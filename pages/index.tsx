import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Tabs, 
  Stack, 
  Alert, 
  Group 
} from '@mantine/core';
import { IconAlertCircle, IconUpload, IconMessage } from '@tabler/icons-react';
import { DocumentUploader } from '../components/DocumentUploader';
import { DocumentList } from '../components/DocumentList';
import { ChatInterface } from '../components/ChatInterface';
import { Document } from '../types';

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('upload');
  
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
    setActiveTab('documents');
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
        setActiveTab('documents');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };
  
  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
    setActiveTab('chat');
  };
  
  return (
    <Container size="lg" py="xl">
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
      
      <Paper withBorder shadow="md" p={0} radius="md">
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
              Upload
            </Tabs.Tab>
            <Tabs.Tab value="documents" leftSection={<IconMessage size={16} />}>
              Documents
            </Tabs.Tab>
            {selectedDocument && (
              <Tabs.Tab value="chat" leftSection={<IconMessage size={16} />}>
                Chat
              </Tabs.Tab>
            )}
          </Tabs.List>
          
          <div style={{ padding: 20 }}>
            <Tabs.Panel value="upload">
              <Stack>
                <Text weight={500} size="lg" mb="xs">
                  Upload a PDF Document
                </Text>
                <DocumentUploader onUploadComplete={handleUploadComplete} />
              </Stack>
            </Tabs.Panel>
            
            <Tabs.Panel value="documents">
              <Stack>
                <Group position="apart">
                  <Text weight={500} size="lg">
                    Your Documents
                  </Text>
                </Group>
                <DocumentList 
                  documents={documents} 
                  onSelect={handleSelectDocument}
                  onDelete={handleDeleteDocument}
                />
              </Stack>
            </Tabs.Panel>
            
            {selectedDocument && (
              <Tabs.Panel value="chat">
                <ChatInterface 
                  documentId={selectedDocument.id}
                  documentName={selectedDocument.name}
                />
              </Tabs.Panel>
            )}
          </div>
        </Tabs>
      </Paper>
    </Container>
  );
}