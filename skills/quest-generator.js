#!/usr/bin/env node

/**
 * Quest Generator
 */

class QuestGenerator {
  constructor() {
    this.hooks = [
      'A desperate villager begs for help',
      'A mysterious note arrives',
      'A reward poster catches your eye',
      'An old friend needs assistance',
      'You witness a crime',
      'A strange dream points the way',
      'A merchant offers payment',
      'A prophecy must be fulfilled',
      'Someone is wrongly accused',
      'A valuable item was stolen'
    ];
    
    this.objectives = [
      'Retrieve the stolen artifact',
      'Rescue the kidnapped victim',
      'Slay the dangerous monster',
      'Deliver the important message',
      'Investigate the strange occurrences',
      'Escort the vulnerable person',
      'Find the lost treasure',
      'Clear the infested location',
      'Negotiate the peace treaty',
      'Discover the ancient secret'
    ];
    
    this.complications = [
      'The quest-giver lied about the danger',
      'A rival group seeks the same goal',
      'The target is not what it seems',
      'Time is running out',
      'Someone close is involved',
      'The reward was stolen',
      'A curse affects the quest',
      'The location is trapped',
      'An old enemy appears',
      'The true villain is revealed'
    ];
    
    this.rewards = {
      gold: ['50 gp', '100 gp', '250 gp', '500 gp', '1000 gp'],
      items: ['Potion of healing', '+1 weapon', 'Magic armor', 'Scroll of protection', 'Bag of holding'],
      favors: ['Noble title', 'Land grant', 'Pardon', 'Alliance', 'Information']
    };
  }

  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  generate(level = 1) {
    const quest = {
      hook: this.random(this.hooks),
      objective: this.random(this.objectives),
      complication: this.random(this.complications),
      reward: {
        gold: this.random(this.rewards.gold),
        item: Math.random() > 0.5 ? this.random(this.rewards.items) : null,
        favor: Math.random() > 0.7 ? this.random(this.rewards.favors) : null
      },
      difficulty: this.calculateDifficulty(level),
      xp: level * 100 + Math.floor(Math.random() * 200)
    };

    return quest;
  }

  calculateDifficulty(level) {
    const roll = Math.random();
    if (roll < 0.3) return 'Easy';
    if (roll < 0.7) return 'Moderate';
    if (roll < 0.9) return 'Hard';
    return 'Deadly';
  }

  formatQuest(quest) {
    let output = '\n📜 QUEST\n\n';
    output += `Hook: ${quest.hook}\n`;
    output += `Objective: ${quest.objective}\n`;
    output += `Complication: ${quest.complication}\n`;
    output += `Difficulty: ${quest.difficulty}\n\n`;
    output += 'Rewards:\n';
    output += `  💰 ${quest.reward.gold}\n`;
    if (quest.reward.item) output += `  🎁 ${quest.reward.item}\n`;
    if (quest.reward.favor) output += `  🤝 ${quest.reward.favor}\n`;
    output += `  ⭐ ${quest.xp} XP\n`;
    return output;
  }

  generateMultiple(count = 3, level = 1) {
    return Array.from({ length: count }, () => this.generate(level));
  }
}

module.exports = QuestGenerator;
