import React, { useState } from 'react';
import { Group, Button, Text, FileButton, Progress, Alert, Select } from '@mantine/core';
import { useModels } from '../hooks/useModels';
import { Document } from '../types';

interface DocumentUploaderProps {
  onUploadComplete: (document: Document) => void;
}

export function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  const { models, loading: loadingModels } = useModels();
  
  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setProgress(10);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    if (selectedModel) {
      formData.append('model', selectedModel);
    }
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 1000);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      setProgress(100);
      
      // Notify parent component of successful upload
      onUploadComplete(data.document);
      
      // Reset the form
      setFile(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Group>
        <FileButton onChange={setFile} accept="application/pdf">
          {(props) => <Button {...props}>Select PDF</Button>}
        </FileButton>
        
        <Select
          placeholder="Select model"
          data={models.map(model => ({ value: model, label: model }))}
          value={selectedModel}
          onChange={setSelectedModel}
          disabled={loadingModels}
          style={{ minWidth: 200 }}
        />
        
        <Button 
          onClick={handleUpload} 
          disabled={!file || loading} 
          loading={loading}
        >
          Upload
        </Button>
      </Group>
      
      {file && (
        <Text size="sm" mt="xs">
          Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
        </Text>
      )}
      
      {loading && (
        <Progress 
          value={progress} 
          mt="md" 
          size="sm" 
          label={`${progress}%`} 
          color={progress === 100 ? 'green' : 'blue'} 
          striped
          animate
        />
      )}
      
      {error && (
        <Alert color="red" mt="md">
          {error}
        </Alert>
      )}
    </div>
  );
}