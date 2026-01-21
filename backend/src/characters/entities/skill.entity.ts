import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Character } from './character.entity';
import { BattleAction } from '../../combat/entities/battle-action.entity';

export enum SkillType {
  ACTIVE = 'active',
  PASSIVE = 'passive',
}

export enum SkillTarget {
  SELF = 'self',
  SINGLE_ENEMY = 'single_enemy',
  ALL_ENEMIES = 'all_enemies',
  SINGLE_ALLY = 'single_ally',
  ALL_ALLIES = 'all_allies',
}

export enum DamageType {
  PHYSICAL = 'physical',
  MAGICAL = 'magical',
  HEALING = 'healing',
  STATUS = 'status',
}

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: SkillType,
  })
  type: SkillType;

  @Column({
    type: 'enum',
    enum: SkillTarget,
  })
  target: SkillTarget;

  @Column({
    type: 'enum',
    enum: DamageType,
  })
  damageType: DamageType;

  @Column({ default: 0 })
  mpCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  power: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  cooldown: number;

  @Column({ type: 'json', nullable: true })
  effects: {
    type: string;
    value: number;
    duration?: number;
    chance?: number;
  }[];

  @Column({ nullable: true })
  iconPath: string;

  @Column({ default: 1 })
  requiredLevel: number;

  @Column({ type: 'json', nullable: true })
  requirements: {
    skillId?: number;
    characterClass?: string;
    characterType?: string;
  };

  @Column({ default: false })
  isUltimate: boolean;

  @Column({ type: 'json', nullable: true })
  scaling: {
    attackPercent?: number;
    magicPowerPercent?: number;
    hpPercent?: number;
  };

  @ManyToMany(() => Character, character => character.skills)
  characters: Character[];

  @OneToMany(() => BattleAction, action => action.skill)
  actions: BattleAction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
