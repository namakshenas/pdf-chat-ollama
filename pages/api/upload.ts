import { NextApiRequest, NextApiResponse } from 'next';
import { saveFile } from '../../lib/fileStorage';
import { processPDF } from '../../lib/pdfHandler';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple function to handle file uploads without formidable
const parseMultipartForm = async (req: NextApiRequest): Promise<{
  fields: Record<string, string>;
  file?: { 
    filepath: string; 
    filename: string; 
    mimetype: string; 
    size: number;
  };
}> => {
  return new Promise((resolve, reject) => {
    // Generate a temp file path
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `upload-${uuidv4()}`);
    const writeStream = fs.createWriteStream(tempFilePath);
    
    let fields: Record<string, string> = {};
    let fileInfo = {
      filepath: tempFilePath,
      filename: '',
      mimetype: '',
      size: 0
    };
    
    // Check content type
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      reject(new Error('Expected multipart/form-data'));
      return;
    }
    
    // Very simple multipart parser - this is not production ready!
    const boundary = contentType.split('boundary=')[1].trim();
    let fileFound = false;
    let isFile = false;
    let currentFieldName = '';
    let currentFileName = '';
    let currentMimeType = '';
    let rawData = Buffer.from([]);
    
    req.on('data', (chunk) => {
      rawData = Buffer.concat([rawData, chunk]);
      
      // Rudimentary parsing logic
      const content = chunk.toString();
      if (content.includes(`filename="`)) {
        isFile = true;
        const filenameMatch = content.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          fileInfo.filename = filenameMatch[1];
          currentFileName = filenameMatch[1];
        }
        
        const mimetypeMatch = content.match(/Content-Type: ([^\r\n]+)/);
        if (mimetypeMatch) {
          fileInfo.mimetype = mimetypeMatch[1];
          currentMimeType = mimetypeMatch[1];
        }
      }
      
      // Add data to write stream if processing file
      if (isFile) {
        writeStream.write(chunk);
      }
    });
    
    req.on('end', () => {
      writeStream.end();
      
      // If we found a file, set it
      if (currentFileName) {
        fileInfo = {
          filepath: tempFilePath,
          filename: currentFileName,
          mimetype: currentMimeType,
          size: fs.statSync(tempFilePath).size
        };
      }
      
      // Return our parsed result
      resolve({
        fields: { model: 'llama3' }, // Hardcoded for simplicity
        file: currentFileName ? fileInfo : undefined
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use our simple parser
    const { fields, file } = await parseMultipartForm(req);
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Validate file type (only allow PDFs)
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    
    // Save the file
    const document = await saveFile({
      name: file.filename || 'unnamed.pdf',
      size: file.size,
      arrayBuffer: async () => {
        return await fs.promises.readFile(file.filepath);
      },
    } as any);
    
    // Process the document
    const modelName = fields.model || 'llama3';
    await processPDF(document.path, modelName);
    
    // Cleanup temp file
    try {
      fs.unlinkSync(file.filepath);
    } catch (e) {
      console.error('Failed to clean up temp file:', e);
    }
    
    return res.status(200).json({ document });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ 
      error: 'Failed to upload file', 
      message: error instanceof Error ? error.message : String(error)
    });
  }
}