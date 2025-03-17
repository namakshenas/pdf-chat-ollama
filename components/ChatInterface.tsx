import React, { useState, useRef, useEffect } from 'react';
import { TextInput, Button, Text } from '@mantine/core';
import { IconSend, IconUser, IconRobot, IconFilePdf } from '@tabler/icons-react';
import { Message } from '../types';
import { useModels } from '../hooks/useModels';

interface ChatInterfaceProps {
  documentId: string;
  documentName: string;
}

export function ChatInterface({ documentId, documentName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  const { models } = useModels();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Set a default model when models are loaded
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: Date.now(),
    };
    
    // Update messages with user message
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          message: input,
          model: selectedModel,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Add assistant message to chat
      setMessages(prev => [...prev, data.messages[1]]);
    } catch (error) {
      // Create error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, an error occurred while processing your message. Please try again.',
        role: 'assistant',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconFilePdf size={20} color="#1890ff" />
          <Text weight={500}>{documentName}</Text>
        </div>
        
        <select
          value={selectedModel || ''}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{ 
            padding: '4px 8px', 
            borderRadius: '4px', 
            border: '1px solid #d9d9d9',
            fontSize: '14px',
            width: '180px'
          }}
        >
          <option value="" disabled>Select a model</option>
          {models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>
      
      {/* Messages Area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: '80px auto',
            maxWidth: '500px',
            padding: '24px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            textAlign: 'center'
          }}>
            <IconFilePdf size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '8px' }}>Start a conversation</h3>
            <p style={{ color: '#666' }}>
              Ask questions about "{documentName}" and receive answers based on its content
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                maxWidth: '75%'
              }}>
                {message.role === 'assistant' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <IconRobot size={20} />
                  </div>
                )}
                
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: message.role === 'user' ? '#e6f7ff' : '#f9f9f9',
                  wordBreak: 'break-word'
                }}>
                  <div>{message.content}</div>
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'right',
                    marginTop: '4px'
                  }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <IconUser size={20} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #1890ff',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ fontSize: '14px', color: '#666' }}>Processing your question...</span>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
      
      {/* Input Area */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ position: 'relative' }}>
          <TextInput
            placeholder="Ask a question about this document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={loading || !selectedModel}
            style={{ width: '100%' }}
            size="md"
          />
          <Button
            style={{
              position: 'absolute',
              right: '4px',
              top: '4px',
              borderRadius: '50%',
              minWidth: '32px',
              width: '32px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: !input.trim() || loading || !selectedModel ? '#d9d9d9' : '#1890ff',
              border: 'none',
              cursor: !input.trim() || loading || !selectedModel ? 'not-allowed' : 'pointer'
            }}
            onClick={handleSendMessage}
            disabled={!input.trim() || loading || !selectedModel}
          >
            <IconSend size={16} color="white" />
          </Button>
        </div>
      </div>
    </div>
  );
}