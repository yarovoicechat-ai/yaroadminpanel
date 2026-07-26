import { useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface PageRegistryField {
  key: string;
  label: string;
}

export interface PageRegistryMetadata {
  pageId: string;
  name: string;
  category?: string;
  icon?: string;
  actions?: string[];
  fields?: PageRegistryField[];
  columns?: PageRegistryField[];
  buttons?: PageRegistryField[];
  tabs?: PageRegistryField[];
  cards?: PageRegistryField[];
  widgets?: PageRegistryField[];
  filters?: PageRegistryField[];
  metadata?: Record<string, any>;
}

export function usePageRegistry(metadata: PageRegistryMetadata) {
  useEffect(() => {
    const registerPage = async () => {
      try {
        await apiClient.post('/api/ems/pages/register', {
          pageId: metadata.pageId,
          name: metadata.name,
          category: metadata.category || 'General',
          icon: metadata.icon || '',
          actions: metadata.actions || [],
          fields: metadata.fields || [],
          columns: metadata.columns || [],
          buttons: metadata.buttons || [],
          tabs: metadata.tabs || [],
          cards: metadata.cards || [],
          widgets: metadata.widgets || [],
          filters: metadata.filters || [],
          metadata: metadata.metadata || {}
        });
      } catch (err: any) {
        console.warn('[Dynamic Page Registry] Notice:', metadata.pageId, err?.message || err);
      }
    };
    registerPage();
  }, [metadata.pageId]);
}
