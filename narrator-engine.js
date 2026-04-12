#!/usr/bin/env node

/**
 * NARRATOR ENGINE - Chronicle Generation System
 * 
 * Transforms raw session logs into epic narrative prose
 * (George R.R. Martin meets Joe Abercrombie style)
 * 
 * Usage:
 *   const narrator = new NarratorEngine(memorySystem, npcDialogueSystem, campaignManager);
 *   const chapter = await narrator.generateChapter(
 *     sessionNumber,
 *     sessionLogPath,
 *     events,
 *     party,
 *     povCharacter
 *   );
 *   await narrator.appendToChronicle(campaignName, chapter);
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Emotional Arc Analysis
 * Identifies turning points, climax, and narrative structure
 */
class EmotionalArcAnalyzer {
  analyze(events) {
    const explorations = events.filter(e => e.type === 'exploration');
    const combats = events.filter(e => e.type === 'combat');
    const discoveries = events.filter(e => e.type === 'discovery');
    const roleplay = events.filter(e => e.type === 'roleplay');

    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    
    // Identify climactic moment
    let climax = lastEvent;
    if (combats.length > 0) {
      climax = combats[combats.length - 1];
    } else if (discoveries.length > 0) {
      climax = discoveries[discoveries.length - 1];
    }

    // Determine overall tone based on event types
    const tone = this.determineTone(events);

    return {
      opening: firstEvent,
      climax,
      resolution: lastEvent,
      tone,
      eventCount: events.length,
      combatCount: combats.length,
      discoveryCount: discoveries.length,
      roleplayCount: roleplay.length,
      explorationCount: explorations.length
    };
  }

  determineTone(events) {
    const hasCombat = events.some(e => e.type === 'combat');
    const hasBetrayals = events.some(e => 
      e.description?.toLowerCase().includes('betray') ||
      e.description?.toLowerCase().includes('broken promise')
    );
    const hasHumor = events.some(e =>
      e.metadata?.tone === 'humorous' ||
      e.metadata?.tone === 'dark humor'
    );
    const hasTension = events.some(e =>
      e.description?.toLowerCase().includes('tension') ||
      e.description?.toLowerCase().includes('danger')
    );

    if (hasBetrayals) return 'dark_cynical';
    if (hasCombat && hasHumor) return 'gritty_darkly_comic';
    if (hasCombat && hasTension) return 'tense_bloody';
    if (hasHumor) return 'darkly_comic';
    return 'tense_introspective';
  }
}

/**
 * Dialogue Moment Extraction
 * Identifies scenes with NPC dialogue for enrichment
 */
class DialogueExtractor {
  extract(events) {
    return events
      .filter(e => e.type === 'roleplay' && e.metadata?.npcId)
      .map((e, idx) => ({
        index: idx,
        npcId: e.metadata.npcId,
        npcName: e.metadata.npcName || e.metadata.npcId,
        sessionEvent: e,
        actionType: this.inferActionType(e),
        context: e.metadata
      }));
  }

  inferActionType(event) {
    const desc = event.description?.toLowerCase() || '';
    
    if (desc.includes('greet') || desc.includes('meet')) return 'greeting';
    if (desc.includes('fight') || desc.includes('combat')) return 'combat_opening';
    if (desc.includes('betray') || desc.includes('promise')) return 'consequence';
    if (desc.includes('negotiate') || desc.includes('bargain')) return 'negotiation';
    if (desc.includes('speak') || desc.includes('talk')) return 'ambient';
    
    return 'ambient';
  }
}

/**
 * Chapter Composer
 * Generates epic prose from session data
 */
class ChapterComposer {
  constructor(campaignName, sessionNumber) {
    this.campaignName = campaignName;
    this.sessionNumber = sessionNumber;
  }

  async compose(arc, events, dialogues, povCharacter, sessionLog = '') {
    const prompt = this.buildPrompt(arc, events, dialogues, povCharacter, sessionLog);
    
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('❌ Failed to generate chapter:', error.message);
      throw error;
    }
  }

  buildPrompt(arc, events, dialogues, povCharacter, sessionLog) {
    const eventSummary = events
      .slice(0, 10)  // Use first 10 events to avoid token bloat
      .map(e => `${e.type}: ${e.description}`)
      .join('\n');

    const dialogueSummary = dialogues
      .slice(0, 5)  // Use first 5 dialogue moments
      .map(d => `${d.npcName} (${d.actionType}): [dialogue to be enriched]`)
      .join('\n');

    return `You are writing an epic fantasy novel chapter (George R.R. Martin meets Joe Abercrombie).

Campaign: ${this.campaignName}
Session: ${this.sessionNumber}
POV Character: ${povCharacter.name}
Tone: ${arc.tone}

EMOTIONAL ARC:
- Opening moment: ${arc.opening.description}
- Climax: ${arc.climax.description}
- Resolution: ${arc.resolution.description}

KEY EVENTS (${arc.eventCount} total):
${eventSummary}

COMBAT: ${arc.combatCount} encounters
DISCOVERIES: ${arc.discoveryCount}
ROLEPLAY: ${arc.roleplayCount} interactions
EXPLORATION: ${arc.explorationCount}

NPC DIALOGUE MOMENTS:
${dialogueSummary}

WRITE A CHAPTER THAT:
1. Opens with a hook (1-2 sentences) that grabs the reader
2. Establishes setting with vivid sensory detail (sight, sound, smell, texture)
3. Grounds the reader in ${povCharacter.name}'s perspective and internal thoughts
4. Weaves session events naturally (not a checklist)
5. Embeds dialogue naturally with context and body language
6. Shows physical reactions, not just emotions
7. Includes internal conflict and doubt
8. Contains dark humor or cynicism where appropriate (Abercrombie style)
9. Shows consequences carrying forward from prior sessions
10. Closes with a beat that makes reader want the next chapter

STYLE RULES:
- Spare, economical prose (Abercrombie's terse style)
- Introspection and internal monologue (Martin's depth)
- Specific nouns (not generic descriptions)
- Dialogue that reveals character, not exposition
- No info-dumping or world-building lectures
- Physical detail (blood, sweat, exhaustion matter)
- Moral ambiguity (no clear heroes/villains)
- Consequence weight (actions cost something)

TARGET: 2,500-4,000 words

Return ONLY the chapter prose (no chapter heading, no session notes, no meta-commentary).
Start directly with the opening hook.`;
  }
}

/**
 * Chronicle File Manager
 * Handles chronicle.md creation and appending
 */
class ChronicleFileManager {
  constructor(campaignName, campaignDir) {
    this.campaignName = campaignName;
    this.campaignDir = campaignDir;
    this.chroniclePath = path.join(campaignDir, 'chronicle.md');
  }

  createHeaderIfNeeded() {
    if (!fs.existsSync(this.chroniclePath)) {
      const header = `# ${this.campaignName.toUpperCase()}\n## A Chronicle of the Descent\n\n---\n\n## BOOK ONE: THE BEGINNING\n\n`;
      fs.writeFileSync(this.chroniclePath, header, 'utf8');
      return true;
    }
    return false;
  }

  appendChapter(chapterNumber, title, content) {
    this.createHeaderIfNeeded();

    const chapterHeader = `### CHAPTER ${chapterNumber}: ${title}\n\n`;
    const chapterFooter = `\n\n---\n\n`;

    const fullChapter = chapterHeader + content + chapterFooter;

    fs.appendFileSync(this.chroniclePath, fullChapter, 'utf8');
  }

  getChronicleContent() {
    if (fs.existsSync(this.chroniclePath)) {
      return fs.readFileSync(this.chroniclePath, 'utf8');
    }
    return null;
  }
}

/**
 * Chapter Title Generator
 * Creates thematic titles based on session events
 */
class ChapterTitleGenerator {
  generate(arc, events) {
    // Extract key themes from events
    const discoveries = events.filter(e => e.type === 'discovery');
    const combats = events.filter(e => e.type === 'combat');
    const betrayals = events.filter(e =>
      e.description?.toLowerCase().includes('betray') ||
      e.description?.toLowerCase().includes('broken')
    );

    // Generate title based on dominant event type
    if (betrayals.length > 0) {
      return this.generateBetrayalTitle(events);
    }
    if (combats.length > 0) {
      return this.generateCombatTitle(events);
    }
    if (discoveries.length > 0) {
      return this.generateDiscoveryTitle(events);
    }

    return this.generateGenericTitle(events);
  }

  generateBetrayalTitle() {
    const titles = [
      'The Cost of Trust',
      'Broken Promises',
      'Ash and Bitterness',
      'The Knife in the Back',
      'Hollow Words'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  generateCombatTitle() {
    const titles = [
      'Blood on Stone',
      'The Reckoning',
      'War and Ruin',
      'Fire and Steel',
      'The Killing Ground'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  generateDiscoveryTitle() {
    const titles = [
      'The Truth Revealed',
      'Secrets Unearthed',
      'Darkness Unveiled',
      'The Hidden Path',
      'What Lies Below'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  generateGenericTitle() {
    const titles = [
      'Into the Abyss',
      'The Reckoning Approaches',
      'Shadows Lengthen',
      'What Comes Next',
      'The Path Continues'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }
}

/**
 * MAIN NARRATOR ENGINE
 */
class NarratorEngine {
  constructor(memorySystem, npcDialogueSystem, campaignManager) {
    this.memory = memorySystem;
    this.dialogues = npcDialogueSystem;
    this.campaigns = campaignManager;
    
    this.arcAnalyzer = new EmotionalArcAnalyzer();
    this.dialogueExtractor = new DialogueExtractor();
    this.titleGenerator = new ChapterTitleGenerator();
  }

  /**
   * GENERATE CHAPTER - Main entry point
   * Called after endSession() completes
   */
  async generateChapter(
    sessionNumber,
    sessionLogPath,
    events,
    party,
    selectedPOVCharacter = null
  ) {
    console.log(`\n📖 Generating Chapter ${sessionNumber}...`);

    // 1. Analyze emotional arc
    const arc = this.arcAnalyzer.analyze(events);
    console.log(`   ✓ Emotional arc analyzed (tone: ${arc.tone})`);

    // 2. Extract dialogue moments
    const dialogues = this.dialogueExtractor.extract(events);
    console.log(`   ✓ ${dialogues.length} dialogue moments identified`);

    // 3. Select POV character
    const povChar = selectedPOVCharacter || party[0];
    console.log(`   ✓ POV: ${povChar.name}`);

    // 4. Generate chapter title
    const title = this.titleGenerator.generate(arc, events);
    console.log(`   ✓ Chapter title: "${title}"`);

    // 5. Compose prose
    const composer = new ChapterComposer(
      this.campaigns.campaign,
      sessionNumber
    );

    let sessionLog = '';
    try {
      if (fs.existsSync(sessionLogPath)) {
        sessionLog = fs.readFileSync(sessionLogPath, 'utf8').substring(0, 2000);
      }
    } catch (e) {
      // Silent fail - session log is optional context
    }

    console.log(`   📝 Composing prose (this may take a moment)...`);
    const prose = await composer.compose(arc, events, dialogues, povChar, sessionLog);
    console.log(`   ✓ Prose generated (${prose.length} characters)`);

    return {
      sessionNumber,
      title,
      content: prose,
      arc,
      povCharacter: povChar.name,
      eventCount: events.length,
      dialogueCount: dialogues.length
    };
  }

  /**
   * APPEND TO CHRONICLE
   * Adds completed chapter to chronicle.md
   */
  async appendToChronicle(campaignName, chapter) {
    const campaignDir = this.campaigns.campaignDir ||
      path.join(__dirname, 'campaigns', campaignName);

    const fileManager = new ChronicleFileManager(campaignName, campaignDir);

    // Create chronicle if needed
    const wasCreated = fileManager.createHeaderIfNeeded();
    if (wasCreated) {
      console.log(`   ✓ Chronicle created at ${fileManager.chroniclePath}`);
    }

    // Append chapter
    fileManager.appendChapter(chapter.sessionNumber, chapter.title, chapter.content);
    console.log(`   ✓ Chapter ${chapter.sessionNumber} appended to chronicle`);

    return {
      chroniclePath: fileManager.chroniclePath,
      chapter: chapter.sessionNumber,
      title: chapter.title
    };
  }

  /**
   * GET CHRONICLE STATS
   * Returns info about current chronicle
   */
  getChronicleStats(campaignName) {
    const campaignDir = this.campaigns.campaignDir ||
      path.join(__dirname, 'campaigns', campaignName);

    const fileManager = new ChronicleFileManager(campaignName, campaignDir);
    const content = fileManager.getChronicleContent();

    if (!content) {
      return { status: 'not_started', chapters: 0 };
    }

    const chapterMatches = content.match(/### CHAPTER \d+:/g);
    const chapterCount = chapterMatches ? chapterMatches.length : 0;
    const wordCount = content.split(/\s+/).length;

    return {
      status: 'active',
      chapters: chapterCount,
      words: wordCount,
      chroniclePath: fileManager.chroniclePath
    };
  }
}

export { NarratorEngine, EmotionalArcAnalyzer, DialogueExtractor, ChapterComposer, ChronicleFileManager, ChapterTitleGenerator };
