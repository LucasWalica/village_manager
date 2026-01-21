import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BattleParticipant } from './battle-participant.entity';
import { BattleTurn } from './battle-turn.entity';
import { BattleAction } from './battle-action.entity';
import { User } from '../../auth/entities/user.entity';

export enum BattleStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  FLED = 'fled',
}

export enum BattleType {
  DUNGEON = 'dungeon',
  PVP = 'pvp',
  BOSS = 'boss',
  RANDOM = 'random',
}

@Entity('battles')
export class Battle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BattleStatus,
    default: BattleStatus.PENDING,
  })
  status: BattleStatus;

  @Column({
    type: 'enum',
    enum: BattleType,
  })
  type: BattleType;

  @Column({ nullable: true })
  dungeonId: number;

  @Column({ nullable: true })
  dungeonRoomId: number;

  @Column({ type: 'json', nullable: true })
  rewards: {
    experience?: number;
    gold?: number;
    items?: { itemId: number; quantity: number }[];
  };

  @Column({ type: 'json', nullable: true })
  battleSettings: {
    maxTurns?: number;
    timeLimit?: number;
    allowEscape?: boolean;
    difficulty: number;
  };

  @Column({ default: 0 })
  currentTurn: number;

  @Column({ type: 'json', nullable: true })
  environment: {
    terrain?: string;
    weather?: string;
    effects?: {
      type: string;
      value: number;
      duration: number;
    }[];
  };

  @ManyToOne(() => User, user => user.battles)
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => BattleParticipant, participant => participant.battle, { cascade: true })
  participants: BattleParticipant[];

  @OneToMany(() => BattleTurn, turn => turn.battle, { cascade: true })
  turns: BattleTurn[];

  @OneToMany(() => BattleAction, action => action.battle, { cascade: true })
  actions: BattleAction[];

  @Column({ nullable: true })
  winnerId: number;

  @Column({ nullable: true })
  endedAt: Date;

  @Column({ nullable: true })
  dungeonRunId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
