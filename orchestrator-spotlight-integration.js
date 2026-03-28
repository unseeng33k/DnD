#!/usr/bin/env node

/**
 * ORCHESTRATOR + SPOTLIGHT SCHEDULER INTEGRATION
 * 
 * The orchestrator decides WHAT happens.
 * The spotlight scheduler biases WHO it happens to and WHEN.
 * 
 * This integration layer connects them:
 * Before the orchestrator suggests a scene/hook/NPC reaction,
 * it checks: "What does the spotlight scheduler want right now?"
 */

class OrchestratorSpotlightIntegration {
  constructor(orchestrator, spotlightScheduler, worldGraph) {
    this.orchestrator = orchestrator;
    this.scheduler = spotlightScheduler;
    this.graph = worldGraph;
  }

  /**
   * ORCHESTRATE ACTION WITH SPOTLIGHT BIAS
   * 
   * Same as normal orchestration, but biased toward fair spotlight allocation
   */
  async orchestrateWithSpotlightBias(playerAction) {
    // Get the bias first
    const bias = this.scheduler.getBias();

    // Let orchestrator do its thing
    const baseDecision = await this.orchestrator.orchestrateAction(playerAction);

    // NOW APPLY SPOTLIGHT BIAS
    const biasedDecision = await this.applySpotlightBias(
      baseDecision,
      bias,
      playerAction
    );

    // Record what happened for scheduler
    this.scheduler.recordMoment(
      playerAction.actor,
      this.determineMomentType(biasedDecision),
      baseDecision.stages.narrative.shortForm
    );

    return biasedDecision;
  }

  /**
   * APPLY SPOTLIGHT BIAS TO DECISION
   * 
   * Modify orchestrator output to favor underfed PCs
   */
  async applySpotlightBias(decision, bias, playerAction) {
    // If spotlight scheduler says "PC X needs attention", try to weave it in
    if (bias.pcBias && bias.pcBias !== playerAction.actor) {
      // Don't force it, but surface related hooks
      decision.stages.suggestedFollowUps = await this.graph.queryNearbyHooks(
        playerAction.location
      );

      decision.stages.spotlightNote = {
        underfed: bias.pcName,
        howToWeaveIn: {
          searchForHooks: `Hooks about ${bias.pcName}'s backstory`,
          mechanicalWeaponry: `Scene that uses ${bias.pcName}'s build strength`,
          narrativeThreads: `Unresolved story arcs from ${bias.pcName}'s past`
        }
      };
    }

    return decision;
  }

  /**
   * SUGGEST NEXT SCENE
   * 
   * Instead of DM guessing, ask: "What should happen next, based on fairness + pacing?"
   */
  async suggestNextScene() {
    const spotlightRec = this.scheduler.recommendNextSpotlight();
    const pacingRec = this.scheduler.recommendNextSceneType();
    const pacingAnalysis = this.scheduler.getPacingAnalysis();

    return {
      spotlight: {
        nextPC: spotlightRec.nextPC,
        deficit: spotlightRec.deficit,
        mechanics: spotlightRec.mechanics,
        narrative: spotlightRec.narrative
      },
      pacing: {
        suggestion: pacingRec.suggestedType,
        intensity: pacingRec.suggestedIntensity,
        reasoning: pacingRec.reasoning,
        tableEnergy: pacingAnalysis.currentTableEnergy
      },
      implementation: {
        hookType: this.mapSpotlightToHook(spotlightRec.nextPC),
        sceneTemplate: this.mapPacingToTemplate(pacingRec.suggestedType),
        intensity: pacingRec.suggestedIntensity
      }
    };
  }

  /**
   * RECORD SCENE
   * 
   * After a scene completes, log it for scheduler
   */
  recordScene(sceneType, intensity, duration) {
    this.scheduler.recordScene(sceneType, intensity, duration);
  }

  /**
   * DISPLAY SPOTLIGHT STATUS
   * 
   * Real-time spotlight balance
   */
  displaySpotlightStatus() {
    const balance = this.scheduler.getSpotlightBalance();
    const pacing = this.scheduler.getPacingAnalysis();

    const status = {
      timestamp: Date.now(),
      session: this.scheduler.sessionNumber,
      spotlight: balance,
      pacing: pacing,
      bias: this.scheduler.getBias()
    };

    return status;
  }

  /**
   * HELPERS
   */
  determineMomentType(decision) {
    if (decision.stages.subsystemExecution?.subsystemUsed === 'combat') {
      return 'mechanical_win';
    } else if (decision.stages.narrative?.shortForm?.includes('backstory')) {
      return 'narrative_moment';
    }
    return 'action';
  }

  mapSpotlightToHook(pcName) {
    return {
      backstory: `Someone from ${pcName}'s past`,
      mechanics: `Situation demanding ${pcName}'s unique ability`,
      decision: `Critical choice that plays to ${pcName}'s strengths`
    };
  }

  mapPacingToTemplate(sceneType) {
    const templates = {
      'combat': 'tactical_encounter',
      'social': 'negotiation_or_intrigue',
      'exploration': 'discovery_scene',
      'roleplay': 'character_moment',
      'downtime': 'recovery_scene',
      'exposition': 'information_delivery'
    };

    return templates[sceneType] || 'open_scene';
  }
}

export { OrchestratorSpotlightIntegration };
