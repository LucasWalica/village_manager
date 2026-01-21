import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { CharacterTemplate } from './character-template.entity';
import { CharacterStats } from './character-stats.entity';
import { Skill } from './skill.entity';
import { Inventory } from './inventory.entity';
import { BattleParticipant } from '../../combat/entities/battle-participant.entity';
import { DungeonRun } from '../../dungeons/entities/dungeon-run.entity';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

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

  @ManyToOne(() => User, user => user.characters, { eager: false })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => CharacterTemplate, template => template.characters, { eager: true })
  template: CharacterTemplate;

  @Column()
  templateId: number;

  @OneToMany(() => CharacterStats, stats => stats.character, { cascade: true })
  stats: CharacterStats[];

  @ManyToMany(() => Skill, skill => skill.characters, { eager: true })
  @JoinTable({
    name: 'character_skills',
    joinColumn: { name: 'character_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' }
  })
  skills: Skill[];

  @OneToMany(() => Inventory, inventory => inventory.character, { cascade: true })
  inventory: Inventory[];

  @OneToMany(() => BattleParticipant, participant => participant.character)
  battleParticipations: BattleParticipant[];

  @OneToMany(() => DungeonRun, run => run.character)
  dungeonRuns: DungeonRun[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
