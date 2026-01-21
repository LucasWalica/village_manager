import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Character } from './character.entity';

export enum CharacterType {
  GOBLIN = 'goblin',
  HALFLING = 'halfling',
  LIZARDFOLK = 'lizardfolk',
}

export enum CharacterClass {
  ARCHER = 'archer',
  FANATIC = 'fanatic',
  FIGHTER = 'fighter',
  OCCULTIST = 'occultist',
  WOLF_RIDER = 'wolf_rider',
  ASSASSIN = 'assassin',
  BARD = 'bard',
  RANGER = 'ranger',
  ROGUE = 'rogue',
  SLINGER = 'slinger',
  BESTIAL = 'bestial',
  GLADIATOR = 'gladiator',
  SCOUT = 'scout',
  SPEARMAN = 'spearman',
}

@Entity('character_templates')
export class CharacterTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CharacterType,
  })
  type: CharacterType;

  @Column({
    type: 'enum',
    enum: CharacterClass,
  })
  class: CharacterClass;

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

  @Column({ default: 12 })
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

  @Column({ default: true })
  isPlayable: boolean;

  @Column({ type: 'json', nullable: true })
  startingSkills: number[];

  @Column({ default: 1 })
  rarity: number; // 1 = common, 2 = uncommon, 3 = rare, 4 = epic, 5 = legendary

  @OneToMany(() => Character, character => character.template)
  characters: Character[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
