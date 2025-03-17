import React from 'react';
import { Text, Box } from '@mantine/core';
import { IconFileText, IconTrash } from '@tabler/icons-react';
import { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  onSelect: (document: Document) => void;
  onDelete: (documentId: string) => void;
  selectedDocumentId?: string;
}

export function DocumentList({ documents, onSelect, onDelete, selectedDocumentId }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <IconFileText size={24} style={{ opacity: 0.5 }} />
        <Text style={{ marginTop: '8px' }} color="dimmed" size="sm">
          No documents uploaded yet. Upload a PDF to get started.
        </Text>
      </div>
    );
  }
  
  return (
    <div style={{ height: 'calc(100% - 30px)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {documents.map((doc) => (
          <div 
            key={doc.id}
            style={{
              padding: '8px',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: selectedDocumentId === doc.id ? '#e6f7ff' : 'transparent',
              border: '1px solid',
              borderColor: selectedDocumentId === doc.id ? '#1890ff' : '#d9d9d9'
            }}
            onClick={() => onSelect(doc)}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                overflow: 'hidden',
                flex: 1
              }}>
                <IconFileText size={18} color="#1890ff" />
                <div style={{ overflow: 'hidden' }}>
                  <Text weight={500} size="sm" style={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {doc.name}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {Math.round(doc.size / 1024)} KB
                  </Text>
                </div>
              </div>
              
              {selectedDocumentId === doc.id && (
                <div style={{
                  fontSize: '10px',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  marginRight: '8px'
                }}>
                  Active
                </div>
              )}
              
              <div
                style={{
                  cursor: 'pointer',
                  color: '#ff4d4f'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id);
                }}
                title="Delete this document"
              >
                <IconTrash size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}