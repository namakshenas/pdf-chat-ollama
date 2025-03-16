export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: number;
  }
  
  export interface Document {
    id: string;
    name: string;
    size: number;
    uploaded: number;
    path: string;
  }
  
  export interface ChatSession {
    id: string;
    documentId: string;
    messages: Message[];
    created: number;
    updated: number;
  }
  
  export interface OllamaModel {
    name: string;
    size: number;
    quantization?: string;
    family?: string;
  }