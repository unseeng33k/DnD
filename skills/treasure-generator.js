#!/usr/bin/env node

/**
 * Treasure Generator
 */

class TreasureGenerator {
  constructor() {
    this.coinTypes = ['cp', 'sp', 'ep', 'gp', 'pp'];
    this.artObjects = [
      { value: '10 gp', description: 'Silver ewer' },
      { value: '25 gp', description: 'Carved bone statuette' },
      { value: '50 gp', description: 'Small gold bracelet' },
      { value: '75 gp', description: 'Cloth-of-gold vestments' },
      { value: '100 gp', description: 'Black velvet mask with citrines' },
      { value: '250 gp', description: 'Carved ivory statuette' },
      { value: '500 gp', description: 'Large gold bracelet' },
      { value: '750 gp', description: 'Silver necklace with gemstone' },
      { value: '1000 gp', description: 'Jeweled gold crown' },
      { value: '2500 gp', description: 'Jeweled platinum ring' }
    ];
    
    this.gems = [
      { value: '10 gp', type: 'Ornamental' },
      { value: '50 gp', type: 'Semi-precious' },
      { value: '100 gp', type: 'Fancy' },
      { value: '500 gp', type: 'Precious' },
      { value: '1000 gp', type: 'Gem' },
      { value: '5000 gp', type: 'Jewel' }
    ];
    
    this.magicItems = {
      common: [
        'Potion of healing',
        'Potion of climbing',
        'Spell scroll (1st level)',
        'Potion of animal friendship'
      ],
      uncommon: [
        'Bag of holding',
        'Boots of elvenkind',
        'Cloak of protection +1',
        'Gauntlets of ogre power',
        'Ring of protection +1',
        'Wand of magic missiles',
        '+1 weapon'
      ],
      rare: [
        'Amulet of health',
        'Carpet of flying',
        'Cloak of displacement',
        'Ring of invisibility',
        'Staff of striking',
        '+2 weapon',
        'Armor +1'
      ],
      veryRare: [
        'Cloak of protection +2',
        'Ring of regeneration',
        'Rod of lordly might',
        'Staff of power',
        'Vorpal sword',
        'Armor +2'
      ],
      legendary: [
        'Ring of protection +3',
        'Staff of the magi',
        'Sword of sharpness',
        'Armor +3',
        'Deck of many things'
      ]
    };
  }

  roll(dice) {
    const [count, sides] = dice.split('d').map(Number);
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  }

  generateCoins(level = 1) {
    const multiplier = level;
    return {
      cp: this.roll(`${multiplier * 10}d6`),
      sp: this.roll(`${multiplier * 5}d6`),
      ep: this.roll(`${multiplier}d6`),
      gp: this.roll(`${multiplier * 2}d6`),
      pp: this.roll(`${Math.floor(multiplier / 2)}d6`)
    };
  }

  generateArt(count = 1) {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(this.artObjects[Math.floor(Math.random() * this.artObjects.length)]);
    }
    return items;
  }

  generateGems(count = 1) {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(this.gems[Math.floor(Math.random() * this.gems.length)]);
    }
    return items;
  }

  generateMagicItem(rarity = null) {
    if (!rarity) {
      const roll = Math.random();
      if (roll < 0.5) rarity = 'common';
      else if (roll < 0.75) rarity = 'uncommon';
      else if (roll < 0.9) rarity = 'rare';
      else if (roll < 0.97) rarity = 'veryRare';
      else rarity = 'legendary';
    }
    
    const items = this.magicItems[rarity];
    return {
      item: items[Math.floor(Math.random() * items.length)],
      rarity
    };
  }

  generateHoard(level = 1) {
    const hoard = {
      coins: this.generateCoins(level),
      art: Math.random() > 0.5 ? this.generateArt(this.roll('1d4')) : [],
      gems: Math.random() > 0.5 ? this.generateGems(this.roll('1d6')) : [],
      magicItems: []
    };
    
    // Magic items based on level
    const magicRoll = Math.random();
    if (level >= 1 && magicRoll > 0.7) {
      hoard.magicItems.push(this.generateMagicItem('common'));
    }
    if (level >= 3 && magicRoll > 0.85) {
      hoard.magicItems.push(this.generateMagicItem('uncommon'));
    }
    if (level >= 5 && magicRoll > 0.95) {
      hoard.magicItems.push(this.generateMagicItem('rare'));
    }
    
    // Calculate total value
    let totalValue = 0;
    totalValue += hoard.coins.cp * 0.01;
    totalValue += hoard.coins.sp * 0.1;
    totalValue += hoard.coins.ep * 0.5;
    totalValue += hoard.coins.gp;
    totalValue += hoard.coins.pp * 10;
    
    hoard.art.forEach(a => {
      totalValue += parseInt(a.value);
    });
    
    hoard.gems.forEach(g => {
      totalValue += parseInt(g.value);
    });
    
    hoard.totalValue = Math.floor(totalValue);
    
    return hoard;
  }

  formatHoard(hoard) {
    let output = '\n💰 TREASURE HOARD\n\n';
    
    output += 'Coins:\n';
    if (hoard.coins.cp > 0) output += `  ${hoard.coins.cp} cp\n`;
    if (hoard.coins.sp > 0) output += `  ${hoard.coins.sp} sp\n`;
    if (hoard.coins.ep > 0) output += `  ${hoard.coins.ep} ep\n`;
    if (hoard.coins.gp > 0) output += `  ${hoard.coins.gp} gp\n`;
    if (hoard.coins.pp > 0) output += `  ${hoard.coins.pp} pp\n`;
    
    if (hoard.art.length > 0) {
      output += '\nArt Objects:\n';
      hoard.art.forEach(a => output += `  ${a.description} (${a.value})\n`);
    }
    
    if (hoard.gems.length > 0) {
      output += '\nGems:\n';
      hoard.gems.forEach(g => output += `  ${g.type} (${g.value})\n`);
    }
    
    if (hoard.magicItems.length > 0) {
      output += '\nMagic Items:\n';
      hoard.magicItems.forEach(m => output += `  ${m.item} (${m.rarity})\n`);
    }
    
    output += `\n💎 Total Value: ${hoard.totalValue} gp\n`;
    
    return output;
  }
}

module.exports = TreasureGenerator;
