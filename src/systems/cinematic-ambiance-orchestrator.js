/**
 * CINEMATIC AMBIANCE ORCHESTRATOR - LEVEL 3 FULL INTEGRATION
 * SOURCE OF TRUTH: /src/systems/cinematic-ambiance-orchestrator.js
 */

class CinematicAmbianceOrchestrator {
  constructor(eventBus, systems, imageHandler, config = {}) {
    this.eventBus = eventBus;
    this.systems = systems;
    this.imageHandler = imageHandler;
    this.config = {
      telegramChatId: config.telegramChatId || null,
      enableImages: config.enableImages !== false,
      enableMusic: config.enableMusic !== false,
      enableSensory: config.enableSensory !== false,
      verbose: config.verbose === true,
      ...config
    };

    this.sceneHistory = [];
    this.momentLog = [];
    this.sessionState = {
      currentScene: null,
      currentMood: null,
      activeArcMoments: [],
      beatActive: false
    };

    this.setupEventListeners();    if (this.config.verbose) {
      console.log('✅ CinematicAmbianceOrchestrator initialized (LEVEL 3)');
    }
  }

  setupEventListeners() {
    this.eventBus.on('ambiance:image-generated', (event) => {
      this.logMoment('image-generated', event.data);
    });

    this.eventBus.on('turn:world-updated', (event) => {
      this.sessionState.lastWorldUpdate = event.data;
    });

    this.eventBus.on('combat:round-started', (event) => {
      this.logMoment('combat-round', event.data);
    });

    this.eventBus.on('character:arc-advanced', (event) => {
      this.logMoment('character-arc', event.data);
    });
  }

  async scene(sceneName, cinematicGuidance = {}) {
    this.logMoment('scene-start', { sceneName, guidance: cinematicGuidance });

    try {
      const cinematicData = this.getCinematicDirection(sceneName, cinematicGuidance);
      const ambianceData = await this.getAmbianceData(sceneName);      
      let imageData = null;
      if (this.config.enableImages && this.imageHandler) {
        imageData = await this.generateSceneImage(sceneName, ambianceData.imagePrompt);
      }

      const unifiedExperience = this.mergeExperience(sceneName, cinematicData, ambianceData, imageData);

      if (this.config.telegramChatId && this.imageHandler) {
        await this.deliverToTelegram(unifiedExperience);
      }

      this.sessionState.currentScene = sceneName;
      this.sessionState.currentMood = unifiedExperience.mood;
      this.sceneHistory.push({ name: sceneName, timestamp: new Date(), experience: unifiedExperience });

      this.eventBus.emit('cinematic:scene-loaded', { scene: sceneName, experience: unifiedExperience });

      if (this.config.verbose) { console.log(`🎬 Scene loaded: ${sceneName}`); }
      return unifiedExperience;
    } catch (error) {
      console.error(`❌ Error loading scene ${sceneName}:`, error);
      this.eventBus.emit('cinematic:scene-error', { sceneName, error: error.message });
      throw error;
    }
  }

  async combatRound(roundNumber, enemyName, actions, environment = {}) {
    this.logMoment('combat-round-start', { roundNumber, enemyName, actionCount: actions.length });
    try {
      const choreography = this.getCombatChoreography(roundNumber, enemyName, actions, environment);
      const sensoryImpact = this.generateCombatSensory(actions, environment, choreography.emotionalBeat);
      let environmentImage = null;
      if (environment.imageKey && this.imageHandler) {
        environmentImage = await this.generateCombatEnvironmentImage(environment, choreography);
      }

      const unifiedCombatMoment = {
        roundNumber,
        enemy: enemyName,
        choreography: choreography,
        sensory: sensoryImpact,
        environment: environment,
        image: environmentImage,
        actions: actions.map(a => this.enrichActionWithSensory(a, sensoryImpact)),
        deliveryTiming: this.getCombatTiming(actions.length, choreography.pace)
      };

      if (environmentImage && this.config.telegramChatId) { await this.deliverCombatToTelegram(unifiedCombatMoment); }
      this.eventBus.emit('cinematic:combat-round', unifiedCombatMoment);
      if (this.config.verbose) { console.log(`⚔️  Combat round ${roundNumber} choreographed`); }
      return unifiedCombatMoment;
    } catch (error) {
      console.error(`❌ Error choreographing combat round ${roundNumber}:`, error);
      throw error;
    }
  }

  async injury(character, damage, damageType, source) {
    this.logMoment('injury', { character: character.name, damage, damageType, source });
    try {
      const narrative = this.getInjuryNarrative(character, damage, damageType, source);
      const sensory = {
        visual: this.getInjurySensoryVisual(damageType, damage, character),
        auditory: this.getInjurySensoryAudio(damageType, source),
        olfactory: this.getInjurySensorySmell(damageType),
        tactile: this.getInjurySensoryTouch(damage, damageType),
        gustatory: this.getInjurySensoryTaste(damageType, damage),
        psychological: this.getInjuryPsychological(character, damage)
      };
      let injuryImage = null;
      if (damage > 10 && this.imageHandler) { injuryImage = await this.generateInjuryImage(character, damage, damageType); }
      const injuryMoment = { character: character.name, damage, damageType, source, narrative, sensory, image: injuryImage, impact: this.calculateInjuryImpact(character, damage), deliveryMethod: 'all-senses-simultaneously' };
      if (this.config.telegramChatId) { await this.deliverInjuryToTelegram(injuryMoment); }
      this.eventBus.emit('cinematic:injury-moment', injuryMoment);
      if (this.config.verbose) { console.log(`🩸 Injury moment for ${character.name}: ${damage} ${damageType}`); }
      return injuryMoment;
    } catch (error) { console.error(`❌ Error creating injury moment:`, error); throw error; }
  }

  async beat(currentMoment, nextMoment) {
    this.logMoment('the-beat', { current: currentMoment, next: nextMoment });
    try {
      this.sessionState.beatActive = true;
      const beatDuration = this.calculateBeatDuration(currentMoment, nextMoment);
      const psychologicalGuidance = this.getBeatPsychology(currentMoment, nextMoment);
      const beatMoment = { currentMoment, nextMoment, durationSeconds: beatDuration, sensory: { sound: 'COMPLETE SILENCE', visual: 'NO NEW IMAGES', narrative: 'NO DESCRIPTION', psychological: psychologicalGuidance }, instruction: `Deliver this in complete silence. Wait ${beatDuration} seconds. This is THE moment your campaign will be remembered for.`, importance: 'CRITICAL - This beat defines the entire narrative arc', playerState: { expected: 'Hold breath, lean forward, complete attention', emotional: 'Anticipation, dread, wonder, hope, revelation', impact: 'This moment echoes through the rest of the campaign' } };
      if (this.config.telegramChatId && this.imageHandler) { await this.deliverBeatToTelegram(beatMoment); }
      this.eventBus.emit('cinematic:the-beat', beatMoment);
      if (this.config.verbose) { console.log(`⏸️  THE BEAT: ${beatDuration}s silence`); }
      setTimeout(() => { this.sessionState.beatActive = false; this.eventBus.emit('cinematic:beat-complete', { beatMoment }); }, beatDuration * 1000);
      return beatMoment;
    } catch (error) { console.error(`❌ Error creating beat:`, error); throw error; }
  }

  async characterArcMoment(character, arcData, sceneKey) {
    this.logMoment('character-arc-moment', { character, sceneKey });
    try {
      const arcNarrative = this.getCharacterArcNarrative(character, arcData);
      const sceneData = await this.getAmbianceData(sceneKey);
      let characterSceneImage = null;
      if (this.imageHandler) { characterSceneImage = await this.generateCharacterArcImage(character, arcData, sceneKey, sceneData); }
      const music = this.curateArcMusic(character, arcData, sceneKey);
      const arcMoment = { character, arc: arcData, scene: sceneKey, narrative: arcNarrative, sensory: sceneData, image: characterSceneImage, music, significance: this.calculateArcSignificance(arcData), guidance: `This is a quiet moment where bonds form. The character grows. The world notices.`, impact: `This arc decision echoes through the rest of the campaign`, deliveryTiming: 'slow, deliberate, full of weight' };
      this.sessionState.activeArcMoments.push(arcMoment);
      if (this.config.telegramChatId) { await this.deliverCharacterArcToTelegram(arcMoment); }
      this.eventBus.emit('cinematic:character-arc-moment', arcMoment);
      if (this.config.verbose) { console.log(`📖 Character arc moment: ${character} in ${sceneKey}`); }
      return arcMoment;
    } catch (error) { console.error(`❌ Error creating character arc moment:`, error); throw error; }
  }

  getCinematicDirection(sceneName, guidance) {
    return { sceneName, composition: { foreground: guidance.foreground || '', midground: guidance.midground || '', background: guidance.background || '' }, emotionalBeat: guidance.emotionalBeat || 'neutral', guidanceForDM: `Describe ${guidance.foreground}. Then pan to ${guidance.midground}. Finally, ${guidance.background}.` };
  }

  async getAmbianceData(sceneName) { if (this.systems?.ambianceRegistry) { return this.systems.ambianceRegistry.get(sceneName) || this.getDefaultAmbiance(sceneName); } return this.getDefaultAmbiance(sceneName); }

  getDefaultAmbiance(sceneName) { return { sceneType: sceneName, music: 'https://youtube.com/...', imagePrompt: `${sceneName} in fantasy RPG style`, sensory: { visual: `The ${sceneName} stretches before you`, auditory: 'Ambient sound', olfactory: 'The scent of adventure', tactile: 'The weight of adventure', gustatory: 'The taste of the moment' } }; }

  async generateSceneImage(sceneName, imagePrompt) { if (!this.imageHandler) return null; try { const result = await this.imageHandler.generateImageDALLE(imagePrompt); return { success: result.success, filepath: result.filepath, prompt: imagePrompt, generatedAt: new Date(), url: result.url }; } catch (error) { console.error(`Image generation failed for ${sceneName}:`, error); return null; } }

  mergeExperience(sceneName, cinematicData, ambianceData, imageData) { return { scene: sceneName, mood: cinematicData.emotionalBeat, cinematic: cinematicData, sensory: ambianceData.sensory, image: imageData, music: ambianceData.music, caption: this.buildSceneCaption(cinematicData, ambianceData), dmGuidance: cinematicData.guidanceForDM }; }

  buildSceneCaption(cinematicData, ambianceData) { return `🎲 **${cinematicData.sceneName}**\nMood: *${cinematicData.emotionalBeat.toUpperCase()}*\n\n👁️ **Visual**: ${ambianceData.sensory?.visual || 'Vivid detail'}\n🎵 **Music**: [Play](${ambianceData.music})\n🔊 **Sounds**: ${ambianceData.sensory?.auditory || 'Ambient'}\n👃 **Smell**: ${ambianceData.sensory?.olfactory || 'Evocative'}\n👆 **Touch**: ${ambianceData.sensory?.tactile || 'Immersive'}`; }

  getCombatChoreography(roundNumber, enemyName, actions, environment) { return { roundNumber, enemy: enemyName, pace: actions.length > 4 ? 'frantic' : 'controlled', emotionalBeat: 'intense', narrativeFlow: this.buildCombatNarrative(actions), emphasis: 'Action drives narrative' }; }

  buildCombatNarrative(actions) { return actions.map((a, i) => `${i + 1}) ${a.actor}: ${a.description}`).join('\n'); }

  generateCombatSensory(actions, environment, emotionalBeat) { const hasInjury = actions.some(a => a.description.includes('damage') || a.description.includes('wound')); const hasMagic = actions.some(a => a.description.includes('spell') || a.description.includes('magic')); return { visual: `Steel clashing, ${hasMagic ? 'magic crackling' : 'weapons striking'}`, auditory: `${hasInjury ? 'Screams, cries of pain' : 'Metallic clash of combat'}`, olfactory: `${hasInjury ? 'Blood, sweat, fear' : 'Dust, effort, adrenaline'}`, tactile: `${hasMagic ? 'Arcane energy crackles through the air' : 'Shockwave of impacts'}`, emotional: emotionalBeat }; }

  enrichActionWithSensory(action, sensoryImpact) { return { ...action, sensory: sensoryImpact }; }

  getCombatTiming(actionCount, pace) { return { pace, secondsPerAction: pace === 'frantic' ? 2 : 3, totalDuration: actionCount * (pace === 'frantic' ? 2 : 3), pauseAfterKeyMoments: true }; }

  async generateCombatEnvironmentImage(environment, choreography) { if (!this.imageHandler) return null; const prompt = `Combat in ${environment.location || 'battlefield'}, fantasy RPG style`; return this.generateSceneImage(`combat-${environment.location}`, prompt); }

  getInjuryNarrative(character, damage, damageType, source) { const severity = damage > 15 ? 'devastating' : damage > 8 ? 'serious' : 'painful'; return `${character.name} takes a ${severity} ${damageType} wound from ${source}. ${damage} damage.`; }

  getInjurySensoryVisual(damageType, damage, character) { const bloodLevel = damage > 15 ? 'profuse' : damage > 8 ? 'visible' : 'minimal'; return `${bloodLevel} ${damageType} wound, ${character.name} staggers`; }

  getInjurySensoryAudio(damageType, source) { return `Sharp cry of pain, sound of tearing flesh`; }
  getInjurySensorySmell(damageType) { return `Copper tang of blood, burnt flesh if fire`; }
  getInjurySensoryTouch(damage, damageType) { return `Searing pain, ${damageType === 'fire' ? 'heat' : 'sharp sting'}`; }
  getInjurySensoryTaste(damageType, damage) { return `Iron taste of blood in mouth`; }
  getInjuryPsychological(character, damage) { return `${character.name} realizes mortality is real. ${damage} damage feels like MORE.`; }

  calculateInjuryImpact(character, damage) { return { isLethal: damage > 20, isSevere: damage > 15, isMeaningful: damage > 8, needsHealing: damage > 5 }; }

  async generateInjuryImage(character, damage, damageType) { if (!this.imageHandler) return null; const severity = damage > 15 ? 'gravely wounded' : 'bleeding from'; const prompt = `${character.name} ${severity} by ${damageType} wound in fantasy RPG style`; return this.generateSceneImage(`injury-${character.name}`, prompt); }

  calculateBeatDuration(currentMoment, nextMoment) { return 5; }
  getBeatPsychology(currentMoment, nextMoment) { return `The moment "${currentMoment}" happens, the world holds its breath. Then "${nextMoment}". This silence is where destiny turns.`; }

  async deliverBeatToTelegram(beatMoment) { if (!this.imageHandler || !this.config.telegramChatId) return; const message = `⏸️ **THE BEAT**\n\n${beatMoment.instruction}\n\nCurrent: "${beatMoment.currentMoment}"\nNext: "${beatMoment.nextMoment}"\n\n⏱️ ${beatMoment.durationSeconds} seconds of silence.`; try { if (this.imageHandler.sendTextToTelegram) { await this.imageHandler.sendTextToTelegram(this.config.telegramChatId, message); } } catch (error) { console.error('Failed to send beat to Telegram:', error); } }

  getCharacterArcNarrative(character, arcData) { return `${character} has grown from "${arcData.startingTrait}" to "${arcData.currentTrait}". The next test approaches: ${arcData.nextTest}`; }

  async generateCharacterArcImage(character, arcData, sceneKey, sceneData) { if (!this.imageHandler) return null; const prompt = `Character ${character} in ${sceneKey}, ${arcData.currentTrait}, fantasy RPG style`; return this.generateSceneImage(`character-arc-${character}-${sceneKey}`, prompt); }

  curateArcMusic(character, arcData, sceneKey) { return 'https://youtube.com/watch?v=...'; }
  calculateArcSignificance(arcData) { return 'major'; }

  async deliverToTelegram(experience) { if (!this.imageHandler || !this.config.telegramChatId) return; try { if (experience.image?.filepath && this.imageHandler.sendImageToTelegram) { await this.imageHandler.sendImageToTelegram(experience.image.filepath, this.config.telegramChatId, experience.caption); } else if (this.imageHandler.sendTextToTelegram) { await this.imageHandler.sendTextToTelegram(this.config.telegramChatId, experience.caption); } } catch (error) { console.error('Failed to deliver scene to Telegram:', error); } }

  async deliverCombatToTelegram(combatMoment) { if (!this.imageHandler || !this.config.telegramChatId) return; try { const caption = `⚔️ **Round ${combatMoment.roundNumber}**\nEnemy: *${combatMoment.enemy}*\n\n${combatMoment.choreography.narrativeFlow}\n\n🔊 ${combatMoment.sensory.auditory}\n👁️ ${combatMoment.sensory.visual}`; if (combatMoment.image?.filepath && this.imageHandler.sendImageToTelegram) { await this.imageHandler.sendImageToTelegram(combatMoment.image.filepath, this.config.telegramChatId, caption); } else if (this.imageHandler.sendTextToTelegram) { await this.imageHandler.sendTextToTelegram(this.config.telegramChatId, caption); } } catch (error) { console.error('Failed to deliver combat to Telegram:', error); } }

  async deliverInjuryToTelegram(injuryMoment) { if (!this.imageHandler || !this.config.telegramChatId) return; try { const caption = `🩸 **${injuryMoment.character} is wounded!**\n\n${injuryMoment.narrative}\n\n👁️ ${injuryMoment.sensory.visual}\n🔊 ${injuryMoment.sensory.auditory}\n👃 ${injuryMoment.sensory.olfactory}\n👆 ${injuryMoment.sensory.tactile}\n🧠 ${injuryMoment.sensory.psychological}`; if (injuryMoment.image?.filepath && this.imageHandler.sendImageToTelegram) { await this.imageHandler.sendImageToTelegram(injuryMoment.image.filepath, this.config.telegramChatId, caption); } else if (this.imageHandler.sendTextToTelegram) { await this.imageHandler.sendTextToTelegram(this.config.telegramChatId, caption); } } catch (error) { console.error('Failed to deliver injury to Telegram:', error); } }

  async deliverCharacterArcToTelegram(arcMoment) { if (!this.imageHandler || !this.config.telegramChatId) return; try { const caption = `📖 **${arcMoment.character}'s Journey**\n\n${arcMoment.narrative}\n\nScene: ${arcMoment.scene}\n🎵 Music: [Link](${arcMoment.music})\n\n💡 *${arcMoment.guidance}*`; if (arcMoment.image?.filepath && this.imageHandler.sendImageToTelegram) { await this.imageHandler.sendImageToTelegram(arcMoment.image.filepath, this.config.telegramChatId, caption); } else if (this.imageHandler.sendTextToTelegram) { await this.imageHandler.sendTextToTelegram(this.config.telegramChatId, caption); } } catch (error) { console.error('Failed to deliver character arc to Telegram:', error); } }

  logMoment(type, data) { this.momentLog.push({ type, data, timestamp: new Date(), sessionScene: this.sessionState.currentScene }); if (this.momentLog.length > 1000) { this.momentLog.shift(); } }

  getSessionSummary() { return { scenes: this.sceneHistory.length, moments: this.momentLog.length, currentScene: this.sessionState.currentScene, currentMood: this.sessionState.currentMood, sceneHistory: this.sceneHistory, momentLog: this.momentLog.slice(-20) }; }

  reset() { this.sceneHistory = []; this.momentLog = []; this.sessionState = { currentScene: null, currentMood: null, activeArcMoments: [], beatActive: false }; }
}

export { CinematicAmbianceOrchestrator };