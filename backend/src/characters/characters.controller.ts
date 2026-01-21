import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Character } from './entities/character.entity';
import { User } from '../auth/entities/user.entity';

@Controller('characters')
@UseGuards(JwtAuthGuard)
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCharacterDto: CreateCharacterDto,
    @Request() req: { user: User },
  ): Promise<Character> {
    return this.charactersService.createCharacter(createCharacterDto, req.user);
  }

  @Get()
  async findAll(@Request() req: { user: User }): Promise<Character[]> {
    return this.charactersService.findAll(req.user);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<Character> {
    return this.charactersService.findOne(+id, req.user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCharacterDto: UpdateCharacterDto,
    @Request() req: { user: User },
  ): Promise<Character> {
    return this.charactersService.update(+id, updateCharacterDto, req.user);
  }

  @Post(':id/level-up')
  @HttpCode(HttpStatus.OK)
  async levelUp(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<Character> {
    return this.charactersService.levelUpCharacter(+id, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<void> {
    return this.charactersService.remove(+id, req.user);
  }

  @Get(':id/stats')
  async getCharacterStats(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<any> {
    const character = await this.charactersService.findOne(+id, req.user);
    return {
      level: character.level,
      experience: character.experience,
      currentHp: character.currentHp,
      currentMp: character.currentMp,
      isAlive: character.isAlive,
      stats: character.stats,
    };
  }

  @Get(':id/inventory')
  async getCharacterInventory(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<any> {
    const character = await this.charactersService.findOne(+id, req.user);
    return character.inventory;
  }
}
