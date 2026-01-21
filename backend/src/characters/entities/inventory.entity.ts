import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Character } from './character.entity';
import { Item } from './item.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ nullable: true })
  slotPosition: number;

  @Column({ default: false })
  isEquipped: boolean;

  @Column({ type: 'json', nullable: true })
  customProperties: {
    durability?: number;
    enchantmentLevel?: number;
    bonusStats?: Record<string, number>;
  };

  @ManyToOne(() => Character, character => character.inventory, { onDelete: 'CASCADE' })
  character: Character;

  @Column()
  characterId: number;

  @ManyToOne(() => Item, item => item.inventoryItems)
  item: Item;

  @Column()
  itemId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
