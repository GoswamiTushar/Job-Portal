import { extractTextFromFile, ExtractedTextResult } from './extractText';
import { parseResumeText, ParsedProfileResult } from './heuristicExtractor';

/**
 * Hybrid Resume Parser:
 * 1. Decodes multi-format document (PDF, DOCX, DOC, Image, TXT) into text using zero-memory-leak local decoders.
 * 2. If GEMINI_API_KEY or OPENAI_API_KEY is configured in .env, optionally calls the structured LLM endpoint.
 * 3. Always falls back immediately to the deterministic NLP parser if no key is provided or if network fails.
 */
export async function parseResumeDocument(
    filePath: string,
    originalName: string
): Promise<{
    success: boolean;
    extracted: ExtractedTextResult;
    profile: ParsedProfileResult;
    engine: 'ai' | 'heuristic';
}> {
    // Stage 1: Memory-efficient text extraction
    const extracted = await extractTextFromFile(filePath, originalName);

    if (!extracted.text || extracted.text.length < 20) {
        throw new Error('Could not extract legible text from this document. Please ensure the file is not empty or password protected.');
    }

    // Stage 2: Optional AI Parsing (if configured)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            const aiProfile = await parseWithGemini(extracted.text, geminiKey);
            if (aiProfile) {
                return {
                    success: true,
                    extracted,
                    profile: aiProfile,
                    engine: 'ai',
                };
            }
        } catch (aiErr) {
            console.warn('AI parsing failed, falling back to local heuristic parser:', aiErr);
        }
    }

    // Stage 3: Built-in deterministic heuristic extraction
    const profile = parseResumeText(extracted.text);

    return {
        success: true,
        extracted,
        profile,
        engine: 'heuristic',
    };
}

/**
 * Optional Gemini 1.5 Flash structured parser
 */
async function parseWithGemini(rawText: string, apiKey: string): Promise<ParsedProfileResult | null> {
    const prompt = `You are an expert resume parser. Extract candidate profile details from the following resume text into strict JSON matching this schema:
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "headline": string,
  "bio": string,
  "skills": string[],
  "experienceLevel": string ("Junior" | "Mid-Level" | "Senior" | "Lead / Principal"),
  "experienceYears": string,
  "workExperience": [
    {
      "title": string,
      "company": string,
      "startDate": string,
      "endDate": string,
      "isCurrent": boolean,
      "description": string
    }
  ],
  "education": [
    {
      "degree": string,
      "institution": string,
      "fieldOfStudy": string,
      "startYear": string,
      "endYear": string
    }
  ],
  "links": {
    "linkedin": string,
    "github": string,
    "portfolio": string
  }
}

Return only valid JSON. Do not include markdown fences.

RESUME TEXT:
${rawText.slice(0, 8000)}`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) return null;

    const parsed = JSON.parse(textOutput);
    return {
        ...parsed,
        rawTextPreview: rawText.slice(0, 800),
    };
}

export * from './extractText';
export * from './heuristicExtractor';
export * from './skillsDictionary';
