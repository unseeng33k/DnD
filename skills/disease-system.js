#!/usr/bin/env node

/**
 * Disease & Infection System
 */

class DiseaseSystem {
  constructor() {
    this.diseases = {
      'ratBiteFever': {
        name: 'Rat Bite Fever',
        onset: '1d3 days',
        symptoms: 'Fever, chills, muscle pain',
        save: 'Save vs poison or die in 1d6 days',
        cure: 'Cure disease spell within 3 days'
      },
      'mummyRot': {
        name: 'Mummy Rot',
        onset: 'Immediate',
        symptoms: 'Flesh decaying, -2 CHA per day',
        save: 'Cannot be cured by normal means',
        cure: 'Cure disease + remove curse'
      },
      'lycanthropy': {
        name: 'Lycanthropy',
        onset: 'Next full moon',
        symptoms: 'Transformation into were-creature',
        save: 'Save vs polymorph or permanent',
        cure: 'Cure disease within 3 days, else permanent'
      },
      'plague': {
        name: 'The Plague',
        onset: '1d4 days',
        symptoms: 'Buboes, fever, delirium',
        save: 'Save vs death or die in 1d6 days',
        cure: 'Cure disease, 25% chance of death even if cured'
      },
      'jungleFever': {
        name: 'Jungle Fever',
        onset: '2d6 days',
        symptoms: 'Fever, weakness, -2 STR/DEX',
        save: 'Save vs poison or bedridden 2d4 weeks',
        cure: 'Rest 1 week, cure disease speeds recovery'
      },
      'filthFever': {
        name: 'Filth Fever',
        onset: '1d2 days',
        symptoms: 'Fever, infection at wound site',
        save: 'Save vs poison or -1 HP/day until cured',
        cure: 'Cure disease or natural healing with rest'
      }
    };
    
    this.infectionSources = [
      { source: 'Giant rat bite', disease: 'ratBiteFever', chance: 25 },
      { source: 'Mummy touch', disease: 'mummyRot', chance: 100 },
      { source: 'Lycanthrope bite', disease: 'lycanthropy', chance: 100 },
      { source: 'Plague victim', disease: 'plague', chance: 50 },
      { source: 'Swamp exposure', disease: 'jungleFever', chance: 15 },
      { source: 'Sewer exposure', disease: 'filthFever', chance: 20 }
    ];
  }

  checkInfection(source) {
    const infection = this.infectionSources.find(i => i.source === source);
    if (!infection) return { infected: false };
    
    const roll = Math.floor(Math.random() * 100) + 1;
    const infected = roll <= infection.chance;
    
    return {
      infected,
      disease: infected ? this.diseases[infection.disease] : null,
      roll,
      chance: infection.chance
    };
  }

  progressDisease(diseaseKey, days = 1) {
    const disease = this.diseases[diseaseKey];
    if (!disease) return { error: 'Unknown disease' };
    
    // Daily progression
    const effects = [];
    
    if (diseaseKey === 'mummyRot') {
      effects.push('-2 CHA from decay');
    } else if (diseaseKey === 'plague') {
      effects.push('Must save vs death or worsen');
    } else if (diseaseKey === 'filthFever') {
      effects.push('-1 HP from infection');
    }
    
    return {
      disease: disease.name,
      days,
      effects,
      terminal: days > 6 && diseaseKey === 'plague'
    };
  }

  attemptCure(diseaseKey, method, casterLevel = 1) {
    const disease = this.diseases[diseaseKey];
    if (!disease) return { error: 'Unknown disease' };
    
    let success = false;
    let message = '';
    
    if (method === 'cureDisease') {
      if (diseaseKey === 'mummyRot') {
        success = false;
        message = 'Cure disease alone is not enough - remove curse required';
      } else if (diseaseKey === 'lycanthropy') {
        success = true; // But must be within 3 days
        message = 'Cured if within 3 days of infection, else permanent';
      } else {
        success = true;
        message = 'Disease cured';
      }
    } else if (method === 'rest') {
      success = diseaseKey === 'filthFever' || diseaseKey === 'jungleFever';
      message = success ? 'Natural recovery over time' : 'Rest alone is not enough';
    } else if (method === 'removeCurse') {
      if (diseaseKey === 'mummyRot') {
        success = true;
        message = 'Remove curse + cure disease required together';
      } else {
        success = false;
        message = 'Remove curse has no effect';
      }
    }
    
    return { success, message, disease: disease.name };
  }

  generateRandomDisease() {
    const keys = Object.keys(this.diseases);
    return this.diseases[keys[Math.floor(Math.random() * keys.length)]];
  }
}

module.exports = DiseaseSystem;
