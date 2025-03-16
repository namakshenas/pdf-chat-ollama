import React, { useState, useRef, useEffect } from 'react';
import { 
  Paper, 
  TextInput, 
  Button, 
  Text, 
  Group, 
  ScrollArea, 
  Stack, 
  Loader, 
  Select 
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
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
  const viewport = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
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
    <Paper
      radius="md"
      withBorder
      p="md"
      style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}
    >
      <Group position="apart" mb="xs">
        <Text weight={500} size="lg">
          Chat with {documentName}
        </Text>
        
        <Select
          placeholder="Select model"
          data={models.map(model => ({ value: model, label: model }))}
          value={selectedModel}
          onChange={setSelectedModel}
          style={{ width: 200 }}
        />
      </Group>
      
      <ScrollArea
        style={{ flex: 1 }}
        viewportRef={viewport}
        offsetScrollbars
      >
        <Stack spacing="xs">
          {messages.length === 0 ? (
            <Text color="dimmed" align="center" my="xl">
              Send a message to start chatting with this document
            </Text>
          ) : (
            messages.map((message) => (
              <Paper
                key={message.id}
                p="sm"
                radius="md"
                withBorder
                bg={message.role === 'user' ? 'blue.0' : 'gray.0'}
                style={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  marginLeft: message.role === 'user' ? 'auto' : 0,
                  marginRight: message.role === 'user' ? 0 : 'auto',
                }}
              >
                <Text>{message.content}</Text>
                <Text size="xs" color="dimmed" align="right">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </Paper>
            ))
          )}
          
          {loading && (
            <Group position="center" mt="md">
              <Loader size="sm" />
              <Text size="sm" color="dimmed">Generating response...</Text>
            </Group>
          )}
        </Stack>
      </ScrollArea>
      
      <Group position="apart" mt="md">
        <TextInput
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          disabled={loading}
          style={{ flex: 1 }}
          rightSection={
            <Button
              compact
              variant="filled"
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
            >
              <IconSend size={16} />
            </Button>
          }
        />
      </Group>
    </Paper>
  );
}