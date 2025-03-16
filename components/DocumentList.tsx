import React from 'react';
import { Table, ActionIcon, Text, Card, Group } from '@mantine/core';
import { IconTrash, IconMessage } from '@tabler/icons-react';
import { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  onSelect: (document: Document) => void;
  onDelete: (documentId: string) => void;
}

export function DocumentList({ documents, onSelect, onDelete }: DocumentListProps) {
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
    <Table striped>
      <thead>
        <tr>
          <th>Document</th>
          <th>Size</th>
          <th>Uploaded</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td>
              <Text weight={500}>{doc.name}</Text>
            </td>
            <td>
              {Math.round(doc.size / 1024)} KB
            </td>
            <td>
              {new Date(doc.uploaded).toLocaleString()}
            </td>
            <td>
              <Group spacing={8}>
                <ActionIcon 
                  color="blue" 
                  onClick={() => onSelect(doc)}
                  title="Chat with this document"
                >
                  <IconMessage size={18} />
                </ActionIcon>
                <ActionIcon 
                  color="red" 
                  onClick={() => onDelete(doc.id)}
                  title="Delete this document"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}