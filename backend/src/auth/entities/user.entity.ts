import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Character } from '../../characters/entities/character.entity';
import { Battle } from '../../combat/entities/battle.entity';
import { DungeonRun } from '../../dungeons/entities/dungeon-run.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  gold: number;

  @Column({ default: 1 })
  playerLevel: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ type: 'json', nullable: true })
  gameStats: {
    dungeonsCompleted: number;
    charactersCreated: number;
    totalBattles: number;
    victories: number;
    defeats: number;
    charactersLost: number;
  };

  @OneToMany(() => Character, character => character.user)
  characters: Character[];

  @OneToMany(() => Battle, battle => battle.user)
  battles: Battle[];

  @OneToMany(() => DungeonRun, run => run.user)
  dungeonRuns: DungeonRun[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
