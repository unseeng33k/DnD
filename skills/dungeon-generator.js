#!/usr/bin/env node

/**
 * Random Dungeon Generator
 * Old-school AD&D style dungeon generation
 */

class DungeonGenerator {
  constructor() {
    this.roomTypes = [
      { type: 'Empty', chance: 20, contents: 'Nothing' },
      { type: 'Monster', chance: 25, contents: 'Roll encounter' },
      { type: 'Monster + Treasure', chance: 15, contents: 'Encounter + treasure' },
      { type: 'Treasure', chance: 5, contents: 'Hidden treasure' },
      { type: 'Trap', chance: 10, contents: 'Roll trap' },
      { type: 'Special', chance: 10, contents: 'Unique feature' },
      { type: 'Stairs', chance: 10, contents: 'Up or down' }
    ];
    
    this.corridorFeatures = [
      'Straight 30\'',
      'Straight 60\'',
      'Straight 90\'',
      'Door on left',
      'Door on right',
      'Door ahead',
      'Side passage left',
      'Side passage right',
      'Turn left 90°',
      'Turn right 90°',
      'Chamber ahead',
      'Stairs down',
      'Stairs up',
      'Dead end',
      'Trap!'
    ];
    
    this.roomShapes = [
      'Square (20x20)',
      'Square (30x30)',
      'Rectangular (20x30)',
      'Rectangular (30x50)',
      'Circular (30 diameter)',
      'Circular (50 diameter)',
      'Triangular (30x30x30)',
      'Octagonal (40 across)',
      'Irregular (roll dimensions)',
      'Cavern (irregular)'
    ];
    
    this.doorTypes = [
      { type: 'Wooden', locked: 30, stuck: 20, secret: 5 },
      { type: 'Stone', locked: 20, stuck: 40, secret: 10 },
      { type: 'Iron', locked: 50, stuck: 10, secret: 5 },
      { type: 'Portcullis', locked: 40, stuck: 30, secret: 0 },
      { type: 'Secret', locked: 10, stuck: 0, secret: 100 }
    ];
    
    this.specialFeatures = [
      'Fountain (magical or mundane)',
      'Statue (treasure hidden within)',
      'Pool of water (depth unknown)',
      'Altar (religious symbols)',
      'Throne (trapped)',
      'Pit (covered or open)',
      'Chasm (requires bridge)',
      'Magic circle (active or dormant)',
      'Library (books, scrolls)',
      'Prison cells (may be occupied)',
      'Trophy room (monster heads)',
      'Armory (weapons, some magical)',
      'Crypt (sarcophagi, undead)',
      'Laboratory (alchemical equipment)',
      'Treasure vault (heavily trapped)'
    ];
  }

  roll(dice) {
    if (typeof dice === 'string') {
      const [count, sides] = dice.split('d').map(Number);
      let total = 0;
      for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1;
      }
      return total;
    }
    return Math.floor(Math.random() * dice) + 1;
  }

  generateRoom() {
    const shape = this.random(this.roomShapes);
    const contents = this.determineContents();
    
    return {
      shape,
      ...contents,
      doors: this.roll('1d4'),
      features: Math.random() > 0.7 ? this.random(this.specialFeatures) : null
    };
  }

  determineContents() {
    const roll = this.roll(100);
    let cumulative = 0;
    
    for (const type of this.roomTypes) {
      cumulative += type.chance;
      if (roll <= cumulative) {
        return {
          type: type.type,
          description: type.contents
        };
      }
    }
    
    return { type: 'Empty', description: 'Nothing' };
  }

  generateCorridor() {
    return {
      feature: this.random(this.corridorFeatures),
      length: this.roll('3d10') * 10,
      width: this.roll('1d3') * 5 + 5
    };
  }

  generateDoor() {
    const door = this.random(this.doorTypes);
    const roll = this.roll(100);
    
    let state = 'Normal';
    if (roll <= door.secret) state = 'Secret';
    else if (roll <= door.secret + door.locked) state = 'Locked';
    else if (roll <= door.secret + door.locked + door.stuck) state = 'Stuck';
    
    return {
      type: door.type,
      state,
      material: door.type === 'Wooden' ? 'Wood' : 
                door.type === 'Stone' ? 'Stone' : 
                door.type === 'Iron' ? 'Iron' : 'Mixed'
    };
  }

  generateDungeon(level = 1, rooms = 10) {
    const dungeon = {
      level,
      rooms: [],
      corridors: [],
      stairs: { up: 0, down: 0 }
    };

    for (let i = 0; i < rooms; i++) {
      const room = this.generateRoom();
      room.number = i + 1;
      dungeon.rooms.push(room);
      
      if (room.type === 'Stairs') {
        if (Math.random() > 0.5) dungeon.stairs.up++;
        else dungeon.stairs.down++;
      }
    }

    // Generate connecting corridors
    for (let i = 0; i < rooms - 1; i++) {
      dungeon.corridors.push(this.generateCorridor());
    }

    return dungeon;
  }

  printDungeon(dungeon) {
    let output = `\n🏰 DUNGEON LEVEL ${dungeon.level}\n\n`;
    
    output += `Rooms: ${dungeon.rooms.length}\n`;
    output += `Stairs Up: ${dungeon.stairs.up} | Down: ${dungeon.stairs.down}\n\n`;
    
    dungeon.rooms.forEach(room => {
      output += `Room ${room.number}: ${room.shape}\n`;
      output += `  Contents: ${room.type} - ${room.description}\n`;
      output += `  Doors: ${room.doors}\n`;
      if (room.features) output += `  Feature: ${room.features}\n`;
      output += '\n';
    });
    
    return output;
  }

  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

module.exports = DungeonGenerator;
