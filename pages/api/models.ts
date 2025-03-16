import { NextApiRequest, NextApiResponse } from 'next';
import { getModels } from '../../lib/ollama';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const models = await getModels();
    return res.status(200).json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch models',
      models: ['llama3', 'mistral'] // Fallback models
    });
  }
}