import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Character } from './character.entity';

export enum StatType {
  HP = 'hp',
  MP = 'mp',
  ATTACK = 'attack',
  DEFENSE = 'defense',
  SPEED = 'speed',
  CRITICAL_RATE = 'critical_rate',
  CRITICAL_DAMAGE = 'critical_damage',
  EVASION = 'evasion',
  ACCURACY = 'accuracy',
  MAGIC_POWER = 'magic_power',
  MAGIC_RESISTANCE = 'magic_resistance',
}

@Entity('character_stats')
export class CharacterStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: StatType,
  })
  statType: StatType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bonusValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  multiplier: number;

  @ManyToOne(() => Character, character => character.stats, { onDelete: 'CASCADE' })
  character: Character;

  @Column()
  characterId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Método helper para calcular el valor total
  get totalValue(): number {
    return Number((this.baseValue + this.bonusValue) * this.multiplier);
  }
}
