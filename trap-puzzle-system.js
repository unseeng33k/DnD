#!/usr/bin/env node

/**
 * TRAP MECHANICS & PUZZLE ENGINE
 * 
 * Traps: detect, disable, trigger
 * Puzzles: hint system, solutions
 */

class TrapMechanics {
  constructor(character) {
    this.character = character;
  }

  /**
   * Trap database
   */
  getTrapDatabase() {
    return {
      'pit trap': {
        detectDC: 10,
        disableDC: 12,
        damage: '2d6',
        save: 'DEX DC 13'
      },
      'poison dart': {
        detectDC: 12,
        disableDC: 14,
        damage: '1d6 + poison',
        save: 'CON DC 14'
      },
      'pressure plate': {
        detectDC: 8,
        disableDC: 10,
        damage: 'Varies (fireball, poison, etc)',
        save: 'DEX DC 13'
      },
      'tripwire': {
        detectDC: 10,
        disableDC: 11,
        damage: 'None or 1d4',
        save: 'None'
      },
      'spiked pit': {
        detectDC: 10,
        disableDC: 14,
        damage: '2d6 fall + 1d4 spikes',
        save: 'DEX DC 13'
      },
      'gas cloud': {
        detectDC: 14,
        disableDC: 16,
        damage: '1d6 poison per round',
        save: 'CON DC 15'
      },
      'blade trap': {
        detectDC: 12,
        disableDC: 15,
        damage: '2d6 slashing',
        save: 'DEX DC 14'
      },
      'magic alarm': {
        detectDC: 16,
        disableDC: 18,
        damage: 'None (alerts enemies)',
        save: 'None'
      }
    };
  }

  /**
   * Detect trap check
   */
  detectTrap(trapName) {
    const traps = this.getTrapDatabase();
    const trap = traps[trapName.toLowerCase()];
    
    if (!trap) {
      return { success: false, message: 'Unknown trap' };
    }

    const searchBonus = this.character.class === 'thief' ? 3 : 0;
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + searchBonus;

    return {
      roll: d20,
      bonus: searchBonus,
      total,
      detectDC: trap.detectDC,
      detected: total >= trap.detectDC,
      message: total >= trap.detectDC ? `DETECTED! ${trapName}` : `No trap found (but was there!)`
    };
  }

  /**
   * Disable trap check
   */
  disableTrap(trapName) {
    const traps = this.getTrapDatabase();
    const trap = traps[trapName.toLowerCase()];
    
    if (!trap) {
      return { success: false, message: 'Unknown trap' };
    }

    if (this.character.class !== 'thief') {
      return { success: false, message: 'Only thieves can disable traps' };
    }

    const disableBonus = 3;
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + disableBonus;

    if (total >= trap.disableDC) {
      return {
        success: true,
        message: `DISABLED! ${trapName} is now safe`,
        total
      };
    } else {
      return {
        success: false,
        message: `FAILED! Trap triggers! Damage: ${trap.damage}, Save: ${trap.save}`,
        total,
        triggered: true
      };
    }
  }

  /**
   * Trigger trap (failed disable)
   */
  triggerTrap(trapName) {
    const traps = this.getTrapDatabase();
    const trap = traps[trapName.toLowerCase()];
    
    if (!trap) return null;

    // Roll damage
    const damageFormula = trap.damage;
    let damage = 0;
    
    if (damageFormula.includes('d')) {
      const match = damageFormula.match(/(\d+)d(\d+)/);
      if (match) {
        const numDice = parseInt(match[1]);
        const diceSize = parseInt(match[2]);
        for (let i = 0; i < numDice; i++) {
          damage += Math.floor(Math.random() * diceSize) + 1;
        }
      }
    }

    return {
      trap: trapName,
      damage,
      save: trap.save,
      message: `TRAP TRIGGERED! ${trapName}: ${damage} damage`
    };
  }
}

/**
 * PUZZLE ENGINE
 */
class PuzzleEngine {
  constructor() {
    this.puzzles = this.getPuzzleDatabase();
  }

  /**
   * Puzzle database with hints
   */
  getPuzzleDatabase() {
    return {
      'statue riddle': {
        question: '"I have cities but no houses, forests but no trees, water but no fish. What am I?"',
        answer: 'a map',
        hints: [
          'Think about what contains these things...',
          'You might carry this in your pocket or backpack',
          'It shows geography and locations'
        ]
      },
      'door puzzle': {
        question: 'The door is locked. You see three symbols: ☀️ (sun), ✦ (star), 🌙 (moon). Which unlocks the door?',
        answer: 'star',
        hints: [
          'Think about when each appears in the sky',
          'Which one appears at a specific time?',
          'The stars are visible at night when the moon is...'
        ]
      },
      'number puzzle': {
        question: 'What number comes next? 2, 4, 8, 16, _?',
        answer: '32',
        hints: [
          'Look at the pattern between numbers',
          'Each number is related to the previous one',
          'Try multiplying or doubling'
        ]
      },
      'magic word': {
        question: 'Speak the word that was never born and will never die?',
        answer: 'echo',
        hints: [
          'It\'s created by sound',
          'You hear it but can\'t touch it',
          'It repeats what you say'
        ]
      }
    };
  }

  /**
   * Present puzzle and track hints given
   */
  getPuzzle(puzzleName) {
    const puzzle = this.puzzles[puzzleName.toLowerCase()];
    
    if (!puzzle) {
      return { success: false, message: 'Puzzle not found' };
    }

    return {
      success: true,
      question: puzzle.question,
      hints: puzzle.hints,
      hintsGiven: 0
    };
  }

  /**
   * Give hint
   */
  giveHint(puzzleName, hintLevel) {
    const puzzle = this.puzzles[puzzleName.toLowerCase()];
    
    if (!puzzle) {
      return { success: false, message: 'Puzzle not found' };
    }

    if (hintLevel < 1 || hintLevel > puzzle.hints.length) {
      return { success: false, message: 'Invalid hint level' };
    }

    return {
      success: true,
      hint: puzzle.hints[hintLevel - 1],
      hintNumber: hintLevel,
      totalHints: puzzle.hints.length
    };
  }

  /**
   * Check solution
   */
  checkSolution(puzzleName, playerAnswer) {
    const puzzle = this.puzzles[puzzleName.toLowerCase()];
    
    if (!puzzle) {
      return { success: false, message: 'Puzzle not found' };
    }

    const correct = playerAnswer.toLowerCase() === puzzle.answer.toLowerCase();
    
    return {
      correct,
      message: correct ? `CORRECT! ${playerAnswer} is the answer!` : `Wrong answer. Try again.`,
      answer: correct ? puzzle.answer : undefined
    };
  }

  /**
   * List available puzzles
   */
  listPuzzles() {
    console.log('\n🧩 Available Puzzles:\n');
    
    for (const [name, puzzle] of Object.entries(this.puzzles)) {
      console.log(`${name.toUpperCase()}`);
      console.log(`  ${puzzle.question}\n`);
    }
  }
}

export { TrapMechanics, PuzzleEngine };
