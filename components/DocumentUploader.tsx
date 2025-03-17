import React, { useState, useEffect } from 'react';
import { Group, Button, Text, FileButton, Progress, Alert, Select } from '@mantine/core';
import { useModels } from '../hooks/useModels';
import { Document } from '../types';

interface DocumentUploaderProps {
  onUploadComplete: (document: Document) => void;
  embeddingModelsOnly?: boolean;
}

// List of models that work well for text embedding
const EMBEDDING_MODELS = ['llama3', 'mistral', 'nomic-embed-text', 'all-MiniLM'];

export function DocumentUploader({ onUploadComplete, embeddingModelsOnly = false }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  const { models, loading: loadingModels } = useModels();
  
  // Filter models based on embedding capability if needed
  const availableModels = embeddingModelsOnly 
    ? models.filter(model => EMBEDDING_MODELS.some(embedModel => model.includes(embedModel)))
    : models;

  // Set default model once models are loaded
  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0]);
    }
  }, [availableModels, selectedModel]);
  
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
      setTimeout(() => {
        setFile(null);
        setProgress(0);
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Group mb="xs">
        <FileButton onChange={setFile} accept="application/pdf">
          {(props) => <Button {...props}>Select PDF</Button>}
        </FileButton>
      </Group>
      
      {file && (
        <>
          <Text size="sm" mb="xs">
            Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
          </Text>
          
          <Group mb="md">
            <Select
              placeholder="Select embedding model"
              data={availableModels.map(model => ({ value: model, label: model }))}
              value={selectedModel}
              onChange={setSelectedModel}
              disabled={loadingModels}
              style={{ flex: 1 }}
              required
              label="Embedding Model"
              description={embeddingModelsOnly ? "Only models suitable for text embedding are shown" : ""}
            />
          </Group>
          
          <Button 
            onClick={handleUpload} 
            disabled={!file || !selectedModel || loading} 
            loading={loading}
            fullWidth
          >
            Upload and Process
          </Button>
        </>
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
      
      {progress === 100 && !loading && (
        <Alert color="green" mt="md" title="Success">
          Document uploaded and processed successfully!
        </Alert>
      )}
      
      {error && (
        <Alert color="red" mt="md" title="Error">
          {error}
        </Alert>
      )}
    </div>
  );
}