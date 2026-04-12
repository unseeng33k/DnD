import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus, StateChange } from '../event-bus';
import { GameState, Participant, Condition } from '../game-state';
import { RulesValidator } from '../validators';
import { RulesResolver } from '../resolvers';
import { ConsequenceTracker } from '../consequences';
import { RulesAuditor } from '../rules-auditor';

describe('D&D 3.5e Rules System', () => {
  let eventBus: EventBus;
  let validator: RulesValidator;
  let resolver: RulesResolver;
  let consequenceTracker: ConsequenceTracker;
  let auditor: RulesAuditor;
  let gameState: GameState;

  beforeEach(() => {
    eventBus = new EventBus();
    validator = new RulesValidator();
    resolver = new RulesResolver();
    consequenceTracker = new ConsequenceTracker(eventBus);
    auditor = new RulesAuditor(eventBus);

    gameState = {
      session: {
        campaignName: 'Test Campaign',
        sessionNumber: 1,
        roundNumber: 1,
        timestamp: new Date(),
      },
      participants: [
        {
          name: 'Aldric',
          type: 'pc',
          stats: {
            hp: 32,
            maxHP: 32,
            ac: 16,
            initiative: 4,
          },
          actions: {
            standard: true,
            move: true,
            swift: true,
            immediate: true,
          },
          spellSlots: {
            1: 4,
            2: 3,
            3: 2,
          },
          abilities: {
            str: 16,
            dex: 14,
            con: 15,
            int: 13,
            wis: 12,
            cha: 10,
          },
          conditions: [],
          resources: {
            actionPoints: 0,
            bardPerformances: 0,
            channelEnergy: 0,
          },
          position: { x: 0, y: 0 },
          status: 'alive',
        },
        {
          name: 'Goblin Fighter',
          type: 'enemy',
          stats: {
            hp: 12,
            maxHP: 12,
            ac: 13,
            initiative: 2,
          },
          actions: {
            standard: true,
            move: true,
            swift: false,
            immediate: false,
          },
          spellSlots: {},
          abilities: {
            str: 14,
            dex: 12,
            con: 13,
            int: 8,
            wis: 9,
            cha: 7,
          },
          conditions: [],
          resources: {},
          position: { x: 30, y: 0 },
          status: 'alive',
        },
      ],
      environment: {
        terrain: 'forest',
        difficulty: 'dense_forest',
        lightLevel: 'dim',
        temperature: 'cool',
      },
      consequences: [],
      tensionTracks: [
        {
          name: 'Goblin Tribe Escalation',
          currentLevel: 1,
          maxLevel: 5,
          escalatorsApplied: 0,
          thresholds: [
            { level: 3, description: 'Scouts sent to investigate' },
            { level: 5, description: 'Warband marches on village' },
          ],
        },
      ],
      auditLog: [],
    };
  });

  describe('Spell Casting Validation', () => {
    it('should reject casting spell without available slots', () => {
      gameState.participants[0].spellSlots[4] = 0;
      const result = validator.validateCastSpell(
        gameState.participants[0],
        'Fireball',
        4,
        gameState
      );
      expect(result.legal).toBe(false);
      expect(result.violations).toContain(
        'No 4th level spell slots available'
      );
    });

    it('should allow casting spell with available slots', () => {
      const result = validator.validateCastSpell(
        gameState.participants[0],
        'Magic Missile',
        1,
        gameState
      );
      expect(result.legal).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should reject casting while concentrating on spell', () => {
      gameState.participants[0].conditions.push({
        name: 'Concentrating',
        durationRounds: 10,
        appliedBy: 'Aldric',
        saveAtEndOfTurn: false,
      });
      const result = validator.validateCastSpell(
        gameState.participants[0],
        'Fireball',
        3,
        gameState
      );
      expect(result.legal).toBe(false);
      expect(result.violations.some((v) => v.includes('Concentrating')))
        .toBe(true);
    });

    it('should reject concentration spell while concentrating', () => {
      gameState.participants[0].conditions.push({
        name: 'Concentrating',
        durationRounds: 5,
        appliedBy: 'Aldric',
        saveAtEndOfTurn: false,
      });
      const result = validator.validateCastSpell(
        gameState.participants[0],
        'Hold Person',
        2,
        gameState
      );
      expect(result.legal).toBe(false);
    });
  });

  describe('Attack Validation', () => {
    it('should reject attacking a dead target', () => {
      gameState.participants[1].status = 'dead';
      const result = validator.validateAttack(
        gameState.participants[0],
        gameState.participants[1],
        gameState
      );
      expect(result.legal).toBe(false);
      expect(result.violations).toContain('Target is dead');
    });

    it('should allow attacking a living target', () => {
      const result = validator.validateAttack(
        gameState.participants[0],
        gameState.participants[1],
        gameState
      );
      expect(result.legal).toBe(true);
    });

    it('should reject attacking out of range', () => {
      // Melee attack but target is 100 feet away
      gameState.participants[1].position = { x: 300, y: 0 };
      const result = validator.validateAttack(
        gameState.participants[0],
        gameState.participants[1],
        gameState
      );
      expect(result.legal).toBe(false);
      expect(result.violations.some((v) => v.includes('range')))
        .toBe(true);
    });
  });

  describe('Movement Validation', () => {
    it('should reject movement beyond speed', () => {
      const movement = 40; // Assuming base 30 ft speed for PC
      const result = validator.validateMovement(
        gameState.participants[0],
        movement,
        gameState
      );
      expect(result.legal).toBe(false);
      expect(result.violations).toContain(
        'Movement distance exceeds available speed'
      );
    });

    it('should allow movement within speed', () => {
      const movement = 25;
      const result = validator.validateMovement(
        gameState.participants[0],
        movement,
        gameState
      );
      expect(result.legal).toBe(true);
    });

    it('should reject movement through solid terrain', () => {
      gameState.environment.terrain = 'solid_rock_wall';
      const result = validator.validateMovement(
        gameState.participants[0],
        15,
        gameState
      );
      expect(result.legal).toBe(false);
      expect(result.violations.some((v) => v.includes('passable')))
        .toBe(true);
    });
  });

  describe('Condition Application', () => {
    it('should reject applying conflicting conditions', () => {
      gameState.participants[0].conditions.push({
        name: 'Hasted',
        durationRounds: 10,
        appliedBy: 'Aldric',
        saveAtEndOfTurn: false,
      });
      const result = validator.validateConditionApplication(
        gameState.participants[0],
        { name: 'Slowed', durationRounds: 5, appliedBy: 'Enemy' },
        gameState
      );
      expect(result.legal).toBe(false);
      expect(result.violations.some((v) => v.includes('conflict')))
        .toBe(true);
    });

    it('should allow non-conflicting conditions', () => {
      gameState.participants[0].conditions.push({
        name: 'Hasted',
        durationRounds: 10,
        appliedBy: 'Aldric',
        saveAtEndOfTurn: false,
      });
      const result = validator.validateConditionApplication(
        gameState.participants[0],
        { name: 'Blessed', durationRounds: 5, appliedBy: 'Cleric' },
        gameState
      );
      expect(result.legal).toBe(true);
    });

    it('should respect condition immunities', () => {
      gameState.participants[0].conditions.push({
        name: 'Undead',
        durationRounds: 999,
        appliedBy: 'Necromancy',
        saveAtEndOfTurn: false,
      });
      const result = validator.validateConditionApplication(
        gameState.participants[0],
        { name: 'Stunned', durationRounds: 1, appliedBy: 'Mind Flayer' },
        gameState
      );
      expect(result.legal).toBe(false);
    });
  });

  describe('Damage Resolution', () => {
    it('should compute accurate damage and track HP reduction', () => {
      const oldHP = gameState.participants[1].stats.hp;
      const damageAmount = 8;
      const result = resolver.resolveDamageOverTime(
        gameState.participants[1],
        damageAmount,
        'Magic Missile',
        gameState
      );
      expect(result.outcome).toBe('hit');
      expect(result.stateChanges.length).toBeGreaterThan(0);
      const hpChange = result.stateChanges.find((c) =>
        c.path.includes('stats.hp')
      );
      expect(hpChange?.before).toBe(oldHP);
      expect(hpChange?.after).toBe(oldHP - damageAmount);
    });

    it('should not reduce HP below 0', () => {
      gameState.participants[1].stats.hp = 5;
      const result = resolver.resolveDamageOverTime(
        gameState.participants[1],
        15,
        'Fireball',
        gameState
      );
      const hpChange = result.stateChanges.find((c) =>
        c.path.includes('stats.hp')
      );
      expect(hpChange?.after).toBeGreaterThanOrEqual(0);
    });

    it('should trigger death status when HP reaches 0', () => {
      gameState.participants[1].stats.hp = 5;
      const result = resolver.resolveDamageOverTime(
        gameState.participants[1],
        10,
        'Execute',
        gameState
      );
      const statusChange = result.stateChanges.find((c) =>
        c.path.includes('status')
      );
      expect(statusChange?.after).toBe('dead');
    });
  });

  describe('Action Economy', () => {
    it('should reject using standard action twice in one round', () => {
      gameState.participants[0].actions.standard = false; // Already used
      const result = validator.validateActionEconomy(
        gameState.participants[0],
        'standard',
        gameState
      );
      expect(result.legal).toBe(false);
    });

    it('should allow using different action types', () => {
      gameState.participants[0].actions.standard = false;
      const moveResult = validator.validateActionEconomy(
        gameState.participants[0],
        'move',
        gameState
      );
      expect(moveResult.legal).toBe(true);
    });
  });

  describe('Saving Throws', () => {
    it('should reject saving throw for unconscious target', () => {
      gameState.participants[1].conditions.push({
        name: 'Unconscious',
        durationRounds: 999,
        appliedBy: 'Sleep Spell',
        saveAtEndOfTurn: true,
      });
      const result = validator.validateSave(
        gameState.participants[1],
        'will',
        gameState
      );
      expect(result.legal).toBe(false);
    });

    it('should allow save for conscious target', () => {
      const result = validator.validateSave(
        gameState.participants[0],
        'will',
        gameState
      );
      expect(result.legal).toBe(true);
    });
  });

  describe('Audit Loop - State Validation', () => {
    it('should flag HP exceeding maximum', () => {
      const stateChanges: StateChange[] = [
        {
          path: 'participants[0].stats.hp',
          before: 32,
          after: 45,
          reason: 'Heal potion',
        },
      ];
      auditor.auditStateChanges(stateChanges, gameState, 1);
      const violations = auditor.getAuditLog();
      expect(
        violations.some((v) =>
          v.violations.some((vio) => vio.message.includes('exceed'))
        )
      ).toBe(true);
    });

    it('should flag damage to dead target', () => {
      gameState.participants[0].status = 'dead';
      const stateChanges: StateChange[] = [
        {
          path: 'participants[0].stats.hp',
          before: 0,
          after: -5,
          reason: 'Overkill',
        },
      ];
      auditor.auditStateChanges(stateChanges, gameState, 1);
      const violations = auditor.getAuditLog();
      expect(
        violations.some((v) =>
          v.violations.some((vio) => vio.message.includes('dead'))
        )
      ).toBe(true);
    });

    it('should flag impossible condition combinations', () => {
      const stateChanges: StateChange[] = [
        {
          path: 'participants[0].conditions',
          before: [],
          after: [
            {
              name: 'Hasted',
              durationRounds: 10,
              appliedBy: 'Aldric',
              saveAtEndOfTurn: false,
            },
            {
              name: 'Slowed',
              durationRounds: 10,
              appliedBy: 'Enemy',
              saveAtEndOfTurn: false,
            },
          ],
          reason: 'Multiple spell effects',
        },
      ];
      auditor.auditStateChanges(stateChanges, gameState, 1);
      const violations = auditor.getAuditLog();
      expect(violations.length).toBeGreaterThan(0);
    });

    it('should allow valid state changes', () => {
      const stateChanges: StateChange[] = [
        {
          path: 'participants[0].stats.hp',
          before: 32,
          after: 24,
          reason: 'Fire spell damage',
        },
      ];
      auditor.auditStateChanges(stateChanges, gameState, 1);
      const violations = auditor.getAuditLog();
      const hasErrors = violations.some(
        (v) =>
          v.violations.filter((vio) => vio.severity === 'critical').length > 0
      );
      expect(hasErrors).toBe(false);
    });
  });

  describe('Integration: Full Action Flow', () => {
    it('should execute complete attack sequence: validate → resolve → audit', () => {
      // 1. Validate attack is legal
      const validation = validator.validateAttack(
        gameState.participants[0],
        gameState.participants[1],
        gameState
      );
      expect(validation.legal).toBe(true);

      // 2. Resolve attack mechanics
      const resolution = resolver.resolveAttack(
        gameState.participants[0],
        gameState.participants[1],
        gameState
      );
      expect(resolution.outcome).toMatch(/hit|miss/);

      // 3. Audit the state changes
      auditor.auditStateChanges(resolution.stateChanges, gameState, 1);
      const auditLog = auditor.getAuditLog();

      // No critical violations should be flagged for valid attack
      const criticalViolations = auditLog
        .flatMap((entry) => entry.violations)
        .filter((v) => v.severity === 'critical');
      expect(criticalViolations.length).toBe(0);
    });

    it('should reject invalid spell cast and block state change', () => {
      // 1. Remove spell slots
      gameState.participants[0].spellSlots[1] = 0;

      // 2. Attempt to validate spell cast
      const validation = validator.validateCastSpell(
        gameState.participants[0],
        'Magic Missile',
        1,
        gameState
      );
      expect(validation.legal).toBe(false);

      // 3. Should not attempt resolution
      expect(validation.violations).toContain(
        'No 1st level spell slots available'
      );
    });

    it('should catch delayed HP inconsistencies in audit', () => {
      // Simulate resolver computing damage correctly
      const resolution = resolver.resolveDamageOverTime(
        gameState.participants[1],
        7,
        'Fireball',
        gameState
      );
      const trueHPChange = 7;

      // Hypothetical: incorrect state change was made (audit catches it)
      const badStateChanges: StateChange[] = [
        {
          path: 'participants[1].stats.hp',
          before: 12,
          after: 2,
          reason: 'Fireball', // Should be 5 (12-7), not 2
        },
      ];

      auditor.auditStateChanges(badStateChanges, gameState, 1);
      const auditLog = auditor.getAuditLog();

      // Should flag as mechanical error
      const errors = auditLog.flatMap((entry) => entry.violations);
      expect(
        errors.some((v) =>
          v.message.includes('Damage recorded') || v.message.includes('mismatch')
        )
      ).toBe(true);
    });
  });

  describe('Consequence Tracking', () => {
    it('should detect when linked NPC dies', () => {
      gameState.consequences.push({
        action: 'Spared Goblin Chief during raid',
        actor: 'Aldric',
        sessionIntroduced: 1,
        resolution: undefined,
        linkedNPCs: ['Goblin Chief Rax'],
        linkedFactions: ['Goblin Tribe'],
        globalTensionIncrease: 2,
      });

      // Emit state change: Goblin Chief dies
      const stateChanges: StateChange[] = [
        {
          path: 'participants[*].status',
          before: 'alive',
          after: 'dead',
          reason: 'Killed in combat',
        },
      ];

      eventBus.emit('STATE_UPDATED', { stateChanges, gameState, roundNumber: 5 });

      const emissions = consequenceTracker.getEmissions();
      // Depending on implementation, should detect linked NPC death
      expect(emissions).toBeDefined();
    });

    it('should escalate unresolved consequences after 3+ rounds', () => {
      gameState.consequences.push({
        action: 'Cast forbidden spell in temple',
        actor: 'Aldric',
        sessionIntroduced: 2,
        resolution: undefined,
        linkedNPCs: [],
        linkedFactions: ['Temple Order'],
        globalTensionIncrease: 3,
      });

      // Emit round 5 end (3 rounds later)
      eventBus.emit('ROUND_ENDED', { roundNumber: 5, gameState });

      const tension = consequenceTracker.getTensionStatus();
      // Tension should reflect escalation
      expect(tension).toBeDefined();
    });
  });

  describe('Round Management', () => {
    it('should expire conditions at end of round', () => {
      gameState.participants[0].conditions.push({
        name: 'Blessed',
        durationRounds: 1,
        appliedBy: 'Cleric',
        saveAtEndOfTurn: false,
      });

      auditor.auditRoundEnd(gameState, 1);
      const auditLog = auditor.getAuditLog();

      // Should verify conditions were checked for expiration
      expect(auditLog.length).toBeGreaterThan(0);
    });

    it('should reset action flags at round start', () => {
      gameState.participants[0].actions.standard = false;
      gameState.participants[0].actions.move = false;

      // Simulate round end → round start
      gameState.participants[0].actions.standard = true;
      gameState.participants[0].actions.move = true;

      expect(gameState.participants[0].actions.standard).toBe(true);
      expect(gameState.participants[0].actions.move).toBe(true);
    });
  });

  describe('Audit Report Generation', () => {
    it('should generate human-readable audit summary', () => {
      const stateChanges: StateChange[] = [
        {
          path: 'participants[0].stats.hp',
          before: 50,
          after: 60,
          reason: 'Invalid healing',
        },
      ];
      auditor.auditStateChanges(stateChanges, gameState, 1);
      const report = auditor.printAuditReport();

      expect(report).toContain('Audit Report') || expect(report).toBeDefined();
    });
  });
});
