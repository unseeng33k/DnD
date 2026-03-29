class AmbianceSystem {
  constructor(eventBus, ambianceRegistry) {
    this.eventBus = eventBus;
    this.ambianceRegistry = ambianceRegistry;
    this.imageCache = new Map();

    this.setupListeners();
  }

  setupListeners() {
    this.eventBus.on('turn:ambiance-resolved', (event) => {
      this.handleAmbianceRequest(event.data.sceneType);
    });

    this.eventBus.on('ambiance:image-request', (event) => {
      this.handleImageRequest(event.data.prompt, event.data.source);
    });
  }

  handleAmbianceRequest(sceneType) {
    const ambiance = this.ambianceRegistry.get(sceneType);
    
    if (!ambiance) {
      console.warn(`⚠️  No ambiance registered for scene type: ${sceneType}`);
      return;
    }

    console.log(`🎵 Music: ${ambiance.music.substring(0, 40)}...`);
    console.log(`🎨 Image prompt: ${ambiance.imagePrompt.substring(0, 40)}...`);

    this.eventBus.emit('ambiance:music', {
      url: ambiance.music,
      sceneType
    });

    this.eventBus.emit('ambiance:image', {
      prompt: ambiance.imagePrompt,
      sceneType
    });
  }

  handleImageRequest(prompt, source) {
    if (this.imageCache.has(prompt)) {
      console.log(`✅ Image found in cache`);
      return this.imageCache.get(prompt);
    }

    console.log(`🎨 Generating image: ${prompt.substring(0, 50)}...`);

    const imageUrl = `generated_${Date.now()}`;
    this.imageCache.set(prompt, imageUrl);

    this.eventBus.emit('ambiance:image-generated', {
      prompt,
      url: imageUrl,
      source,
      cachedAt: new Date()
    });

    return imageUrl;
  }
}

export { AmbianceSystem };
