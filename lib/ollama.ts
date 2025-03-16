import { Ollama } from 'ollama';

// Initialize Ollama client
const ollamaClient = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434',
});

export async function getModels(): Promise<string[]> {
  try {
    const response = await ollamaClient.list();
    return response.models.map(model => model.name);
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

export async function generateResponse(
  prompt: string, 
  model: string = 'llama3',
  context: number[] = []
) {
  try {
    const response = await ollamaClient.chat({
      model,
      messages: [{ role: 'user', content: prompt }],
      context,
    });
    
    return {
      content: response.message.content,
      context: response.context,
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

export default ollamaClient;