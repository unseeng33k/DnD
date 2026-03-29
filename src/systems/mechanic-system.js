/**
 * MECHANIC SYSTEM - PHASE 4 INTEGRATED
 * 
 * Handles mechanical game events: attacks, damage, ability checks
 * Uses DiceAdapter for all rolls
 */

class MechanicSystem {
  constructor(eventBus, diceAdapter = null) {
    this.eventBus = eventBus;
    this.diceAdapter = diceAdapter;
    this.characterState = new Map();
    this.setupListeners();
  }

  setupListeners() {
    // Existing listeners
    this.eventBus.on('effect:apply-damage', (event) => {
      this.applyDamage(event.data.target, event.data.result.damage);
    });

    this.eventBus.on('effect:add-to-inventory', (event) => {
      this.addToInventory(event.data.target, event.data.result.item);
    });

    // Phase 4: Attack rolls
    this.eventBus.on('mechanic:attack-roll', (event) => {
      this.resolveAttackRoll(event.data);
    });

    // Phase 4: Damage rolls
    this.eventBus.on('mechanic:damage-roll', (event) => {
      this.resolveDamageRoll(event.data);
    });

    // Phase 4: Ability checks
    this.eventBus.on('mechanic:ability-check', (event) => {
      this.resolveAbilityCheck(event.data);
    });
  }

  /**
   * PHASE 4: Resolve attack roll
   */
  resolveAttackRoll(data) {
    if (!this.diceAdapter) {
      console.warn('⚠️ DiceAdapter not available');
      return null;
    }

    const actor = data.actor || 'Unknown';
    const target = data.target || 'Unknown';
    const bonus = data.attackBonus || 0;
    const hasAdvantage = data.advantage || false;
    const hasDisadvantage = data.disadvantage || false;

    let roll;
    if (hasAdvantage) {
      roll = this.diceAdapter.rollWithAdvantage(1, bonus);
    } else if (hasDisadvantage) {
      roll = this.diceAdapter.rollWithDisadvantage(1, bonus);
    } else {
      roll = this.diceAdapter.rollD20(bonus);
    }

    const hit = roll.total >= 10;

    console.log(`⚔️ ${actor} attacks ${target}: ${roll.total} ${hit ? '✅ HIT' : '❌ MISS'}`);

    this.eventBus.emit('mechanic:attack-roll-resolved', {
      actor,
      target,
      roll,
      hit
    });

    return roll;
  }

  /**
   * PHASE 4: Resolve damage roll
   */
  resolveDamageRoll(data) {
    if (!this.diceAdapter) {
      console.warn('⚠️ DiceAdapter not available');
      return null;
    }

    const actor = data.actor || 'Unknown';
    const target = data.target || 'Unknown';
    const diceType = data.diceType || 8;
    const count = data.count || 1;
    const modifier = data.modifier || 0;

    const roll = this.diceAdapter.rollDice(diceType, count, modifier);

    this.applyDamage(target, roll.total);

    console.log(`🗡️ ${actor} deals ${roll.total} damage to ${target}`);

    this.eventBus.emit('mechanic:damage-roll-resolved', {
      actor,
      target,
      roll,
      damage: roll.total
    });

    return roll;
  }

  /**
   * PHASE 4: Resolve ability check
   */
  resolveAbilityCheck(data) {
    if (!this.diceAdapter) {
      console.warn('⚠️ DiceAdapter not available');
      return null;
    }

    const actor = data.actor || 'Unknown';
    const ability = data.ability || 'Strength';
    const dc = data.dc || 10;
    const modifier = data.modifier || 0;

    const roll = this.diceAdapter.rollD20(modifier);
    const success = roll.total >= dc;

    console.log(`🔍 ${actor}'s ${ability} check: ${roll.total} vs DC ${dc} → ${success ? '✅ SUCCESS' : '❌ FAIL'}`);

    this.eventBus.emit('mechanic:ability-check-resolved', {
      actor,
      ability,
      roll,
      dc,
      success
    });

    return roll;
  }

  applyDamage(target, amount) {
    console.log(`💔 Damage to ${target}: ${amount} HP`);
    const state = this.characterState.get(target) || { hp: 69 };
    state.hp -= amount;
    this.characterState.set(target, state);
  }

  addToInventory(actor, item) {
    const state = this.characterState.get(actor) || { inventory: [] };
    if (!state.inventory) state.inventory = [];
    state.inventory.push(item);
    this.characterState.set(actor, state);
    console.log(`📦 ${actor} acquired: ${item}`);
  }

  getCharacterState(name) {
    return this.characterState.get(name);
  }

  setCharacterState(name, state) {
    this.characterState.set(name, state);
  }
}

export { MechanicSystem };
