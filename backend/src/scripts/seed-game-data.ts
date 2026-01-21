import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { CharacterTemplate, CharacterType, CharacterClass } from '../characters/entities/character-template.entity';
import { EnemyTemplate, EnemyType, EnemyClass } from '../enemies/entities/enemy-template.entity';
import { Item, ItemType, ItemRarity, EquipmentSlot } from '../characters/entities/item.entity';
import { Skill, SkillType, SkillTarget, DamageType } from '../characters/entities/skill.entity';
import { Character } from '../characters/entities/character.entity';
import { Enemy } from '../enemies/entities/enemy.entity';
import { CharacterStats } from '../characters/entities/character-stats.entity';
import { EnemyStats } from '../enemies/entities/enemy-stats.entity';
import { Inventory } from '../characters/entities/inventory.entity';

interface CharacterData {
  name: string;
  type: CharacterType;
  class: CharacterClass;
  description: string;
  baseHp: number;
  baseMp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  avatarPath: string;
  statGrowth: {
    hpPerLevel: number;
    mpPerLevel: number;
    attackPerLevel: number;
    defensePerLevel: number;
    speedPerLevel: number;
  };
  rarity: number;
  startingSkills: string[];
}

interface EnemyData {
  name: string;
  type: EnemyType;
  class: EnemyClass;
  description: string;
  baseHp: number;
  baseMp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  avatarPath: string;
  minLevel: number;
  maxLevel: number;
  rarity: number;
  experienceReward: number;
  goldReward: number;
  isBoss: boolean;
  statGrowth: {
    hpPerLevel: number;
    mpPerLevel: number;
    attackPerLevel: number;
    defensePerLevel: number;
    speedPerLevel: number;
  };
  aiBehavior: {
    aggression: number;
    priority: 'weakest' | 'strongest' | 'random' | 'lowest_hp';
    skillUsage: 'conservative' | 'balanced' | 'aggressive';
    fleeThreshold?: number;
  };
  resistances?: any;
  weaknesses?: any;
  possibleDrops?: any[];
}

interface ItemData {
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  iconPath?: string;
  baseValue: number;
  maxStack: number;
  equipmentSlot?: EquipmentSlot;
  stats?: any;
  effects?: any;
  requirements?: any;
  consumableEffect?: any;
  isTradeable: boolean;
  isSellable: boolean;
}

interface SkillData {
  name: string;
  description: string;
  type: SkillType;
  target: SkillTarget;
  damageType: DamageType;
  mpCost: number;
  power: number;
  cooldown: number;
  effects?: any;
  iconPath?: string;
  requiredLevel: number;
  requirements?: any;
  isUltimate: boolean;
  scaling?: any;
}

async function seedGameData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting game data seeding...');

  try {
    // Get repositories
    const characterTemplateRepo = dataSource.getRepository(CharacterTemplate);
    const enemyTemplateRepo = dataSource.getRepository(EnemyTemplate);
    const itemRepo = dataSource.getRepository(Item);
    const skillRepo = dataSource.getRepository(Skill);

    // Clear existing data in correct order (respecting foreign key constraints)
    console.log('🧹 Clearing existing data...');
    
    // Get all repositories that might have foreign key dependencies
    const characterRepo = dataSource.getRepository(Character);
    const enemyRepo = dataSource.getRepository(Enemy);
    const characterStatsRepo = dataSource.getRepository(CharacterStats);
    const enemyStatsRepo = dataSource.getRepository(EnemyStats);
    const inventoryRepo = dataSource.getRepository(Inventory);
    
    // Use raw SQL with CASCADE to handle foreign key constraints properly
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      // Disable foreign key constraints temporarily
      await queryRunner.query('SET session_replication_role = replica;');
      
      // Clear all data in correct order
      await queryRunner.query('TRUNCATE TABLE "character_stats" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "enemy_stats" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "inventory" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "characters" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "enemies" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "character_templates" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "enemy_templates" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "items" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "skills" CASCADE');
      
      // Re-enable foreign key constraints
      await queryRunner.query('SET session_replication_role = DEFAULT;');
      
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    console.log('✨ Creating skills...');
    const createdSkills = await createSkills(skillRepo);

    console.log('🧪 Creating items...');
    await createItems(itemRepo);

    console.log('👥 Creating character templates...');
    await createCharacterTemplates(characterTemplateRepo, createdSkills);

    console.log('👹 Creating enemy templates...');
    await createEnemyTemplates(enemyTemplateRepo, createdSkills);

    console.log('✅ Game data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

async function createSkills(skillRepo: any): Promise<Map<string, number>> {
  const skillMap = new Map<string, number>();
  const skills: SkillData[] = [
    // Basic Attack Skills
    {
      name: 'Slash',
      description: 'A basic sword attack',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.PHYSICAL,
      mpCost: 0,
      power: 100,
      cooldown: 0,
      requiredLevel: 1,
      isUltimate: false,
      scaling: { attackPercent: 100 }
    },
    {
      name: 'Power Strike',
      description: 'A powerful melee attack',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.PHYSICAL,
      mpCost: 10,
      power: 150,
      cooldown: 2,
      requiredLevel: 3,
      isUltimate: false,
      scaling: { attackPercent: 150 }
    },
    {
      name: 'Arrow Shot',
      description: 'A precise arrow attack',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.PHYSICAL,
      mpCost: 5,
      power: 120,
      cooldown: 1,
      requiredLevel: 1,
      isUltimate: false,
      scaling: { attackPercent: 120 }
    },
    {
      name: 'Multi Shot',
      description: 'Shoot multiple arrows at enemies',
      type: SkillType.ACTIVE,
      target: SkillTarget.ALL_ENEMIES,
      damageType: DamageType.PHYSICAL,
      mpCost: 20,
      power: 80,
      cooldown: 3,
      requiredLevel: 5,
      isUltimate: false,
      scaling: { attackPercent: 80 }
    },
    {
      name: 'Sling Shot',
      description: 'A quick sling attack',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.PHYSICAL,
      mpCost: 3,
      power: 90,
      cooldown: 1,
      requiredLevel: 1,
      isUltimate: false,
      scaling: { attackPercent: 90 }
    },
    {
      name: 'Spear Thrust',
      description: 'A powerful spear thrust',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.PHYSICAL,
      mpCost: 8,
      power: 130,
      cooldown: 2,
      requiredLevel: 2,
      isUltimate: false,
      scaling: { attackPercent: 130 }
    },
    // Magic Skills
    {
      name: 'Fireball',
      description: 'Launch a fireball at enemy',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.MAGICAL,
      mpCost: 15,
      power: 130,
      cooldown: 2,
      requiredLevel: 2,
      isUltimate: false,
      scaling: { magicPowerPercent: 130 }
    },
    {
      name: 'Lightning Bolt',
      description: 'Strike with lightning',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.MAGICAL,
      mpCost: 20,
      power: 160,
      cooldown: 3,
      requiredLevel: 4,
      isUltimate: false,
      scaling: { magicPowerPercent: 160 }
    },
    {
      name: 'Shadow Bolt',
      description: 'A dark magic attack',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.MAGICAL,
      mpCost: 12,
      power: 110,
      cooldown: 2,
      requiredLevel: 2,
      isUltimate: false,
      scaling: { magicPowerPercent: 110 }
    },
    // Healing Skills
    {
      name: 'Heal',
      description: 'Restore HP to an ally',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ALLY,
      damageType: DamageType.HEALING,
      mpCost: 10,
      power: 100,
      cooldown: 2,
      requiredLevel: 1,
      isUltimate: false,
      scaling: { magicPowerPercent: 100 }
    },
    {
      name: 'Group Heal',
      description: 'Restore HP to all allies',
      type: SkillType.ACTIVE,
      target: SkillTarget.ALL_ALLIES,
      damageType: DamageType.HEALING,
      mpCost: 25,
      power: 60,
      cooldown: 4,
      requiredLevel: 6,
      isUltimate: false,
      scaling: { magicPowerPercent: 60 }
    },
    // Buff/Debuff Skills
    {
      name: 'War Cry',
      description: 'Increase attack power of all allies',
      type: SkillType.ACTIVE,
      target: SkillTarget.ALL_ALLIES,
      damageType: DamageType.STATUS,
      mpCost: 15,
      power: 0,
      cooldown: 4,
      effects: [{
        type: 'attack_boost',
        value: 20,
        duration: 3
      }],
      requiredLevel: 3,
      isUltimate: false
    },
    {
      name: 'Poison',
      description: 'Poison an enemy, dealing damage over time',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.STATUS,
      mpCost: 12,
      power: 50,
      cooldown: 2,
      effects: [{
        type: 'poison',
        value: 20,
        duration: 3
      }],
      requiredLevel: 2,
      isUltimate: false
    },
    {
      name: 'Curse',
      description: 'Curse an enemy, reducing their defense',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.STATUS,
      mpCost: 15,
      power: 0,
      cooldown: 3,
      effects: [{
        type: 'defense_debuff',
        value: 25,
        duration: 3
      }],
      requiredLevel: 3,
      isUltimate: false
    },
    // Ultimate Skills
    {
      name: 'Berserker Rage',
      description: 'Enter a rage state, massively increasing attack power',
      type: SkillType.ACTIVE,
      target: SkillTarget.SELF,
      damageType: DamageType.STATUS,
      mpCost: 30,
      power: 0,
      cooldown: 8,
      effects: [{
        type: 'attack_boost',
        value: 50,
        duration: 4
      }],
      requiredLevel: 8,
      isUltimate: true
    },
    {
      name: 'Meteor Storm',
      description: 'Call down a meteor storm on all enemies',
      type: SkillType.ACTIVE,
      target: SkillTarget.ALL_ENEMIES,
      damageType: DamageType.MAGICAL,
      mpCost: 50,
      power: 200,
      cooldown: 10,
      requiredLevel: 10,
      isUltimate: true,
      scaling: { magicPowerPercent: 200 }
    },
    {
      name: 'Assassinate',
      description: 'A deadly assassination attempt with high critical chance',
      type: SkillType.ACTIVE,
      target: SkillTarget.SINGLE_ENEMY,
      damageType: DamageType.PHYSICAL,
      mpCost: 25,
      power: 250,
      cooldown: 6,
      effects: [{
        type: 'critical_boost',
        value: 50
      }],
      requiredLevel: 7,
      isUltimate: true,
      scaling: { attackPercent: 250 }
    },
    // Passive Skills
    {
      name: 'Evasion',
      description: 'Increases evasion chance',
      type: SkillType.PASSIVE,
      target: SkillTarget.SELF,
      damageType: DamageType.STATUS,
      mpCost: 0,
      power: 0,
      cooldown: 0,
      effects: [{
        type: 'evasion_boost',
        value: 15
      }],
      requiredLevel: 4,
      isUltimate: false
    },
    {
      name: 'Regeneration',
      description: 'Regenerate HP each turn',
      type: SkillType.PASSIVE,
      target: SkillTarget.SELF,
      damageType: DamageType.HEALING,
      mpCost: 0,
      power: 10,
      cooldown: 0,
      effects: [{
        type: 'regeneration',
        value: 10
      }],
      requiredLevel: 5,
      isUltimate: false
    },
    {
      name: 'Magic Resistance',
      description: 'Increases magical defense',
      type: SkillType.PASSIVE,
      target: SkillTarget.SELF,
      damageType: DamageType.STATUS,
      mpCost: 0,
      power: 0,
      cooldown: 0,
      effects: [{
        type: 'magic_resistance_boost',
        value: 20
      }],
      requiredLevel: 3,
      isUltimate: false
    }
  ];

  for (const skillData of skills) {
    const skill = skillRepo.create(skillData);
    const savedSkill = await skillRepo.save(skill);
    skillMap.set(skillData.name, savedSkill.id);
    console.log(`  ✅ Created skill: ${skillData.name}`);
  }

  return skillMap;
}

async function createItems(itemRepo: any) {
  // Materials for crafting
  const materials: ItemData[] = [
    {
      name: 'Herb',
      description: 'A common herb used in potion making',
      type: ItemType.MATERIAL,
      rarity: ItemRarity.COMMON,
      baseValue: 5,
      maxStack: 99,
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Crystal Shard',
      description: 'A magical crystal shard',
      type: ItemType.MATERIAL,
      rarity: ItemRarity.UNCOMMON,
      baseValue: 20,
      maxStack: 99,
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Monster Essence',
      description: 'Essence extracted from defeated monsters',
      type: ItemType.MATERIAL,
      rarity: ItemRarity.UNCOMMON,
      baseValue: 15,
      maxStack: 99,
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Dragon Scale',
      description: 'A rare dragon scale',
      type: ItemType.MATERIAL,
      rarity: ItemRarity.RARE,
      baseValue: 100,
      maxStack: 99,
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Phoenix Feather',
      description: 'A feather from a phoenix',
      type: ItemType.MATERIAL,
      rarity: ItemRarity.EPIC,
      baseValue: 500,
      maxStack: 99,
      isTradeable: true,
      isSellable: true
    }
  ];

  // Potions
  const potions: ItemData[] = [
    {
      name: 'Health Potion',
      description: 'Restores 50 HP',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.COMMON,
      baseValue: 25,
      maxStack: 10,
      consumableEffect: {
        healHp: 50
      },
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Greater Health Potion',
      description: 'Restores 150 HP',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.UNCOMMON,
      baseValue: 75,
      maxStack: 10,
      consumableEffect: {
        healHp: 150
      },
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Mana Potion',
      description: 'Restores 30 MP',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.COMMON,
      baseValue: 30,
      maxStack: 10,
      consumableEffect: {
        healMp: 30
      },
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Strength Potion',
      description: 'Increases attack by 10 for 5 turns',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.UNCOMMON,
      baseValue: 50,
      maxStack: 5,
      consumableEffect: {
        temporaryBuff: {
          stat: 'attack',
          value: 10,
          duration: 5
        }
      },
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Defense Potion',
      description: 'Increases defense by 10 for 5 turns',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.UNCOMMON,
      baseValue: 50,
      maxStack: 5,
      consumableEffect: {
        temporaryBuff: {
          stat: 'defense',
          value: 10,
          duration: 5
        }
      },
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Speed Potion',
      description: 'Increases speed by 5 for 5 turns',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.UNCOMMON,
      baseValue: 40,
      maxStack: 5,
      consumableEffect: {
        temporaryBuff: {
          stat: 'speed',
          value: 5,
          duration: 5
        }
      },
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Revival Potion',
      description: 'Revives a fallen character with 25% HP',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.RARE,
      baseValue: 200,
      maxStack: 3,
      consumableEffect: {
        revive: true,
        healHp: 25
      },
      isTradeable: true,
      isSellable: true
    }
  ];

  // Basic Equipment
  const equipment: ItemData[] = [
    {
      name: 'Iron Sword',
      description: 'A basic iron sword',
      type: ItemType.WEAPON,
      rarity: ItemRarity.COMMON,
      baseValue: 100,
      maxStack: 1,
      equipmentSlot: EquipmentSlot.WEAPON,
      stats: {
        attack: 15
      },
      requirements: {
        level: 1
      },
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Wooden Bow',
      description: 'A simple wooden bow',
      type: ItemType.WEAPON,
      rarity: ItemRarity.COMMON,
      baseValue: 80,
      maxStack: 1,
      equipmentSlot: EquipmentSlot.WEAPON,
      stats: {
        attack: 12,
        speed: 2
      },
      requirements: {
        level: 1
      },
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Magic Wand',
      description: 'A basic magic wand',
      type: ItemType.WEAPON,
      rarity: ItemRarity.COMMON,
      baseValue: 90,
      maxStack: 1,
      equipmentSlot: EquipmentSlot.WEAPON,
      stats: {
        magicPower: 18,
        mp: 10
      },
      requirements: {
        level: 1
      },
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Leather Armor',
      description: 'Basic leather armor',
      type: ItemType.ARMOR,
      rarity: ItemRarity.COMMON,
      baseValue: 60,
      maxStack: 1,
      equipmentSlot: EquipmentSlot.CHEST,
      stats: {
        defense: 10
      },
      requirements: {
        level: 1
      },
      isTradeable: true,
      isSellable: true
    },
    {
      name: 'Iron Shield',
      description: 'A sturdy iron shield',
      type: ItemType.ARMOR,
      rarity: ItemRarity.COMMON,
      baseValue: 50,
      maxStack: 1,
      equipmentSlot: EquipmentSlot.SHIELD,
      stats: {
        defense: 8,
        hp: 5
      },
      requirements: {
        level: 2
      },
      isTradeable: true,
      isSellable: true
    }
  ];

  const allItems = [...materials, ...potions, ...equipment];

  for (const itemData of allItems) {
    const item = itemRepo.create(itemData);
    await itemRepo.save(item);
    console.log(`  ✅ Created item: ${itemData.name}`);
  }
}

async function createCharacterTemplates(characterTemplateRepo: any, skillMap: Map<string, number>) {
  const characterTemplates: CharacterData[] = [
    // Goblin Characters
    {
      name: 'Goblin Archer',
      type: CharacterType.GOBLIN,
      class: CharacterClass.ARCHER,
      description: 'A quick and precise goblin archer',
      baseHp: 80,
      baseMp: 40,
      baseAttack: 12,
      baseDefense: 8,
      baseSpeed: 14,
      avatarPath: 'assets/Basic Humanoid Animations/goblin archer/GoblinArcher.png',
      statGrowth: {
        hpPerLevel: 8,
        mpPerLevel: 3,
        attackPerLevel: 2,
        defensePerLevel: 1,
        speedPerLevel: 2
      },
      rarity: 1,
      startingSkills: ['Arrow Shot', 'Multi Shot']
    },
    {
      name: 'Goblin Fighter',
      type: CharacterType.GOBLIN,
      class: CharacterClass.FIGHTER,
      description: 'A tough goblin warrior',
      baseHp: 100,
      baseMp: 20,
      baseAttack: 14,
      baseDefense: 12,
      baseSpeed: 8,
      avatarPath: 'assets/Basic Humanoid Animations/goblin fighter/GoblinFighter.png',
      statGrowth: {
        hpPerLevel: 12,
        mpPerLevel: 1,
        attackPerLevel: 2,
        defensePerLevel: 2,
        speedPerLevel: 1
      },
      rarity: 1,
      startingSkills: ['Slash', 'Power Strike']
    },
    {
      name: 'Goblin Occultist',
      type: CharacterType.GOBLIN,
      class: CharacterClass.OCCULTIST,
      description: 'A mysterious goblin magic user',
      baseHp: 70,
      baseMp: 60,
      baseAttack: 8,
      baseDefense: 6,
      baseSpeed: 10,
      avatarPath: 'assets/Basic Humanoid Animations/goblin occultist/GoblinOccultist.png',
      statGrowth: {
        hpPerLevel: 6,
        mpPerLevel: 5,
        attackPerLevel: 1,
        defensePerLevel: 1,
        speedPerLevel: 1
      },
      rarity: 2,
      startingSkills: ['Fireball', 'Poison']
    },
    {
      name: 'Goblin Wolf Rider',
      type: CharacterType.GOBLIN,
      class: CharacterClass.WOLF_RIDER,
      description: 'A fast goblin riding a wolf',
      baseHp: 90,
      baseMp: 30,
      baseAttack: 13,
      baseDefense: 9,
      baseSpeed: 16,
      avatarPath: 'assets/Basic Humanoid Animations/goblin wolf rider/GoblinWolfRider.png',
      statGrowth: {
        hpPerLevel: 9,
        mpPerLevel: 2,
        attackPerLevel: 2,
        defensePerLevel: 1,
        speedPerLevel: 3
      },
      rarity: 2,
      startingSkills: ['Slash', 'Evasion']
    },
    {
      name: 'Goblin Fanatic',
      type: CharacterType.GOBLIN,
      class: CharacterClass.FANATIC,
      description: 'A fanatical goblin berserker',
      baseHp: 85,
      baseMp: 25,
      baseAttack: 15,
      baseDefense: 7,
      baseSpeed: 11,
      avatarPath: 'assets/Basic Humanoid Animations/goblin fanatic/GoblinFanatic.png',
      statGrowth: {
        hpPerLevel: 8,
        mpPerLevel: 2,
        attackPerLevel: 3,
        defensePerLevel: 1,
        speedPerLevel: 1
      },
      rarity: 2,
      startingSkills: ['Power Strike', 'Berserker Rage']
    },
    // Halfling Characters
    {
      name: 'Halfling Rogue',
      type: CharacterType.HALFLING,
      class: CharacterClass.ROGUE,
      description: 'A sneaky halfling rogue',
      baseHp: 75,
      baseMp: 35,
      baseAttack: 11,
      baseDefense: 9,
      baseSpeed: 15,
      avatarPath: 'assets/Basic Humanoid Animations/halfling rogue/HalflingRogue.png',
      statGrowth: {
        hpPerLevel: 7,
        mpPerLevel: 3,
        attackPerLevel: 2,
        defensePerLevel: 1,
        speedPerLevel: 2
      },
      rarity: 1,
      startingSkills: ['Slash', 'Evasion']
    },
    {
      name: 'Halfling Ranger',
      type: CharacterType.HALFLING,
      class: CharacterClass.RANGER,
      description: 'A skilled halfling ranger',
      baseHp: 85,
      baseMp: 40,
      baseAttack: 12,
      baseDefense: 10,
      baseSpeed: 13,
      avatarPath: 'assets/Basic Humanoid Animations/halfling ranger/HalflingRanger.png',
      statGrowth: {
        hpPerLevel: 8,
        mpPerLevel: 3,
        attackPerLevel: 2,
        defensePerLevel: 1,
        speedPerLevel: 2
      },
      rarity: 1,
      startingSkills: ['Arrow Shot', 'Multi Shot']
    },
    {
      name: 'Halfling Bard',
      type: CharacterType.HALFLING,
      class: CharacterClass.BARD,
      description: 'A charismatic halfling bard',
      baseHp: 70,
      baseMp: 50,
      baseAttack: 9,
      baseDefense: 8,
      baseSpeed: 11,
      avatarPath: 'assets/Basic Humanoid Animations/halfling bard/HalflingBard.png',
      statGrowth: {
        hpPerLevel: 6,
        mpPerLevel: 4,
        attackPerLevel: 1,
        defensePerLevel: 1,
        speedPerLevel: 1
      },
      rarity: 2,
      startingSkills: ['Heal', 'War Cry']
    },
    {
      name: 'Halfling Assassin',
      type: CharacterType.HALFLING,
      class: CharacterClass.ASSASSIN,
      description: 'A deadly halfling assassin',
      baseHp: 70,
      baseMp: 30,
      baseAttack: 16,
      baseDefense: 7,
      baseSpeed: 14,
      avatarPath: 'assets/Basic Humanoid Animations/halfling assassin/HalflingAssassin.png',
      statGrowth: {
        hpPerLevel: 6,
        mpPerLevel: 2,
        attackPerLevel: 3,
        defensePerLevel: 1,
        speedPerLevel: 2
      },
      rarity: 2,
      startingSkills: ['Slash', 'Assassinate']
    },
    {
      name: 'Halfling Slinger',
      type: CharacterType.HALFLING,
      class: CharacterClass.SLINGER,
      description: 'A quick halfling slinger',
      baseHp: 75,
      baseMp: 35,
      baseAttack: 10,
      baseDefense: 8,
      baseSpeed: 14,
      avatarPath: 'assets/Basic Humanoid Animations/halfling slinger/HalflingSlinger.png',
      statGrowth: {
        hpPerLevel: 7,
        mpPerLevel: 3,
        attackPerLevel: 2,
        defensePerLevel: 1,
        speedPerLevel: 2
      },
      rarity: 1,
      startingSkills: ['Sling Shot', 'Multi Shot']
    },
    // Lizardfolk Characters
    {
      name: 'Lizardfolk Archer',
      type: CharacterType.LIZARDFOLK,
      class: CharacterClass.ARCHER,
      description: 'A resilient lizardfolk archer',
      baseHp: 90,
      baseMp: 35,
      baseAttack: 13,
      baseDefense: 11,
      baseSpeed: 12,
      avatarPath: 'assets/Basic Humanoid Animations/lizardfolk archer/LizardfolkArcher.png',
      statGrowth: {
        hpPerLevel: 10,
        mpPerLevel: 2,
        attackPerLevel: 2,
        defensePerLevel: 2,
        speedPerLevel: 1
      },
      rarity: 1,
      startingSkills: ['Arrow Shot', 'Multi Shot']
    },
    {
      name: 'Lizardfolk Gladiator',
      type: CharacterType.LIZARDFOLK,
      class: CharacterClass.GLADIATOR,
      description: 'A heavily armored lizardfolk gladiator',
      baseHp: 110,
      baseMp: 25,
      baseAttack: 15,
      baseDefense: 14,
      baseSpeed: 7,
      avatarPath: 'assets/Basic Humanoid Animations/lizardfolk gladiator/LizardfolkGladiator.png',
      statGrowth: {
        hpPerLevel: 13,
        mpPerLevel: 1,
        attackPerLevel: 2,
        defensePerLevel: 2,
        speedPerLevel: 1
      },
      rarity: 2,
      startingSkills: ['Slash', 'Power Strike']
    },
    {
      name: 'Lizardfolk Scout',
      type: CharacterType.LIZARDFOLK,
      class: CharacterClass.SCOUT,
      description: 'A fast lizardfolk scout',
      baseHp: 85,
      baseMp: 30,
      baseAttack: 12,
      baseDefense: 9,
      baseSpeed: 15,
      avatarPath: 'assets/Basic Humanoid Animations/lizardfolk scout/LizardfolkScout.png',
      statGrowth: {
        hpPerLevel: 8,
        mpPerLevel: 2,
        attackPerLevel: 2,
        defensePerLevel: 1,
        speedPerLevel: 3
      },
      rarity: 1,
      startingSkills: ['Spear Thrust', 'Evasion']
    },
    {
      name: 'Lizardfolk Spearman',
      type: CharacterType.LIZARDFOLK,
      class: CharacterClass.SPEARMAN,
      description: 'A defensive lizardfolk spearman',
      baseHp: 95,
      baseMp: 30,
      baseAttack: 13,
      baseDefense: 13,
      baseSpeed: 9,
      avatarPath: 'assets/Basic Humanoid Animations/lizardfolk spearman/LizardfolkSpearman.png',
      statGrowth: {
        hpPerLevel: 11,
        mpPerLevel: 2,
        attackPerLevel: 2,
        defensePerLevel: 2,
        speedPerLevel: 1
      },
      rarity: 1,
      startingSkills: ['Spear Thrust', 'Power Strike']
    },
    {
      name: 'Bestial Lizardfolk',
      type: CharacterType.LIZARDFOLK,
      class: CharacterClass.BESTIAL,
      description: 'A wild bestial lizardfolk',
      baseHp: 100,
      baseMp: 20,
      baseAttack: 16,
      baseDefense: 10,
      baseSpeed: 12,
      avatarPath: 'assets/Basic Humanoid Animations/bestial lizardfolk/BestialLizardfolk.png',
      statGrowth: {
        hpPerLevel: 10,
        mpPerLevel: 1,
        attackPerLevel: 3,
        defensePerLevel: 1,
        speedPerLevel: 2
      },
      rarity: 2,
      startingSkills: ['Slash', 'Berserker Rage']
    }
  ];

  for (const characterData of characterTemplates) {
    const startingSkillIds = characterData.startingSkills.map(skillName => skillMap.get(skillName)).filter(id => id !== undefined);
    
    const characterTemplate = characterTemplateRepo.create({
      ...characterData,
      startingSkills: startingSkillIds,
      isPlayable: true
    });
    await characterTemplateRepo.save(characterTemplate);
    console.log(`  ✅ Created character template: ${characterData.name}`);
  }
}

async function createEnemyTemplates(enemyTemplateRepo: any, skillMap: Map<string, number>) {
  const enemyTemplates: EnemyData[] = [
    // Demon Enemies
    {
      name: 'Crimson Imp',
      type: EnemyType.DEMON,
      class: EnemyClass.IMP,
      description: 'A small but aggressive fire demon',
      baseHp: 60,
      baseMp: 30,
      baseAttack: 12,
      baseDefense: 6,
      baseSpeed: 14,
      avatarPath: 'assets/basic_demon_animations/crimson imp/CrimsonImp.png',
      minLevel: 1,
      maxLevel: 10,
      rarity: 1,
      experienceReward: 30,
      goldReward: 15,
      isBoss: false,
      statGrowth: {
        hpPerLevel: 6,
        mpPerLevel: 2,
        attackPerLevel: 2,
        defensePerLevel: 1,
        speedPerLevel: 2
      },
      aiBehavior: {
        aggression: 70,
        priority: 'weakest',
        skillUsage: 'aggressive'
      },
      resistances: {
        fire: 50
      },
      weaknesses: {
        holy: 50
      }
    },
    {
      name: 'Antlered Rascal',
      type: EnemyType.DEMON,
      class: EnemyClass.RASCAL,
      description: 'A tricky demon with antlers',
      baseHp: 70,
      baseMp: 25,
      baseAttack: 11,
      baseDefense: 8,
      baseSpeed: 13,
      avatarPath: 'assets/basic_demon_animations/antlered rascal/AntleredRascal.png',
      minLevel: 2,
      maxLevel: 12,
      rarity: 1,
      experienceReward: 35,
      goldReward: 20,
      isBoss: false,
      statGrowth: {
        hpPerLevel: 7,
        mpPerLevel: 2,
        attackPerLevel: 2,
        defensePerLevel: 1,
        speedPerLevel: 2
      },
      aiBehavior: {
        aggression: 60,
        priority: 'random',
        skillUsage: 'balanced'
      }
    },
    {
      name: 'Clawed Abomination',
      type: EnemyType.DEMON,
      class: EnemyClass.ABOMINATION,
      description: 'A horrifying demon with massive claws',
      baseHp: 120,
      baseMp: 20,
      baseAttack: 18,
      baseDefense: 10,
      baseSpeed: 8,
      avatarPath: 'assets/basic_demon_animations/clawed abomination/ClawedAbomination.png',
      minLevel: 8,
      maxLevel: 20,
      rarity: 3,
      experienceReward: 100,
      goldReward: 60,
      isBoss: false,
      statGrowth: {
        hpPerLevel: 12,
        mpPerLevel: 1,
        attackPerLevel: 3,
        defensePerLevel: 2,
        speedPerLevel: 1
      },
      aiBehavior: {
        aggression: 85,
        priority: 'strongest',
        skillUsage: 'aggressive'
      },
      resistances: {
        physical: 25
      }
    },
    {
      name: 'Depraved Blackguard',
      type: EnemyType.DEMON,
      class: EnemyClass.BLACKGUARD,
      description: 'A corrupted knight serving dark forces',
      baseHp: 100,
      baseMp: 30,
      baseAttack: 15,
      baseDefense: 14,
      baseSpeed: 9,
      avatarPath: 'assets/basic_demon_animations/Depraved Blackguard/DepravedBlackguard.png',
      minLevel: 6,
      maxLevel: 18,
      rarity: 2,
      experienceReward: 80,
      goldReward: 50,
      isBoss: false,
      statGrowth: {
        hpPerLevel: 10,
        mpPerLevel: 2,
        attackPerLevel: 2,
        defensePerLevel: 2,
        speedPerLevel: 1
      },
      aiBehavior: {
        aggression: 75,
        priority: 'weakest',
        skillUsage: 'balanced'
      },
      resistances: {
        magical: 30
      }
    },
    {
      name: 'Fledgling Demon',
      type: EnemyType.DEMON,
      class: EnemyClass.DEMONSPAWN,
      description: 'A young demon learning its powers',
      baseHp: 80,
      baseMp: 40,
      baseAttack: 13,
      baseDefense: 9,
      baseSpeed: 11,
      avatarPath: 'assets/basic_demon_animations/fledgling demon/FledglingDemon.png',
      minLevel: 3,
      maxLevel: 15,
      rarity: 1,
      experienceReward: 50,
      goldReward: 30,
      isBoss: false,
      statGrowth: {
        hpPerLevel: 8,
        mpPerLevel: 3,
        attackPerLevel: 2,
        defensePerLevel: 1,
        speedPerLevel: 2
      },
      aiBehavior: {
        aggression: 65,
        priority: 'random',
        skillUsage: 'balanced'
      }
    },
    // Monster Enemies
    {
      name: 'Brawny Ogre',
      type: EnemyType.MONSTER,
      class: EnemyClass.OGRE,
      description: 'A large and powerful ogre',
      baseHp: 140,
      baseMp: 10,
      baseAttack: 20,
      baseDefense: 12,
      baseSpeed: 6,
      avatarPath: 'assets/Basic Monster Animations/Brawny Ogre/BrawnyOgre.png',
      minLevel: 7,
      maxLevel: 20,
      rarity: 2,
      experienceReward: 90,
      goldReward: 55,
      isBoss: false,
      statGrowth: {
        hpPerLevel: 14,
        mpPerLevel: 1,
        attackPerLevel: 3,
        defensePerLevel: 2,
        speedPerLevel: 1
      },
      aiBehavior: {
        aggression: 80,
        priority: 'strongest',
        skillUsage: 'aggressive'
      },
      resistances: {
        physical: 30
      },
      weaknesses: {
        magical: 25
      }
    },
    {
      name: 'Death Slime',
      type: EnemyType.MONSTER,
      class: EnemyClass.SLIME,
      description: 'A corrosive death slime',
      baseHp: 90,
      baseMp: 20,
      baseAttack: 10,
      baseDefense: 15,
      baseSpeed: 7,
      avatarPath: 'assets/Basic Monster Animations/Death Slime/DeathSlime.png',
      minLevel: 4,
      maxLevel: 16,
      rarity: 1,
      experienceReward: 60,
      goldReward: 35,
      isBoss: false,
      statGrowth: {
        hpPerLevel: 9,
        mpPerLevel: 2,
        attackPerLevel: 2,
        defensePerLevel: 2,
        speedPerLevel: 1
      },
      aiBehavior: {
        aggression: 55,
        priority: 'weakest',
        skillUsage: 'conservative'
      },
      resistances: {
        physical: 40
      },
      weaknesses: {
        fire: 50
      }
    },
    {
      name: 'Crushing Cyclops',
      type: EnemyType.MONSTER,
      class: EnemyClass.CYCLOPS,
      description: 'A one-eyed giant with immense strength',
      baseHp: 160,
      baseMp: 15,
      baseAttack: 22,
      baseDefense: 11,
      baseSpeed: 5,
      avatarPath: 'assets/Basic Monster Animations/Crushing Cyclops/CrushingCyclops.png',
      minLevel: 10,
      maxLevel: 25,
      rarity: 3,
      experienceReward: 120,
      goldReward: 80,
      isBoss: false,
      statGrowth: {
        hpPerLevel: 16,
        mpPerLevel: 1,
        attackPerLevel: 3,
        defensePerLevel: 2,
        speedPerLevel: 1
      },
      aiBehavior: {
        aggression: 90,
        priority: 'strongest',
        skillUsage: 'aggressive'
      },
      resistances: {
        physical: 35
      }
    },
    // Undead Bosses
    {
      name: 'Skeleton Warrior',
      type: EnemyType.UNDEAD_BOSS,
      class: EnemyClass.UNDEAD_WARRIOR,
      description: 'An armored skeleton warrior',
      baseHp: 200,
      baseMp: 30,
      baseAttack: 25,
      baseDefense: 20,
      baseSpeed: 8,
      avatarPath: 'assets/10 Undead JRPG characters 1.0/Original Size 1х/Pallete 1/Skeleton.png',
      minLevel: 15,
      maxLevel: 30,
      rarity: 3,
      experienceReward: 300,
      goldReward: 200,
      isBoss: true,
      statGrowth: {
        hpPerLevel: 20,
        mpPerLevel: 2,
        attackPerLevel: 3,
        defensePerLevel: 3,
        speedPerLevel: 1
      },
      aiBehavior: {
        aggression: 75,
        priority: 'weakest',
        skillUsage: 'balanced'
      },
      resistances: {
        physical: 50,
        poison: 100
      },
      weaknesses: {
        holy: 75,
        fire: 50
      }
    },
    {
      name: 'Lich Lord',
      type: EnemyType.UNDEAD_BOSS,
      class: EnemyClass.UNDEAD_LICH,
      description: 'A powerful lich commanding undead armies',
      baseHp: 180,
      baseMp: 100,
      baseAttack: 20,
      baseDefense: 15,
      baseSpeed: 10,
      avatarPath: 'assets/10 Undead JRPG characters 1.0/Original Size 1х/Pallete 1/Lich.png',
      minLevel: 20,
      maxLevel: 40,
      rarity: 4,
      experienceReward: 500,
      goldReward: 350,
      isBoss: true,
      statGrowth: {
        hpPerLevel: 18,
        mpPerLevel: 5,
        attackPerLevel: 2,
        defensePerLevel: 2,
        speedPerLevel: 1
      },
      aiBehavior: {
        aggression: 60,
        priority: 'strongest',
        skillUsage: 'conservative'
      },
      resistances: {
        magical: 50,
        poison: 100,
        ice: 50
      },
      weaknesses: {
        holy: 100,
        fire: 75
      }
    }
  ];

  for (const enemyData of enemyTemplates) {
    const enemyTemplate = enemyTemplateRepo.create(enemyData);
    await enemyTemplateRepo.save(enemyTemplate);
    console.log(`  ✅ Created enemy template: ${enemyData.name}`);
  }
}

// Run the seeding function
if (require.main === module) {
  seedGameData().catch(console.error);
}
