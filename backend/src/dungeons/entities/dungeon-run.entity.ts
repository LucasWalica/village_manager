import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Dungeon } from './dungeon.entity';
import { Character } from '../../characters/entities/character.entity';
import { Battle } from '../../combat/entities/battle.entity';
import { User } from '../../auth/entities/user.entity';

export enum RunStatus {
  PREPARING = 'preparing',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ABANDONED = 'abandoned',
}

@Entity('dungeon_runs')
export class DungeonRun {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RunStatus,
    default: RunStatus.PREPARING,
  })
  status: RunStatus;

  @Column({ default: 1 })
  currentRoom: number;

  @Column({ default: 0 })
  score: number;

  @Column({ type: 'json', nullable: true })
  party: {
    characterId: number;
    position: number; // 0-9 para hasta 10 personajes
    currentHp: number;
    currentMp: number;
    status: string;
  }[];

  @Column({ type: 'json', nullable: true })
  resources: {
    gold: number;
    potions: { type: string; quantity: number }[];
    keys?: number;
    specialItems?: { itemId: number; quantity: number }[];
  };

  @Column({ type: 'json', nullable: true })
  progress: {
    roomsCompleted: number[];
    enemiesDefeated: number;
    battlesWon: number;
    battlesLost: number;
    itemsCollected: number;
    totalDamage: number;
    totalDamageTaken: number;
  };

  @Column({ type: 'json', nullable: true })
  difficulty: {
    base: number;
    modifier: number;
    final: number;
  };

  @Column({ type: 'json', nullable: true })
  rewards: {
    experienceGained: number;
    goldGained: number;
    itemsObtained: { itemId: number; quantity: number }[];
    charactersLost: number[]; // IDs de personajes que murieron permanentemente
  };

  @Column({ type: 'json', nullable: true })
  battleHistory: {
    roomId: number;
    battleId: number;
    result: 'victory' | 'defeat' | 'fled';
    duration: number; // en segundos
    rewards?: any;
  }[];

  @Column({ type: 'json', nullable: true })
  choices: {
    roomId: number;
    choice: string;
    consequence: string;
  }[];

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  timeLimit: Date; // Si hay límite de tiempo

  @Column({ default: false })
  isPermadeath: boolean; // Si los personajes mueren permanentemente

  @ManyToOne(() => Dungeon, dungeon => dungeon.runs)
  dungeon: Dungeon;

  @Column()
  dungeonId: number;

  @ManyToOne(() => Character, character => character.dungeonRuns)
  character: Character; // Personaje líder o principal

  @Column()
  characterId: number;

  @ManyToOne(() => User, user => user.dungeonRuns)
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Battle, battle => battle.dungeonRunId)
  battles: Battle[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos helper
  get isCompleted(): boolean {
    return this.status === RunStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === RunStatus.FAILED || this.status === RunStatus.ABANDONED;
  }

  get duration(): number {
    if (!this.startTime) return 0;
    const end = this.endTime || new Date();
    return Math.floor((end.getTime() - this.startTime.getTime()) / 1000);
  }

  get charactersAlive(): number {
    return this.party?.filter(p => p.currentHp > 0).length || 0;
  }
}
