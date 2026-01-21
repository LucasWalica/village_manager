import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Battle } from './battle.entity';
import { Character } from '../../characters/entities/character.entity';
import { Enemy } from '../../enemies/entities/enemy.entity';
import { BattleAction } from './battle-action.entity';

export enum ParticipantType {
  CHARACTER = 'character',
  ENEMY = 'enemy',
}

export enum ParticipantStatus {
  ACTIVE = 'active',
  DEAD = 'dead',
  STUNNED = 'stunned',
  POISONED = 'poisoned',
  SLEEPING = 'sleeping',
  CONFUSED = 'confused',
}

@Entity('battle_participants')
export class BattleParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ParticipantType,
  })
  type: ParticipantType;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.ACTIVE,
  })
  status: ParticipantStatus;

  @Column({ default: 0 })
  position: number; // Posición en el campo de batalla (0-5)

  @Column({ default: 100 })
  currentHp: number;

  @Column({ default: 50 })
  currentMp: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  initiative: number;

  @Column({ default: 0 })
  turnOrder: number;

  @Column({ type: 'json', nullable: true })
  temporaryStats: {
    attack?: number;
    defense?: number;
    speed?: number;
    criticalRate?: number;
    evasion?: number;
  };

  @Column({ type: 'json', nullable: true })
  statusEffects: {
    type: string;
    value: number;
    duration: number;
    source: string;
  }[];

  @Column({ type: 'json', nullable: true })
  cooldowns: {
    [skillId: number]: number;
  };

  @ManyToOne(() => Battle, battle => battle.participants, { onDelete: 'CASCADE' })
  battle: Battle;

  @Column()
  battleId: number;

  @ManyToOne(() => Character, character => character.battleParticipations, { nullable: true })
  character: Character;

  @Column({ nullable: true })
  characterId: number;

  @ManyToOne(() => Enemy, enemy => enemy.battleParticipations, { nullable: true })
  enemy: Enemy;

  @Column({ nullable: true })
  enemyId: number;

  @OneToMany(() => BattleAction, action => action.participant)
  actions: BattleAction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos helper
  get isAlive(): boolean {
    return this.status !== ParticipantStatus.DEAD && this.currentHp > 0;
  }

  get canAct(): boolean {
    return this.isAlive && this.status !== ParticipantStatus.STUNNED && this.status !== ParticipantStatus.SLEEPING;
  }
}
