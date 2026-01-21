import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DungeonRoom } from './dungeon-room.entity';
import { Enemy } from '../../enemies/entities/enemy.entity';
import { DungeonRun } from './dungeon-run.entity';

export enum EncounterType {
  COMBAT = 'combat',
  PUZZLE = 'puzzle',
  DIALOGUE = 'dialogue',
  TRAP = 'trap',
  TREASURE = 'treasure',
  SHOP = 'shop',
}

export enum EncounterDifficulty {
  TRIVIAL = 0,
  EASY = 1,
  NORMAL = 2,
  HARD = 3,
  BOSS = 4,
}

@Entity('dungeon_encounters')
export class DungeonEncounter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: EncounterType,
  })
  type: EncounterType;

  @Column({
    type: 'enum',
    enum: EncounterDifficulty,
  })
  difficulty: EncounterDifficulty;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  enemyFormation: {
    position: number; // 0-5 en el campo de batalla
    enemyId: number;
  }[];

  @Column({ type: 'json', nullable: true })
  aiBehavior: {
    coordination: number; // 0-100, qué tan coordinados atacan
    targetPriority: 'random' | 'weakest' | 'strongest' | 'lowest_hp' | 'highest_damage';
    skillUsage: 'conservative' | 'balanced' | 'aggressive';
  };

  @Column({ type: 'json', nullable: true })
  specialConditions: {
    timeLimit?: number;
    noEscape?: boolean;
    weather?: string;
    terrain?: string;
    statusEffects?: {
      type: string;
      value: number;
      duration: number;
    }[];
  };

  @Column({ type: 'json', nullable: true })
  victoryConditions: {
    eliminateAll?: boolean;
    surviveTurns?: number;
    protectTarget?: boolean;
    specialObjective?: string;
  };

  @Column({ type: 'json', nullable: true })
  defeatConditions: {
    allDead?: boolean;
    timeLimit?: number;
    targetKilled?: boolean;
  };

  @Column({ type: 'json', nullable: true })
  rewards: {
    experience?: number;
    gold?: number;
    guaranteedDrops?: { itemId: number; quantity: number }[];
    possibleDrops?: { itemId: number; chance: number; quantity: number }[];
    specialReward?: {
      type: 'item' | 'character' | 'unlock';
      value: any;
      chance: number;
    };
  };

  @Column({ type: 'json', nullable: true })
  dialogue: {
    introduction?: string;
    midBattle?: string[];
    victory?: string;
    defeat?: string;
  };

  @Column({ default: false })
  isDefeated: boolean;

  @Column({ default: false })
  isOptional: boolean;

  @ManyToOne(() => DungeonRoom, room => room.encounters, { onDelete: 'CASCADE' })
  room: DungeonRoom;

  @Column()
  roomId: number;

  @ManyToMany(() => Enemy, enemy => enemy.dungeonEncounters)
  @JoinTable({
    name: 'encounter_enemies',
    joinColumn: { name: 'encounter_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'enemy_id', referencedColumnName: 'id' }
  })
  enemies: Enemy[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
