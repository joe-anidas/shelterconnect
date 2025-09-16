// Test Gemini API integration
import vectorEmbeddingService from './utils/vectorEmbeddings.js';

async function testGeminiEmbeddings() {
  try {
    console.log('🧪 Testing Gemini embeddings integration...');
    
    const testText = "Emergency shelter request for family of 4 in San Francisco. Need food and medical assistance.";
    console.log('📝 Input text:', testText);
    
    const embedding = await vectorEmbeddingService.generateEmbedding(testText);
    console.log('✅ Embedding generated successfully!');
    console.log('📊 Embedding dimensions:', embedding.length);
    console.log('🔢 First 10 values:', embedding.slice(0, 10));
    
    // Verify it's the expected 1536 dimensions
    if (embedding.length === 1536) {
      console.log('✅ Correct embedding dimensions (1536)');
    } else {
      console.log('❌ Incorrect embedding dimensions:', embedding.length);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing Gemini embeddings:', error);
    process.exit(1);
  }
}

testGeminiEmbeddings();