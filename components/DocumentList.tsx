import React from 'react';
import { Table, ActionIcon, Text, Card, Group, Badge, Stack, Box } from '@mantine/core';
import { IconTrash, IconMessage, IconCheck } from '@tabler/icons-react';
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
      <Card withBorder p="xl" radius="md">
        <Text align="center" color="dimmed">
          No documents uploaded yet. Upload a PDF to get started.
        </Text>
      </Card>
    );
  }
  
  return (
    <Stack spacing="xs" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {documents.map((doc) => (
        <Box 
          key={doc.id}
          sx={(theme) => ({
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
            cursor: 'pointer',
            backgroundColor: selectedDocumentId === doc.id ? 
              theme.colorScheme === 'dark' ? theme.colors.blue[9] : theme.colors.blue[0] : 
              'transparent',
            '&:hover': {
              backgroundColor: selectedDocumentId === doc.id ? 
                (theme.colorScheme === 'dark' ? theme.colors.blue[9] : theme.colors.blue[0]) : 
                (theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0])
            },
            border: '1px solid',
            borderColor: selectedDocumentId === doc.id ? 
              theme.colors.blue[5] : 
              theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
          })}
          onClick={() => onSelect(doc)}
        >
          <Group position="apart" noWrap>
            <Stack spacing={2} style={{ flex: 1, overflow: 'hidden' }}>
              <Group position="apart">
                <Text weight={500} lineClamp={1} style={{ maxWidth: '70%' }}>
                  {doc.name}
                </Text>
                {selectedDocumentId === doc.id && (
                  <Badge color="blue" variant="light" size="sm">Selected</Badge>
                )}
              </Group>
              <Text size="xs" color="dimmed">
                {Math.round(doc.size / 1024)} KB • {new Date(doc.uploaded).toLocaleString()}
              </Text>
            </Stack>
            
            <ActionIcon 
              color="red" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
              title="Delete this document"
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Box>
      ))}
    </Stack>
  );
}