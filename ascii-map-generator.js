#!/usr/bin/env node

/**
 * ASCII MAP GENERATOR
 * 
 * Generates ASCII dungeon maps with:
 * - Rooms, corridors, encounters
 * - Terrain features (walls, doors, water)
 * - Dynamic sizing based on module data
 * - ASCII art rendering
 * - Tactical overlay (grid, distances)
 */

class AsciiMapGenerator {
  constructor(width = 80, height = 24) {
    this.width = width;
    this.height = height;
    this.grid = this.initializeGrid();
    this.rooms = [];
    this.corridors = [];
    this.encounters = [];
    this.treasures = [];
  }

  /**
   * Initialize empty grid
   */
  initializeGrid() {
    return Array(this.height).fill(null).map(() => 
      Array(this.width).fill(' ')
    );
  }

  /**
   * Add room to map
   */
  addRoom(x, y, width, height, name = '') {
    const room = {
      x, y, width, height, name,
      encounters: [],
      treasure: [],
      exits: []
    };

    // Draw room boundary
    for (let i = 0; i < width; i++) {
      this.grid[y][x + i] = '─';
      this.grid[y + height - 1][x + i] = '─';
    }
    for (let i = 0; i < height; i++) {
      this.grid[y + i][x] = '│';
      this.grid[y + i][x + width - 1] = '│';
    }

    // Corners
    this.grid[y][x] = '┌';
    this.grid[y][x + width - 1] = '┐';
    this.grid[y + height - 1][x] = '└';
    this.grid[y + height - 1][x + width - 1] = '┘';

    // Room interior label
    const label = name.substring(0, width - 4);
    for (let i = 0; i < label.length; i++) {
      this.grid[y + 1][x + 2 + i] = label[i];
    }

    this.rooms.push(room);
    return room;
  }

  /**
   * Add corridor between rooms
   */
  addCorridor(x1, y1, x2, y2, horizontal = true) {
    const corridor = { x1, y1, x2, y2, horizontal };

    if (horizontal) {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      for (let x = minX; x <= maxX; x++) {
        if (this.grid[y1][x] === ' ') this.grid[y1][x] = '─';
      }
    } else {
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      for (let y = minY; y <= maxY; y++) {
        if (this.grid[y][x1] === ' ') this.grid[y][x1] = '│';
      }
    }

    this.corridors.push(corridor);
    return corridor;
  }

  /**
   * Add door to map
   */
  addDoor(x, y, direction = 'vertical', locked = false) {
    const doorChar = locked ? '╳' : '╭';
    this.grid[y][x] = doorChar;
    return { x, y, direction, locked };
  }

  /**
   * Add encounter marker
   */
  addEncounter(x, y, type = 'combat', difficulty = 'medium') {
    const iconMap = {
      'combat': '⚔',
      'trap': '⚠',
      'puzzle': '?',
      'npc': '@',
      'treasure': '◆'
    };
    
    const icon = iconMap[type] || '●';
    this.grid[y][x] = icon;

    this.encounters.push({
      x, y, type, difficulty,
      encountered: false
    });

    return this.encounters[this.encounters.length - 1];
  }

  /**
   * Add treasure/loot
   */
  addTreasure(x, y, value = 'unknown') {
    this.grid[y][x] = '◆';
    this.treasures.push({ x, y, value, looted: false });
  }

  /**
   * Add terrain feature
   */
  addTerrain(x, y, type = 'wall') {
    const terrainMap = {
      'wall': '█',
      'water': '~',
      'pit': 'O',
      'lava': '≈',
      'magical': '✦'
    };

    this.grid[y][x] = terrainMap[type] || '#';
  }

  /**
   * Add player/party position
   */
  addPartyPosition(x, y) {
    this.grid[y][x] = 'P';
    this.partyX = x;
    this.partyY = y;
  }

  /**
   * Render map as ASCII art
   */
  renderMap(includeGrid = false, includeEncounters = true) {
    let output = '\n';

    // Top border with column numbers
    if (includeGrid) {
      output += '  ';
      for (let x = 0; x < this.width; x++) {
        output += (x % 10).toString();
      }
      output += '\n';
    }

    // Grid with row numbers
    for (let y = 0; y < this.height; y++) {
      if (includeGrid) {
        output += (y % 10).toString().padStart(2);
      }
      
      for (let x = 0; x < this.width; x++) {
        output += this.grid[y][x];
      }
      output += '\n';
    }

    return output;
  }

  /**
   * Generate full dungeon level
   */
  generateDungeonLevel(levelNumber = 1, size = 'medium') {
    const sizes = {
      'small': { rooms: 3, corridors: 2, width: 60, height: 20 },
      'medium': { rooms: 6, corridors: 4, width: 80, height: 24 },
      'large': { rooms: 10, corridors: 8, width: 100, height: 30 }
    };

    const config = sizes[size] || sizes['medium'];

    // Generate rooms in grid pattern
    const roomWidth = 12;
    const roomHeight = 8;
    const gridX = 3;
    const gridY = 2;

    let roomNum = 0;
    for (let ry = 0; ry < gridY && roomNum < config.rooms; ry++) {
      for (let rx = 0; rx < gridX && roomNum < config.rooms; rx++) {
        const x = 4 + (rx * (roomWidth + 4));
        const y = 2 + (ry * (roomHeight + 2));

        if (x + roomWidth < this.width && y + roomHeight < this.height) {
          const room = this.addRoom(x, y, roomWidth, roomHeight, `Room ${roomNum + 1}`);
          
          // Random encounter
          if (Math.random() < 0.6) {
            const encX = x + 2 + Math.floor(Math.random() * (roomWidth - 4));
            const encY = y + 2 + Math.floor(Math.random() * (roomHeight - 4));
            const types = ['combat', 'trap', 'npc'];
            this.addEncounter(encX, encY, types[Math.floor(Math.random() * types.length)]);
          }

          // Random treasure
          if (Math.random() < 0.3) {
            const tX = x + 2 + Math.floor(Math.random() * (roomWidth - 4));
            const tY = y + 2 + Math.floor(Math.random() * (roomHeight - 4));
            this.addTreasure(tX, tY);
          }

          roomNum++;
        }
      }
    }

    // Connect rooms with corridors
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const r1 = this.rooms[i];
      const r2 = this.rooms[i + 1];
      
      // Simple corridor connection
      this.addCorridor(
        r1.x + r1.width,
        r1.y + Math.floor(r1.height / 2),
        r2.x,
        r2.y + Math.floor(r2.height / 2)
      );
    }

    return {
      level: levelNumber,
      size,
      rooms: this.rooms.length,
      encounters: this.encounters.length,
      treasures: this.treasures.length
    };
  }

  /**
   * Calculate distance from party to location
   */
  calculateDistance(x, y) {
    if (!this.partyX || !this.partyY) return null;

    const dx = Math.abs(x - this.partyX);
    const dy = Math.abs(y - this.partyY);
    
    // Chebyshev distance (grid-based)
    const gridDistance = Math.max(dx, dy);
    
    // Manhattan distance
    const walkingDistance = dx + dy;

    return {
      grid: gridDistance,
      walking: walkingDistance,
      euclidean: Math.sqrt(dx * dx + dy * dy).toFixed(1)
    };
  }

  /**
   * Get room at coordinates
   */
  getRoomAtCoords(x, y) {
    for (const room of this.rooms) {
      if (x >= room.x && x < room.x + room.width &&
          y >= room.y && y < room.y + room.height) {
        return room;
      }
    }
    return null;
  }

  /**
   * Get path from point A to point B
   */
  findPath(startX, startY, endX, endY) {
    // Simple pathfinding (A* would be better)
    const path = [];
    let x = startX, y = startY;

    while (x !== endX || y !== endY) {
      if (x < endX) x++;
      else if (x > endX) x--;

      if (y < endY) y++;
      else if (y > endY) y--;

      path.push({ x, y });

      if (path.length > 200) break; // Safety limit
    }

    return path;
  }

  /**
   * Get field of view from position
   */
  getFieldOfView(x, y, range = 5) {
    const visible = [];

    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        const distance = Math.max(Math.abs(dx), Math.abs(dy));

        if (distance <= range && nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          // Check line of sight (simple: no diagonal walls blocking)
          const char = this.grid[ny][nx];
          
          // Can see through non-walls
          if (char !== '█' && char !== '║' && char !== '─' && distance <= range) {
            visible.push({ x: nx, y: ny, distance, char });
          }
        }
      }
    }

    return visible;
  }

  /**
   * Export map as JSON (for saving)
   */
  exportMapData() {
    return {
      width: this.width,
      height: this.height,
      rooms: this.rooms,
      corridors: this.corridors,
      encounters: this.encounters,
      treasures: this.treasures,
      partyPosition: { x: this.partyX, y: this.partyY }
    };
  }

  /**
   * Import map from JSON
   */
  importMapData(data) {
    this.width = data.width;
    this.height = data.height;
    this.rooms = data.rooms;
    this.corridors = data.corridors;
    this.encounters = data.encounters;
    this.treasures = data.treasures;
    if (data.partyPosition) {
      this.partyX = data.partyPosition.x;
      this.partyY = data.partyPosition.y;
    }
  }
}

export { AsciiMapGenerator };
