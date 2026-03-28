#!/usr/bin/env node

/**
 * D&D 3.5e Inventory & Magic Item Manager
 * Handles all calculations: weight, AC bonuses, stat mods, charges, etc.
 */

const fs = require('fs');
const path = require('path');

// Base item database (expandable)
const ITEM_DB = {
  // Weapons
  'longsword': { type: 'weapon', slot: 'mainHand', weight: 4, cost: { gp: 15 }, damage: '1d8', crit: '19-20/x2', dmgType: 'slashing' },
  'shortsword': { type: 'weapon', slot: 'mainHand', weight: 2, cost: { gp: 10 }, damage: '1d6', crit: '19-20/x2', dmgType: 'piercing' },
  'dagger': { type: 'weapon', slot: 'mainHand', weight: 1, cost: { gp: 2 }, damage: '1d4', crit: '19-20/x2', dmgType: 'piercing/slashing' },
  'greatsword': { type: 'weapon', slot: 'twoHand', weight: 8, cost: { gp: 50 }, damage: '2d6', crit: '19-20/x2', dmgType: 'slashing' },
  'longbow': { type: 'weapon', slot: 'ranged', weight: 3, cost: { gp: 75 }, damage: '1d8', crit: 'x3', dmgType: 'piercing', range: 100 },
  'shortbow': { type: 'weapon', slot: 'ranged', weight: 2, cost: { gp: 30 }, damage: '1d6', crit: 'x3', dmgType: 'piercing', range: 60 },
  'quarterstaff': { type: 'weapon', slot: 'twoHand', weight: 4, cost: { gp: 0 }, damage: '1d6', crit: 'x2', dmgType: 'bludgeoning' },
  'mace': { type: 'weapon', slot: 'mainHand', weight: 8, cost: { gp: 12 }, damage: '1d8', crit: 'x2', dmgType: 'bludgeoning' },
  'spear': { type: 'weapon', slot: 'twoHand', weight: 6, cost: { gp: 2 }, damage: '1d8', crit: 'x3', dmgType: 'piercing', range: 20 },
  
  // Armor
  'padded': { type: 'armor', slot: 'body', weight: 10, cost: { gp: 5 }, ac: 1, maxDex: 8, check: 0, spellFail: 5, speed: 30 },
  'leather': { type: 'armor', slot: 'body', weight: 15, cost: { gp: 10 }, ac: 2, maxDex: 6, check: 0, spellFail: 10, speed: 30 },
  'studded leather': { type: 'armor', slot: 'body', weight: 20, cost: { gp: 25 }, ac: 3, maxDex: 5, check: -1, spellFail: 15, speed: 30 },
  'chain shirt': { type: 'armor', slot: 'body', weight: 25, cost: { gp: 100 }, ac: 4, maxDex: 4, check: -2, spellFail: 20, speed: 30 },
  'hide': { type: 'armor', slot: 'body', weight: 25, cost: { gp: 15 }, ac: 3, maxDex: 4, check: -3, spellFail: 20, speed: 20 },
  'scale mail': { type: 'armor', slot: 'body', weight: 30, cost: { gp: 50 }, ac: 4, maxDex: 3, check: -4, spellFail: 25, speed: 20 },
  'chainmail': { type: 'armor', slot: 'body', weight: 40, cost: { gp: 150 }, ac: 5, maxDex: 2, check: -5, spellFail: 30, speed: 20 },
  'breastplate': { type: 'armor', slot: 'body', weight: 30, cost: { gp: 200 }, ac: 5, maxDex: 3, check: -4, spellFail: 25, speed: 20 },
  'splint mail': { type: 'armor', slot: 'body', weight: 45, cost: { gp: 200 }, ac: 6, maxDex: 0, check: -7, spellFail: 40, speed: 20 },
  'banded mail': { type: 'armor', slot: 'body', weight: 35, cost: { gp: 250 }, ac: 6, maxDex: 1, check: -6, spellFail: 35, speed: 20 },
  'half-plate': { type: 'armor', slot: 'body', weight: 50, cost: { gp: 600 }, ac: 7, maxDex: 0, check: -7, spellFail: 40, speed: 20 },
  'full plate': { type: 'armor', slot: 'body', weight: 50, cost: { gp: 1500 }, ac: 8, maxDex: 1, check: -6, spellFail: 35, speed: 20 },
  
  // Shields
  'buckler': { type: 'shield', slot: 'offHand', weight: 5, cost: { gp: 15 }, ac: 1, check: -1, spellFail: 5 },
  'light shield': { type: 'shield', slot: 'offHand', weight: 6, cost: { gp: 3 }, ac: 1, check: -1, spellFail: 5 },
  'heavy shield': { type: 'shield', slot: 'offHand', weight: 15, cost: { gp: 7 }, ac: 2, check: -2, spellFail: 15 },
  'tower shield': { type: 'shield', slot: 'offHand', weight: 45, cost: { gp: 30 }, ac: 4, check: -10, spellFail: 50, cover: true },
  
  // Adventuring gear
  'backpack': { type: 'gear', weight: 2, cost: { gp: 2 }, capacity: '2 cu ft / 60 lbs' },
  'bedroll': { type: 'gear', weight: 5, cost: { sp: 1 } },
  'waterskin': { type: 'gear', weight: 4, cost: { gp: 1 } },
  'torch': { type: 'gear', weight: 1, cost: { cp: 1 }, duration: '1 hour', light: 20 },
  'lantern': { type: 'gear', weight: 2, cost: { gp: 7 }, light: 30 },
  'oil (1 pint)': { type: 'gear', weight: 1, cost: { sp: 1 } },
  'rope (50 ft)': { type: 'gear', weight: 10, cost: { gp: 1 } },
  'grappling hook': { type: 'gear', weight: 4, cost: { gp: 1 } },
  'rations (1 day)': { type: 'gear', weight: 1, cost: { sp: 5 } },
  'thieves tools': { type: 'gear', weight: 1, cost: { gp: 30 } },
  'healers kit': { type: 'gear', weight: 1, cost: { gp: 50 }, uses: 10 },
  'spell component pouch': { type: 'gear', weight: 2, cost: { gp: 5 } },
  'scroll case': { type: 'gear', weight: 0.5, cost: { gp: 1 } },
  'map case': { type: 'gear', weight: 0.5, cost: { gp: 1 } },
  'tent': { type: 'gear', weight: 20, cost: { gp: 10 } },
  'blanket': { type: 'gear', weight: 3, cost: { sp: 5 } },
  'flint and steel': { type: 'gear', weight: 0, cost: { gp: 1 } },
  'ink (1 oz)': { type: 'gear', weight: 0, cost: { gp: 8 } },
  'inkpen': { type: 'gear', weight: 0, cost: { sp: 1 } },
  'paper (sheet)': { type: 'gear', weight: 0, cost: { sp: 4 } },
  'parchment (sheet)': { type: 'gear', weight: 0, cost: { sp: 2 } },
  'sealing wax': { type: 'gear', weight: 1, cost: { gp: 1 } },
  'soap': { type: 'gear', weight: 0.5, cost: { sp: 5 } },
  'crowbar': { type: 'gear', weight: 5, cost: { gp: 2 } },
  'hammer': { type: 'gear', weight: 2, cost: { sp: 5 } },
  'piton': { type: 'gear', weight: 0.5, cost: { sp: 1 } },
  'whetstone': { type: 'gear', weight: 1, cost: { cp: 2 } },
  'signal whistle': { type: 'gear', weight: 0, cost: { gp: 8 } },
  'spyglass': { type: 'gear', weight: 1, cost: { gp: 1000 } },
  'magnifying glass': { type: 'gear', weight: 0, cost: { gp: 100 } },
  'musical instrument': { type: 'gear', weight: 3, cost: { gp: 5 } },
  'holy symbol': { type: 'gear', weight: 1, cost: { gp: 25 } },
  'spellbook': { type: 'gear', weight: 3, cost: { gp: 15 }, pages: 100 },
  
  // Ammunition
  'arrows (20)': { type: 'ammo', weight: 3, cost: { gp: 1 }, quantity: 20 },
  'bolts (10)': { type: 'ammo', weight: 1, cost: { gp: 1 }, quantity: 10 },
  'bullets (10)': { type: 'ammo', weight: 5, cost: { sp: 3 }, quantity: 10 },
  
  // Containers
  'pouch': { type: 'container', weight: 0.5, cost: { gp: 1 }, capacity: '1/5 cu ft / 6 lbs' },
  'sack': { type: 'container', weight: 0.5, cost: { sp: 1 }, capacity: '1 cu ft / 30 lbs' },
  'sack (large)': { type: 'container', weight: 1, cost: { sp: 2 }, capacity: '2 cu ft / 60 lbs' },
  'vial': { type: 'container', weight: 0, cost: { gp: 1 } },
  'barrel': { type: 'container', weight: 30, cost: { gp: 2 }, capacity: '40 gallons' },
  'chest': { type: 'container', weight: 25, cost: { gp: 2 }, capacity: '2 cu ft / 100 lbs' }
};

// Magic item database
const MAGIC_ITEMS = {
  // Weapons
  'longsword +1': { type: 'weapon', slot: 'mainHand', bonus: 1, weight: 4, aura: 'faint transmutation', casterLevel: 5, price: 2315 },
  'longsword +2': { type: 'weapon', slot: 'mainHand', bonus: 2, weight: 4, aura: 'moderate transmutation', casterLevel: 8, price: 8315 },
  'flaming longsword': { type: 'weapon', slot: 'mainHand', bonus: 1, special: ['flaming'], weight: 4, aura: 'moderate evocation', casterLevel: 10, price: 8315 },
  'frost longsword': { type: 'weapon', slot: 'mainHand', bonus: 1, special: ['frost'], weight: 4, aura: 'moderate evocation', casterLevel: 10, price: 8315 },
  
  // Armor
  'leather armor +1': { type: 'armor', slot: 'body', bonus: 1, weight: 15, aura: 'faint conjuration', casterLevel: 5, price: 1160 },
  'chain shirt +1': { type: 'armor', slot: 'body', bonus: 1, weight: 25, aura: 'faint conjuration', casterLevel: 5, price: 1250 },
  'chainmail +1': { type: 'armor', slot: 'body', bonus: 1, weight: 40, aura: 'faint conjuration', casterLevel: 5, price: 1300 },
  'breastplate +1': { type: 'armor', slot: 'body', bonus: 1, weight: 30, aura: 'faint conjuration', casterLevel: 5, price: 1350 },
  'full plate +1': { type: 'armor', slot: 'body', bonus: 1, weight: 50, aura: 'faint conjuration', casterLevel: 5, price: 2650 },
  'mithral chain shirt': { type: 'armor', slot: 'body', bonus: 0, special: ['mithral'], weight: 12.5, maxDex: 6, check: 0, spellFail: 10, aura: 'moderate transmutation', casterLevel: 8, price: 1100 },
  
  // Rings
  'ring of protection +1': { type: 'ring', slot: 'finger', bonus: { ac: 1, deflection: 1 }, weight: 0, aura: 'faint abjuration', casterLevel: 5, price: 2000 },
  'ring of protection +2': { type: 'ring', slot: 'finger', bonus: { ac: 2, deflection: 2 }, weight: 0, aura: 'moderate abjuration', casterLevel: 8, price: 8000 },
  'ring of feather falling': { type: 'ring', slot: 'finger', effect: 'feather_fall', weight: 0, aura: 'faint transmutation', casterLevel: 1, price: 2200 },
  
  // Amulets
  'amulet of natural armor +1': { type: 'amulet', slot: 'neck', bonus: { ac: 1, natural: 1 }, weight: 0, aura: 'faint conjuration', casterLevel: 5, price: 2000 },
  'amulet of health +2': { type: 'amulet', slot: 'neck', bonus: { con: 2 }, weight: 0, aura: 'faint transmutation', casterLevel: 8, price: 4000 },
  'periapt of wisdom +2': { type: 'amulet', slot: 'neck', bonus: { wis: 2 }, weight: 0, aura: 'faint transmutation', casterLevel: 8, price: 4000 },
  
  // Cloaks
  'cloak of resistance +1': { type: 'cloak', slot: 'shoulders', bonus: { saves: 1 }, weight: 1, aura: 'faint abjuration', casterLevel: 5, price: 1000 },
  'cloak of resistance +2': { type: 'cloak', slot: 'shoulders', bonus: { saves: 2 }, weight: 1, aura: 'moderate abjuration', casterLevel: 8, price: 4000 },
  'cloak of elvenkind': { type: 'cloak', slot: 'shoulders', bonus: { hide: 5 }, weight: 1, aura: 'faint illusion', casterLevel: 3, price: 2500 },
  
  // Belts
  'belt of giant strength +2': { type: 'belt', slot: 'waist', bonus: { str: 2 }, weight: 1, aura: 'faint transmutation', casterLevel: 8, price: 4000 },
  'belt of incredible dexterity +2': { type: 'belt', slot: 'waist', bonus: { dex: 2 }, weight: 1, aura: 'faint transmutation', casterLevel: 8, price: 4000 },
  'belt of mighty constitution +2': { type: 'belt', slot: 'waist', bonus: { con: 2 }, weight: 1, aura: 'faint transmutation', casterLevel: 8, price: 4000 },
  
  // Head
  'hat of disguise': { type: 'head', slot: 'head', effect: 'disguise_self', weight: 0, aura: 'faint illusion', casterLevel: 1, price: 1800 },
  'headband of intellect +2': { type: 'head', slot: 'head', bonus: { int: 2 }, weight: 0, aura: 'faint transmutation', casterLevel: 8, price: 4000 },
  'headband of alluring charisma +2': { type: 'head', slot: 'head', bonus: { cha: 2 }, weight: 0, aura: 'faint transmutation', casterLevel: 8, price: 4000 },
  
  // Eyes
  'eyes of the eagle': { type: 'eyes', slot: 'eyes', bonus: { spot: 5 }, weight: 0, aura: 'faint divination', casterLevel: 3, price: 2500 },
  
  // Wrists
  'bracers of armor +1': { type: 'wrists', slot: 'wrists', bonus: { ac: 1, armor: 1 }, weight: 1, aura: 'faint conjuration', casterLevel: 7, price: 1000 },
  'bracers of armor +2': { type: 'wrists', slot: 'wrists', bonus: { ac: 2, armor: 2 }, weight: 1, aura: 'faint conjuration', casterLevel: 7, price: 4000 },
  
  // Hands
  'gauntlets of ogre power': { type: 'hands', slot: 'hands', bonus: { str: 2 }, weight: 4, aura: 'faint transmutation', casterLevel: 6, price: 4000 },
  'gloves of dexterity +2': { type: 'hands', slot: 'hands', bonus: { dex: 2 }, weight: 0, aura: 'faint transmutation', casterLevel: 8, price: 4000 },
  
  // Feet
  'boots of elvenkind': { type: 'feet', slot: 'feet', bonus: { move_silently: 5 }, weight: 1, aura: 'faint transmutation', casterLevel: 5, price: 2500 },
  'boots of speed': { type: 'feet', slot: 'feet', effect: 'haste', charges: 10, weight: 1, aura: 'moderate transmutation', casterLevel: 10, price: 12000 },
  'boots of striding and springing': { type: 'feet', slot: 'feet', bonus: { speed: 10, jump: 5 }, weight: 1, aura: 'faint transmutation', casterLevel: 3, price: 5500 },
  
  // Wondrous
  'bag of holding (type I)': { type: 'wondrous', slot: 'none', effect: 'extradimensional_storage', weight: 15, capacity: '250 lbs / 30 cu ft', aura: 'moderate conjuration', casterLevel: 9, price: 2500 },
  'handy haversack': { type: 'wondrous', slot: 'none', effect: 'extradimensional_storage', weight: 5, capacity: '120 lbs / 12 cu ft', aura: 'moderate conjuration', casterLevel: 9, price: 2000 },
  'efficient quiver': { type: 'wondrous', slot: 'none', effect: 'extradimensional_storage', weight: 2, aura: 'moderate transmutation', casterLevel: 9, price: 1800 }
};

class InventoryManager {
  constructor(characterPath) {
    this.characterPath = characterPath;
    this.character = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    this.inventory = this.character.inventory || { equipped: {}, backpack: [], currency: { pp: 0, gp: 0, sp: 0, cp: 0 } };
  }
  
  save() {
    this.character.inventory = this.inventory;
    fs.writeFileSync(this.characterPath, JSON.stringify(this.character, null, 2));
  }
  
  convertCurrency() {
    const total = this.inventory.currency.pp * 1000 + 
                  this.inventory.currency.gp * 100 + 
                  this.inventory.currency.sp * 10 + 
                  this.inventory.currency.cp;
    return {
      pp: Math.floor(total / 1000),
      gp: Math.floor((total % 1000) / 100),
      sp: Math.floor((total % 100) / 10),
      cp: total % 10
    };
  }
  
  addCurrency(pp = 0, gp = 0, sp = 0, cp = 0) {
    this.inventory.currency.pp += pp;
    this.inventory.currency.gp += gp;
    this.inventory.currency.sp += sp;
    this.inventory.currency.cp += cp;
    this.inventory.currency = this.convertCurrency();
    this.save();
    return this.inventory.currency;
  }
  
  spendCurrency(pp = 0, gp = 0, sp = 0, cp = 0) {
    const cost = pp * 1000 + gp * 100 + sp * 10 + cp;
    const current = this.inventory.currency.pp * 1000 + 
                    this.inventory.currency.gp * 100 + 
                    this.inventory.currency.sp * 10 + 
                    this.inventory.currency.cp;
    
    if (current < cost) {
      return { success: false, message: 'Insufficient funds' };
    }
    
    const remaining = current - cost;
    this.inventory.currency = {
      pp: Math.floor(remaining / 1000),
      gp: Math.floor((remaining % 1000) / 100),
      sp: Math.floor((remaining % 100) / 10),
      cp: remaining % 10
    };
    this.save();
    return { success: true, currency: this.inventory.currency };
  }
  
  getTotalWeight() {
    let weight = 0;
    for (const item of Object.values(this.inventory.equipped)) {
      if (item) weight += item.weight || 0;
    }
    for (const item of this.inventory.backpack) {
      weight += (item.weight || 0) * (item.quantity || 1);
    }
    const totalCoins = Object.values(this.inventory.currency).reduce((a, b) => a + b, 0);
    weight += Math.floor(totalCoins / 50);
    return weight;
  }
  
  getEncumbrance() {
    const str = this.character.abilityScores?.str?.score || 10;
    const light = str * 10;
    const medium = str * 20;
    const heavy = str * 30;
    const current = this.getTotalWeight();
    
    let load = 'light';
    if (current > heavy) load = 'overloaded';
    else if (current > medium) load = 'heavy';
    else if (current > light) load = 'medium';
    
    return { light, medium, heavy, current, load };
  }
  
  calculateAC() {
    const dexMod = Math.floor(((this.character.abilityScores?.dex?.score || 10) - 10) / 2);
    const sizeMod = this.character.raceData?.size === 'Small' ? 1 : 0;
    
    let ac = { base: 10, dex: dexMod, size: sizeMod, armor: 0, shield: 0, natural: 0, deflection: 0, misc: 0 };
    
    for (const [slot, item] of Object.entries(this.inventory.equipped)) {
      if (!item) continue;
      if (item.type === 'armor') {
        ac.armor = item.ac || 0;
        const maxDex = item.maxDex !== undefined ? item.maxDex : 99;
        ac.dex = Math.min(ac.dex, maxDex);
      }
      if (item.type === 'shield') ac.shield = item.ac || 0;
      if (item.bonus) {
        if (item.bonus.natural) ac.natural += item.bonus.natural;
        if (item.bonus.deflection) ac.deflection += item.bonus.deflection;
        if (item.bonus.ac && item.type !== 'armor' && item.type !== 'shield') ac.misc += item.bonus.ac;
      }
    }
    
    ac.total = ac.base + ac.dex + ac.size + ac.armor + ac.shield + ac.natural + ac.deflection + ac.misc;
    ac.touch = ac.base + ac.dex + ac.size + ac.deflection + ac.misc;
    ac.flatFooted = ac.base + ac.size + ac.armor + ac.shield + ac.natural + ac.deflection + ac.misc;
    return ac;
  }
  
  calculateSaves() {
    const base = this.character.saves || { fortitude: 0, reflex: 0, will: 0 };
    const bonuses = { fortitude: 0, reflex: 0, will: 0 };
    for (const item of Object.values(this.inventory.equipped)) {
      if (item?.bonus?.saves) {
        bonuses.fortitude += item.bonus.saves;
        bonuses.reflex += item.bonus.saves;
        bonuses.will += item.bonus.saves;
      }
    }
    return {
      fortitude: base.fortitude + bonuses.fortitude,
      reflex: base.reflex + bonuses.reflex,
      will: base.will + bonuses.will
    };
  }
  
  equip(itemName) {
    const item = MAGIC_ITEMS[itemName.toLowerCase()] || ITEM_DB[itemName.toLowerCase()];
    if (!item) return { success: false, message: `Item not found: ${itemName}` };
    
    const slot = item.slot;
    if (!slot) return { success: false, message: 'Item has no equip slot' };
    
    if (slot === 'finger') {
      if (!this.inventory.equipped.fingers) this.inventory.equipped.fingers = [null, null];
      if (this.inventory.equipped.fingers[0] && this.inventory.equipped.fingers[1]) {
        return { success: false, message: 'Both ring slots full' };
      }
      const idx = this.inventory.equipped.fingers[0] ? 1 : 0;
      this.inventory.equipped.fingers[idx] = { ...item, name: itemName };
    } else {
      this.inventory.equipped[slot] = { ...item, name: itemName };
    }
    
    this.save();
    return { success: true, message: `Equipped ${itemName}` };
  }
  
  addToBackpack(itemName, quantity = 1) {
    const item = ITEM_DB[itemName.toLowerCase()];
    if (!item) return { success: false, message: `Item not found: ${itemName}` };
    
    const existing = this.inventory.backpack.find(i => i.name === itemName);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + quantity;
    } else {
      this.inventory.backpack.push({ ...item, name: itemName, quantity });
    }
    
    this.save();
    return { success: true, message: `Added ${quantity}x ${itemName}` };
  }
  
  getCharacterSheet() {
    return {
      name: this.character.name,
      race: this.character.race,
      class: this.character.class,
      level: this.character.level,
      abilityScores: this.character.abilityScores,
      hp: this.character.hp,
      ac: this.calculateAC(),
      saves: this.calculateSaves(),
      encumbrance: this.getEncumbrance(),
      currency: this.inventory.currency,
      equipped: this.inventory.equipped,
      backpack: this.inventory.backpack
    };
  }
}

// CLI
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(`
Inventory Manager:
  node inventory.js <character> add <item> [qty]
  node inventory.js <character> equip <item>
  node inventory.js <character> currency
  node inventory.js <character> add-gold <amount>
  node inventory.js <character> spend <pp> <gp> <sp> <cp>
  node inventory.js <character> sheet
  node inventory.js <character> ac
  node inventory.js <character> weight
`);
  process.exit(1);
}

const charPath = path.join(__dirname, 'characters', `${args[0].toLowerCase()}.json`);
if (!fs.existsSync(charPath)) {
  console.error(`Character not found: ${args[0]}`);
  process.exit(1);
}

const inv = new InventoryManager(charPath);

switch (args[1]) {
  case 'add':
    console.log(inv.addToBackpack(args[2], parseInt(args[3]) || 1));
    break;
  case 'equip':
    console.log(inv.equip(args[2]));
    break;
  case 'currency':
    console.log('Currency:', inv.inventory.currency);
    break;
  case 'add-gold':
    console.log('New balance:', inv.addCurrency(0, parseInt(args[2]) || 0, 0, 0));
    break;
  case 'spend':
    console.log(inv.spendCurrency(parseInt(args[2])||0, parseInt(args[3])||0, parseInt(args[4])||0, parseInt(args[5])||0));
    break;
  case 'sheet':
    console.log(JSON.stringify(inv.getCharacterSheet(), null, 2));
    break;
  case 'ac':
    console.log('AC:', inv.calculateAC());
    break;
  case 'weight':
    console.log('Encumbrance:', inv.getEncumbrance());
    break;
  default:
    console.log('Unknown command');
}
