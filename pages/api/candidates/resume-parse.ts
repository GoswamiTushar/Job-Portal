import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import formidable from 'formidable';
import { parseResumeDocument } from '../../../lib/resumeParser';

// Disable Next.js default body parser to enable streaming file uploads via formidable
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Configure formidable with 8MB hard ceiling for strict memory control
    const form = formidable({
        maxFileSize: 8 * 1024 * 1024, // 8MB limit
        keepExtensions: true,
        multiples: false,
    });

    let tempFilePath: string | null = null;

    try {
        const [fields, files] = await form.parse(req);
        void fields;

        const file = Array.isArray(files.resume) ? files.resume[0] : files.resume;

        if (!file) {
            return res.status(400).json({ message: 'No resume file uploaded. Please provide a "resume" file field.' });
        }

        const uploadedFilePath = file.filepath;
        tempFilePath = uploadedFilePath;
        const originalName = file.originalFilename || 'resume';

        // Execute parsing engine
        const result = await parseResumeDocument(uploadedFilePath, originalName);

        return res.status(200).json({
            success: true,
            engine: result.engine,
            fileType: result.extracted.fileType,
            fileName: originalName,
            fileSize: file.size,
            profile: result.profile,
        });
    } catch (err: any) {
        console.error('Resume parsing API error:', err);
        return res.status(500).json({
            message: err.message || 'Failed to parse resume document',
        });
    } finally {
        // ALWAYS delete the temporary upload file immediately to avoid disk leaks
        if (tempFilePath && fs.existsSync(/*turbopackIgnore: true*/ tempFilePath)) {
            try {
                fs.unlinkSync(/*turbopackIgnore: true*/ tempFilePath);
            } catch (cleanupErr) {
                console.warn('Failed to clean up temp resume file:', cleanupErr);
            }
        }
    }
}
