#!/usr/bin/env node

/**
 * Name Generators
 */

class NameGenerator {
  constructor() {
    this.human = {
      male: ['Aldric', 'Benedict', 'Cedric', 'Dorian', 'Edmund', 'Frederick', 'Gareth', 'Harold', 'Ivan', 'Julian', 'Klaus', 'Leopold', 'Marcus', 'Nathaniel', 'Oswald', 'Percival', 'Quentin', 'Reginald', 'Sebastian', 'Theodore', 'Ulric', 'Victor', 'William', 'Xavier', 'Yorick', 'Zacharias'],
      female: ['Adelaide', 'Beatrice', 'Celeste', 'Diana', 'Eleanor', 'Felicity', 'Gwendolyn', 'Helena', 'Isabella', 'Josephine', 'Katarina', 'Lillian', 'Margaret', 'Natalie', 'Ophelia', 'Priscilla', 'Rosalind', 'Seraphina', 'Theodora', 'Ursula', 'Victoria', 'Wilhelmina', 'Xena', 'Yvette', 'Zara'],
      surnames: ['Ashworth', 'Blackwood', 'Cromwell', 'Davenport', 'Ellington', 'Fairfax', 'Goldman', 'Harrington', 'Ironside', 'Kingsley', 'Lockwood', 'Montague', 'Northwood', 'Pemberton', 'Quincy', 'Radcliffe', 'Sinclair', 'Thornwood', 'Underwood', 'Vance', 'Westbrook', 'Yardley', 'Zimmerman']
    };
    
    this.elf = {
      male: ['Aelrond', 'Belthas', 'Caelum', 'Daelin', 'Erevan', 'Faelar', 'Gaelin', 'Haelen', 'Ilyrion', 'Jorah', 'Kaelen', 'Laeroth', 'Maeris', 'Naeris', 'Orophin', 'Paelias', 'Quelenna', 'Raeris', 'Saelis', 'Taeris', 'Uaelis', 'Vaeris', 'Waeris', 'Xaelis', 'Yaelis', 'Zaelis'],
      female: ['Aelindra', 'Belindra', 'Caelindra', 'Daelindra', 'Elandra', 'Faelindra', 'Gaelindra', 'Haelindra', 'Ilyndra', 'Jaelindra', 'Kaelindra', 'Laelindra', 'Maelindra', 'Naelindra', 'Ophindra', 'Paelindra', 'Quelindra', 'Raelindra', 'Saelindra', 'Taelindra', 'Uaelindra', 'Vaelindra', 'Waelindra', 'Xaelindra', 'Yaelindra', 'Zaelindra'],
      surnames: ['Moonwhisper', 'Starweaver', 'Dawnstrider', 'Nightbreeze', 'Silverleaf', 'Goldensong', 'Swiftwind', 'Shadowalker', 'Brightstar', 'Dreamweaver']
    };
    
    this.dwarf = {
      male: ['Borin', 'Dain', 'Farin', 'Gimli', 'Harin', 'Kazin', 'Morin', 'Norin', 'Orin', 'Thorin', 'Balin', 'Dwalin', 'Oin', 'Gloin', 'Bifur', 'Bofur', 'Bombur', 'Fili', 'Kili', 'Ori'],
      female: ['Bryna', 'Dagna', 'Farya', 'Greta', 'Hulda', 'Kara', 'Moria', 'Nora', 'Orla', 'Thora', 'Astrid', 'Dagmar', 'Freya', 'Gerda', 'Helga', 'Ingrid', 'Sigrid', 'Ulla', 'Yrsa'],
      surnames: ['Ironforge', 'Goldhammer', 'Steelbeard', 'Mountainheart', 'Deepdelver', 'Stonefist', 'Battleaxe', 'Runecaster', 'Flamekeeper', 'Anvilbreaker']
    };
    
    this.tavern = {
      first: ['The Prancing', 'The Drunken', 'The Golden', 'The Silver', 'The Rusty', 'The Leaping', 'The Sleeping', 'The Wandering', 'The Hidden', 'The Crooked', 'The Laughing', 'The Crying', 'The Howling', 'The Roaring', 'The Whispering'],
      second: ['Pony', 'Dragon', 'Goblin', 'Knight', 'Mug', 'Sword', 'Stag', 'Wolf', 'Bear', 'Eagle', 'Ogre', 'Giant', 'Dwarf', 'Elf', 'Wizard', 'Thief', 'Hero', 'Villain', 'King', 'Queen']
    };
    
    this.dungeon = {
      prefix: ['The', 'Dark', 'Forbidden', 'Lost', 'Hidden', 'Cursed', 'Ancient', 'Haunted', 'Sunken', 'Burning', 'Frozen', 'Shattered', 'Twisted', 'Forgotten', 'Nameless'],
      type: ['Crypt', 'Dungeon', 'Catacombs', 'Maze', 'Labyrinth', 'Caverns', 'Mines', 'Tombs', 'Temple', 'Shrine', 'Fortress', 'Castle', 'Tower', 'Keep', 'Vault'],
      suffix: ['of Doom', 'of Despair', 'of the Dead', 'of Shadows', 'of Nightmares', 'of Terror', 'of Madness', 'of Sorrows', 'of Secrets', 'of the Ancients']
    };
    
    this.items = {
      prefix: ['Glowing', 'Cursed', 'Blessed', 'Ancient', 'Shattered', 'Enchanted', 'Corrupted', 'Holy', 'Unholy', 'Mysterious', 'Legendary', 'Forgotten', 'Burning', 'Frozen', 'Thundering'],
      type: ['Sword', 'Shield', 'Amulet', 'Ring', 'Staff', 'Crown', 'Armor', 'Helm', 'Boots', 'Cloak', 'Dagger', 'Bow', 'Hammer', 'Orb', 'Tome'],
      suffix: ['of Power', 'of the Gods', 'of Shadows', 'of Light', 'of the Elements', 'of the Dragon', 'of the Phoenix', 'of the Wolf', 'of the Bear', 'of the Eagle']
    };
  }

  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  humanName(gender = 'male') {
    const first = this.random(this.human[gender]);
    const last = this.random(this.human.surnames);
    return `${first} ${last}`;
  }

  elfName(gender = 'male') {
    const first = this.random(this.elf[gender]);
    const last = this.random(this.elf.surnames);
    return `${first} ${last}`;
  }

  dwarfName(gender = 'male') {
    const first = this.random(this.dwarf[gender]);
    const last = this.random(this.dwarf.surnames);
    return `${first} ${last}`;
  }

  tavernName() {
    return `${this.random(this.tavern.first)} ${this.random(this.tavern.second)}`;
  }

  dungeonName() {
    const roll = Math.random();
    if (roll < 0.3) {
      return `${this.random(this.dungeon.prefix)} ${this.random(this.dungeon.type)}`;
    } else if (roll < 0.7) {
      return `${this.random(this.dungeon.type)} ${this.random(this.dungeon.suffix)}`;
    } else {
      return `${this.random(this.dungeon.prefix)} ${this.random(this.dungeon.type)} ${this.random(this.dungeon.suffix)}`;
    }
  }

  itemName() {
    const roll = Math.random();
    if (roll < 0.3) {
      return `${this.random(this.items.prefix)} ${this.random(this.items.type)}`;
    } else if (roll < 0.7) {
      return `${this.random(this.items.type)} ${this.random(this.items.suffix)}`;
    } else {
      return `${this.random(this.items.prefix)} ${this.random(this.items.type)} ${this.random(this.items.suffix)}`;
    }
  }

  generateMultiple(type, count = 5) {
    const results = [];
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'human': results.push(this.humanName()); break;
        case 'elf': results.push(this.elfName()); break;
        case 'dwarf': results.push(this.dwarfName()); break;
        case 'tavern': results.push(this.tavernName()); break;
        case 'dungeon': results.push(this.dungeonName()); break;
        case 'item': results.push(this.itemName()); break;
        default: results.push('Unknown type');
      }
    }
    return results;
  }
}

module.exports = NameGenerator;
