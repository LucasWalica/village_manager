import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Enemy } from './enemy.entity';

export enum EnemyType {
  MONSTER = 'monster',
  DEMON = 'demon',
  UNDEAD_BOSS = 'undead_boss',
}

export enum EnemyClass {
  // Monsters
  GRIMLOCK = 'grimlock',
  OGRE = 'ogre',
  SLAAD = 'slaad',
  CYCLOPS = 'cyclops',
  SLIME = 'slime',
  MYCONID = 'myconid',
  ETTIN = 'ettin',
  JELLY = 'jelly',
  WATCHER = 'watcher',
  REDCAP = 'redcap',
  MUSHROOM = 'mushroom',
  TROLL = 'troll',
  
  // Demons
  IMP = 'imp',
  ABOMINATION = 'abomination',
  BLACKGUARD = 'blackguard',
  DEMONSPAWN = 'demonspawn',
  RASCAL = 'rascal',
  STALKER = 'stalker',
  SCOUNDREL = 'scoundrel',
  SKULL = 'skull',
  GOUGER = 'gouger',
  EYE = 'eye',
  
  // Undead Bosses (de 10 Undead JRPG characters)
  UNDEAD_WARRIOR = 'undead_warrior',
  UNDEAD_MAGE = 'undead_mage',
  UNDEAD_ROGUE = 'undead_rogue',
  UNDEAD_ARCHER = 'undead_archer',
  UNDEAD_CLERIC = 'undead_cleric',
  UNDEAD_PALADIN = 'undead_paladin',
  UNDEAD_NECROMANCER = 'undead_necromancer',
  UNDEAD_BERSERKER = 'undead_berserker',
  UNDEAD_ASSASSIN = 'undead_assassin',
  UNDEAD_LICH = 'undead_lich',
}

@Entity('enemy_templates')
export class EnemyTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: EnemyType,
  })
  type: EnemyType;

  @Column({
    type: 'enum',
    enum: EnemyClass,
  })
  class: EnemyClass;

  @Column()
  description: string;

  @Column({ default: 100 })
  baseHp: number;

  @Column({ default: 50 })
  baseMp: number;

  @Column({ default: 10 })
  baseAttack: number;

  @Column({ default: 8 })
  baseDefense: number;

  @Column({ default: 10 })
  baseSpeed: number;

  @Column({ type: 'json' })
  statGrowth: {
    hpPerLevel: number;
    mpPerLevel: number;
    attackPerLevel: number;
    defensePerLevel: number;
    speedPerLevel: number;
  };

  @Column({ nullable: true })
  avatarPath: string;

  @Column({ default: 1 })
  minLevel: number;

  @Column({ default: 100 })
  maxLevel: number;

  @Column({ default: 1 })
  rarity: number; // 1 = common, 2 = uncommon, 3 = rare, 4 = epic, 5 = legendary

  @Column({ default: 100 })
  experienceReward: number;

  @Column({ default: 50 })
  goldReward: number;

  @Column({ type: 'json', nullable: true })
  possibleDrops: {
    itemId: number;
    chance: number; // 0-100 percentage
    minQuantity: number;
    maxQuantity: number;
  }[];

  @Column({ type: 'json', nullable: true })
  resistances: {
    physical?: number; // 0-100 percentage
    magical?: number;
    fire?: number;
    ice?: number;
    lightning?: number;
    poison?: number;
    holy?: number;
  };

  @Column({ type: 'json', nullable: true })
  weaknesses: {
    physical?: number;
    magical?: number;
    fire?: number;
    ice?: number;
    lightning?: number;
    poison?: number;
    holy?: number;
  };

  @Column({ type: 'json', nullable: true })
  skills: {
    skillId: number;
    chance?: number; // Chance to use this skill
    cooldown?: number;
  }[];

  @Column({ type: 'json', nullable: true })
  aiBehavior: {
    aggression: number; // 0-100
    priority: 'weakest' | 'strongest' | 'random' | 'lowest_hp';
    skillUsage: 'conservative' | 'balanced' | 'aggressive';
    fleeThreshold?: number; // HP percentage to flee
  };

  @Column({ type: 'boolean', default: false })
  isBoss: boolean; // true = boss, false = normal enemy

  @Column({ type: 'json', nullable: true })
  dungeonDifficulty: {
    minDifficulty: number;
    maxDifficulty: number;
    preferredPosition?: 'early' | 'middle' | 'final';
  };

  @OneToMany(() => Enemy, enemy => enemy.template)
  enemies: Enemy[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
