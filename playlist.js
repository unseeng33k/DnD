#!/usr/bin/env node

/**
 * Session Playlist Generator
 * Creates clickable music links for mobile/phone use
 */

const fs = require('fs');
const path = require('path');

// Module-specific playlists
const MODULE_PLAYLISTS = {
  'tamoachan': {
    name: 'Hidden Shrine of Tamoachan',
    description: 'Jungle temple, ancient mystery, Mesoamerican vibes',
    exploration: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo', // Tomb Raider vibes
      youtube: 'https://www.youtube.com/watch?v=8Z3Q3Jd3d3w', // Jungle ambience
      tracks: ['Tomb Raider (1996) - Nathan McCree', 'Apocalypto OST - James Horner']
    },
    combat: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=HEf_xrg1q3E', // Epic jungle combat
      tracks: ['God of War - Bear McCreary', 'The Witcher 3 - Silver for Monsters']
    },
    horror: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=1R6lD0xR3Gw', // Temple dread
      tracks: ['Silent Hill 2 - Akira Yamaoka', 'Darkest Dungeon - Stuart Chatwood']
    }
  },
  'tomb-of-horrors': {
    name: 'Tomb of Horrors',
    description: 'Certain death, oppressive dread, Acererak',
    exploration: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=1R6lD0xR3Gw', // Dark ambient
      tracks: ['Silent Hill 2', 'Dark Souls - Motoi Sakuraba']
    },
    combat: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=HEf_xrg1q3E',
      tracks: ['DOOM 2016 - Mick Gordon', 'Bloodborne']
    },
    horror: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=1R6lD0xR3Gw',
      tracks: ['Silent Hill 2 - Theme of Laura', 'Amnesia: The Dark Descent']
    }
  },
  'ravenloft': {
    name: 'Ravenloft',
    description: 'Gothic horror, vampires, Barovia',
    exploration: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=1R6lD0xR3Gw',
      tracks: ['Castlevania: Symphony of the Night', 'Bloodborne']
    },
    combat: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=HEf_xrg1q3E',
      tracks: ['Castlevania - Dance of Illusions', 'God of War']
    },
    horror: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=1R6lD0xR3Gw',
      tracks: ['Bloodborne - The Night of the Hunt', 'Silent Hill']
    }
  },
  'saltmarsh': {
    name: 'Sinister Secret of Saltmarsh',
    description: 'Coastal village, smugglers, haunted house',
    exploration: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=8Z3Q3Jd3d3w', // Coastal ambience
      tracks: ['The Witcher 3 - Skellige', 'Sea shanties']
    },
    combat: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=HEf_xrg1q3E',
      tracks: ['Pirate battle music', 'Assassin\'s Creed Black Flag']
    },
    horror: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      youtube: 'https://www.youtube.com/watch?v=1R6lD0xR3Gw',
      tracks: ['Darkest Dungeon - The Cove', 'Haunted house ambience']
    }
  }
};

// Generic playlists by mood
const MOOD_PLAYLISTS = {
  'exploration': {
    name: 'General Exploration',
    spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
    youtube: 'https://www.youtube.com/watch?v=8Z3Q3Jd3d3w',
    description: 'Atmospheric, mysterious, wandering'
  },
  'combat': {
    name: 'Combat',
    spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
    youtube: 'https://www.youtube.com/watch?v=HEf_xrg1q3E',
    description: 'Intense, driving, action'
  },
  'boss': {
    name: 'Boss Battle',
    spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
    youtube: 'https://www.youtube.com/watch?v=HEf_xrg1q3E',
    description: 'Epic, desperate, climactic'
  },
  'horror': {
    name: 'Horror/Dread',
    spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
    youtube: 'https://www.youtube.com/watch?v=1R6lD0xR3Gw',
    description: 'Oppressive, anxious, something is wrong'
  },
  'rest': {
    name: 'Rest/Camp',
    spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
    youtube: 'https://www.youtube.com/watch?v=8Z3Q3Jd3d3w',
    description: 'Peaceful, safe, temporary'
  },
  'victory': {
    name: 'Victory',
    spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
    youtube: 'https://www.youtube.com/watch?v=HEf_xrg1q3E',
    description: 'Triumphant, celebratory'
  }
};

function generateSessionPlaylist(moduleName) {
  const module = MODULE_PLAYLISTS[moduleName.toLowerCase()];
  
  if (!module) {
    console.log(`Module not found: ${moduleName}`);
    console.log('Available:', Object.keys(MODULE_PLAYLISTS).join(', '));
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎵 ${module.name.toUpperCase()}`);
  console.log(module.description);
  console.log('='.repeat(60));
  
  console.log('\n📱 TAP TO PLAY:');
  
  console.log('\n🌲 EXPLORATION:');
  console.log(`   Spotify: ${module.exploration.spotify}`);
  console.log(`   YouTube: ${module.exploration.youtube}`);
  console.log(`   Key tracks: ${module.exploration.tracks.join(', ')}`);
  
  console.log('\n⚔️  COMBAT:');
  console.log(`   Spotify: ${module.combat.spotify}`);
  console.log(`   YouTube: ${module.combat.youtube}`);
  console.log(`   Key tracks: ${module.combat.tracks.join(', ')}`);
  
  console.log('\n👻 HORROR/TENSION:');
  console.log(`   Spotify: ${module.horror.spotify}`);
  console.log(`   YouTube: ${module.horror.youtube}`);
  console.log(`   Key tracks: ${module.horror.tracks.join(', ')}`);
  
  console.log('\n💡 DM TIPS:');
  console.log('   • Open Spotify links before session starts');
  console.log('   • Download for offline (no ads interrupting)');
  console.log('   • Use crossfade for smooth transitions');
  console.log('   • Keep YouTube links ready for ambience loops');
}

function generateQuickPlaylist(mood) {
  const playlist = MOOD_PLAYLISTS[mood.toLowerCase()];
  
  if (!playlist) {
    console.log(`Mood not found: ${mood}`);
    console.log('Available:', Object.keys(MOOD_PLAYLISTS).join(', '));
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎵 ${playlist.name.toUpperCase()}`);
  console.log(playlist.description);
  console.log('='.repeat(60));
  
  console.log('\n📱 TAP TO PLAY:');
  console.log(`   Spotify: ${playlist.spotify}`);
  console.log(`   YouTube: ${playlist.youtube}`);
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

if (command === 'module') {
  generateSessionPlaylist(args[1] || 'tamoachan');
} else if (command === 'mood') {
  generateQuickPlaylist(args[1] || 'exploration');
} else {
  console.log(`
🎵 SESSION PLAYLIST GENERATOR

Usage:
  node playlist.js module <module-name>    Full session playlist
  node playlist.js mood <mood>             Quick mood playlist

Modules:
  ${Object.keys(MODULE_PLAYLISTS).join(', ')}

Moods:
  ${Object.keys(MOOD_PLAYLISTS).join(', ')}

Examples:
  node playlist.js module tamoachan
  node playlist.js mood combat
  node playlist.js mood horror
`);
}
