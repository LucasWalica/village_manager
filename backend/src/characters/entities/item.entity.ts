import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Inventory } from './inventory.entity';
import { BattleAction } from '../../combat/entities/battle-action.entity';

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  QUEST = 'quest',
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum EquipmentSlot {
  WEAPON = 'weapon',
  SHIELD = 'shield',
  HELMET = 'helmet',
  CHEST = 'chest',
  GLOVES = 'gloves',
  BOOTS = 'boots',
  RING = 'ring',
  NECKLACE = 'necklace',
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ItemType,
  })
  type: ItemType;

  @Column({
    type: 'enum',
    enum: ItemRarity,
  })
  rarity: ItemRarity;

  @Column({ nullable: true })
  iconPath: string;

  @Column({ default: 0 })
  baseValue: number; // Precio base en moneda del juego

  @Column({ default: 1 })
  maxStack: number; // Cantidad máxima en un stack

  @Column({ nullable: true })
  equipmentSlot: EquipmentSlot;

  @Column({ type: 'json', nullable: true })
  stats: {
    attack?: number;
    defense?: number;
    speed?: number;
    hp?: number;
    mp?: number;
    criticalRate?: number;
    criticalDamage?: number;
    evasion?: number;
    accuracy?: number;
    magicPower?: number;
    magicResistance?: number;
  };

  @Column({ type: 'json', nullable: true })
  effects: {
    type: string;
    value: number;
    duration?: number;
    chance?: number;
  }[];

  @Column({ type: 'json', nullable: true })
  requirements: {
    level?: number;
    class?: string[];
    stats?: Record<string, number>;
  };

  @Column({ type: 'json', nullable: true })
  consumableEffect: {
    healHp?: number;
    healMp?: number;
    temporaryBuff?: {
      stat: string;
      value: number;
      duration: number;
    };
    revive?: boolean;
  };

  @Column({ default: false })
  isTradeable: boolean;

  @Column({ default: false })
  isSellable: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Inventory, inventory => inventory.item)
  inventoryItems: Inventory[];

  @OneToMany(() => BattleAction, action => action.item)
  actions: BattleAction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
