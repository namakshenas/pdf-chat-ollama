import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Document } from '../types';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function saveFile(file: File): Promise<Document> {
  const id = uuidv4();
  const fileName = file.name;
  const fileExtension = path.extname(fileName);
  const storagePath = path.join(UPLOAD_DIR, `${id}${fileExtension}`);
  
  // Read file as buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Write to filesystem
  fs.writeFileSync(storagePath, buffer);
  
  // Create document metadata
  const document: Document = {
    id,
    name: fileName,
    size: file.size,
    uploaded: Date.now(),
    path: storagePath,
  };
  
  // Save document metadata
  saveDocumentMetadata(document);
  
  return document;
}

export function getDocuments(): Document[] {
  try {
    const metadataPath = path.join(process.cwd(), 'data', 'documents.json');
    if (!fs.existsSync(metadataPath)) {
      return [];
    }
    
    const data = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading documents:', error);
    return [];
  }
}

export function saveDocumentMetadata(document: Document): void {
  try {
    const documents = getDocuments();
    const existingIndex = documents.findIndex(doc => doc.id === document.id);
    
    if (existingIndex !== -1) {
      documents[existingIndex] = document;
    } else {
      documents.push(document);
    }
    
    const metadataPath = path.join(process.cwd(), 'data', 'documents.json');
    fs.writeFileSync(metadataPath, JSON.stringify(documents, null, 2));
  } catch (error) {
    console.error('Error saving document metadata:', error);
  }
}

export function deleteDocument(id: string): boolean {
  try {
    const documents = getDocuments();
    const document = documents.find(doc => doc.id === id);
    
    if (!document) {
      return false;
    }
    
    // Delete the file
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }
    
    // Delete the document directory if it exists
    const docDir = path.join(process.cwd(), 'data', 'documents', id);
    if (fs.existsSync(docDir)) {
      fs.rmSync(docDir, { recursive: true, force: true });
    }
    
    // Update the metadata
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    const metadataPath = path.join(process.cwd(), 'data', 'documents.json');
    fs.writeFileSync(metadataPath, JSON.stringify(updatedDocuments, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}