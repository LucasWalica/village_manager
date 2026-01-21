import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DungeonRoom } from './dungeon-room.entity';
import { DungeonRun } from './dungeon-run.entity';

export enum DungeonType {
  FOREST = 'forest',
  CAVE = 'cave',
  CASTLE = 'castle',
  NECROPOLIS = 'necropolis',
  VOLCANO = 'volcano',
  ICE_TEMPLE = 'ice_temple',
  ABANDONED_MINE = 'abandoned_mine',
  SWAMP = 'swamp',
}

export enum DungeonDifficulty {
  EASY = 1,
  NORMAL = 2,
  HARD = 3,
  EXPERT = 4,
  NIGHTMARE = 5,
}

@Entity('dungeons')
export class Dungeon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: DungeonType,
  })
  type: DungeonType;

  @Column({
    type: 'enum',
    enum: DungeonDifficulty,
  })
  difficulty: DungeonDifficulty;

  @Column({ default: 5 })
  maxRooms: number; // Número de peleas (5 como en Axie Infinity)

  @Column({ default: 3 })
  minPartySize: number;

  @Column({ default: 10 })
  maxPartySize: number;

  @Column({ type: 'json', nullable: true })
  requirements: {
    minCharacterLevel?: number;
    minPartySize?: number;
    requiredItems?: { itemId: number; quantity: number }[];
    goldCost?: number;
    completedDungeons?: number[];
  };

  @Column({ type: 'json', nullable: true })
  rewards: {
    baseExperience: number;
    baseGold: number;
    experienceMultiplier: number; // Multiplicador por dificultad
    goldMultiplier: number;
    guaranteedDrops?: { itemId: number; quantity: number }[];
    possibleDrops?: { itemId: number; chance: number; quantity: number }[];
  };

  @Column({ type: 'json', nullable: true })
  enemyPool: {
    normalEnemies: number[]; // IDs de enemy templates para peleas normales
    miniBosses: number[]; // IDs para mini-bosses (pelea 4)
    finalBosses: number[]; // IDs para boss final (pelea 5)
  };

  @Column({ nullable: true })
  backgroundImage: string;

  @Column({ nullable: true })
  iconPath: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  specialRules: {
    timeLimit?: number; // En minutos
    noEscape?: boolean;
    permadeath?: boolean; // Si mueren personajes, se pierden permanentemente
    levelRestriction?: { min: number; max: number };
    characterTypeRestriction?: string[]; // Solo ciertos tipos de personajes
  };

  @Column({ type: 'json', nullable: true })
  roomLayout: {
    room1: { type: 'normal'; enemyCount: number };
    room2: { type: 'normal'; enemyCount: number };
    room3: { type: 'normal'; enemyCount: number };
    room4: { type: 'miniboss'; enemyCount: number };
    room5: { type: 'boss'; enemyCount: number };
  };

  @OneToMany(() => DungeonRoom, room => room.dungeon)
  rooms: DungeonRoom[];

  @OneToMany(() => DungeonRun, run => run.dungeon)
  runs: DungeonRun[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
