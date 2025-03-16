import { useState, useEffect } from 'react';

export function useModels() {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/models');
        
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        
        const data = await response.json();
        setModels(data.models);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        // Fallback to default models
        setModels(['llama3', 'mistral']);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModels();
  }, []);
  
  return { models, loading, error };
}