#!/usr/bin/env node

/**
 * PDF MODULE READER
 * 
 * Reads TSR AD&D module PDFs and extracts:
 * - Module metadata (name, level, length)
 * - Areas/locations
 * - Encounters with monsters
 * - Treasure and rewards
 * - NPCs and plot hooks
 * - Wandering monsters
 */

import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

class PDFModuleReader {
  constructor(pdfPath) {
    this.pdfPath = pdfPath;
    this.moduleName = path.basename(pdfPath).replace('.pdf', '');
    this.content = null;
    this.sections = {};
  }

  /**
   * Read and parse PDF
   */
  async readPDF() {
    try {
      const dataBuffer = fs.readFileSync(this.pdfPath);
      const data = await pdfParse(dataBuffer);
      this.content = data.text;
      return true;
    } catch (error) {
      console.error(`Error reading PDF: ${error.message}`);
      return false;
    }
  }

  /**
   * Extract module metadata
   */
  extractMetadata() {
    const metadata = {
      name: this.extractModuleName(),
      code: this.extractModuleCode(),
      authoredLevel: this.extractLevel(),
      estimatedDuration: this.extractDuration(),
      description: this.extractDescription()
    };

    return metadata;
  }

  /**
   * Extract module name
   */
  extractModuleName() {
    // Try common patterns
    const patterns = [
      /^.*Module\s*[-:]\s*(.+?)(?:\n|$)/,
      /^(.+?)\s*Module/,
      /^(.+?)(?:\(|$)/
    ];

    for (const pattern of patterns) {
      const match = this.content.match(pattern);
      if (match) return match[1].trim();
    }

    return this.moduleName;
  }

  /**
   * Extract module code (I6, S1, etc)
   */
  extractModuleCode() {
    const match = this.moduleName.match(/^[A-Z]+\d+/);
    return match ? match[0] : null;
  }

  /**
   * Extract recommended level
   */
  extractLevel() {
    const patterns = [
      /(?:character level|for characters of|levels?)\s*(?:of\s*)?(\d+)(?:\s*[-to]+\s*(\d+))?/i,
      /(\d+)(?:\s*[-to]+\s*(\d+))?\s*(?:character|PC|level)/i
    ];

    for (const pattern of patterns) {
      const match = this.content.match(pattern);
      if (match) {
        return match[2] ? [parseInt(match[1]), parseInt(match[2])] : [parseInt(match[1])];
      }
    }

    return [1, 10]; // Default
  }

  /**
   * Extract duration estimate
   */
  extractDuration() {
    const patterns = [
      /(?:session|sessions|adventure)\s*(?:lasting|taking|requiring)?:?\s*(\d+)\s*(?:hours?|days?|sessions?)/i,
      /(\d+)\s*(?:hours?|days?|sessions?)/i
    ];

    for (const pattern of patterns) {
      const match = this.content.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return 'Unknown';
  }

  /**
   * Extract description/overview
   */
  extractDescription() {
    // First few paragraphs
    const paragraphs = this.content.split(/\n\n+/).filter(p => p.trim().length > 50);
    return paragraphs.slice(0, 3).join('\n\n').substring(0, 500);
  }

  /**
   * Extract areas/locations
   */
  extractAreas() {
    const areas = [];
    const areaPatterns = [
      /Area\s+(\d+)[:.]\s*([^\n]+)/gi,
      /Room\s+(\d+)[:.]\s*([^\n]+)/gi,
      /Location\s+(\d+)[:.]\s*([^\n]+)/gi
    ];

    for (const pattern of areaPatterns) {
      let match;
      while ((match = pattern.exec(this.content)) !== null) {
        areas.push({
          id: match[1],
          name: match[2].trim(),
          description: this.extractAreaDescription(match[1])
        });
      }
    }

    return areas.slice(0, 50); // Limit to first 50
  }

  /**
   * Extract area description
   */
  extractAreaDescription(areaId) {
    const areaStart = this.content.indexOf(`Area ${areaId}`);
    if (areaStart === -1) return '';

    const nextArea = this.content.indexOf(/Area \d+/i, areaStart + 10);
    const endIndex = nextArea === -1 ? areaStart + 1000 : nextArea;
    const areaText = this.content.substring(areaStart, endIndex);

    // Extract first 2-3 lines of description
    const lines = areaText.split('\n').filter(l => l.trim().length > 0);
    return lines.slice(0, 3).join(' ').substring(0, 300);
  }

  /**
   * Extract encounters
   */
  extractEncounters() {
    const encounters = [];
    const encounterPatterns = [
      /Encounter[:\s]+(.+?)(?:\n\n|Encounter|$)/gi,
      /Combat:\s*(.+?)(?:\n\n|Combat:|$)/gi
    ];

    for (const pattern of encounterPatterns) {
      let match;
      let count = 0;
      while ((match = pattern.exec(this.content)) !== null && count < 30) {
        const encounterText = match[1];
        encounters.push({
          description: encounterText.substring(0, 200),
          difficulty: this.estimateDifficulty(encounterText)
        });
        count++;
      }
    }

    return encounters;
  }

  /**
   * Estimate encounter difficulty from text
   */
  estimateDifficulty(text) {
    if (text.match(/dragon|demon|lich|ancient/i)) return 'deadly';
    if (text.match(/ogre|giant|elemental/i)) return 'hard';
    if (text.match(/goblin|orc|skeleton/i)) return 'medium';
    return 'easy';
  }

  /**
   * Extract treasure
   */
  extractTreasure() {
    const treasures = [];
    const treasurePatterns = [
      /Treasure[:\s]+([^.\n]+[.!])/gi,
      /Gold[:\s]+(\d+)/gi,
      /Magic [Ii]tems?[:\s]+(.+?)(?:\n|$)/gi
    ];

    for (const pattern of treasurePatterns) {
      let match;
      let count = 0;
      while ((match = pattern.exec(this.content)) !== null && count < 20) {
        treasures.push(match[1].trim());
        count++;
      }
    }

    return treasures;
  }

  /**
   * Extract NPCs
   */
  extractNPCs() {
    const npcs = [];
    const npcPatterns = [
      /(?:NPC|Villain|Guardian)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:the|,|\()/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*(?:a|an)\s*([\w\s]+)(?:\s*,|\n)/gi
    ];

    for (const pattern of npcPatterns) {
      let match;
      let count = 0;
      while ((match = pattern.exec(this.content)) !== null && count < 15) {
        npcs.push({
          name: match[1],
          description: match[2] || 'Unknown'
        });
        count++;
      }
    }

    return npcs;
  }

  /**
   * Get full module structure
   */
  async getModuleStructure() {
    if (!this.content) {
      await this.readPDF();
    }

    return {
      metadata: this.extractMetadata(),
      areas: this.extractAreas(),
      encounters: this.extractEncounters(),
      treasures: this.extractTreasure(),
      npcs: this.extractNPCs(),
      content: this.content
    };
  }

  /**
   * Save extracted module as JSON
   */
  async saveAsJSON(outputPath) {
    const structure = await this.getModuleStructure();
    fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2));
    return outputPath;
  }
}

export { PDFModuleReader };
