import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EnemyTemplate } from './enemy-template.entity';
import { EnemyStats } from './enemy-stats.entity';
import { BattleParticipant } from '../../combat/entities/battle-participant.entity';
import { DungeonEncounter } from '../../dungeons/entities/dungeon-encounter.entity';

@Entity('enemies')
export class Enemy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 100 })
  currentHp: number;

  @Column({ default: 50 })
  currentMp: number;

  @Column({ default: false })
  isAlive: boolean;

  @Column({ nullable: true })
  avatarPath: string;

  @Column({ type: 'json', nullable: true })
  position: { x: number; y: number };

  @ManyToOne(() => EnemyTemplate, template => template.enemies, { eager: true })
  template: EnemyTemplate;

  @Column()
  templateId: number;

  @OneToMany(() => EnemyStats, stats => stats.enemy, { cascade: true })
  stats: EnemyStats[];

  @OneToMany(() => BattleParticipant, participant => participant.enemy)
  battleParticipations: BattleParticipant[];

  @OneToMany(() => DungeonEncounter, encounter => encounter.enemies)
  dungeonEncounters: DungeonEncounter[];

  @Column({ type: 'json', nullable: true })
  aiBehavior: {
    aggression: number; // 0-100
    priority: 'weakest' | 'strongest' | 'random' | 'lowest_hp';
    skillUsage: 'conservative' | 'balanced' | 'aggressive';
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
