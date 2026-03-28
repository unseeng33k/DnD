#!/usr/bin/env node

/**
 * ASCII Map Skill for D&D
 * Simple, clear dungeon maps showing party location
 */

const fs = require('fs');
const path = require('path');

class ASCIIMap {
  constructor() {
    this.mapFile = path.join(__dirname, '..', '..', 'current_map.json');
    this.currentMap = this.loadMap();
  }

  loadMap() {
    try {
      return JSON.parse(fs.readFileSync(this.mapFile, 'utf8'));
    } catch (e) {
      return this.createDefaultMap();
    }
  }

  saveMap() {
    fs.writeFileSync(this.mapFile, JSON.stringify(this.currentMap, null, 2));
  }

  createDefaultMap() {
    return {
      name: 'Default Dungeon',
      width: 10,
      height: 10,
      partyLocation: { x: 1, y: 1 },
      rooms: {},
      discovered: [['1,1']],
      grid: this.generateEmptyGrid(10, 10)
    };
  }

  generateEmptyGrid(width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push('#'); // Wall by default
      }
      grid.push(row);
    }
    return grid;
  }

  /**
   * Create a new dungeon map
   */
  createDungeon(name, width = 10, height = 10) {
    this.currentMap = {
      name,
      width,
      height,
      partyLocation: { x: 1, y: 1 },
      rooms: {},
      discovered: [['1,1']],
      grid: this.generateEmptyGrid(width, height)
    };
    this.saveMap();
    return this.currentMap;
  }

  /**
   * Add a room to the dungeon
   */
  addRoom(id, x, y, width, height, name = '', connections = []) {
    // Carve out room in grid
    for (let ry = y; ry < y + height && ry < this.currentMap.height; ry++) {
      for (let rx = x; rx < x + width && rx < this.currentMap.width; rx++) {
        this.currentMap.grid[ry][rx] = '.';
      }
    }

    // Add doors for connections
    connections.forEach(conn => {
      if (conn.x >= 0 && conn.x < this.currentMap.width && 
          conn.y >= 0 && conn.y < this.currentMap.height) {
        this.currentMap.grid[conn.y][conn.x] = '+';
      }
    });

    this.currentMap.rooms[id] = {
      id,
      name: name || `Room ${id}`,
      x, y, width, height,
      connections
    };

    this.saveMap();
  }

  /**
   * Move party to a location
   */
  moveParty(x, y) {
    if (x >= 0 && x < this.currentMap.width && y >= 0 && y < this.currentMap.height) {
      this.currentMap.partyLocation = { x, y };
      this.discover(x, y);
      this.saveMap();
      return true;
    }
    return false;
  }

  /**
   * Move party to a room by ID
   */
  moveToRoom(roomId) {
    const room = this.currentMap.rooms[roomId];
    if (room) {
      const centerX = Math.floor(room.x + room.width / 2);
      const centerY = Math.floor(room.y + room.height / 2);
      return this.moveParty(centerX, centerY);
    }
    return false;
  }

  /**
   * Mark area as discovered
   */
  discover(x, y, radius = 2) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.currentMap.width && ny >= 0 && ny < this.currentMap.height) {
          const key = `${nx},${ny}`;
          if (!this.currentMap.discovered.includes(key)) {
            this.currentMap.discovered.push(key);
          }
        }
      }
    }
    this.saveMap();
  }

  /**
   * Render the map as ASCII
   */
  render() {
    const { width, height, partyLocation, discovered, grid, name } = this.currentMap;
    
    let output = `\n🏰 ${name.toUpperCase()}\n\n`;
    
    // Column headers
    output += '    ';
    for (let x = 0; x < width; x++) {
      output += `${x % 10} `;
    }
    output += '\n';
    
    // Top border
    output += '   +';
    for (let x = 0; x < width; x++) {
      output += '--';
    }
    output += '-+\n';
    
    // Grid rows
    for (let y = 0; y < height; y++) {
      output += `${String.fromCharCode(65 + y % 26)}  |`;
      
      for (let x = 0; x < width; x++) {
        const isParty = (x === partyLocation.x && y === partyLocation.y);
        const isDiscovered = discovered.includes(`${x},${y}`);
        
        if (isParty) {
          output += ' @';
        } else if (isDiscovered) {
          output += ` ${grid[y][x]}`;
        } else {
          output += ' ?';
        }
      }
      
      output += ' |\n';
    }
    
    // Bottom border
    output += '   +';
    for (let x = 0; x < width; x++) {
      output += '--';
    }
    output += '-+\n';
    
    // Legend
    output += '\n📜 LEGEND:\n';
    output += '  @ = Party    # = Wall    . = Floor\n';
    output += '  + = Door     ? = Unknown\n';
    
    // Party location info
    const room = this.getRoomAt(partyLocation.x, partyLocation.y);
    output += `\n📍 Party at: ${String.fromCharCode(65 + partyLocation.y % 26)}${partyLocation.x}`;
    if (room) {
      output += ` (${room.name})`;
    }
    output += '\n';
    
    return output;
  }

  getRoomAt(x, y) {
    for (const room of Object.values(this.currentMap.rooms)) {
      if (x >= room.x && x < room.x + room.width &&
          y >= room.y && y < room.y + room.height) {
        return room;
      }
    }
    return null;
  }

  /**
   * Create Tamoachan dungeon preset
   */
  createTamoachan() {
    this.createDungeon('Hidden Shrine of Tamoachan', 12, 12);
    
    // Entrance
    this.addRoom('entrance', 1, 1, 3, 3, 'Jungle Entrance', [
      { x: 4, y: 2 }
    ]);
    
    // Antechamber (Three Archways)
    this.addRoom('antechamber', 5, 1, 4, 3, 'Antechamber', [
      { x: 4, y: 2 }, { x: 9, y: 2 }
    ]);
    
    // Pool Chamber
    this.addRoom('pool', 1, 5, 4, 4, 'Pool Chamber', [
      { x: 4, y: 2 }
    ]);
    
    // Shrine Room
    this.addRoom('shrine', 6, 5, 4, 4, 'Shrine of Tlaloc', [
      { x: 9, y: 2 }
    ]);
    
    // Tomb
    this.addRoom('tomb', 6, 9, 4, 2, 'Tomb of Olman King', []);
    
    this.moveToRoom('entrance');
    this.saveMap();
    
    return this.currentMap;
  }

  printMap() {
    console.log(this.render());
  }

  printHelp() {
    console.log(`
🗺️  ASCII MAP SKILL

USAGE:
  node ascii-map.js show                    Show current map
  node ascii-map.js move <x> <y>            Move party to coordinates
  node ascii-map.js room <room-id>          Move party to room
  node ascii-map.js create <name> [w] [h]   Create new dungeon
  node ascii-map.js tamoachan               Load Tamoachan preset
  node ascii-map.js discover <x> <y>        Discover area

EXAMPLES:
  node ascii-map.js show
  node ascii-map.js move 5 3
  node ascii-map.js room antechamber
  node ascii-map.js create "My Dungeon" 15 15
  node ascii-map.js tamoachan

SYMBOLS:
  @ = Party location    # = Wall
  . = Floor/room        + = Door
  ? = Unexplored
`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const map = new ASCIIMap();

  switch (command) {
    case 'show':
    case 'map':
      map.printMap();
      break;

    case 'move':
      if (args.length < 3) {
        console.log('Usage: move <x> <y>');
        process.exit(1);
      }
      if (map.moveParty(parseInt(args[1]), parseInt(args[2]))) {
        console.log('Party moved.');
        map.printMap();
      } else {
        console.log('Invalid coordinates.');
      }
      break;

    case 'room':
      if (!args[1]) {
        console.log('Usage: room <room-id>');
        process.exit(1);
      }
      if (map.moveToRoom(args[1])) {
        console.log(`Party moved to ${args[1]}.`);
        map.printMap();
      } else {
        console.log('Room not found.');
      }
      break;

    case 'create':
      if (!args[1]) {
        console.log('Usage: create <name> [width] [height]');
        process.exit(1);
      }
      map.createDungeon(args[1], parseInt(args[2]) || 10, parseInt(args[3]) || 10);
      console.log(`Created dungeon: ${args[1]}`);
      map.printMap();
      break;

    case 'tamoachan':
      map.createTamoachan();
      console.log('Loaded: Hidden Shrine of Tamoachan');
      map.printMap();
      break;

    case 'discover':
      if (args.length < 3) {
        console.log('Usage: discover <x> <y>');
        process.exit(1);
      }
      map.discover(parseInt(args[1]), parseInt(args[2]));
      console.log('Area discovered.');
      map.printMap();
      break;

    case 'help':
    default:
      map.printHelp();
      break;
  }
}

module.exports = ASCIIMap;
