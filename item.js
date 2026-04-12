#!/usr/bin/env node

/**
 * Magic Item Compendium
 * Detailed descriptions for all magic items
 */

class MagicItemCompendium {
  constructor() {
    this.items = {
      // Armor
      'armor of the sunken king': {
        name: 'Armor of the Sunken King',
        type: 'Armor',
        subtype: 'Elven Chain',
        bonus: '+3',
        ac: -3,
        value: '10,000 gp',
        special: 'Water breathing, swim 30\', immunity to grapple/restraint',
        appearance: 'Ancient bronze scales with sea-green patina, depictions of underwater kingdoms',
        history: 'Worn by an elf who ruled these depths before Tlaloc. Before the Olman. Before history.',
        weight: 15
      },
      'armor +1': {
        name: 'Armor +1',
        type: 'Armor',
        bonus: '+1',
        ac: -1,
        value: '1,000 gp',
        special: null,
        appearance: 'Subtly shimmering metal with protective enchantments',
        history: 'Common enchanted armor used by adventurers',
        weight: null
      },
      'armor +2': {
        name: 'Armor +2',
        type: 'Armor',
        bonus: '+2',
        ac: -2,
        value: '3,000 gp',
        special: null,
        appearance: 'Gleaming metal with visible magical runes',
        history: 'Crafted by skilled artificers for elite warriors',
        weight: null
      },
      'armor +3': {
        name: 'Armor +3',
        type: 'Armor',
        bonus: '+3',
        ac: -3,
        value: '7,000 gp',
        special: null,
        appearance: 'Brilliant metal that seems to shift colors in light',
        history: 'Masterwork enchanted armor, rare and valuable',
        weight: null
      },

      // Rings
      'ring of protection': {
        name: 'Ring of Protection',
        type: 'Ring',
        bonus: '+1',
        ac: -1,
        saves: 1,
        value: '2,000 gp',
        special: 'Stacks with other protection items',
        appearance: 'Simple band with protective sigils',
        history: 'Common protective magic, favored by adventurers'
      },
      'ring of protection +1': {
        name: 'Ring of Protection +1',
        type: 'Ring',
        bonus: '+1',
        ac: -1,
        saves: 1,
        value: '2,000 gp',
        special: 'Stacks with other protection items',
        appearance: 'Simple band with protective sigils',
        history: 'Common protective magic, favored by adventurers'
      },
      'ring of protection +2': {
        name: 'Ring of Protection +2',
        type: 'Ring',
        bonus: '+2',
        ac: -2,
        saves: 2,
        value: '10,000 gp',
        special: 'Stacks with other protection items',
        appearance: 'Silver band with protective runes visible only in moonlight',
        history: 'Greater protective enchantment, highly sought after'
      },
      'ring of protection +3': {
        name: 'Ring of Protection +3',
        type: 'Ring',
        bonus: '+3',
        ac: -3,
        saves: 3,
        value: '25,000 gp',
        special: 'Stacks with other protection items',
        appearance: 'Platinum band with constantly shifting protective glyphs',
        history: 'Legendary protection, crafted by master enchanters'
      },
      'ring of wizardry': {
        name: 'Ring of Wizardry',
        type: 'Ring',
        bonus: null,
        value: '25,000 gp',
        special: 'Doubles 1st-level mage spell slots',
        appearance: 'Gold band set with tiny star sapphires that twinkle when spells are cast',
        history: 'One of the most prized possessions of any mage'
      },
      'ring of invisibility': {
        name: 'Ring of Invisibility',
        type: 'Ring',
        bonus: null,
        value: '15,000 gp',
        special: 'Turn invisible at will, lasts until dispelled or attack',
        appearance: 'Plain silver ring that becomes transparent when worn',
        history: 'Ancient magic, often associated with thieves and spies'
      },
      'ring of regeneration': {
        name: 'Ring of Regeneration',
        type: 'Ring',
        bonus: null,
        value: '30,000 gp',
        special: 'Regenerate 1 HP per round, reattach severed limbs in 2d4 rounds',
        appearance: 'Gold band with intertwining vine patterns that seem to grow',
        history: 'Legendary ring, said to be blessed by nature deities'
      },

      // Weapons
      'sword +1': {
        name: 'Sword +1',
        type: 'Weapon',
        bonus: '+1',
        toHit: 1,
        damage: 1,
        value: '1,000 gp',
        special: null,
        appearance: 'Blade with faint blue glow along edge',
        history: 'Standard enchanted weapon for adventurers'
      },
      'sword +2': {
        name: 'Sword +2',
        type: 'Weapon',
        bonus: '+2',
        toHit: 2,
        damage: 2,
        value: '3,000 gp',
        special: null,
        appearance: 'Gleaming blade with visible runes',
        history: 'Quality enchanted weapon for experienced warriors'
      },
      'sword +3': {
        name: 'Sword +3',
        type: 'Weapon',
        bonus: '+3',
        toHit: 3,
        damage: 3,
        value: '7,000 gp',
        special: null,
        appearance: 'Brilliant blade that hums with power',
        history: 'Masterwork weapon, rare and powerful'
      },
      'long sword +3': {
        name: 'Long Sword +3',
        type: 'Weapon',
        bonus: '+3',
        toHit: 3,
        damage: 3,
        damageSM: '4-9',
        damageL: '3-11',
        value: '7,000 gp',
        special: null,
        appearance: 'Ancient blade with jade inlays, glows faintly blue when drawn',
        history: 'Often recovered from ancient tombs, wielded by legendary warriors'
      },
      'sword of tides': {
        name: 'Sword of Tides',
        type: 'Weapon',
        subtype: 'Longsword +3',
        bonus: '+3',
        toHit: 3,
        damage: 3,
        damageSM: '4-9',
        damageL: '3-11',
        value: '8,000 gp',
        special: 'Tidal wave: 3d10 damage, 30\' cone, 1/day. Weapon floats (buoyant).',
        appearance: 'Ancient blade with wave patterns that shimmer like moving water',
        history: 'The sea obeys this blade. It has drowned kingdoms.'
      },
      'vorpal sword': {
        name: 'Vorpal Sword',
        type: 'Weapon',
        bonus: '+3',
        toHit: 3,
        damage: 3,
        value: '50,000+ gp',
        special: 'On natural 20, decapitates target (instant death)',
        appearance: 'Wickedly curved blade with serrated edge, seems to whisper',
        history: 'Legendary weapon from the poem Jabberwocky, feared by all'
      },
      'uthul': {
        name: 'Uthul',
        type: 'Weapon',
        subtype: 'Battle Axe +2',
        bonus: '+2',
        toHit: 2,
        damage: 2,
        value: '5,000 gp',
        special: 'Vorpal vs giant class: sever limb on 18-20',
        appearance: 'Heavy battle axe with runes that glow when giants are near',
        history: 'Forged to slay giants, this axe has felled many tyrants'
      },

      // Miscellaneous
      'luck stone': {
        name: 'Luck Stone',
        type: 'Miscellaneous',
        bonus: null,
        saves: 1,
        value: '5,000 gp',
        special: '+1 to all saving throws, must be carried on person',
        appearance: 'Smooth river stone that feels warm to the touch',
        history: 'Natural stone infused with luck magic by ancient rituals'
      },
      'bag of holding': {
        name: 'Bag of Holding',
        type: 'Miscellaneous',
        bonus: null,
        value: '2,500 gp',
        special: 'Holds 500 lbs, always weighs 15 lbs',
        appearance: 'Ordinary-looking sack with subtle magical shimmer inside',
        history: 'Standard adventuring gear, essential for treasure hunting'
      },
      'cloak of protection': {
        name: 'Cloak of Protection',
        type: 'Miscellaneous',
        bonus: '+1',
        ac: -1,
        saves: 1,
        value: '2,000 gp',
        special: 'Stacks with other protection items',
        appearance: 'Fine cloak that seems to shift colors in shadow',
        history: 'Favored by rogues and mages who cannot wear armor'
      },
      'boots of elvenkind': {
        name: 'Boots of Elvenkind',
        type: 'Miscellaneous',
        bonus: null,
        value: '2,500 gp',
        special: 'Move silently (surprise on 1-4 in 6)',
        appearance: 'Soft leather boots with elven leaf patterns',
        history: 'Crafted by elven leatherworkers using ancient techniques'
      },
      'gauntlets of ogre power': {
        name: 'Gauntlets of Ogre Power',
        type: 'Miscellaneous',
        bonus: null,
        value: '2,000 gp',
        special: 'STR 18/00 while worn',
        appearance: 'Thick leather gauntlets that seem too large until worn',
        history: 'Infused with ogre strength through dangerous rituals'
      },
      'amulet of health': {
        name: 'Amulet of Health',
        type: 'Miscellaneous',
        bonus: null,
        value: '5,000 gp',
        special: 'CON 18 while worn',
        appearance: 'Golden amulet with a beating heart gemstone',
        history: 'Blessed by clerics of health and vitality deities'
      },
      'carpet of flying': {
        name: 'Carpet of Flying',
        type: 'Miscellaneous',
        bonus: null,
        value: '15,000 gp',
        special: 'Flies at 42", carries 3 people',
        appearance: 'Ornate rug with intricate patterns that shimmer in wind',
        history: 'Woven by djinn for wealthy sultans and adventurers'
      },
      'deck of many things': {
        name: 'Deck of Many Things',
        type: 'Miscellaneous',
        bonus: null,
        value: 'Priceless',
        special: 'Draw cards for random major effects (can gain or lose everything)',
        appearance: 'Ordinary deck of cards that feels heavy with destiny',
        history: 'Most dangerous item in existence, use at own risk'
      }
    };
  }

  getItem(name) {
    const key = name.toLowerCase().trim();
    return this.items[key] || null;
  }

  searchItems(term) {
    const results = [];
    const searchTerm = term.toLowerCase();
    
    for (const [key, item] of Object.entries(this.items)) {
      if (key.includes(searchTerm) || 
          item.name.toLowerCase().includes(searchTerm) ||
          item.type.toLowerCase().includes(searchTerm)) {
        results.push(item);
      }
    }
    
    return results;
  }

  printItem(name) {
    const item = this.getItem(name);
    
    if (!item) {
      console.log(`Item "${name}" not found in compendium.`);
      return;
    }

    console.log(`\n✨ ${item.name.toUpperCase()}\n`);
    console.log(`Type: ${item.type}`);
    if (item.bonus) console.log(`Bonus: ${item.bonus}`);
    if (item.ac) console.log(`AC Bonus: ${item.ac}`);
    if (item.saves) console.log(`Save Bonus: +${item.saves}`);
    if (item.toHit) console.log(`To-Hit Bonus: +${item.toHit}`);
    if (item.damage) console.log(`Damage Bonus: +${item.damage}`);
    console.log(`Value: ${item.value}`);
    
    if (item.special) {
      console.log(`\nSpecial: ${item.special}`);
    }
    
    console.log(`\nAppearance: ${item.appearance}`);
    console.log(`\nHistory: ${item.history}`);
    
    if (item.weight) {
      console.log(`\nWeight: ${item.weight} lbs`);
    }
  }

  listByType(type) {
    const results = [];
    for (const item of Object.values(this.items)) {
      if (item.type.toLowerCase() === type.toLowerCase()) {
        results.push(item);
      }
    }
    return results;
  }

  printHelp() {
    console.log(`
📖 MAGIC ITEM COMPENDIUM

USAGE:
  node item.js <item-name>      Show item details
  node item.js search <term>    Search items
  node item.js list <type>      List by type (armor, ring, weapon, misc)

EXAMPLES:
  node item.js "ring of protection"
  node item.js search sword
  node item.js list armor
`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const compendium = new MagicItemCompendium();

  if (!command || command === 'help') {
    compendium.printHelp();
    process.exit(0);
  }

  if (command === 'search' && args[1]) {
    const results = compendium.searchItems(args[1]);
    console.log(`\n🔍 Found ${results.length} item(s):\n`);
    results.forEach(item => console.log(`  • ${item.name} (${item.type})`));
    process.exit(0);
  }

  if (command === 'list' && args[1]) {
    const results = compendium.listByType(args[1]);
    console.log(`\n📋 ${args[1].toUpperCase()} ITEMS:\n`);
    results.forEach(item => console.log(`  • ${item.name}`));
    process.exit(0);
  }

  // Default: look up item
  compendium.printItem(args.join(' '));
}

module.exports = MagicItemCompendium;
