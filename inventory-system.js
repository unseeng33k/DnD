#!/usr/bin/env node

/**
 * INVENTORY & ENCUMBRANCE SYSTEM
 * 
 * - Track items, weight, value
 * - Encumbrance penalties (movement, AC)
 * - Equipment lists by class
 * - Gold tracking
 */

class InventorySystem {
  constructor(character) {
    this.character = character;
    this.items = [];
    this.gold = 0;
    this.totalWeight = 0; // in coins (AD&D uses coins as weight)
  }

  /**
   * AD&D equipment weights (in coins)
   */
  getEquipmentDatabase() {
    return {
      // Weapons
      'dagger': { weight: 1, value: 2, hands: 1, damage: '1d4' },
      'short sword': { weight: 5, value: 5, hands: 1, damage: '1d6' },
      'long sword': { weight: 25, value: 10, hands: 1, damage: '1d8' },
      'great sword': { weight: 60, value: 25, hands: 2, damage: '1d10' },
      'axe': { weight: 20, value: 5, hands: 1, damage: '1d8' },
      'mace': { weight: 30, value: 5, hands: 1, damage: '1d6' },
      'hammer': { weight: 20, value: 2, hands: 1, damage: '1d4' },
      'staff': { weight: 40, value: 1, hands: 2, damage: '1d6' },
      'spear': { weight: 30, value: 1, hands: 2, damage: '1d6' },
      'bow': { weight: 15, value: 15, hands: 2, damage: '1d6' },
      'crossbow': { weight: 50, value: 30, hands: 2, damage: '1d8' },
      
      // Armor
      'leather armor': { weight: 150, value: 10, ac: 8 },
      'chain mail': { weight: 500, value: 50, ac: 5 },
      'plate armor': { weight: 800, value: 100, ac: 2 },
      'shield': { weight: 100, value: 10, ac: '+1' },
      'helmet': { weight: 50, value: 10, ac: '+1' },
      
      // Adventuring gear
      'backpack': { weight: 50, value: 1 },
      'bedroll': { weight: 200, value: 1 },
      'rope (50ft)': { weight: 100, value: 1 },
      'torch': { weight: 1, value: 0.01 },
      'lantern': { weight: 50, value: 10 },
      'tinderbox': { weight: 5, value: 1 },
      'waterskin': { weight: 20, value: 0.5 },
      'rations (1 day)': { weight: 10, value: 0.5 },
      'potion': { weight: 5, value: 50 },
      'spell component pouch': { weight: 20, value: 5 }
    };
  }

  /**
   * Add item to inventory
   */
  addItem(itemName, quantity = 1) {
    const equipment = this.getEquipmentDatabase();
    const item = equipment[itemName.toLowerCase()];
    
    if (!item) {
      return { success: false, message: `Unknown item: ${itemName}` };
    }

    this.items.push({
      name: itemName,
      quantity,
      weight: item.weight * quantity,
      value: item.value * quantity,
      ...item
    });

    this.updateTotalWeight();
    return { success: true, message: `Added ${quantity}x ${itemName}` };
  }

  /**
   * Remove item from inventory
   */
  removeItem(itemName, quantity = 1) {
    const index = this.items.findIndex(i => i.name.toLowerCase() === itemName.toLowerCase());
    
    if (index === -1) {
      return { success: false, message: 'Item not found' };
    }

    const item = this.items[index];
    if (item.quantity <= quantity) {
      this.items.splice(index, 1);
    } else {
      item.quantity -= quantity;
      item.weight -= item.weight / item.quantity * quantity;
    }

    this.updateTotalWeight();
    return { success: true, message: `Removed ${quantity}x ${itemName}` };
  }

  /**
   * Update total weight
   */
  updateTotalWeight() {
    this.totalWeight = this.items.reduce((sum, item) => sum + item.weight, 0) + this.gold;
  }

  /**
   * Calculate encumbrance
   */
  calculateEncumbrance() {
    const str = this.character.abilityScores?.STR || 10;
    const maxWeight = {
      3: 100, 4: 150, 5: 200, 6: 250, 7: 300, 8: 350, 9: 400,
      10: 450, 11: 500, 12: 550, 13: 600, 14: 700, 15: 800,
      16: 900, 17: 1000, 18: 1150, 19: 1300
    }[str] || 1000;

    if (this.totalWeight <= maxWeight / 3) {
      return { level: 'UNENCUMBERED', movement: '12"/round', ac: 0, thaco: 0 };
    } else if (this.totalWeight <= (maxWeight * 2) / 3) {
      return { level: 'LIGHTLY ENCUMBERED', movement: '9"/round', ac: 1, thaco: -1 };
    } else if (this.totalWeight <= maxWeight) {
      return { level: 'HEAVILY ENCUMBERED', movement: '6"/round', ac: 2, thaco: -2 };
    } else {
      return { level: 'OVER-ENCUMBERED', movement: '3"/round', ac: 4, thaco: -4 };
    }
  }

  /**
   * Get inventory summary
   */
  getSummary() {
    const encumbrance = this.calculateEncumbrance();
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║           INVENTORY                    ║');
    console.log('╚════════════════════════════════════════╝\n');

    if (this.items.length === 0) {
      console.log('(empty)');
    } else {
      for (const item of this.items) {
        console.log(`${item.name.padEnd(25)} x${item.quantity.toString().padEnd(3)} (${item.weight} coins)`);
      }
    }

    console.log(`\nGold: ${this.gold} GP`);
    console.log(`\nTotal Weight: ${this.totalWeight} coins`);
    console.log(`Encumbrance: ${encumbrance.level}`);
    console.log(`Movement: ${encumbrance.movement}`);
    console.log(`AC Penalty: ${encumbrance.ac > 0 ? '+' : ''}${encumbrance.ac}`);
    console.log(`THAC0 Penalty: ${encumbrance.thaco < 0 ? '' : '+'}${encumbrance.thaco}`);
  }

  /**
   * Add gold
   */
  addGold(amount) {
    this.gold += amount;
    this.updateTotalWeight();
    return { success: true, message: `Added ${amount} GP` };
  }

  /**
   * Remove gold
   */
  removeGold(amount) {
    if (this.gold < amount) {
      return { success: false, message: 'Not enough gold' };
    }
    this.gold -= amount;
    this.updateTotalWeight();
    return { success: true, message: `Removed ${amount} GP` };
  }

  /**
   * List available equipment
   */
  listAvailable() {
    console.log('\nAvailable equipment:');
    const equipment = this.getEquipmentDatabase();
    const names = Object.keys(equipment);
    
    for (let i = 0; i < names.length; i += 3) {
      console.log(`  ${names[i].padEnd(20)} ${names[i+1]?.padEnd(20) || ''} ${names[i+2] || ''}`);
    }
  }
}

export { InventorySystem };
