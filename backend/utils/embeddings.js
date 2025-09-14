//utils/embeddings.js

import fetch from 'node-fetch';

// Generate embeddings using OpenAI API
export const generateEmbedding = async (text) => {
  try {
    // For demo purposes, return a mock embedding if no API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('No OpenAI API key found, returning mock embedding');
      return Array.from({ length: 1536 }, () => Math.random() - 0.5);
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return mock embedding for demo purposes
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }
};

// Generate embeddings for multiple texts
export const generateEmbeddings = async (texts) => {
  try {
    // For demo purposes, return mock embeddings if no API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('No OpenAI API key found, returning mock embeddings');
      return texts.map(() => Array.from({ length: 1536 }, () => Math.random() - 0.5));
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: texts,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    // Return mock embeddings for demo purposes
    return texts.map(() => Array.from({ length: 1536 }, () => Math.random() - 0.5));
  }
};

// Calculate cosine similarity between two embeddings
export const calculateSimilarity = (embedding1, embedding2) => {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

// Find most similar embeddings
export const findMostSimilar = (queryEmbedding, candidateEmbeddings, topK = 5) => {
  const similarities = candidateEmbeddings.map((embedding, index) => ({
    index,
    similarity: calculateSimilarity(queryEmbedding, embedding)
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};

// Generate embedding for shelter features
export const generateShelterEmbedding = async (shelter) => {
  const features = shelter.features || '';
  const description = `${shelter.name} ${features}`.trim();
  return await generateEmbedding(description);
};

// Generate embedding for request needs
export const generateRequestEmbedding = async (request) => {
  const needs = request.needs || '';
  const features = request.features_required || '';
  const description = `${needs} ${features}`.trim();
  return await generateEmbedding(description);
};

// Legacy function for backward compatibility
export function getEmbedding(query) {
  // This is a placeholder - in a real implementation, you would use a model like SentenceTransformers
  // For now, we'll generate a random 4-dimensional vector
  return Array.from({length: 4}, () => Math.random());
}