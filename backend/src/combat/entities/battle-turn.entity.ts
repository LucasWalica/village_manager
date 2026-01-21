import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Battle } from './battle.entity';
import { BattleAction } from './battle-action.entity';
import { BattleParticipant } from './battle-participant.entity';

export enum TurnStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('battle_turns')
export class BattleTurn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  turnNumber: number;

  @Column({
    type: 'enum',
    enum: TurnStatus,
    default: TurnStatus.PENDING,
  })
  status: TurnStatus;

  @Column({ type: 'json', nullable: true })
  turnOrder: {
    participantId: number;
    initiative: number;
    order: number;
  }[];

  @Column({ type: 'json', nullable: true })
  environmentEffects: {
    type: string;
    value: number;
    duration: number;
    affectedParticipants: number[];
  }[];

  @Column({ type: 'json', nullable: true })
  statusChanges: {
    participantId: number;
    status: string;
    value: number;
    duration: number;
  }[];

  @Column({ type: 'json', nullable: true })
  summary: {
    totalDamage: number;
    totalHealing: number;
    participantsKilled: number[];
    effectsApplied: string[];
    turnDuration: number; // en segundos
  };

  @Column({ type: 'json', nullable: true })
  combatLog: string[];

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ type: 'json', nullable: true })
  weatherEffects: {
    type: string;
    impact: string;
    duration: number;
  };

  @Column({ type: 'json', nullable: true })
  terrainModifiers: {
    position: number;
    effect: string;
    value: number;
  }[];

  @ManyToOne(() => Battle, battle => battle.turns, { onDelete: 'CASCADE' })
  battle: Battle;

  @Column()
  battleId: number;

  @OneToMany(() => BattleAction, action => action.turn)
  actions: BattleAction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos helper
  get isActive(): boolean {
    return this.status === TurnStatus.ACTIVE;
  }

  get isCompleted(): boolean {
    return this.status === TurnStatus.COMPLETED;
  }

  get duration(): number {
    if (!this.startTime) return 0;
    const end = this.endTime || new Date();
    return Math.floor((end.getTime() - this.startTime.getTime()) / 1000);
  }

  get participantCount(): number {
    return this.turnOrder?.length || 0;
  }

  get totalActions(): number {
    return this.actions?.length || 0;
  }
}
