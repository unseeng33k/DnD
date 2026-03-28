#!/usr/bin/env node

/**
 * Weather System
 */

class WeatherSystem {
  constructor() {
    this.regions = {
      temperate: {
        spring: ['Clear', 'Cloudy', 'Light rain', 'Heavy rain', 'Thunderstorm', 'Fog'],
        summer: ['Clear', 'Sunny', 'Hot', 'Very hot', 'Light rain', 'Thunderstorm'],
        autumn: ['Clear', 'Cloudy', 'Fog', 'Light rain', 'Heavy rain', 'Windy'],
        winter: ['Clear', 'Cloudy', 'Snow', 'Heavy snow', 'Blizzard', 'Freezing fog']
      },
      tropical: {
        dry: ['Clear', 'Sunny', 'Hot', 'Very hot', 'Humid', 'Partly cloudy'],
        wet: ['Light rain', 'Heavy rain', 'Monsoon', 'Thunderstorm', 'Humid', 'Overcast']
      },
      desert: {
        day: ['Clear', 'Sunny', 'Hot', 'Very hot', 'Scorching', 'Sandstorm'],
        night: ['Clear', 'Cold', 'Very cold', 'Freezing', 'Calm', 'Windy']
      },
      arctic: {
        summer: ['Clear', 'Cloudy', 'Cold', 'Snow', 'Blizzard', 'Whiteout'],
        winter: ['Clear', 'Aurora', 'Bitter cold', 'Snow', 'Blizzard', 'Ice storm']
      }
    };
    
    this.effects = {
      'Clear': 'Normal visibility, no penalties',
      'Sunny': 'Normal visibility, heat exhaustion possible',
      'Hot': 'Exhaustion after 4 hours, water consumption doubled',
      'Very hot': 'Exhaustion after 2 hours, -2 to all rolls',
      'Scorching': 'Exhaustion after 1 hour, -4 to all rolls, fire damage',
      'Cloudy': 'Normal visibility, comfortable',
      'Partly cloudy': 'Normal visibility, pleasant',
      'Overcast': 'Visibility slightly reduced, gloomy',
      'Fog': 'Visibility 30 feet, surprise chance +1',
      'Freezing fog': 'Visibility 20 feet, cold damage per hour',
      'Light rain': 'Visibility 75%, tracks obscured',
      'Heavy rain': 'Visibility 50%, -2 to missile attacks',
      'Monsoon': 'No missile fire, movement halved, flooding',
      'Thunderstorm': 'No missile fire, lightning danger, -4 to listen',
      'Snow': 'Movement halved, tracks covered, cold damage',
      'Heavy snow': 'Movement quartered, -4 to visibility, cold damage',
      'Blizzard': 'No travel, -8 to visibility, severe cold damage',
      'Whiteout': 'Lost automatically, severe cold damage',
      'Ice storm': 'No travel, slipping hazard, severe cold damage',
      'Windy': 'Missile attacks -2, small characters knocked down',
      'Sandstorm': 'No visibility, suffocation damage, lost automatically',
      'Aurora': 'Beautiful lights, no penalties, magical feeling',
      'Humid': 'Exhaustion doubled, clothing becomes soaked'
    };
    
    this.moonPhases = [
      'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
      'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
    ];
  }

  roll() {
    return Math.floor(Math.random() * 6) + 1;
  }

  generate(region = 'temperate', season = 'spring', timeOfDay = 'day') {
    const regionData = this.regions[region];
    if (!regionData) return { error: 'Unknown region' };
    
    let weatherOptions;
    if (region === 'tropical') {
      weatherOptions = regionData[season]; // dry or wet
    } else if (region === 'desert') {
      weatherOptions = regionData[timeOfDay];
    } else if (region === 'arctic') {
      weatherOptions = regionData[season];
    } else {
      weatherOptions = regionData[season];
    }
    
    const weather = this.random(weatherOptions);
    
    return {
      weather,
      region,
      season,
      timeOfDay,
      effect: this.effects[weather] || 'Normal conditions',
      temperature: this.estimateTemperature(region, season, timeOfDay),
      wind: this.generateWind(),
      duration: this.roll() + ' hours'
    };
  }

  estimateTemperature(region, season, timeOfDay) {
    const base = {
      temperate: { spring: 60, summer: 80, autumn: 50, winter: 30 },
      tropical: { dry: 90, wet: 85 },
      desert: { day: 110, night: 40 },
      arctic: { summer: 40, winter: -20 }
    };
    
    let temp = base[region]?.[season] || 60;
    
    // Time of day modifier
    if (timeOfDay === 'night') temp -= 20;
    if (timeOfDay === 'dawn' || timeOfDay === 'dusk') temp -= 10;
    
    // Random variation
    temp += Math.floor(Math.random() * 20) - 10;
    
    return temp + '°F';
  }

  generateWind() {
    const winds = ['Calm', 'Light breeze', 'Moderate wind', 'Strong wind', 'Gale'];
    return this.random(winds);
  }

  getMoonPhase(day = 1) {
    const phaseIndex = (day - 1) % 8;
    return this.moonPhases[phaseIndex];
  }

  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  generateForecast(region, season, days = 3) {
    const forecast = [];
    for (let i = 0; i < days; i++) {
      forecast.push({
        day: i + 1,
        ...this.generate(region, season)
      });
    }
    return forecast;
  }
}

module.exports = WeatherSystem;
