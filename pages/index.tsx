import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Stack, 
  Alert, 
  Group,
  Grid,
  Divider,
  Box
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
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
    <Container size="xl" py="xl">
      <Title align="center" mb="sm">PDF Chat with Ollama</Title>
      <Text align="center" color="dimmed" mb="lg">
        Upload PDFs and chat with them using your local Ollama models
      </Text>
      
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <Grid gutter="md">
        {/* Left panel: Upload and document list */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack spacing="md">
            <Paper withBorder shadow="md" p="md" radius="md">
              <Text weight={500} size="lg" mb="xs">
                Upload a PDF Document
              </Text>
              <DocumentUploader 
                onUploadComplete={handleUploadComplete} 
                embeddingModelsOnly={true}
              />
            </Paper>
            
            <Paper withBorder shadow="md" p="md" radius="md">
              <Text weight={500} size="lg" mb="xs">
                Your Documents
              </Text>
              <DocumentList 
                documents={documents} 
                onSelect={handleSelectDocument}
                onDelete={handleDeleteDocument}
                selectedDocumentId={selectedDocument?.id}
              />
            </Paper>
          </Stack>
        </Grid.Col>
        
        {/* Right panel: Chat interface or placeholder */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder shadow="md" style={{ height: '100%', minHeight: '70vh' }} radius="md">
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
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}