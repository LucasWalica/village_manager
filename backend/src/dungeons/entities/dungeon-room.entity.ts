import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Dungeon } from './dungeon.entity';
import { DungeonEncounter } from './dungeon-encounter.entity';

export enum RoomType {
  NORMAL = 'normal',
  MINIBOSS = 'miniboss',
  BOSS = 'boss',
  TREASURE = 'treasure',
  TRAP = 'trap',
  SHOP = 'shop',
  REST = 'rest',
}

@Entity('dungeon_rooms')
export class DungeonRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomNumber: number; // 1-5 en el sistema actual

  @Column({
    type: 'enum',
    enum: RoomType,
  })
  type: RoomType;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  layout: {
    width: number;
    height: number;
    obstacles?: { x: number; y: number; type: string }[];
    specialTiles?: { x: number; y: number; effect: string }[];
  };

  @Column({ type: 'json', nullable: true })
  environment: {
    terrain?: string;
    weather?: string;
    lighting?: string;
    background?: string;
  };

  @Column({ type: 'json', nullable: true })
  specialRules: {
    timeLimit?: number;
    noEscape?: boolean;
    statusEffects?: string[];
    statModifiers?: { stat: string; value: number }[];
  };

  @Column({ nullable: true })
  backgroundImage: string;

  @Column({ nullable: true })
  musicTrack: string;

  @Column({ type: 'json', nullable: true })
  rewards: {
    guaranteed?: { itemId: number; quantity: number }[];
    possible?: { itemId: number; chance: number; quantity: number }[];
    gold?: number;
    experience?: number;
  };

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isOptional: boolean; // Salas opcionales como tesoros

  @ManyToOne(() => Dungeon, dungeon => dungeon.rooms, { onDelete: 'CASCADE' })
  dungeon: Dungeon;

  @Column()
  dungeonId: number;

  @OneToMany(() => DungeonEncounter, encounter => encounter.room)
  encounters: DungeonEncounter[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
