# Game Data Seeding Script

Este script pobla la base de datos con todos los personajes, enemigos, bosses, items y habilidades necesarios para el juego Village Manager.

## ¿Qué crea el script?

### 🎭 Personajes Jugables (14 templates)
**Goblins (5):**
- Goblin Archer - Arquero rápido y preciso
- Goblin Fighter - Guerrero tanque resistente  
- Goblin Occultist - Mago oscuro con veneno
- Goblin Wolf Rider - Jinete rápido de lobo
- Goblin Fanatic - Berserker agresivo

**Halflings (5):**
- Halfling Rogue - Pícaro sigiloso
- Halfling Ranger - Arquero equilibrado
- Halfling Bard - Soporte con curación
- Halfling Assassin - Asesino de alto daño
- Halfling Slinger - Lanzador de honda

**Lizardfolk (4):**
- Lizardfolk Archer - Arquero resistente
- Lizardfolk Gladiator - Luchador pesado
- Lizardfolk Scout - Explorador veloz
- Lizardfolk Spearman - Lancero defensivo

### 👹 Enemigos (25 templates)
**Demonios (11):**
- Crimson Imp, Antlered Rascal, Clawed Abomination
- Depraved Blackguard, Fledgling Demon
- Y 6 tipos más con diferentes comportamientos de IA

**Monstruos (15):**
- Brawny Ogre, Death Slime, Crushing Cyclops
- Y 12 tipos más con resistencias y debilidades específicas

### 👑 Bosses Undead (10 templates)
- Skeleton Warrior, Lich Lord
- Banshee, Cursed Armor, Ghost, Ghoul
- Vampire, Wendigo, Zombie, Monster

### 🧪 Items (17 tipos)
**Materiales de Crafting:**
- Herb, Crystal Shard, Monster Essence
- Dragon Scale, Phoenix Feather

**Pociones Crafterables:**
- Health Potion, Mana Potion, Greater Health Potion
- Strength Potion, Defense Potion, Speed Potion
- Revival Potion

**Equipamiento Básico:**
- Iron Sword, Wooden Bow, Magic Wand
- Leather Armor, Iron Shield

### ⚔ Habilidades (20 habilidades)
**Ataques Básicos:**
- Slash, Power Strike, Arrow Shot, Multi Shot
- Sling Shot, Spear Thrust

**Magia:**
- Fireball, Lightning Bolt, Shadow Bolt

**Curación y Soporte:**
- Heal, Group Heal, War Cry

**Debuffs:**
- Poison, Curse

**Habilidades Ultimate:**
- Berserker Rage, Meteor Storm, Assassinate

**Pasivas:**
- Evasion, Regeneration, Magic Resistance

## 🚀 Cómo ejecutar el script

### Prerrequisitos
- Base de datos PostgreSQL configurada
- Variables de entorno configuradas (`.env`)
- Dependencias instaladas (`npm install`)

### Ejecución
```bash
# Desde el directorio backend/
npm run seed:data
```

### ¿Qué hace el script?
1. **Conexión a la base de datos** - Usa TypeORM para conectarse
2. **Limpieza de datos** - Borra datos existentes para evitar duplicados
3. **Creación de habilidades** - Inserta todas las habilidades del juego
4. **Creación de items** - Inserta materiales, pociones y equipamiento
5. **Creación de personajes** - Inserta todos los templates de personajes jugables
6. **Creación de enemigos** - Inserta todos los templates de enemigos y bosses
7. **Logging detallado** - Muestra progreso con emojis y contadores

## 📊 Características del Sistema

### Balanceo de Personajes
- **Stats base nivel 1** para equilibrio inicial
- **Crecimiento por nivel** diferenciado por rol
- **Habilidades iniciales** apropiadas para cada clase
- **Rarezas** para sistema de recolección

### IA de Enemigos
- **Comportamientos diferenciados:** Agresivo, Conservador, Balanceado
- **Prioridades de ataque:** Más débil, más fuerte, aleatorio, menor HP
- **Umbrales de huida** para enemigos cobardes
- **Resistencias y debilidades** elementales

### Sistema de Items
- **Stacking** para consumibles y materiales
- **Requisitos de nivel** para equipamiento
- **Stats variables** por tipo de equipamiento
- **Efectos de consumibles** con duración

### Sistema de Habilidades
- **Scaling** basado en stats del personaje
- **Cooldowns** para balance de combate
- **Costos de maná** para gestión de recursos
- **Efectos de estado** para combate estratégico

## 🛠️ Personalización

### Agregar nuevos personajes
```typescript
// En createCharacterTemplates()
{
  name: 'Nuevo Personaje',
  type: CharacterType.GOBLIN,
  class: CharacterClass.FIGHTER,
  description: 'Descripción del personaje',
  baseHp: 100,
  baseMp: 30,
  baseAttack: 15,
  baseDefense: 12,
  baseSpeed: 10,
  avatarPath: 'assets/path/to/image.png',
  statGrowth: {
    hpPerLevel: 10,
    mpPerLevel: 2,
    attackPerLevel: 2,
    defensePerLevel: 2,
    speedPerLevel: 1
  },
  rarity: 1,
  startingSkills: ['Slash', 'Power Strike']
}
```

### Agregar nuevos enemigos
```typescript
// En createEnemyTemplates()
{
  name: 'Nuevo Enemigo',
  type: EnemyType.MONSTER,
  class: EnemyClass.OGRE,
  description: 'Descripción del enemigo',
  // ... stats base
  aiBehavior: {
    aggression: 75,
    priority: 'weakest',
    skillUsage: 'balanced'
  },
  resistances: {
    physical: 25
  },
  weaknesses: {
    magical: 50
  }
}
```

## 🔧 Solución de Problemas

### Errores Comunes
1. **Conexión a base de datos**
   - Verificar que PostgreSQL esté corriendo
   - Comprobar variables de entorno en `.env`

2. **Errores de TypeScript**
   - Ejecutar `npm run build` para verificar
   - Revisar tipos de enums y entidades

3. **Paths de assets incorrectos**
   - Verificar que los archivos PNG existan
   - Usar paths relativos desde la raíz del proyecto

### Resetear Datos
```bash
# Para limpiar todo y volver a poblar
npm run seed:data
```

El script es idempotente - puede ejecutarse múltiples veces sin crear duplicados.

## 📈 Próximos Pasos

Después de ejecutar el seed:
1. **Probar creación de personajes** en la API
2. **Verificar sistema de combate** con diferentes habilidades
3. **Testear mazmorras** con enemigos de diferentes niveles
4. **Implementar sistema de crafting** de pociones
5. **Agregar más contenido** (jefes, misiones, etc.)

## 🎮 Integración con Frontend

Los avatar paths están configurados para funcionar con la estructura de assets:
```
assets/
├── Basic Humanoid Animations/
├── Basic Monster Animations/
└── 10 Undead JRPG characters 1.0/
```

El frontend puede cargar los sprites usando estos paths relativos.
