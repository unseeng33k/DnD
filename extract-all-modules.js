#!/usr/bin/env node

/**
 * MODULE MARKDOWN EXTRACTOR
 * 
 * Reads all 40 TSR PDF modules and generates markdown files
 * so modules can be played without PDF dependency
 * 
 * Usage: node extract-all-modules.js
 * 
 * Output: /modules/[CODE]/README.md (for each module)
 */

import fs from 'fs';
import path from 'path';
import { PDFModuleReader } from './pdf-module-reader.js';

class ModuleMarkdownExtractor {
  constructor(resourcesPath) {
    this.resourcesPath = resourcesPath;
    this.modulesPath = path.join(resourcesPath, 'modules');
    this.outputPath = '/Users/mpruskowski/.openclaw/workspace/dnd/modules';
  }

  /**
   * Extract all modules
   */
  async extractAllModules() {
    console.log('📚 MODULE MARKDOWN EXTRACTOR\n');
    
    if (!fs.existsSync(this.modulesPath)) {
      console.error(`❌ Modules directory not found: ${this.modulesPath}`);
      return;
    }

    const pdfFiles = fs.readdirSync(this.modulesPath).filter(f => f.endsWith('.pdf'));
    console.log(`Found ${pdfFiles.length} modules\n`);

    for (let i = 0; i < pdfFiles.length; i++) {
      const pdfFile = pdfFiles[i];
      const pdfPath = path.join(this.modulesPath, pdfFile);
      
      console.log(`[${i + 1}/${pdfFiles.length}] Extracting ${pdfFile}...`);
      
      await this.extractModule(pdfPath);
    }

    console.log('\n✅ All modules extracted!');
  }

  /**
   * Extract single module
   */
  async extractModule(pdfPath) {
    const reader = new PDFModuleReader(pdfPath);
    
    if (!(await reader.readPDF())) {
      return;
    }

    const structure = await reader.getModuleStructure();
    const metadata = structure.metadata;
    const code = metadata.code || this.getCodeFromPath(pdfPath);

    // Create module directory
    const moduleDir = path.join(this.outputPath, code);
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    // Generate README.md
    const readmeMarkdown = this.generateReadme(metadata, structure, code);
    fs.writeFileSync(path.join(moduleDir, 'README.md'), readmeMarkdown);

    // Generate encounters.md
    const encountersMarkdown = this.generateEncounters(structure.encounters);
    fs.writeFileSync(path.join(moduleDir, 'encounters.md'), encountersMarkdown);

    // Generate npcs.md
    const npcsMarkdown = this.generateNPCs(structure.npcs);
    fs.writeFileSync(path.join(moduleDir, 'npcs.md'), npcsMarkdown);

    // Generate treasures.md
    const treasuresMarkdown = this.generateTreasures(structure.treasures);
    fs.writeFileSync(path.join(moduleDir, 'treasures.md'), treasuresMarkdown);

    // Generate state.json
    const stateJson = {
      module: metadata.name,
      code,
      started: false,
      currentArea: null,
      completedEncounters: [],
      treasureLooted: [],
      npcInteractions: {},
      partyDeaths: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(path.join(moduleDir, 'state.json'), JSON.stringify(stateJson, null, 2));
  }

  /**
   * Generate README.md
   */
  generateReadme(metadata, structure, code) {
    let markdown = `# ${metadata.name}\n\n`;
    markdown += `**Module Code**: ${code}\n`;
    markdown += `**Recommended Level**: ${Array.isArray(metadata.authoredLevel) ? metadata.authoredLevel.join('-') : metadata.authoredLevel}\n`;
    markdown += `**Duration**: ${metadata.estimatedDuration || 'Unknown'}\n\n`;

    markdown += `## Overview\n\n${metadata.description}\n\n`;

    markdown += `## Areas & Locations\n\n`;
    if (structure.areas && structure.areas.length > 0) {
      for (const area of structure.areas) {
        markdown += `### Area ${area.id}: ${area.name}\n\n${area.description}\n\n`;
      }
    }

    return markdown;
  }

  /**
   * Generate encounters.md
   */
  generateEncounters(encounters) {
    let markdown = `# Encounters\n\n`;
    
    if (encounters && encounters.length > 0) {
      for (let i = 0; i < encounters.length; i++) {
        const encounter = encounters[i];
        markdown += `## Encounter ${i + 1} [${encounter.difficulty.toUpperCase()}]\n\n`;
        markdown += `${encounter.description}\n\n`;
      }
    } else {
      markdown += 'No encounters found in module data.';
    }

    return markdown;
  }

  /**
   * Generate npcs.md
   */
  generateNPCs(npcs) {
    let markdown = `# Key NPCs\n\n`;
    
    if (npcs && npcs.length > 0) {
      for (const npc of npcs) {
        markdown += `## ${npc.name}\n\n`;
        markdown += `**Role**: ${npc.description}\n\n`;
      }
    } else {
      markdown += 'No NPCs found in module data.';
    }

    return markdown;
  }

  /**
   * Generate treasures.md
   */
  generateTreasures(treasures) {
    let markdown = `# Treasure & Loot\n\n`;
    
    if (treasures && treasures.length > 0) {
      for (let i = 0; i < treasures.length; i++) {
        markdown += `${i + 1}. ${treasures[i]}\n`;
      }
    } else {
      markdown += 'No treasures found in module data.';
    }

    return markdown;
  }

  /**
   * Extract module code from filename
   */
  getCodeFromPath(filepath) {
    const filename = path.basename(filepath);
    const match = filename.match(/[A-Z]+\d+/);
    return match ? match[0] : 'UNKNOWN';
  }
}

// Run
const resourcesPath = '/Users/mpruskowski/.openclaw/workspace/dnd/resources';
const extractor = new ModuleMarkdownExtractor(resourcesPath);
extractor.extractAllModules().catch(console.error);
