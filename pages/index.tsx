import { useState, useEffect } from 'react';
import { 
  Box,
  Text, 
  Paper, 
  Stack, 
  Alert, 
  Group,
  Title
} from '@mantine/core';
import { IconAlertCircle, IconFileText } from '@tabler/icons-react';
import { DocumentUploader } from '../components/DocumentUploader';
import { DocumentList } from '../components/DocumentList';
import { ChatInterface } from '../components/ChatInterface';
import { Document } from '../types';

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadComplete = (document: Document) => {
    setDocuments(prev => [...prev, document]);
    setSelectedDocument(document); // Automatically select the newly uploaded document
  };
  
  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      // Update documents list
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // If the deleted document was selected, clear the selection
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };
  
  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Box 
        sx={{ 
          height: 60, 
          padding: '16px', 
          borderBottom: '1px solid var(--mantine-color-gray-3)'
        }}
      >
        <Group>
          <IconFileText size={24} />
          <Title order={4}>Chat with your PDF locally</Title>
        </Group>
      </Box>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          m="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <Box 
          sx={{ 
            width: 300, 
            borderRight: '1px solid var(--mantine-color-gray-3)',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 60px)',
            overflow: 'hidden'
          }}
          p="md"
        >
          <Paper withBorder p="md" radius="md" mb="md">
            <Text weight={500} size="md" mb="xs">
              Upload a PDF Document
            </Text>
            <DocumentUploader 
              onUploadComplete={handleUploadComplete} 
              embeddingModelsOnly={true}
            />
          </Paper>
          
          <Paper 
            withBorder 
            p="md" 
            radius="md" 
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Text weight={500} size="md" mb="xs">
              Your Documents
            </Text>
            <DocumentList 
              documents={documents} 
              onSelect={handleSelectDocument}
              onDelete={handleDeleteDocument}
              selectedDocumentId={selectedDocument?.id}
            />
          </Paper>
        </Box>
        
        {/* Main Content Area */}
        <Box sx={{ flex: 1, height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
          {selectedDocument ? (
            <ChatInterface 
              documentId={selectedDocument.id}
              documentName={selectedDocument.name}
            />
          ) : (
            <Box 
              style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <Text color="dimmed" size="lg">
                Select a document from the list or upload a new one to start chatting
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}