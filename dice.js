#!/usr/bin/env node

/**
 * D&D Dice Roller
 * Usage: node dice.js [roll] [options]
 * 
 * Examples:
 *   node dice.js d20
 *   node dice.js 2d6+3
 *   node dice.js 4d6          # 4d6 drop lowest (character stats)
 *   node dice.js 3d6 --sum    # Sum of 3 rolls
 *   node dice.js d20 --adv    # Roll with advantage
 *   node dice.js d20 --dis    # Roll with disadvantage
 */

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function parseRoll(rollStr) {
  // Match patterns like "2d6", "d20", "2d6+3", "2d6-1"
  const match = rollStr.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!match) return null;
  
  const numDice = match[1] ? parseInt(match[1]) : 1;
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;
  
  return { numDice, sides, modifier };
}

function roll(rollStr, options = {}) {
  const parsed = parseRoll(rollStr);
  if (!parsed) {
    console.error(`Invalid roll format: ${rollStr}`);
    console.error('Use format like: d20, 2d6, 3d8+2, 4d6');
    process.exit(1);
  }
  
  const { numDice, sides, modifier } = parsed;
  const results = [];
  
  for (let i = 0; i < numDice; i++) {
    results.push(rollDie(sides));
  }
  
  // Handle advantage/disadvantage for d20
  if (sides === 20 && (options.advantage || options.disadvantage)) {
    const roll2 = rollDie(20);
    const kept = options.advantage ? Math.max(results[0], roll2) : Math.min(results[0], roll2);
    const dropped = options.advantage ? Math.min(results[0], roll2) : Math.max(results[0], roll2);
    const total = kept + modifier;
    
    return {
      rolls: [results[0], roll2],
      kept,
      dropped,
      modifier,
      total,
      type: options.advantage ? 'advantage' : 'disadvantage'
    };
  }
  
  // Handle 4d6 drop lowest (character generation)
  if (numDice === 4 && sides === 6 && options.dropLowest !== false) {
    const sorted = [...results].sort((a, b) => b - a);
    const dropped = sorted.pop();
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      rolls: results,
      kept: sorted,
      dropped,
      total: sum,
      type: '4d6 drop lowest'
    };
  }
  
  const sum = results.reduce((a, b) => a + b, 0);
  const total = sum + modifier;
  
  return {
    rolls: results,
    modifier,
    total,
    type: 'normal'
  };
}

function formatResult(result, rollStr) {
  const modStr = result.modifier ? (result.modifier > 0 ? `+${result.modifier}` : `${result.modifier}`) : '';
  
  if (result.type === 'advantage' || result.type === 'disadvantage') {
    const [r1, r2] = result.rolls;
    const indicator = result.type === 'advantage' ? 'ADV' : 'DIS';
    return `🎲 ${rollStr} [${indicator}]: [${r1}, ${r2}] → **${result.kept}**${modStr} = **${result.total}**`;
  }
  
  if (result.type === '4d6 drop lowest') {
    return `🎲 ${rollStr}: [${result.rolls.join(', ')}] → drop ${result.dropped} → **${result.total}**`;
  }
  
  if (result.rolls.length === 1) {
    return `🎲 ${rollStr}: **${result.total}**`;
  }
  
  const rollStr_formatted = result.rolls.join(' + ');
  if (result.modifier) {
    return `🎲 ${rollStr}: [${rollStr_formatted}]${modStr} = **${result.total}**`;
  }
  return `🎲 ${rollStr}: [${rollStr_formatted}] = **${result.total}**`;
}

// Main
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
D&D Dice Roller

Usage: node dice.js <roll> [options]

Roll formats:
  d20         Roll 1d20
  2d6         Roll 2d6
  3d8+2       Roll 3d8, add 2
  4d6         Roll 4d6, drop lowest (character stats)

Options:
  --adv, --advantage     Roll d20 with advantage
  --dis, --disadvantage  Roll d20 with disadvantage
  --sum                  Show sum for multiple dice
  --help                 Show this help

Examples:
  node dice.js d20
  node dice.js 2d6+3
  node dice.js d20 --adv
  node dice.js 4d6       # Character stat roll
`);
  process.exit(0);
}

const rollArg = args.find(a => !a.startsWith('--'));
if (!rollArg) {
  console.error('No roll specified. Use --help for usage.');
  process.exit(1);
}

const options = {
  advantage: args.includes('--adv') || args.includes('--advantage'),
  disadvantage: args.includes('--dis') || args.includes('--disadvantage'),
  dropLowest: true  // default for 4d6
};

const result = roll(rollArg, options);
console.log(formatResult(result, rollArg));
