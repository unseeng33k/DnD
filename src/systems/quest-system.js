class QuestSystem {
  constructor(eventBus, registries) {
    this.eventBus = eventBus;
    this.registries = registries;
    this.activeQuest = null;
  }

  initialize(questConfig) {
    console.log(`🎭 Initializing quest: ${questConfig.questName}`);

    this.activeQuest = {
      id: questConfig.questName.toLowerCase().replace(/\s+/g, '-'),
      name: questConfig.questName,
      town: questConfig.townName,
      mood: questConfig.townMood,
      hook: questConfig.hookType,
      stakes: questConfig.stakeLevel,
      startedAt: new Date()
    };

    this.eventBus.emit('quest:initialized', {
      quest: this.activeQuest
    });

    return this.activeQuest;
  }

  getCurrentQuest() {
    return this.activeQuest;
  }

  completeQuest() {
    if (!this.activeQuest) return;

    this.eventBus.emit('quest:completed', {
      questId: this.activeQuest.id,
      completedAt: new Date()
    });

    this.activeQuest = null;
  }
}

export { QuestSystem };
