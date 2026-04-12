#!/usr/bin/env node

/**
 * DM Learning System - Feedback & Adaptation Tracker
 * Captures player preferences and suggests DM improvements
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

const LEARNING_FILE = path.join(__dirname, 'learning-system.json');
const FEEDBACK_FILE = path.join(__dirname, 'feedback.md');

function loadLearningData() {
  if (fs.existsSync(LEARNING_FILE)) {
    return JSON.parse(fs.readFileSync(LEARNING_FILE, 'utf8'));
  }
  return {
    version: "1.0",
    player: {
      name: "",
      playStyle: {},
      preferences: {},
      feedback: { positive: [], negative: [], suggestions: [] },
      characterHistory: [],
      favoriteMoments: [],
      frustrations: []
    },
    sessions: [],
    dmImprovements: { narrationAdjustments: [], ruleInterpretations: [], pacingChanges: [], contentAdditions: [] },
    patterns: { successfulEncounters: [], failedEncounters: [], playerTriggers: {}, engagementMetrics: {} }
  };
}

function saveLearningData(data) {
  fs.writeFileSync(LEARNING_FILE, JSON.stringify(data, null, 2));
}

function appendFeedback(text) {
  const timestamp = new Date().toISOString();
  const entry = `\n## ${timestamp}\n\n${text}\n`;
  fs.appendFileSync(FEEDBACK_FILE, entry);
}

async function collectPostSessionFeedback() {
  console.log('\n🎲 POST-SESSION FEEDBACK\n');
  console.log('Help me DM better for YOU.\n');
  
  const data = loadLearningData();
  const sessionNum = data.sessions.length + 1;
  
  const feedback = {
    session: sessionNum,
    timestamp: new Date().toISOString(),
    responses: {}
  };
  
  // Core questions
  console.log('--- HIGHLIGHTS ---');
  feedback.responses.favoriteMoment = await question('What was your favorite moment? ');
  
  if (feedback.responses.favoriteMoment) {
    data.player.favoriteMoments.push({
      session: sessionNum,
      moment: feedback.responses.favoriteMoment,
      date: new Date().toISOString()
    });
  }
  
  console.log('\n--- PACING ---');
  feedback.responses.pacing = await question('How was the pacing? (too fast/just right/too slow/mixed): ');
  
  console.log('\n--- ENGAGEMENT ---');
  feedback.responses.mostEngaged = await question('When were you most engaged? ');
  feedback.responses.leastEngaged = await question('When did you check out or get bored? ');
  
  if (feedback.responses.leastEngaged) {
    data.player.frustrations.push({
      session: sessionNum,
      issue: feedback.responses.leastEngaged,
      date: new Date().toISOString()
    });
  }
  
  console.log('\n--- CONTENT ---');
  feedback.responses.wantMore = await question('What do you want MORE of? ');
  feedback.responses.wantLess = await question('What do you want LESS of? ');
  
  console.log('\n--- RULES & CHALLENGES ---');
  feedback.responses.difficulty = await question('How was the difficulty? (too easy/just right/too hard/unfair): ');
  feedback.responses.rulesIssues = await question('Any rules feel off or unfair? ');
  
  console.log('\n--- NPCs & STORY ---');
  feedback.responses.npcOpinion = await question('How are the NPCs? (memorable/flat/mixed): ');
  feedback.responses.storyInterest = await question('How invested are you in the story? (1-10): ');
  
  console.log('\n--- OPEN FEEDBACK ---');
  feedback.responses.suggestions = await question('Any suggestions for next session? ');
  
  if (feedback.responses.suggestions) {
    data.player.feedback.suggestions.push({
      session: sessionNum,
      suggestion: feedback.responses.suggestions,
      date: new Date().toISOString()
    });
  }
  
  // Detect patterns
  detectPatterns(data, feedback);
  
  // Generate adaptations
  const adaptations = generateAdaptations(data, feedback);
  
  // Save
  data.sessions.push(feedback);
  saveLearningData(data);
  
  // Append to markdown log
  let mdEntry = `# Session ${sessionNum} Feedback\n\n`;
  mdEntry += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
  mdEntry += `### Highlights\n- Favorite moment: ${feedback.responses.favoriteMoment || 'None noted'}\n\n`;
  mdEntry += `### Pacing & Engagement\n- Pacing: ${feedback.responses.pacing || 'Not specified'}\n`;
  mdEntry += `- Most engaged: ${feedback.responses.mostEngaged || 'Not specified'}\n`;
  mdEntry += `- Least engaged: ${feedback.responses.leastEngaged || 'Not specified'}\n\n`;
  mdEntry += `### Content Preferences\n- Want more: ${feedback.responses.wantMore || 'Nothing specific'}\n`;
  mdEntry += `- Want less: ${feedback.responses.wantLess || 'Nothing specific'}\n\n`;
  mdEntry += `### DM Adaptations for Next Session\n`;
  if (adaptations.length > 0) {
    adaptations.forEach(a => mdEntry += `- ${a}\n`);
  } else {
    mdEntry += `- No major changes needed\n`;
  }
  mdEntry += `\n---\n`;
  
  fs.appendFileSync(FEEDBACK_FILE, mdEntry);
  
  // Output summary
  console.log('\n' + '='.repeat(50));
  console.log('FEEDBACK RECORDED');
  console.log('='.repeat(50));
  console.log(`\n📊 Session ${sessionNum} analyzed`);
  
  if (adaptations.length > 0) {
    console.log('\n🎯 ADAPTATIONS FOR NEXT SESSION:');
    adaptations.forEach(a => console.log(`   • ${a}`));
  }
  
  console.log(`\n💾 Saved to: ${LEARNING_FILE}`);
  console.log(`📝 Logged to: ${FEEDBACK_FILE}`);
  
  rl.close();
}

function detectPatterns(data, feedback) {
  // Track combat vs roleplay preference
  if (feedback.responses.mostEngaged) {
    const text = feedback.responses.mostEngaged.toLowerCase();
    if (text.includes('combat') || text.includes('fight') || text.includes('battle')) {
      data.patterns.playerTriggers.combatPreference = (data.patterns.playerTriggers.combatPreference || 0) + 1;
    }
    if (text.includes('talk') || text.includes('npc') || text.includes('conversation') || text.includes('roleplay')) {
      data.patterns.playerTriggers.roleplayPreference = (data.patterns.playerTriggers.roleplayPreference || 0) + 1;
    }
    if (text.includes('puzzle') || text.includes('trap') || text.includes('figured out')) {
      data.patterns.playerTriggers.puzzlePreference = (data.patterns.playerTriggers.puzzlePreference || 0) + 1;
    }
  }
  
  // Track risk tolerance
  if (feedback.responses.difficulty) {
    const diff = feedback.responses.difficulty.toLowerCase();
    if (diff.includes('easy')) data.patterns.playerTriggers.riskTolerance = 'low';
    if (diff.includes('hard') || diff.includes('unfair')) data.patterns.playerTriggers.riskTolerance = 'high';
    if (diff.includes('just right')) data.patterns.playerTriggers.riskTolerance = 'medium';
  }
  
  // Track pacing preference
  if (feedback.responses.pacing) {
    const pace = feedback.responses.pacing.toLowerCase();
    if (pace.includes('fast')) data.patterns.playerTriggers.preferredPacing = 'fast';
    if (pace.includes('slow')) data.patterns.playerTriggers.preferredPacing = 'slow';
    if (pace.includes('just right')) data.patterns.playerTriggers.preferredPacing = 'moderate';
  }
}

function generateAdaptations(data, feedback) {
  const adaptations = [];
  
  // Content adaptations
  if (feedback.responses.wantMore) {
    const want = feedback.responses.wantMore.toLowerCase();
    if (want.includes('combat')) adaptations.push('Increase combat encounter frequency');
    if (want.includes('npc') || want.includes('character')) adaptations.push('Add more detailed NPCs with backstories');
    if (want.includes('loot') || want.includes('treasure')) adaptations.push('Increase treasure/magic item drops');
    if (want.includes('description') || want.includes('detail')) adaptations.push('Add more sensory descriptions to scenes');
    if (want.includes('story') || want.includes('plot')) adaptations.push('Advance main plot threads more aggressively');
    if (want.includes('exploration')) adaptations.push('Add more optional areas to discover');
  }
  
  if (feedback.responses.wantLess) {
    const less = feedback.responses.wantLess.toLowerCase();
    if (less.includes('combat')) adaptations.push('Reduce random combat encounters');
    if (less.includes('puzzle')) adaptations.push('Simplify or reduce puzzle complexity');
    if (less.includes('trap')) adaptations.push('Make traps more visible/clued');
    if (less.includes('description')) adaptations.push('Shorten descriptions, focus on key details');
    if (less.includes('tracking') || less.includes('inventory')) adaptations.push('Simplify resource management');
  }
  
  // Pacing adaptations
  if (feedback.responses.pacing) {
    const pace = feedback.responses.pacing.toLowerCase();
    if (pace.includes('slow')) adaptations.push('Shorten scenes, move to action faster');
    if (pace.includes('fast')) adaptations.push('Add more atmospheric moments between encounters');
  }
  
  // Difficulty adaptations
  if (feedback.responses.difficulty) {
    const diff = feedback.responses.difficulty.toLowerCase();
    if (diff.includes('hard')) adaptations.push('Provide more resources/healing opportunities');
    if (diff.includes('easy')) adaptations.push('Increase enemy numbers or add complications');
    if (diff.includes('unfair')) adaptations.push('Ensure all challenges have visible warning signs');
  }
  
  // NPC adaptations
  if (feedback.responses.npcOpinion) {
    const npc = feedback.responses.npcOpinion.toLowerCase();
    if (npc.includes('flat')) adaptations.push('Give NPCs stronger personalities and voices');
  }
  
  return adaptations;
}

async function showPlayerProfile() {
  const data = loadLearningData();
  
  console.log('\n📊 PLAYER PROFILE\n');
  console.log(`Sessions played: ${data.sessions.length}`);
  
  if (data.patterns.playerTriggers.combatPreference) {
    console.log(`\nCombat engagement: ${data.patterns.playerTriggers.combatPreference} mentions`);
  }
  if (data.patterns.playerTriggers.roleplayPreference) {
    console.log(`Roleplay engagement: ${data.patterns.playerTriggers.roleplayPreference} mentions`);
  }
  if (data.patterns.playerTriggers.puzzlePreference) {
    console.log(`Puzzle engagement: ${data.patterns.playerTriggers.puzzlePreference} mentions`);
  }
  if (data.patterns.playerTriggers.riskTolerance) {
    console.log(`Risk tolerance: ${data.patterns.playerTriggers.riskTolerance}`);
  }
  if (data.patterns.playerTriggers.preferredPacing) {
    console.log(`Preferred pacing: ${data.patterns.playerTriggers.preferredPacing}`);
  }
  
  if (data.player.favoriteMoments.length > 0) {
    console.log('\n🌟 TOP MOMENTS:');
    data.player.favoriteMoments.slice(-5).forEach(m => {
      console.log(`   Session ${m.session}: ${m.moment.substring(0, 60)}...`);
    });
  }
  
  if (data.player.frustrations.length > 0) {
    console.log('\n⚠️ RECURRING FRUSTRATIONS:');
    data.player.frustrations.slice(-3).forEach(f => {
      console.log(`   Session ${f.session}: ${f.issue.substring(0, 60)}...`);
    });
  }
  
  rl.close();
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'feedback';

if (command === 'feedback') {
  collectPostSessionFeedback();
} else if (command === 'profile') {
  showPlayerProfile();
} else {
  console.log('Usage: node learn.js [feedback|profile]');
  rl.close();
}
