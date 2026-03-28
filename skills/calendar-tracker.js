#!/usr/bin/env node

/**
 * Calendar & Time Tracker
 */

class CalendarTracker {
  constructor() {
    this.months = [
      { name: 'Hammer', days: 30, season: 'winter' },
      { name: 'Alturiak', days: 30, season: 'winter' },
      { name: 'Ches', days: 30, season: 'spring' },
      { name: 'Tarsakh', days: 30, season: 'spring' },
      { name: 'Mirtul', days: 30, season: 'spring' },
      { name: 'Kythorn', days: 30, season: 'summer' },
      { name: 'Flamerule', days: 30, season: 'summer' },
      { name: 'Eleasis', days: 30, season: 'summer' },
      { name: 'Eleint', days: 30, season: 'autumn' },
      { name: 'Marpenoth', days: 30, season: 'autumn' },
      { name: 'Uktar', days: 30, season: 'autumn' },
      { name: 'Nightal', days: 30, season: 'winter' }
    ];
    
    this.daysOfWeek = ['Firstday', 'Seconday', 'Thirday', 'Fourday', 'Fifthday', 'Sixday', 'Sevenday', 'Eightday', 'Nineday', 'Tenday'];
    
    this.festivals = {
      'Hammer 1': 'Midwinter',
      'Ches 19': 'Spring Equinox',
      'Tarsakh 20': 'Greengrass',
      'Kythorn 20': 'Summer Solstice',
      'Eleasis 20': 'Highsummer',
      'Eleint 21': 'Autumn Equinox',
      'Marpenoth 20': 'Highharvestide',
      'Uktar 20': 'Feast of the Moon',
      'Nightal 20': 'Winter Solstice'
    };
    
    this.moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                       'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    
    // Default to current date
    this.year = 1357; // DR (Dalereckoning)
    this.month = 0; // Hammer
    this.day = 1;
    this.hour = 8; // 8 AM
  }

  setDate(year, month, day, hour = 8) {
    this.year = year;
    this.month = month - 1; // 0-indexed
    this.day = day;
    this.hour = hour;
  }

  advanceTime(hours) {
    this.hour += hours;
    while (this.hour >= 24) {
      this.hour -= 24;
      this.advanceDay();
    }
  }

  advanceDay(days = 1) {
    for (let i = 0; i < days; i++) {
      this.day++;
      if (this.day > this.months[this.month].days) {
        this.day = 1;
        this.month++;
        if (this.month >= 12) {
          this.month = 0;
          this.year++;
        }
      }
    }
  }

  getDateString() {
    const monthName = this.months[this.month].name;
    const dayOfWeek = this.daysOfWeek[(this.day - 1) % 10];
    const festival = this.festivals[`${monthName} ${this.day}`];
    
    let str = `${dayOfWeek}, ${monthName} ${this.day}, ${this.year} DR`;
    if (festival) str += ` (${festival})`;
    
    return str;
  }

  getTimeString() {
    const period = this.hour >= 12 ? 'PM' : 'AM';
    const displayHour = this.hour > 12 ? this.hour - 12 : (this.hour === 0 ? 12 : this.hour);
    return `${displayHour}:00 ${period}`;
  }

  getMoonPhase() {
    // Simplified: changes every 3-4 days
    const dayOfYear = this.month * 30 + this.day;
    return this.moonPhases[Math.floor(dayOfYear / 3.75) % 8];
  }

  getSeason() {
    return this.months[this.month].season;
  }

  isFullMoon() {
    return this.getMoonPhase() === 'Full Moon';
  }

  isNewMoon() {
    return this.getMoonPhase() === 'New Moon';
  }

  getStatus() {
    return {
      date: this.getDateString(),
      time: this.getTimeString(),
      season: this.getSeason(),
      moon: this.getMoonPhase(),
      isFullMoon: this.isFullMoon(),
      isNewMoon: this.isNewMoon()
    };
  }

  printStatus() {
    const status = this.getStatus();
    console.log(`\n📅 ${status.date}`);
    console.log(`🕐 ${status.time}`);
    console.log(`🌙 Moon: ${status.moon}`);
    console.log(`🌿 Season: ${status.season}`);
  }
}

module.exports = CalendarTracker;
