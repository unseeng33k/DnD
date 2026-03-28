#!/usr/bin/env node

/**
 * SPOTLIGHT & PACING SCHEDULER
 * 
 * Allocates mechanical wins, narrative moments, and emotional intensity
 * across the party fairly and rhythmically.
 * 
 * The orchestrator decides WHAT happens.
 * The graph remembers WHAT EXISTS.
 * This system decides WHO gets the next moment and WHEN.
 * 
 * Failure modes it prevents:
 * - Loudest player becoming main character
 * - Quiet player becoming permanent NPC
 * - Three combats in a row (fatigue)
 * - Hour of shopping (dragging)
 * - Pacing sludge (no rhythm)
 */

class SpotlightPacingScheduler {
  constructor(partyMembers = []) {
    this.party = partyMembers;
    
    // SPOTLIGHT TRACKING
    this.spotlightBalance = {};
    this.mechanicalWins = {};
    this.narrativeWins = {};
    this.decisionGates = {};