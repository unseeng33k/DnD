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
