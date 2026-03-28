#!/usr/bin/env node

/**
 * Puzzle & Trap Generator
 */

class PuzzleTrapGenerator {
  constructor() {
    this.riddles = [
      { question: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?', answer: 'A map', hint: 'Think about representation vs reality' },
      { question: 'The more you take, the more you leave behind. What am I?', answer: 'Footsteps', hint: 'Think about movement' },
      { question: 'I have keys but no locks. I have space but no room. You can enter but not go outside. What am I?', answer: 'A keyboard', hint: 'Modern technology' },
      { question: 'The poor have me, the rich need me, eat me and you die. What am I?', answer: 'Nothing', hint: 'Think about absence' },
      { question: 'I am always coming but never arrive. What am I?', answer: 'Tomorrow', hint: 'Think about time' },
      { question: 'What has a head, a tail, but no body?', answer: 'A coin', hint: 'Currency' },
      { question: 'What gets wetter the more it dries?', answer: 'A towel', hint: 'Household item' },
      { question: 'What has hands but cannot clap?', answer: 'A clock', hint: 'Timepiece' },
      { question: 'What has a heart that doesn\'t beat?', answer: 'An artichoke', hint: 'Vegetable' },
      { question: 'What can travel around the world while staying in a corner?', answer: 'A stamp', hint: 'Mail' }
    ];
    
    this.traps = {
      mechanical: [
        { name: 'Pit Trap', trigger: 'Pressure plate', effect: '10d6 falling damage', detect: '1 in 6', disarm: 'Needle in hole' },
        { name: 'Poison Dart', trigger: 'Tripwire', effect: 'Save vs poison or die', detect: '2 in 6', disarm: 'Cut wire' },
        { name: 'Falling Block', trigger: 'Door opened', effect: '6d6 crushing damage', detect: '2 in 6', disarm: 'Wedge door' },
        { name: 'Swinging Blade', trigger: 'Pressure plate', effect: '4d6 slashing damage', detect: '1 in 6', disarm: 'Disable plate' },
        { name: 'Net Trap', trigger: 'Tripwire', effect: 'Trapped, -4 to hit', detect: '2 in 6', disarm: 'Cut wire' },
        { name: 'Bear Trap', trigger: 'Step on it', effect: '3d6 damage, held', detect: '3 in 6', disarm: 'Jam with iron spike' },
        { name: 'Rolling Boulder', trigger: 'Pressure plate', effect: '8d6 crushing damage', detect: '1 in 6', disarm: 'Disable plate' },
        { name: 'Spiked Pit', trigger: 'False floor', effect: '10d6 + 2d6 spikes', detect: '2 in 6', disarm: 'Probe with pole' }
      ],
      magical: [
        { name: 'Glyph of Warding', trigger: 'Touch', effect: '6d6 fire damage', detect: 'Magic only', disarm: 'Dispel magic' },
        { name: 'Symbol of Death', trigger: 'Read', effect: 'Save or die', detect: 'Magic only', disarm: 'Remove curse' },
        { name: 'Teleport Trap', trigger: 'Step on it', effect: 'Teleported to random location', detect: 'Magic only', disarm: 'Dispel magic' },
        { name: 'Polymorph Trap', trigger: 'Touch', effect: 'Save or turned into frog', detect: 'Magic only', disarm: 'Dispel magic' },
        { name: 'Fear Gas', trigger: 'Door opened', effect: 'Save or flee in terror', detect: '1 in 6', disarm: 'Dispel magic' },
        { name: 'Sleep Trap', trigger: 'Pressure plate', effect: 'Save or sleep 2d4 turns', detect: 'Magic only', disarm: 'Dispel magic' },
        { name: 'Lightning Bolt', trigger: 'Touch door handle', effect: '6d6 lightning damage', detect: 'Magic only', disarm: 'Dispel magic' },
        { name: 'Reverse Gravity', trigger: 'Pressure plate', effect: 'Fall upward 30 feet', detect: 'Magic only', disarm: 'Dispel magic' }
      ],
      complex: [
        { name: 'The Chessboard', description: 'Floor is chessboard pattern. Stepping on wrong color triggers dart trap.', solution: 'Follow knight\'s move pattern' },
        { name: 'The Riddle Door', description: 'Door asks riddle. Wrong answer triggers glyph.', solution: 'Answer riddle correctly' },
        { name: 'The Invisible Bridge', description: 'Pit with invisible bridge. False bridges are trapped.', solution: 'Throw dust to see bridge' },
        { name: 'The Mimic Chest', description: 'Treasure chest is actually a monster.', solution: 'Detect magic or prod with pole' },
        { name: 'The Pressure Chamber', description: 'Room fills with water. Must solve puzzle to drain.', solution: 'Turn valves in correct order' },
        { name: 'The Mirror Maze', description: 'Maze of mirrors. Some are portals to dangerous places.', solution: 'Mark path, follow breeze' },
        { name: 'The Pendulum Room', description: 'Giant pendulums swing across room. Touch means death.', solution: 'Time movements carefully' },
        { name: 'The Word Lock', description: 'Door with letter tiles. Must spell password.', solution: 'Find clue in dungeon' }
      ]
    };
  }

  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  generateRiddle() {
    return this.random(this.riddles);
  }

  generateTrap(type = 'random') {
    if (type === 'random') {
      type = Math.random() < 0.5 ? 'mechanical' : 'magical';
    }
    
    if (type === 'complex') {
      return this.random(this.traps.complex);
    }
    
    return this.random(this.traps[type]);
  }

  generatePuzzleRoom() {
    const trap = this.random(this.traps.complex);
    const riddle = this.random(this.riddles);
    
    return {
      description: `A ${trap.name} blocks the way forward.`,
      trap: trap,
      riddle: riddle,
      solution: trap.solution || riddle.answer,
      reward: 'Treasure or passage'
    };
  }
}

module.exports = PuzzleTrapGenerator;
