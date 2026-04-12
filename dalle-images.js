const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Generate AI images for D&D scenes using DALL-E 3
 * Call during gameplay: "show me this room" → generates image
 */

async function generateImage(prompt, size = '1024x1024') {
  const fullPrompt = `${prompt}. 1979 D&D module art style, Erol Otus or David Sutherland illustration style, ink and watercolor, atmospheric lighting, vintage TSR aesthetic`;
  
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        size: size,
        quality: 'standard',
        n: 1
      })
    });
    
    const data = await response.json();
    
    if (data.data && data.data[0]) {
      return {
        success: true,
        url: data.data[0].url,
        revised_prompt: data.data[0].revised_prompt,
        original_prompt: prompt
      };
    }
    
    return { 
      success: false, 
      error: data.error?.message || 'Unknown error',
      prompt: fullPrompt 
    };
  } catch (err) {
    return { 
      success: false, 
      error: err.message,
      prompt: fullPrompt 
    };
  }
}

/**
 * Generate room image from current game state
 */
async function generateRoomImage(roomDescription, environment, lighting) {
  const prompt = `${roomDescription}, ${environment}, ${lighting}, ancient dungeon`;
  return generateImage(prompt);
}

/**
 * Generate monster image
 */
async function generateMonsterImage(monsterName, description, habitat) {
  const prompt = `${monsterName}: ${description}, ${habitat}`;
  return generateImage(prompt);
}

/**
 * Generate battle scene
 */
async function generateBattleImage(party, enemies, environment, action) {
  const prompt = `${party} fighting ${enemies} in ${environment}, ${action}, dynamic combat pose`;
  return generateImage(prompt);
}

// CLI test
if (require.main === module) {
  const prompt = process.argv[2] || 'Ancient Olman temple entrance overgrown by jungle, weathered stone doorway with geometric carvings, thick vines, torchlight, stairs descending into darkness';
  
  console.log('Generating image...');
  console.log('Prompt:', prompt);
  
  generateImage(prompt).then(result => {
    if (result.success) {
      console.log('\n✅ Image generated!');
      console.log('URL:', result.url);
      console.log('\nRevised prompt:', result.revised_prompt);
    } else {
      console.log('\n❌ Error:', result.error);
    }
  });
}

module.exports = {
  generateImage,
  generateRoomImage,
  generateMonsterImage,
  generateBattleImage
};
