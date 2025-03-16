// lib/pdfHandler.ts
import fs from 'fs';
import path from 'path';
import { generateResponse } from './ollama';

// Function to process a PDF file
export async function processPDF(
  filePath: string,
  modelName: string = 'llama3'
): Promise<string> {
  try {
    // Get the document ID from the file path
    const documentId = path.basename(filePath, path.extname(filePath));
    
    // Create directory for the document
    const documentDir = path.join(process.cwd(), 'data', 'documents', documentId);
    if (!fs.existsSync(documentDir)) {
      fs.mkdirSync(documentDir, { recursive: true });
    }
    
    // Copy the file to the document directory
    const documentPath = path.join(documentDir, path.basename(filePath));
    fs.copyFileSync(filePath, documentPath);
    
    // Store metadata about the document
    const metadataPath = path.join(documentDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify({
      id: documentId,
      filePath: documentPath,
      model: modelName,
      created: Date.now()
    }));
    
    return documentId;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

// Function to query Ollama about a document
export async function queryDocument(
  documentId: string,
  query: string,
  modelName: string = 'llama3'
): Promise<string> {
  try {
    // Path to the document metadata
    const documentDir = path.join(process.cwd(), 'data', 'documents', documentId);
    const metadataPath = path.join(documentDir, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Document metadata not found for ID: ${documentId}`);
    }
    
    // Load metadata
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Create a prompt that instructs the model to answer based on the PDF
    const contextPrompt = `You are acting as a helpful assistant that can answer questions about PDF documents.
The user has uploaded a PDF document named "${path.basename(metadata.filePath)}".
Please answer their question to the best of your ability based on your knowledge.
If you don't know the answer, just say that you don't know.

Question: ${query}`;
    
    // Use ollama client to generate response
    const response = await generateResponse(contextPrompt, modelName || metadata.model);
    
    return response.content;
  } catch (error) {
    console.error('Error querying document:', error);
    throw error;
  }
}