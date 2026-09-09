import fs from 'fs';
import path from 'path';

export interface ExtractedTextResult {
    text: string;
    fileType: string;
    pageCount?: number;
}

/**
 * Extracts raw textual content from multiple document formats:
 * - PDF (.pdf) via pdf-parse
 * - DOCX (.docx) via mammoth
 * - DOC (.doc) via word-extractor
 * - Images (.png, .jpg, .jpeg, .webp) via tesseract.js OCR
 * - Plain text (.txt)
 *
 * Implements strict memory lifecycle management:
 * - WASM OCR workers are immediately terminated upon completion
 * - Buffers are scoped locally for rapid garbage collection
 */
export async function extractTextFromFile(
    filePath: string,
    originalName: string = ''
): Promise<ExtractedTextResult> {
    const ext = (path.extname(originalName || filePath) || '').toLowerCase();

    if (!fs.existsSync(filePath)) {
        throw new Error(`Resume file not found at path: ${filePath}`);
    }

    // 1. Plain Text
    if (ext === '.txt') {
        const text = fs.readFileSync(filePath, 'utf-8');
        return { text: text.trim(), fileType: 'txt' };
    }

    // 2. PDF
    if (ext === '.pdf') {
        try {
            // Support both modern pdf-parse v2.x (class PDFParse) and legacy v1.x (function export)
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfModule = require('pdf-parse');
            const dataBuffer = fs.readFileSync(filePath);

            let extractedText = '';
            let pageCount = 1;

            if (pdfModule.PDFParse) {
                const parser = new pdfModule.PDFParse({ data: dataBuffer });
                try {
                    const textResult = await parser.getText();
                    extractedText = textResult.text || '';
                    pageCount = textResult.total || textResult.pages?.length || 1;
                } finally {
                    await parser.destroy();
                }
            } else if (typeof pdfModule === 'function') {
                const pdfData = await pdfModule(dataBuffer);
                extractedText = pdfData.text || '';
                pageCount = pdfData.numpages || 1;
            } else if (typeof pdfModule.default === 'function') {
                const pdfData = await pdfModule.default(dataBuffer);
                extractedText = pdfData.text || '';
                pageCount = pdfData.numpages || 1;
            } else {
                throw new Error('Unsupported pdf-parse module structure');
            }

            return {
                text: (extractedText || '').trim(),
                pageCount,
                fileType: 'pdf',
            };
        } catch (pdfErr: any) {
            console.error('PDF parsing error:', pdfErr);
            throw new Error(`Failed to extract text from PDF: ${pdfErr.message || pdfErr}`);
        }
    }

    // 3. Word DOCX
    if (ext === '.docx') {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ path: filePath });
            return {
                text: (result.value || '').trim(),
                fileType: 'docx',
            };
        } catch (docxErr: any) {
            console.error('DOCX parsing error:', docxErr);
            throw new Error(`Failed to extract text from DOCX: ${docxErr.message || docxErr}`);
        }
    }

    // 4. Legacy Word DOC
    if (ext === '.doc') {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const WordExtractor = require('word-extractor');
            const extractor = new WordExtractor();
            const extracted = await extractor.extract(filePath);
            const text = extracted.getBody();
            return {
                text: (text || '').trim(),
                fileType: 'doc',
            };
        } catch (docErr: any) {
            console.error('DOC parsing error:', docErr);
            throw new Error(`Failed to extract text from DOC: ${docErr.message || docErr}`);
        }
    }

    // 5. Image formats (PNG, JPG, JPEG, WEBP)
    if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        let worker: any = null;
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { createWorker } = require('tesseract.js');
            worker = await createWorker('eng');
            const ret = await worker.recognize(filePath);
            const text = ret.data.text || '';
            return {
                text: text.trim(),
                fileType: ext.replace('.', ''),
            };
        } catch (ocrErr: any) {
            console.error('OCR parsing error:', ocrErr);
            throw new Error(`Failed to extract text from image resume: ${ocrErr.message || ocrErr}`);
        } finally {
            // CRITICAL: Explicitly terminate WASM worker to release heap memory immediately
            if (worker && typeof worker.terminate === 'function') {
                try {
                    await worker.terminate();
                } catch (tErr) {
                    console.error('Error terminating OCR worker:', tErr);
                }
            }
        }
    }

    // Fallback: Attempt UTF-8 read
    try {
        const text = fs.readFileSync(filePath, 'utf-8');
        return { text: text.trim(), fileType: ext || 'unknown' };
    } catch {
        throw new Error(`Unsupported file extension: ${ext}. Supported formats: PDF, DOCX, DOC, TXT, PNG, JPG, JPEG, WEBP.`);
    }
}
