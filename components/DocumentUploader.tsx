import React, { useState, useEffect } from 'react';
import { IconUpload, IconFilePdf } from '@tabler/icons-react';
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
    ? models.filter(model => EMBEDDING_MODELS.some(embedModel => 
        model.toLowerCase().includes(embedModel.toLowerCase())))
    : models;

  // Set default model once models are loaded
  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0]);
    }
  }, [availableModels, selectedModel]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
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
          return prev + 5;
        });
      }, 500);
      
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
        setError(null);
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {!file ? (
        <div 
          style={{
            border: '2px dashed #d9d9d9',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <IconUpload size={20} color="#1890ff" />
            <span style={{ fontSize: '14px' }}>Click to select a PDF file</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            overflow: 'hidden'
          }}>
            <IconFilePdf size={18} color="#1890ff" />
            <span style={{ 
              fontSize: '14px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {file.name} ({Math.round(file.size / 1024)} KB)
            </span>
          </div>
          
          <div style={{ marginTop: '8px' }}>
            <label 
              style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: 500,
                marginBottom: '4px'
              }}
            >
              Embedding Model
            </label>
            <select
              value={selectedModel || ''}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={loadingModels || loading}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                fontSize: '14px'
              }}
            >
              <option value="" disabled>Select a model</option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            <div style={{ 
              fontSize: '12px', 
              color: '#888',
              marginTop: '4px'
            }}>
              Select a model for text embedding
            </div>
          </div>
          
          {loading ? (
            <div style={{ marginTop: '12px' }}>
              <div style={{ 
                height: '6px', 
                backgroundColor: '#f0f0f0',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? '#52c41a' : '#1890ff',
                    transition: 'width 0.3s',
                    borderRadius: '3px'
                  }}
                />
              </div>
              <div style={{ 
                textAlign: 'center', 
                fontSize: '12px', 
                marginTop: '4px',
                color: '#666'
              }}>
                {progress}%
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '12px',
              gap: '8px'
            }}>
              <button
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  flex: 1
                }}
                onClick={() => {
                  setFile(null);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '6px 12px',
                  backgroundColor: !file || !selectedModel ? '#f0f0f0' : '#1890ff',
                  color: !file || !selectedModel ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !file || !selectedModel ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  flex: 1
                }}
                onClick={handleUpload}
                disabled={!file || !selectedModel || loading}
              >
                Process
              </button>
            </div>
          )}
        </div>
      )}
      
      {progress === 100 && !loading && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '4px',
          color: '#52c41a',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Document successfully processed!</span>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#999'
            }}
            onClick={() => setProgress(0)}
          >
            ×
          </button>
        </div>
      )}
      
      {error && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '4px',
          color: '#ff4d4f',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#999'
            }}
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}