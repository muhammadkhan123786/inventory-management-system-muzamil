import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

export type UploadFieldRule = {
    name: string;
    maxCount: number;
    mimeTypes: string[];
};

export interface UploadedFiles {
    [fieldname: string]: Express.Multer.File[];
}

/**
 * Factory function to create a multer middleware for multiple fields
 */
export const createUploader = (fields: UploadFieldRule[]) => {
    // ✅ Always use project root
    const uploadDir = path.resolve(process.cwd(), 'uploads');

    // ✅ Ensure folder exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`[MULTER] Created upload directory: ${uploadDir}`);
    }

    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname);
            const safeName = file.fieldname.replace(/\s+/g, '_');
            const filename = `${Date.now()}-${safeName}${ext}`;
            cb(null, filename);
        },
    });

    const fileFilter: multer.Options['fileFilter'] = (req: Request, file, cb) => {
        const rule = fields.find(f => f.name === file.fieldname);
        if (!rule) return cb(null, false);

        if (!rule.mimeTypes.includes(file.mimetype)) {
            return cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${rule.mimeTypes.join(', ')}`));
        }

        cb(null, true);
    };

    const uploader = multer({
        storage,
        fileFilter,
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }).any();

    return (req: any, res: any, next: any) => {
        uploader(req, res, (err: any) => {
            if (err) return next(err);
            next();
        });
    };
};
