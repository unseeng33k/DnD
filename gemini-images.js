const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyC1AIKfvGz9U8Wuow0u9-fH-TtnyHkMfs8';

/**
 * Generate AI images for D&D scenes using Gemini
 * Call during gameplay: "show me this room" → generates image
 */

async function generateSceneImage(prompt, style = '1979 D&D module art') {
  const fullPrompt = `${prompt}, ${style}, Erol Otus style, ink and watercolor illustration, atmospheric lighting`;
  
  // Gemini image generation endpoint
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`;
  
  const body = {
    contents: [{
      parts: [
        { text: `Generate an image: ${fullPrompt}` }
      ]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].inlineData) {
      return {
        success: true,
        imageData: data.candidates[0].content.parts[0].inlineData.data,
        mimeType: data.candidates[0].content.parts[0].inlineData.mimeType,
        prompt: fullPrompt
      };
    }
    
    return { success: false, error: 'No image generated', prompt: fullPrompt };
  } catch (err) {
    return { success: false, error: err.message, prompt: fullPrompt };
  }
}

/**
 * Generate room image from current game state
 */
async function generateRoomImage(roomDescription, environment, lighting) {
  const prompt = `${roomDescription}, ${environment}, ${lighting}, ancient dungeon, 1979 D&D module art style, Erol Otus, atmospheric, ink and watercolor`;
  return generateSceneImage(prompt);
}

/**
 * Generate monster image
 */
async function generateMonsterImage(monsterName, description, habitat) {
  const prompt = `${monsterName}: ${description}, ${habitat}, 1979 D&D Monster Manual art style, David Sutherland, ink illustration`;
  return generateSceneImage(prompt);
}

/**
 * Generate battle scene
 */
async function generateBattleImage(party, enemies, environment, action) {
  const prompt = `${party} fighting ${enemies} in ${environment}, ${action}, dynamic combat pose, 1979 D&D module art, Erol Otus style`;
  return generateSceneImage(prompt);
}

module.exports = {
  generateSceneImage,
  generateRoomImage,
  generateMonsterImage,
  generateBattleImage
};
