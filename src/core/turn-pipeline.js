class TurnPipeline {
  constructor(eventBus, effectRuntime, registries, dmMemoryAdapter = null, diceAdapter = null) {
    this.eventBus = eventBus;
    this.effectRuntime = effectRuntime;
    this.registries = registries;
    this.dmMemory = dmMemoryAdapter;      // Phase 1 Integration: DM-memory adapter (optional)
    this.diceAdapter = diceAdapter;        // Phase 4 Integration: Dice adapter (optional)
    this.turnCount = 0;
    this.turnHistory = [];
  }

  async execute(turnData) {
    this.turnCount++;

    const turnRecord = {
      turnNumber: this.turnCount,
      startTime: new Date(),
      input: turnData.input,
      stages: {}
    };

    try {
      const processedInput = await this.stageProcessInput(turnData.input);
      turnRecord.stages.input = processedInput;

      const ambiance = await this.stageResolveAmbiance(processedInput, turnData.context);
      turnRecord.stages.ambiance = ambiance;

      const effectResults = await this.stageApplyEffects(processedInput, turnData.context);
      turnRecord.stages.effects = effectResults;

      const worldUpdates = await this.stageUpdateWorldState(processedInput, effectResults, turnData.context);
      turnRecord.stages.worldState = worldUpdates;

      const output = await this.stageEmitOutput(ambiance, effectResults, worldUpdates);
      turnRecord.stages.output = output;

      turnRecord.status = 'complete';
      turnRecord.endTime = new Date();

    } catch (error) {
      console.error(`❌ Turn execution failed:`, error);
      turnRecord.status = 'failed';
      turnRecord.error = error.message;
      turnRecord.endTime = new Date();

      this.eventBus.emit('turn:failed', {
        turnNumber: this.turnCount,
        error: error.message
      });
    }
