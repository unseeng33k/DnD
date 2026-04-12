#!/usr/bin/env node

/**
 * DM Soundtrack System
 * Suggests music for every moment of the game
 */

const MUSIC_LIBRARY = {
  exploration: {
    jungle: {
      name: 'Jungle/Forest Exploration',
      spotify: [
        { name: 'Tomb Raider (1996)', artist: 'Nathan McCree', tracks: ['Main Theme', 'The Caves', 'Tomb of Qualopec'] },
        { name: 'Far Cry Primal', artist: 'Various', tracks: ['The Shaman', 'Savage', 'The Charge'] },
        { name: 'Apocalypto', artist: 'James Horner', tracks: ['The Journey', 'The Hidden Valley'] }
      ],
      youtube: [
        { name: 'Jungle Ambience', url: 'https://www.youtube.com/results?search_query=jungle+ambience+distant+drums' },
        { name: 'Amazon Rainforest', url: 'https://www.youtube.com/results?search_query=amazon+rainforest+sounds+10+hours' },
        { name: 'Mesoamerican Flute', url: 'https://www.youtube.com/results?search_query=mesoamerican+flute+music' }
      ],
      mood: 'Humid, mysterious, ancient, overgrown'
    },
    dungeon: {
      name: 'Dungeon/Underground',
      spotify: [
        { name: 'Diablo (1996)', artist: 'Matt Uelmen', tracks: ['Tristram', 'Catacombs', 'Caves'] },
        { name: 'Darkest Dungeon', artist: 'Stuart Chatwood', tracks: ['The Hamlet', 'The Cove', 'Exploration'] },
        { name: 'Diablo II', artist: 'Matt Uelmen', tracks: ['Rogue Encampment', 'Underground', 'Tombs'] }
      ],
      youtube: [
        { name: 'Dungeon Ambience', url: 'https://www.youtube.com/results?search_query=medieval+dungeon+ambience' },
        { name: 'Cave Sounds', url: 'https://www.youtube.com/results?search_query=cave+ambience+water+dripping' },
        { name: 'Torchlit Corridor', url: 'https://www.youtube.com/results?search_query=torchlit+dungeon+ambience' }
      ],
      mood: 'Claustrophobic, ancient, echoing, dangerous'
    },
    temple: {
      name: 'Temple/Sacred Space',
      spotify: [
        { name: 'Assassin\'s Creed Origins', artist: 'Sarah Schachner', tracks: ['Bayek of Siwa', 'The Temple', 'Ancient Stones'] },
        { name: 'God of War (2018)', artist: 'Bear McCreary', tracks: ['The Mountain', 'Temple of Light'] },
        { name: 'Prince of Persia', artist: 'Stuart Chatwood', tracks: ['Welcome to Persia', 'The Temple'] }
      ],
      youtube: [
        { name: 'Ancient Temple', url: 'https://www.youtube.com/results?search_query=ancient+temple+ambience' },
        { name: 'Gregorian Chants', url: 'https://www.youtube.com/results?search_query=gregorian+chants+with+rain' },
        { name: 'Sacred Space', url: 'https://www.youtube.com/results?search_query=sacred+temple+music' }
      ],
      mood: 'Sacred, ominous, ancient, charged with presence'
    },
    swamp: {
      name: 'Swamp/Marsh',
      spotify: [
        { name: 'The Witcher 3', artist: 'Marcin Przybyłowicz', tracks: ['Cloak and Dagger', 'Silver for Monsters'] },
        { name: 'Skyrim', artist: 'Jeremy Soule', tracks: ['Morthal', 'Frostfall', 'The Jerall Mountains'] },
        { name: 'Dragon Age: Origins', artist: 'Inon Zur', tracks: ['Leliana\'s Song', 'The Deep Roads'] }
      ],
      youtube: [
        { name: 'Swamp Ambience', url: 'https://www.youtube.com/results?search_query=swamp+ambience+frogs+insects' },
        { name: 'Dark Swamp', url: 'https://www.youtube.com/results?search_query=dark+atmospheric+swamp+music' },
        { name: 'Bayou Sounds', url: 'https://www.youtube.com/results?search_query=bayou+ambience+night' }
      ],
      mood: 'Decaying, treacherous, suffocating, hiding things'
    },
    city: {
      name: 'City/Tavern',
      spotify: [
        { name: 'The Witcher 3', artist: 'Various', tracks: ['The Wolven Storm', 'Drink Up, There\'s More!'] },
        { name: 'Medieval Tavern Music', artist: 'Various', tracks: ['Tavern Brawl', 'The Minstrel'] },
        { name: 'Skyrim', artist: 'Jeremy Soule', tracks: ['The Bannered Mare', 'Tavern'] }
      ],
      youtube: [
        { name: 'Tavern Ambience', url: 'https://www.youtube.com/results?search_query=medieval+tavern+ambience+lute' },
        { name: 'Medieval Inn', url: 'https://www.youtube.com/results?search_query=medieval+inn+music' },
        { name: 'Fantasy City', url: 'https://www.youtube.com/results?search_query=fantasy+city+ambience' }
      ],
      mood: 'Bustling, warm, safe, social'
    }
  },
  
  combat: {
    standard: {
      name: 'Standard Combat',
      spotify: [
        { name: 'DOOM (2016)', artist: 'Mick Gordon', tracks: ['Rip & Tear', 'BFG Division', 'At Doom\'s Gate'] },
        { name: 'God of War', artist: 'Bear McCreary', tracks: ['God of War', 'The Dragon', 'Magni and Modi'] },
        { name: 'The Witcher 3', artist: 'Marcin Przybyłowicz', tracks: ['Silver for Monsters', 'Sword of Destiny'] }
      ],
      youtube: [
        { name: 'Epic Combat', url: 'https://www.youtube.com/results?search_query=epic+medieval+combat+music' },
        { name: 'Intense Battle', url: 'https://www.youtube.com/results?search_query=intense+fantasy+battle+music' },
        { name: 'Combat Music', url: 'https://www.youtube.com/results?search_query=dnd+combat+music' }
      ],
      mood: 'Intense, driving, adrenaline-pumping'
    },
    boss: {
      name: 'Boss Battle',
      spotify: [
        { name: 'Dark Souls', artist: 'Motoi Sakuraba', tracks: ['Ornstein & Smough', 'Gwyn, Lord of Cinder'] },
        { name: 'Bloodborne', artist: 'Various', tracks: ['The Cleric Beast', 'Father Gascoigne', 'Ludwig the Holy Blade'] },
        { name: 'Final Fantasy XIV', artist: 'Nobuo Uematsu', tracks: ['Ultima', 'Oblivion', 'The Worm\s Head'] }
      ],
      youtube: [
        { name: 'Boss Battle', url: 'https://www.youtube.com/results?search_query=epic+boss+battle+music' },
        { name: 'Final Boss', url: 'https://www.youtube.com/results?search_query=final+boss+music+epic' },
        { name: 'Epic Orchestral', url: 'https://www.youtube.com/results?search_query=epic+orchestral+boss+music' }
      ],
      mood: 'Epic, desperate, climactic, legendary'
    },
    ambush: {
      name: 'Ambush/Surprise',
      spotify: [
        { name: 'Darkest Dungeon', artist: 'Stuart Chatwood', tracks: ['The Cove Battle', 'Combat in the Warrens'] }
      ],
      youtube: [
        { name: 'Surprise Attack', url: 'https://www.youtube.com/results?search_query=surprise+attack+music+sting' },
        { name: 'Ambush', url: 'https://www.youtube.com/results?search_query=ambush+combat+music' }
      ],
      mood: 'Sudden, shocking, immediate danger'
    }
  },
  
  horror: {
      name: 'Horror/Dread',
      spotify: [
        { name: 'Silent Hill 2', artist: 'Akira Yamaoka', tracks: ['Theme of Laura', 'Null Moon', 'The Darkness That Lurks'] },
        { name: 'Amnesia: The Dark Descent', artist: 'Mikko Tarmia', tracks: ['Ambience', 'The Dungeon'] },
        { name: 'Darkest Dungeon', artist: 'Stuart Chatwood', tracks: ['The Cove', 'The Warrens'] }
      ],
      youtube: [
        { name: 'Horror Ambience', url: 'https://www.youtube.com/results?search_query=horror+ambience+subtle+strings' },
        { name: 'Dread', url: 'https://www.youtube.com/results?search_query=dread+atmosphere+music' },
        { name: 'Tension', url: 'https://www.youtube.com/results?search_query=tension+building+horror+music' }
      ],
      mood: 'Oppressive, anxious, something is wrong'
    },
    chase: {
      name: 'Chase/Escape',
      spotify: [
        { name: 'Dark Souls', artist: 'Motoi Sakuraba', tracks: ['Ornstein & Smough'] },
        { name: 'Bloodborne', artist: 'Various', tracks: ['The Hunter'] }
      ],
      youtube: [
        { name: 'Chase Music', url: 'https://www.youtube.com/results?search_query=intense+chase+music' },
        { name: 'Escape', url: 'https://www.youtube.com/results?search_query=escape+running+music' }
      ],
      mood: 'Urgent, panic, run or die'
    }
  },
  
  victory: {
    triumph: {
      name: 'Victory/Celebration',
      spotify: [
        { name: 'Final Fantasy series', artist: 'Nobuo Uematsu', tracks: ['Victory Fanfare', 'Prelude'] },
        { name: 'The Legend of Zelda', artist: 'Koji Kondo', tracks: ['Item Get', 'Heart Container', 'Treasure Chest'] }
      ],
      youtube: [
        { name: 'Victory Fanfare', url: 'https://www.youtube.com/results?search_query=triumphant+medieval+fanfare' },
        { name: 'Win Music', url: 'https://www.youtube.com/results?search_query=victory+music+fanfare' }
      ],
      mood: 'Triumphant, celebratory, earned'
    },
    levelup: {
      name: 'Level Up',
      spotify: [
        { name: 'Final Fantasy VII', artist: 'Nobuo Uematsu', tracks: ['Fanfare'] }
      ],
      youtube: [
        { name: 'Level Up', url: 'https://www.youtube.com/results?search_query=dnd+level+up+sound+effect' }
      ],
      mood: 'Achievement, growth, power'
    }
  },
  
  rest: {
    camp: {
      name: 'Rest/Camp',
      spotify: [
        { name: 'Skyrim', artist: 'Jeremy Soule', tracks: ['Secunda', 'Far Horizons', 'The Bannered Mare'] },
        { name: 'The Witcher 3', artist: 'Marcin Przybyłowicz', tracks: ['Kaer Morhen', 'The Fields of Ard Skellig'] },
        { name: 'Oblivion', artist: 'Jeremy Soule', tracks: ['Peace of Akatosh', 'Sunrise of Flutes'] }
      ],
      youtube: [
        { name: 'Campfire', url: 'https://www.youtube.com/results?search_query=campfire+ambience+soft+music' },
        { name: 'Medieval Lute', url: 'https://www.youtube.com/results?search_query=medieval+lute+relaxing' },
        { name: 'Fantasy Camp', url: 'https://www.youtube.com/results?search_query=fantasy+campfire+music' }
      ],
      mood: 'Peaceful, safe, reflective, temporary'
    }
  },
  
  modules: {
    tombOfHorrors: {
      name: 'Tomb of Horrors',
      spotify: [
        { name: 'Silent Hill 2', artist: 'Akira Yamaoka', tracks: ['Theme of Laura', 'Null Moon'] },
        { name: 'Dark Souls', artist: 'Motoi Sakuraba', tracks: ['Great Grey Wolf Sif', 'Gwyn, Lord of Cinder'] }
      ],
      mood: 'Oppressive dread, certain death, hopelessness'
    },
    ravenloft: {
      name: 'Ravenloft',
      spotify: [
        { name: 'Castlevania: Symphony of the Night', artist: 'Michiru Yamane', tracks: ['Dracula\'s Castle', 'Dance of Illusions'] },
        { name: 'Bloodborne', artist: 'Various', tracks: ['The Night of the Hunt', 'The Hunter'] }
      ],
      mood: 'Gothic horror, vampires, cursed realm'
    },
    againstTheGiants: {
      name: 'Against the Giants',
      spotify: [
        { name: 'God of War', artist: 'Bear McCreary', tracks: ['God of War', 'The Dragon'] },
        { name: 'Skyrim', artist: 'Jeremy Soule', tracks: ['Dragonborn', 'One They Fear'] }
      ],
      mood: 'Epic scale, giant battles, heroic'
    },
    tamoachan: {
      name: 'Tamoachan (Jungle Temple)',
      spotify: [
        { name: 'Tomb Raider (1996)', artist: 'Nathan McCree', tracks: ['Main Theme', 'The Caves', 'Tomb of Qualopec'] },
        { name: 'Apocalypto', artist: 'James Horner', tracks: ['The Journey', 'The Hidden Valley'] }
      ],
      youtube: [
        { name: 'Mesoamerican', url: 'https://www.youtube.com/results?search_query=mesoamerican+flute+music' }
      ],
      mood: 'Ancient mystery, jungle exploration, Mayan aesthetic'
    }
  }
};

// CLI
const args = process.argv.slice(2);
const category = args[0];
const subcategory = args[1];

if (!category) {
  console.log(`
🎵 DM SOUNDTRACK SYSTEM

Usage:
  node music.js <category> [subcategory]

Categories:
  exploration   - Jungle, dungeon, temple, swamp, city
  combat        - Standard, boss, ambush
  horror        - Dread, chase
  victory       - Triumph, levelup
  rest          - Camp, peaceful
  modules       - Specific module soundtracks

Examples:
  node music.js exploration jungle
  node music.js combat boss
  node music.js modules tamoachan
  node music.js rest camp
`);
  process.exit(0);
}

const categoryData = MUSIC_LIBRARY[category];

if (!categoryData) {
  console.log(`Unknown category: ${category}`);
  console.log('Available:', Object.keys(MUSIC_LIBRARY).join(', '));
  process.exit(1);
}

// Handle subcategory or show all
if (subcategory && categoryData[subcategory]) {
  const data = categoryData[subcategory];
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎵 ${data.name.toUpperCase()}`);
  console.log('='.repeat(60));
  console.log(`\n🎭 Mood: ${data.mood}`);
  
  if (data.spotify) {
    console.log('\n📀 SPOTIFY:');
    data.spotify.forEach(s => {
      console.log(`   • "${s.name}" by ${s.artist}`);
      if (s.tracks) console.log(`     Key tracks: ${s.tracks.join(', ')}`);
    });
  }
  
  if (data.youtube) {
    console.log('\n📺 YOUTUBE:');
    data.youtube.forEach(y => {
      console.log(`   • ${y.name}`);
      console.log(`     ${y.url}`);
    });
  }
  
} else {
  // Show available subcategories
  console.log(`\n🎵 ${category.toUpperCase()} OPTIONS:\n`);
  Object.entries(categoryData).forEach(([key, data]) => {
    console.log(`  ${key.padEnd(15)} - ${data.name}`);
    console.log(`                    Mood: ${data.mood}`);
  });
}
