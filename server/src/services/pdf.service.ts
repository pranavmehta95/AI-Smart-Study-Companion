import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

const pdfService = {
    async extractText(filePath: string): Promise<string> {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        } else if (ext === '.txt') {
            return fs.readFileSync(filePath, 'utf-8');
        } else {
            // For .doc/.docx — return a placeholder (can add mammoth later)
            return fs.readFileSync(filePath, 'utf-8');
        }
    }
};

export default pdfService;
