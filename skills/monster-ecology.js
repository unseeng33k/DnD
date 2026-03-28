#!/usr/bin/env node

/**
 * Monster Ecology System
 */

class MonsterEcology {
  constructor() {
    this.ecologies = {
      'goblin': {
        diet: 'Carrion, small animals, stolen food',
        territory: '1-2 square miles per tribe',
        social: 'Tribal, 20-200 per tribe, ruled by strongest',
        reproduction: '2d6 young per year, mature at 2 years',
        enemies: ['Humans', 'Dwarves', 'Elves', 'Other goblin tribes'],
        allies: ['Orcs', 'Hobgoblins', 'Bugbears'],
        habits: 'Nocturnal, cowardly, trap-setters',
        lair: 'Caves, ruins, abandoned mines'
      },
      'orc': {
        diet: 'Meat (any), fermented beverages',
        territory: '5-10 square miles per clan',
        social: 'Clan-based, 50-500 per clan, ruled by war chief',
        reproduction: '1d4 young per year, mature at 3 years',
        enemies: ['Humans', 'Elves', 'Dwarves', 'Gnomes'],
        allies: ['Goblins', 'Ogres', 'Trolls'],
        habits: 'Warlike, territorial, raiders',
        lair: 'Caves, fortresses, underground complexes'
      },
      'troll': {
        diet: 'Meat (any), especially humanoids',
        territory: 'Solitary, 10-20 square miles',
        social: 'Solitary or small family groups',
        reproduction: '1-2 young every 5 years, mature at 10 years',
        enemies: ['Fire-wielders', 'Acid-users', 'Giants'],
        allies: ['None - too stupid and hungry'],
        habits: 'Gluttonous, regenerates, hates fire',
        lair: 'Caves, swamps, dark forests'
      },
      'dragon': {
        diet: 'Large mammals, treasure (metallic dragons)',
        territory: '100+ square miles',
        social: 'Solitary, mate only briefly',
        reproduction: '1-2 eggs per century, century to mature',
        enemies: ['Other dragons', 'Adventurers', 'Giants'],
        allies: ['Cultists', 'Kobolds (sometimes)', 'Evil humanoids'],
        habits: 'Hoard treasure, sleep for decades, paranoid',
        lair: 'Mountain peaks, deep caverns, ruins'
      },
      'undead': {
        diet: 'Life energy, flesh (ghouls), blood (vampires)',
        territory: 'Variable, often tied to burial site',
        social: 'Solitary or controlled by necromancer',
        reproduction: 'Created by magic or infection',
        enemies: ['Clerics', 'Paladins', 'Living creatures'],
        allies: ['Necromancers', 'Other undead', 'Evil cults'],
        habits: 'Mindless (skeletons/zombies), cunning (vampires)',
        lair: 'Graveyards, tombs, cursed places'
      },
      'giant': {
        diet: 'Large quantities of meat, grain, ale',
        territory: '50-100 square miles',
        social: 'Clan-based, 10-30 per clan',
        reproduction: '1 young every 5 years, 50 years to mature',
        enemies: ['Humans', 'Dragons', 'Other giants'],
        allies: ['Ogres', 'Trolls', 'Evil humanoids'],
        habits: 'Raiding, territorial, varying intelligence by type',
        lair: 'Mountain caves, castles, hills'
      }
    };
    
    this.habitats = {
      forest: ['Goblins', 'Orcs', 'Wolves', 'Bears', 'Spiders', 'Dryads'],
      mountain: ['Giants', 'Dragons', 'Trolls', 'Eagles', 'Dwarves'],
      swamp: ['Lizard men', 'Trolls', 'Will-o-wisps', 'Snakes', 'Crocodiles'],
      desert: ['Gnolls', 'Bandits', 'Scorpions', 'Dragons', 'Thri-kreen'],
      underground: ['Drow', 'Duergar', 'Mind flayers', 'Aboleths', 'Umber hulks'],
      urban: ['Thieves', 'Assassins', 'Cultists', 'Vampires', 'Wererats']
    };
    
    this.relationships = [
      { type: 'predator-prey', description: 'Hunts and eats' },
      { type: 'competition', description: 'Competes for same resources' },
      { type: 'symbiosis', description: 'Mutually beneficial relationship' },
      { type: 'parasitism', description: 'One benefits at other\'s expense' },
      { type: 'alliance', description: 'Cooperates with' },
      { type: 'war', description: 'Actively fights against' }
    ];
  }

  getEcology(monster) {
    return this.ecologies[monster.toLowerCase()] || {
      diet: 'Unknown',
      territory: 'Unknown',
      social: 'Unknown',
      reproduction: 'Unknown',
      enemies: ['Unknown'],
      allies: ['Unknown'],
      habits: 'Unknown',
      lair: 'Unknown'
    };
  }

  getHabitatCreatures(habitat) {
    return this.habitats[habitat] || ['Unknown'];
  }

  determineRelationship(monster1, monster2) {
    const m1 = this.getEcology(monster1);
    const m2 = this.getEcology(monster2);
    
    // Check enemies/allies
    if (m1.enemies.includes(monster2) || m2.enemies.includes(monster1)) {
      return { type: 'war', description: 'These creatures are natural enemies' };
    }
    
    if (m1.allies.includes(monster2) || m2.allies.includes(monster1)) {
      return { type: 'alliance', description: 'These creatures often cooperate' };
    }
    
    // Check diet
    if (m1.diet.includes(monster2) || m2.diet.includes(monster1)) {
      return { type: 'predator-prey', description: 'One hunts the other' };
    }
    
    // Check territory overlap
    if (m1.territory && m2.territory) {
      return { type: 'competition', description: 'They compete for territory' };
    }
    
    return { type: 'neutral', description: 'No special relationship' };
  }

  generateLair(monster) {
    const ecology = this.getEcology(monster);
    const baseLair = ecology.lair || 'Cave';
    
    const features = [
      'Bone pile',
      'Treasure hoard',
      'Sleeping area',
      'Food storage',
      'Trap',
      'Prisoner cage',
      'Altar',
      'Water source'
    ];
    
    const lairFeatures = [];
    const numFeatures = Math.floor(Math.random() * 4) + 1;
    
    for (let i = 0; i < numFeatures; i++) {
      const feature = features[Math.floor(Math.random() * features.length)];
      if (!lairFeatures.includes(feature)) {
        lairFeatures.push(feature);
      }
    }
    
    return {
      type: baseLair,
      features: lairFeatures,
      inhabitants: Math.floor(Math.random() * 6) + 1
    };
  }

  printEcology(monster) {
    const eco = this.getEcology(monster);
    
    let output = `\n🐾 ${monster.toUpperCase()} ECOLOGY\n\n`;
    output += `Diet: ${eco.diet}\n`;
    output += `Territory: ${eco.territory}\n`;
    output += `Social Structure: ${eco.social}\n`;
    output += `Reproduction: ${eco.reproduction}\n`;
    output += `Enemies: ${eco.enemies.join(', ')}\n`;
    output += `Allies: ${eco.allies.join(', ')}\n`;
    output += `Habits: ${eco.habits}\n`;
    output += `Typical Lair: ${eco.lair}\n`;
    
    return output;
  }
}

module.exports = MonsterEcology;
