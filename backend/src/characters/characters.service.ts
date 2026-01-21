import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { CharacterTemplate } from './entities/character-template.entity';
import { CharacterStats } from './entities/character-stats.entity';
import { Skill } from './entities/skill.entity';
import { Item } from './entities/item.entity';
import { Inventory } from './entities/inventory.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { User } from '../auth/entities/user.entity';
import { StatType } from './entities/character-stats.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(CharacterTemplate)
    private templateRepository: Repository<CharacterTemplate>,
    @InjectRepository(CharacterStats)
    private statsRepository: Repository<CharacterStats>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async createCharacter(createCharacterDto: CreateCharacterDto, user: User): Promise<Character> {
    // Buscar la plantilla del personaje
    const template = await this.templateRepository.findOne({
      where: {
        type: createCharacterDto.type,
        class: createCharacterDto.class,
        isPlayable: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Character template not found');
    }

    // Verificar si el usuario tiene suficiente oro
    const goldCost = createCharacterDto.goldCost || this.calculateCharacterCost(template);
    if (user.gold < goldCost) {
      throw new BadRequestException('Insufficient gold');
    }

    // Crear el personaje
    const character = this.characterRepository.create({
      name: createCharacterDto.name,
      level: createCharacterDto.level || 1,
      experience: 0,
      currentHp: template.baseHp,
      currentMp: template.baseMp,
      isAlive: true,
      avatarPath: createCharacterDto.avatarPath || template.avatarPath,
      user,
      userId: user.id,
      template,
      templateId: template.id,
    });

    const savedCharacter = await this.characterRepository.save(character);

    // Crear estadísticas base del personaje
    await this.createCharacterStats(savedCharacter, template, createCharacterDto.level || 1);

    // Asignar habilidades iniciales
    await this.assignStartingSkills(savedCharacter, template);

    // Dar equipo inicial
    await this.giveStartingEquipment(savedCharacter, template);

    // Restar oro al usuario
    user.gold -= goldCost;
    // Aquí deberías guardar el usuario actualizado

    return savedCharacter;
  }

  async findAll(user: User): Promise<Character[]> {
    return this.characterRepository.find({
      where: { userId: user.id },
      relations: ['template', 'stats', 'skills', 'inventory'],
    });
  }

  async findOne(id: number, user: User): Promise<Character> {
    const character = await this.characterRepository.findOne({
      where: { id, userId: user.id },
      relations: ['template', 'stats', 'skills', 'inventory'],
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return character;
  }

  async update(id: number, updateCharacterDto: UpdateCharacterDto, user: User): Promise<Character> {
    const character = await this.findOne(id, user);

    // Actualizar campos básicos
    if (updateCharacterDto.name) character.name = updateCharacterDto.name;
    if (updateCharacterDto.experience !== undefined) character.experience = updateCharacterDto.experience;
    if (updateCharacterDto.currentHp !== undefined) character.currentHp = updateCharacterDto.currentHp;
    if (updateCharacterDto.currentMp !== undefined) character.currentMp = updateCharacterDto.currentMp;
    if (updateCharacterDto.isAlive !== undefined) character.isAlive = updateCharacterDto.isAlive;
    if (updateCharacterDto.position) character.position = updateCharacterDto.position;

    // Actualizar habilidades si se proporcionan
    if (updateCharacterDto.skillIds) {
      const skills = await this.skillRepository.findByIds(updateCharacterDto.skillIds);
      character.skills = skills;
    }

    // Subir de nivel si hay suficiente experiencia
    if (updateCharacterDto.experience !== undefined) {
      const newLevel = this.calculateLevelFromExperience(updateCharacterDto.experience);
      if (newLevel > character.level) {
        character.level = newLevel;
        await this.updateCharacterStatsOnLevelUp(character, newLevel);
      }
    }

    return this.characterRepository.save(character);
  }

  async remove(id: number, user: User): Promise<void> {
    const character = await this.findOne(id, user);
    await this.characterRepository.remove(character);
  }

  async levelUpCharacter(id: number, user: User): Promise<Character> {
    const character = await this.findOne(id, user);
    const newLevel = character.level + 1;
    const experienceNeeded = this.calculateExperienceForLevel(newLevel);

    if (character.experience < experienceNeeded) {
      throw new BadRequestException('Insufficient experience for level up');
    }

    character.level = newLevel;
    await this.updateCharacterStatsOnLevelUp(character, newLevel);

    return this.characterRepository.save(character);
  }

  private async createCharacterStats(character: Character, template: CharacterTemplate, level: number): Promise<void> {
    const stats = [
      { statType: StatType.HP, baseValue: template.baseHp + (template.statGrowth.hpPerLevel * (level - 1)) },
      { statType: StatType.MP, baseValue: template.baseMp + (template.statGrowth.mpPerLevel * (level - 1)) },
      { statType: StatType.ATTACK, baseValue: template.baseAttack + (template.statGrowth.attackPerLevel * (level - 1)) },
      { statType: StatType.DEFENSE, baseValue: template.baseDefense + (template.statGrowth.defensePerLevel * (level - 1)) },
      { statType: StatType.SPEED, baseValue: template.baseSpeed + (template.statGrowth.speedPerLevel * (level - 1)) },
    ];

    for (const stat of stats) {
      const characterStat = this.statsRepository.create({
        ...stat,
        character,
        characterId: character.id,
      });
      await this.statsRepository.save(characterStat);
    }
  }

  private async assignStartingSkills(character: Character, template: CharacterTemplate): Promise<void> {
    if (template.startingSkills && template.startingSkills.length > 0) {
      const skills = await this.skillRepository.findByIds(template.startingSkills);
      character.skills = skills;
      await this.characterRepository.save(character);
    }
  }

  private async giveStartingEquipment(character: Character, template: CharacterTemplate): Promise<void> {
    // Dar equipo básico según el tipo de personaje
    const basicItems = await this.itemRepository.find({
      where: { isActive: true },
      take: 3, // Dar 3 items básicos
    });

    for (const item of basicItems) {
      const inventory = this.inventoryRepository.create({
        character,
        characterId: character.id,
        item,
        itemId: item.id,
        quantity: 1,
        isEquipped: false,
      });
      await this.inventoryRepository.save(inventory);
    }
  }

  private calculateCharacterCost(template: CharacterTemplate): number {
    // Costo base según rareza y tipo
    const baseCost = 100 * template.rarity;
    const typeMultiplier = template.type === 'goblin' ? 1 : template.type === 'halfling' ? 1.5 : 2;
    return Math.floor(baseCost * typeMultiplier);
  }

  private calculateLevelFromExperience(experience: number): number {
    // Fórmula simple: cada nivel requiere experiencia * nivel
    let level = 1;
    let totalExp = 0;
    
    while (totalExp <= experience) {
      level++;
      totalExp += level * 100;
    }
    
    return level - 1;
  }

  private calculateExperienceForLevel(level: number): number {
    return level * 100;
  }

  private async updateCharacterStatsOnLevelUp(character: Character, newLevel: number): Promise<void> {
    const template = character.template;
    const statGrowth = template.statGrowth;

    // Actualizar HP y MP máximos
    const newMaxHp = template.baseHp + (statGrowth.hpPerLevel * (newLevel - 1));
    const newMaxMp = template.baseMp + (statGrowth.mpPerLevel * (newLevel - 1));

    // Curar completamente al subir de nivel
    character.currentHp = newMaxHp;
    character.currentMp = newMaxMp;

    // Actualizar estadísticas en la base de datos
    const statsToUpdate = [
      StatType.HP,
      StatType.MP,
      StatType.ATTACK,
      StatType.DEFENSE,
      StatType.SPEED,
    ];

    for (const statType of statsToUpdate) {
      await this.statsRepository.update(
        { characterId: character.id, statType },
        {
          baseValue: this.getStatValue(statType, template, statGrowth, newLevel),
        },
      );
    }
  }

  private getStatValue(statType: StatType, template: CharacterTemplate, statGrowth: any, level: number): number {
    switch (statType) {
      case StatType.HP:
        return template.baseHp + (statGrowth.hpPerLevel * (level - 1));
      case StatType.MP:
        return template.baseMp + (statGrowth.mpPerLevel * (level - 1));
      case StatType.ATTACK:
        return template.baseAttack + (statGrowth.attackPerLevel * (level - 1));
      case StatType.DEFENSE:
        return template.baseDefense + (statGrowth.defensePerLevel * (level - 1));
      case StatType.SPEED:
        return template.baseSpeed + (statGrowth.speedPerLevel * (level - 1));
      default:
        return 0;
    }
  }
}
