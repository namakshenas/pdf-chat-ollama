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
  Select,
  Avatar,
  Box,
  Divider,
  Badge
} from '@mantine/core';
import { IconSend, IconUser, IconRobot } from '@tabler/icons-react';
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
  
  // Set a default model when models are loaded
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);
  
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
    <Box
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        padding: '0'
      }}
    >
      <Group 
        position="apart" 
        style={{ 
          padding: '12px 16px',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
        }}
      >
        <Group>
          <Text weight={600} size="lg">
            {documentName}
          </Text>
          <Badge color="blue" variant="light">PDF</Badge>
        </Group>
        
        <Select
          placeholder="Select model for chat"
          data={models.map(model => ({ value: model, label: model }))}
          value={selectedModel}
          onChange={setSelectedModel}
          style={{ width: 200 }}
          size="sm"
        />
      </Group>
      
      <ScrollArea
        style={{ flex: 1 }}
        viewportRef={viewport}
        offsetScrollbars
        p="md"
      >
        <Stack spacing="md">
          {messages.length === 0 ? (
            <Text color="dimmed" align="center" my="xl">
              Send a message to start chatting with this document
            </Text>
          ) : (
            messages.map((message) => (
              <Group
                key={message.id}
                align="flex-start"
                style={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  marginLeft: message.role === 'user' ? 'auto' : 0,
                  marginRight: message.role === 'user' ? 0 : 'auto',
                }}
              >
                {message.role === 'assistant' && (
                  <Avatar radius="xl" color="blue">
                    <IconRobot size={20} />
                  </Avatar>
                )}
                
                <Paper
                  p="sm"
                  radius="md"
                  withBorder
                  bg={message.role === 'user' ? 'blue.1' : 'gray.0'}
                  style={{ maxWidth: 'calc(100% - 45px)' }}
                >
                  <Text>{message.content}</Text>
                  <Text size="xs" color="dimmed" align="right" mt={4}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Text>
                </Paper>
                
                {message.role === 'user' && (
                  <Avatar radius="xl" color="green">
                    <IconUser size={20} />
                  </Avatar>
                )}
              </Group>
            ))
          )}
          
          {loading && (
            <Group position="center" mt="md">
              <Loader size="sm" />
              <Text size="sm" color="dimmed">Processing your question...</Text>
            </Group>
          )}
        </Stack>
      </ScrollArea>
      
      <Box px="md" py="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
        <Group position="apart" spacing="md">
          <TextInput
            placeholder="Ask a question about this document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={loading || !selectedModel}
            style={{ flex: 1 }}
            size="md"
            rightSection={
              <Button
                variant="filled"
                radius="xl"
                onClick={handleSendMessage}
                disabled={!input.trim() || loading || !selectedModel}
                size="xs"
              >
                <IconSend size={16} />
              </Button>
            }
          />
        </Group>
      </Box>
    </Box>
  );
}