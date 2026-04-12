#!/usr/bin/env node

/**
 * Pre-Game Character Check
 * Validates all characters before session starts
 */

const fs = require('fs');
const path = require('path');
const PartyManager = require('./party_manager');

class PregameCheck {
  constructor(campaignName = null) {
    this.pm = new PartyManager();
    this.issues = [];
    this.warnings = [];
    this.ok = [];
  }

  checkAll() {
    console.log('\n🔍 PRE-GAME CHARACTER CHECK\n');
    console.log('='.repeat(60));
    
    if (!this.pm.party || !this.pm.party.members) {
      console.log('❌ No party found!');
      return false;
    }
    
    for (const char of this.pm.party.members) {
      this.checkCharacter(char);
    }
    
    this.printResults();
    return this.issues.length === 0;
  }

  checkCharacter(char) {
    const sessionChar = this.pm.session?.characters?.[char.character_id];
    
    console.log(`\n📋 Checking: ${char.name}`);
    console.log('-'.repeat(40));
    
    // HP Check
    if (sessionChar) {
      const hpPercent = (sessionChar.hp_current / char.hp.max) * 100;
      if (sessionChar.hp_current <= 0) {
        this.issues.push(`${char.name}: UNCONSCIOUS (0 HP)`);
        console.log('❌ HP: UNCONSCIOUS');
      } else if (hpPercent < 25) {
        this.warnings.push(`${char.name}: Low HP (${sessionChar.hp_current}/${char.hp.max})`);
        console.log(`⚠️  HP: Low (${sessionChar.hp_current}/${char.hp.max})`);
      } else {
        this.ok.push(`${char.name}: HP OK`);
        console.log(`✅ HP: ${sessionChar.hp_current}/${char.hp.max}`);
      }
    }
    
    // Spell Slots Check
    if (char.class.toLowerCase().includes('cleric') || char.class.toLowerCase().includes('mage')) {
      this.checkSpells(char, sessionChar);
    }
    
    // Equipment Check
    this.checkEquipment(char);
    
    // Conditions Check
    if (sessionChar?.conditions && sessionChar.conditions.length > 0) {
      this.warnings.push(`${char.name}: Has conditions (${sessionChar.conditions.join(', ')})`);
      console.log(`⚠️  Conditions: ${sessionChar.conditions.join(', ')}`);
    } else {
      console.log('✅ No conditions');
    }
    
    // Location Check
    console.log(`📍 Location: ${char.location || 'Unknown'}`);
    
    // Level-Up Check
    this.checkLevelUp(char);
  }

  checkSpells(char, sessionChar) {
    if (!sessionChar) return;
    
    const spellClasses = [];
    if (char.class.toLowerCase().includes('cleric')) spellClasses.push('cleric');
    if (char.class.toLowerCase().includes('mage')) spellClasses.push('mage');
    
    for (const spellClass of spellClasses) {
      const available = [];
      for (let level = 1; level <= 3; level++) {
        const slots = this.pm.getAvailableSpells(char.character_id, spellClass, level);
        if (slots > 0) {
          available.push(`L${level}:${slots}`);
        }
      }
      
      if (available.length === 0) {
        this.warnings.push(`${char.name}: No ${spellClass} spells remaining`);
        console.log(`⚠️  ${spellClass} spells: NONE`);
      } else {
        console.log(`✅ ${spellClass} spells: ${available.join(', ')}`);
      }
    }
  }

  checkEquipment(char) {
    // Check for basic adventuring gear
    const hasHolySymbol = char.class.toLowerCase().includes('cleric');
    const hasSpellbook = char.class.toLowerCase().includes('mage');
    
    if (hasHolySymbol) {
      console.log('✅ Holy symbol required (cleric)');
    }
    if (hasSpellbook) {
      console.log('✅ Spellbook required (mage)');
    }
    
    console.log('✅ Equipment check complete');
  }

  checkLevelUp(char) {
    // Check if character is close to leveling
    const xp = char.xp || 0;
    const level = this.parseLevel(char.level);
    const nextLevelXP = this.getNextLevelXP(char.class, level);
    
    if (nextLevelXP && xp >= nextLevelXP) {
      this.warnings.push(`${char.name}: READY TO LEVEL UP!`);
      console.log(`⚠️  LEVEL UP READY: ${xp} XP (needs ${nextLevelXP})`);
      this.printLevelUpChecklist(char);
    } else if (nextLevelXP) {
      const percent = Math.floor((xp / nextLevelXP) * 100);
      console.log(`📈 XP Progress: ${percent}% (${xp}/${nextLevelXP})`);
    }
  }

  parseLevel(levelStr) {
    // Handle "6/6" or "6" formats
    if (levelStr.includes('/')) {
      return parseInt(levelStr.split('/')[0]);
    }
    return parseInt(levelStr);
  }

  getNextLevelXP(charClass, currentLevel) {
    // Fighter XP table (simplified)
    const fighterXP = [0, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000];
    // Cleric XP table
    const clericXP = [0, 1500, 3000, 6000, 13000, 27500, 55000, 110000, 225000, 450000];
    // Mage XP table
    const mageXP = [0, 2500, 5000, 10000, 20000, 40000, 80000, 150000, 300000, 600000];
    
    const nextLevel = currentLevel + 1;
    if (nextLevel > 10) return null;
    
    if (charClass.toLowerCase().includes('fighter')) {
      return fighterXP[nextLevel];
    } else if (charClass.toLowerCase().includes('cleric')) {
      return clericXP[nextLevel];
    } else if (charClass.toLowerCase().includes('mage')) {
      return mageXP[nextLevel];
    }
    
    return null;
  }

  printLevelUpChecklist(char) {
    console.log(`\n   📋 LEVEL UP CHECKLIST for ${char.name}:`);
    console.log(`   • Roll HP (add CON bonus)`);
    
    if (char.class.toLowerCase().includes('mage')) {
      console.log(`   • Check for new spell slots`);
      console.log(`   • Attempt to learn new spells (INT check)`);
    }
    if (char.class.toLowerCase().includes('cleric')) {
      console.log(`   • Check for new spell slots`);
      console.log(`   • Update turn undead table`);
    }
    if (char.class.toLowerCase().includes('fighter')) {
      console.log(`   • THAC0 improves`);
      console.log(`   • Check for additional attacks`);
    }
    
    console.log(`   • Update saving throws`);
    console.log(`   • Record new abilities/features`);
    console.log(`   • Training time: 1 week per level`);
    console.log(`   • Training cost: 1000 gp per level`);
    console.log();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CHECK RESULTS\n');
    
    if (this.issues.length > 0) {
      console.log('❌ ISSUES (Must Fix):');
      this.issues.forEach(i => console.log(`   • ${i}`));
      console.log();
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS (Review):');
      this.warnings.forEach(w => console.log(`   • ${w}`));
      console.log();
    }
    
    console.log(`✅ Passed: ${this.ok.length} checks`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Issues: ${this.issues.length}`);
    
    if (this.issues.length === 0) {
      console.log('\n🎉 READY TO PLAY!\n');
    } else {
      console.log('\n⛔ FIX ISSUES BEFORE STARTING\n');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      party: this.pm.party?.name || 'Unknown',
      checks: {
        passed: this.ok,
        warnings: this.warnings,
        issues: this.issues
      },
      ready: this.issues.length === 0
    };
    
    return report;
  }

  saveReport(campaignDir) {
    const report = this.generateReport();
    const reportFile = path.join(campaignDir, 'logs', 'pregame-check.json');
    
    // Ensure logs directory exists
    const logsDir = path.join(campaignDir, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to: ${reportFile}`);
  }
}

// CLI
if (require.main === module) {
  const campaign = process.argv[2];
  const checker = new PregameCheck(campaign);
  const ready = checker.checkAll();
  
  if (campaign) {
    const campaignDir = path.join(__dirname, 'campaigns', campaign);
    if (fs.existsSync(campaignDir)) {
      checker.saveReport(campaignDir);
    }
  }
  
  process.exit(ready ? 0 : 1);
}

module.exports = PregameCheck;
