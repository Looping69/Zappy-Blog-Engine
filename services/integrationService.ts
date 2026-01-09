
import { SanityConfig, AirtableConfig } from '../types';

export const publishToSanity = async (config: SanityConfig, title: string, content: string) => {
  const mutations = [{
    create: {
      _type: 'post',
      title: title,
      body: content, // Storing as raw markdown string for simplicity, or could be mapped to Portable Text
      publishedAt: new Date().toISOString()
    }
  }];

  const response = await fetch(`https://${config.projectId}.api.sanity.io/v2021-06-07/data/mutate/${config.dataset}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${config.token}`
    },
    body: JSON.stringify({ mutations })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.description || `Sanity Error: ${response.statusText}`);
  }
  return response.json();
};

export const publishToAirtable = async (config: AirtableConfig, title: string, content: string) => {
  const response = await fetch(`https://api.airtable.com/v0/${config.baseId}/${config.tableName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      fields: {
        Title: title,
        Content: content,
        Status: 'Draft'
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `Airtable Error: ${response.statusText}`);
  }
  return response.json();
};
