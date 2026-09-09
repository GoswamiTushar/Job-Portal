import { extractSkillsFromText } from './skillsDictionary';

export interface ParsedProfileResult {
    name: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    bio: string;
    skills: string[];
    experienceLevel: string;
    experienceYears: string;
    workExperience: Array<{
        title: string;
        company: string;
        startDate?: string;
        endDate?: string;
        isCurrent?: boolean;
        description?: string;
    }>;
    education: Array<{
        degree: string;
        institution: string;
        fieldOfStudy?: string;
        startYear?: string;
        endYear?: string;
    }>;
    links: {
        linkedin: string;
        github: string;
        portfolio: string;
    };
    rawTextPreview?: string;
}

/**
 * Deterministic NLP heuristic resume parser.
 * Extracts structured entities from plain text with zero external dependencies.
 */
export function parseResumeText(text: string): ParsedProfileResult {
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    // 1. Email Extraction
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0].toLowerCase() : '';

    // 2. Phone Extraction
    const phoneRegex = /(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{3,5}/g;
    let phone = '';
    const phoneCandidates = text.match(phoneRegex) || [];
    for (const cand of phoneCandidates) {
        const digits = cand.replace(/\D/g, '');
        if (digits.length >= 10 && digits.length <= 15) {
            phone = cand.trim();
            break;
        }
    }

    // 3. Social Links
    const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
    const linkedin = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : '';

    const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
    const github = githubMatch ? `https://github.com/${githubMatch[1]}` : '';

    let portfolio = '';
    const portfolioMatch = text.match(
        /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|io|me|tech|site|online|app|com))(?:\/[^\s,]*)?/i
    );
    if (
        portfolioMatch &&
        !portfolioMatch[0].includes('linkedin.com') &&
        !portfolioMatch[0].includes('github.com')
    ) {
        portfolio = portfolioMatch[0].startsWith('http') ? portfolioMatch[0] : `https://${portfolioMatch[0]}`;
    }

    // 4. Candidate Name Detection
    // Name typically resides in the first 5 non-empty lines, before contact details
    let name = '';
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
        const line = lines[i];
        if (
            line.includes('@') ||
            line.includes('http') ||
            /^\+?\d/.test(line) ||
            /^(resume|curriculum|vitae|profile|cv|contact|page\s*\d)/i.test(line)
        ) {
            continue;
        }

        // Clean punctuation
        const clean = line.replace(/[^a-zA-Z\s.'-]/g, '').trim();
        const words = clean.split(/\s+/);
        if (words.length >= 2 && words.length <= 4 && words.every((w) => w.length >= 2)) {
            // Check if title-cased
            name = words
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ');
            break;
        }
    }

    // 5. Skills Extraction
    const skills = extractSkillsFromText(text);

    // 6. Professional Headline
    let headline = '';
    const knownTitlePatterns = [
        /(?:Senior|Lead|Staff|Principal|Junior|Associate)?\s*(?:Full[- ]Stack|Frontend|Backend|Software|Web|Mobile|DevOps|Cloud|Data|AI|ML|Platform)?\s*(?:Engineer|Developer|Architect|Specialist|Scientist|Consultant|Manager)/i,
    ];
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i];
        if (line === name || line.includes('@')) continue;
        for (const pattern of knownTitlePatterns) {
            const m = line.match(pattern);
            if (m && m[0].length > 6) {
                headline = line.length < 65 ? line : m[0];
                break;
            }
        }
        if (headline) break;
    }
    if (!headline && skills.length > 0) {
        headline = `Software Engineer | ${skills.slice(0, 3).join(', ')}`;
    }

    // 7. Location Detection
    let location = '';
    const cityPattern =
        /\b(San Francisco|New York|Seattle|Austin|Boston|Chicago|Los Angeles|London|Berlin|Toronto|Vancouver|Bangalore|Bengaluru|Mumbai|Delhi|Hyderabad|Pune|Gurgaon|Noida|Chennai|Remote|Singapore|Amsterdam|Dublin)\b/i;
    const locMatch = text.match(cityPattern);
    if (locMatch) {
        location = locMatch[0];
    }

    // 8. Summary / Bio Extraction
    let bio = '';
    const summaryHeaderIndex = lines.findIndex((l) =>
        /^(summary|professional summary|about me|profile|executive summary|overview)$/i.test(l)
    );
    if (summaryHeaderIndex !== -1 && summaryHeaderIndex + 1 < lines.length) {
        const bioLines: string[] = [];
        for (let i = summaryHeaderIndex + 1; i < Math.min(lines.length, summaryHeaderIndex + 6); i++) {
            const line = lines[i];
            if (/^(experience|education|skills|projects|certifications|work)/i.test(line)) break;
            bioLines.push(line);
        }
        bio = bioLines.join(' ').trim();
    }

    // 9. Work Experience Extraction
    const workExperience: ParsedProfileResult['workExperience'] = [];
    const expHeaderIndex = lines.findIndex((l) =>
        /^(experience|work experience|professional experience|employment history|work history)$/i.test(l)
    );
    if (expHeaderIndex !== -1) {
        // Scan lines under experience section
        let currentRole: any = null;
        const dateRegex =
            /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)?\s*(\d{4})\s*[-–—to]+\s*(Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4})\b/i;

        for (let i = expHeaderIndex + 1; i < Math.min(lines.length, expHeaderIndex + 45); i++) {
            const line = lines[i];
            if (/^(education|skills|projects|certifications|awards|languages|interests)$/i.test(line)) {
                break;
            }

            const dateMatch = line.match(dateRegex);
            if (dateMatch) {
                if (currentRole && currentRole.title) {
                    workExperience.push(currentRole);
                }

                const dateStr = dateMatch[0];
                const parts = dateStr.split(/\s*(?:[-–—]|(?:\bto\b))\s*/i).map((s) => s.trim());
                const isCurrent = /present|current|now/i.test(parts[1] || dateStr);

                // Title or company may be in this line or the preceding line
                const lineWithoutDate = line.replace(dateRegex, '').replace(/[|•,-]/g, ' ').trim();
                const prevLine = lines[i - 1] || '';

                currentRole = {
                    title: lineWithoutDate || prevLine,
                    company: prevLine && prevLine !== lineWithoutDate ? prevLine : 'Company',
                    startDate: parts[0] || '',
                    endDate: isCurrent ? 'Present' : parts[1] || '',
                    isCurrent,
                    description: '',
                };
            } else if (currentRole) {
                if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                    currentRole.description += (currentRole.description ? '\n' : '') + line;
                } else if (currentRole.description.length < 300) {
                    currentRole.description += ' ' + line;
                }
            }
        }
        if (currentRole && currentRole.title) {
            workExperience.push(currentRole);
        }
    }

    // 10. Education Extraction
    const education: ParsedProfileResult['education'] = [];
    const eduHeaderIndex = lines.findIndex((l) =>
        /^(education|academic background|academics|qualifications)$/i.test(l)
    );
    if (eduHeaderIndex !== -1) {
        const degreePattern =
            /\b(B\.?Tech|B\.?E|B\.?S|M\.?S|M\.?Tech|Master|Bachelor|PhD|Doctorate|Diploma|BCA|MCA)\b/i;

        for (let i = eduHeaderIndex + 1; i < Math.min(lines.length, eduHeaderIndex + 25); i++) {
            const line = lines[i];
            if (/^(skills|projects|certifications|awards|experience)$/i.test(line)) break;

            const degMatch = line.match(degreePattern);
            const yearMatch = line.match(/\b(19\d{2}|20\d{2})\b/);

            if (degMatch || /university|institute|college|school/i.test(line)) {
                education.push({
                    degree: degMatch ? degMatch[0] : 'Degree',
                    institution: line.length < 80 ? line : 'University',
                    fieldOfStudy: /computer science|information technology|software engineering/i.test(line)
                        ? 'Computer Science'
                        : '',
                    startYear: '',
                    endYear: yearMatch ? yearMatch[0] : '',
                });
            }
        }
    }

    // 11. Experience Level & Years Estimation
    let experienceYears = '0';
    let experienceLevel = 'Entry-Level';

    const explicitExpMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s*of)?\s*experience/i);
    if (explicitExpMatch) {
        experienceYears = explicitExpMatch[1];
    } else if (workExperience.length > 0) {
        experienceYears = String(Math.max(1, workExperience.length * 2));
    }

    const numYears = parseInt(experienceYears, 10) || 0;
    if (numYears >= 8 || /principal|director|staff/i.test(headline)) {
        experienceLevel = 'Lead / Principal';
    } else if (numYears >= 5 || /senior|sr\./i.test(headline)) {
        experienceLevel = 'Senior';
    } else if (numYears >= 2 || /mid|intermediate/i.test(headline)) {
        experienceLevel = 'Mid-Level';
    }

    return {
        name,
        email,
        phone,
        location,
        headline,
        bio: bio.slice(0, 500),
        skills: skills.slice(0, 25),
        experienceLevel,
        experienceYears,
        workExperience: workExperience.slice(0, 5),
        education: education.slice(0, 3),
        links: {
            linkedin,
            github,
            portfolio,
        },
        rawTextPreview: text.slice(0, 800),
    };
}
