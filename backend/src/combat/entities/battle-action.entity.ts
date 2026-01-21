import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Battle } from './battle.entity';
import { BattleParticipant } from './battle-participant.entity';
import { BattleTurn } from './battle-turn.entity';
import { Skill } from '../../characters/entities/skill.entity';
import { Item } from '../../characters/entities/item.entity';

export enum ActionType {
  ATTACK = 'attack',
  SKILL = 'skill',
  ITEM = 'item',
  DEFEND = 'defend',
  FLEE = 'flee',
  PASS = 'pass',
}

export enum ActionTarget {
  SINGLE_ENEMY = 'single_enemy',
  ALL_ENEMIES = 'all_enemies',
  SINGLE_ALLY = 'single_ally',
  ALL_ALLIES = 'all_allies',
  SELF = 'self',
}

@Entity('battle_actions')
export class BattleAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  actionType: ActionType;

  @Column({
    type: 'enum',
    enum: ActionTarget,
  })
  target: ActionTarget;

  @Column({ default: 0 })
  turnNumber: number;

  @Column({ default: 0 })
  actionOrder: number; // Orden en el que se ejecuta esta acción

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  damage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  healing: number;

  @Column({ type: 'json', nullable: true })
  effects: {
    type: string;
    value: number;
    duration: number;
    target: number; // ID del participante afectado
  }[];

  @Column({ type: 'json', nullable: true })
  result: {
    success: boolean;
    critical: boolean;
    missed: boolean;
    blocked: boolean;
    effectiveness: 'normal' | 'super_effective' | 'not_very_effective' | 'immune';
  };

  @Column({ type: 'json', nullable: true })
  combatLog: string[];

  @Column({ nullable: true })
  targetParticipantId: number;

  @Column({ nullable: true })
  skillId: number;

  @Column({ nullable: true })
  itemId: number;

  @Column({ type: 'json', nullable: true })
  position: {
    x: number;
    y: number;
  };

  @Column({ type: 'json', nullable: true })
  animation: {
    type: string;
    duration: number;
    sprite?: string;
    effect?: string;
  };

  @ManyToOne(() => Battle, battle => battle.actions, { onDelete: 'CASCADE' })
  battle: Battle;

  @Column()
  battleId: number;

  @ManyToOne(() => BattleParticipant, participant => participant.actions, { onDelete: 'CASCADE' })
  participant: BattleParticipant;

  @Column()
  participantId: number;

  @ManyToOne(() => BattleTurn, turn => turn.actions, { onDelete: 'CASCADE' })
  turn: BattleTurn;

  @Column()
  turnId: number;

  @ManyToOne(() => Skill, skill => skill.actions, { nullable: true })
  skill: Skill;

  @ManyToOne(() => Item, item => item.actions, { nullable: true })
  item: Item;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos helper
  get isDamageAction(): boolean {
    return this.damage > 0;
  }

  get isHealingAction(): boolean {
    return this.healing > 0;
  }

  get isSuccessful(): boolean {
    return this.result?.success || false;
  }

  get isCritical(): boolean {
    return this.result?.critical || false;
  }
}
