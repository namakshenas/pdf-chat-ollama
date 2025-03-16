import { NextApiRequest, NextApiResponse } from 'next';
import { queryDocument } from '../../lib/pdfHandler'; // Use our direct handler
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentId, message, model } = req.body;
    
    if (!documentId || !message) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Query the document with the user's message
    const response = await queryDocument(documentId, message, model || 'llama3');
    
    // Create message objects
    const userMessage: Message = {
      id: uuidv4(),
      content: message,
      role: 'user',
      timestamp: Date.now(),
    };
    
    const assistantMessage: Message = {
      id: uuidv4(),
      content: response,
      role: 'assistant',
      timestamp: Date.now(),
    };
    
    return res.status(200).json({ 
      messages: [userMessage, assistantMessage] 
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    return res.status(500).json({ error: 'Failed to process chat' });
  }
}