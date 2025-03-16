import { NextApiRequest, NextApiResponse } from 'next';
import { getDocuments, deleteDocument } from '../../lib/fileStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const documents = getDocuments();
      return res.status(200).json({ documents });
    } catch (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({ error: 'Failed to fetch documents' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Document ID is required' });
      }
      
      const success = deleteDocument(id);
      
      if (success) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(404).json({ error: 'Document not found' });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({ error: 'Failed to delete document' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}