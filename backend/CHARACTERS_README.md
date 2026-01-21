# Sistema de Personajes - Village Manager

## Overview

Este módulo implementa la gestión completa de personajes para el juego de gestión de aldea, incluyendo:

- Creación de personajes con diferentes tipos y clases
- Sistema de niveles y experiencia
- Gestión de estadísticas y habilidades
- Inventario y equipamiento
- Muerte permanente en mazmorras

## Arquitectura

### Entities Principales

#### Character
- **Propósito**: Representa un personaje individual del jugador
- **Características**:
  - Nivel, experiencia, HP/MP actuales
  - Relación con User (propietario)
  - Relación con CharacterTemplate (plantilla base)
  - Relaciones con stats, skills, inventory

#### CharacterTemplate
- **Propósito**: Plantillas base para cada tipo de personaje
- **Tipos disponibles**:
  - **Goblins**: Archer, Fanatic, Fighter, Occultist, Wolf Rider
  - **Halflings**: Assassin, Bard, Ranger, Rogue, Slinger
  - **Lizardfolk**: Bestial, Archer, Gladiator, Scout, Spearman
- **Características**:
  - Estadísticas base y crecimiento por nivel
  - Habilidades iniciales
  - Costo de creación según rareza

#### CharacterStats
- **Propósito**: Estadísticas variables de cada personaje
- **Tipos**: HP, MP, Attack, Defense, Speed, Critical Rate, etc.
- **Características**:
  - Valor base, bonificaciones y multiplicadores
  - Método helper para calcular valor total

#### Skill
- **Propósito**: Habilidades especiales de los personajes
- **Tipos**: Active, Passive
- **Objetivos**: Self, Single Enemy, All Enemies, etc.
- **Características**:
  - Costo de MP, poder, cooldown
  - Efectos y requisitos
  - Escalado con stats del personaje

#### Item & Inventory
- **Propósito**: Sistema de objetos y equipamiento
- **Tipos**: Weapon, Armor, Accessory, Consumable, etc.
- **Características**:
  - Stats y efectos
  - Requisitos de uso
  - Efectos consumibles (pociones, etc.)

## API Endpoints

### Personajes

#### `POST /characters`
- **Descripción**: Crear un nuevo personaje
- **Autenticación**: Requiere JWT
- **Body**:
  ```json
  {
    "name": "Goblin Warrior",
    "type": "goblin",
    "class": "fighter",
    "level": 1,
    "avatarPath": "/assets/goblin-fighter.png"
  }
  ```
- **Respuesta**: Character creado

#### `GET /characters`
- **Descripción**: Listar todos los personajes del usuario
- **Autenticación**: Requiere JWT
- **Respuesta**: Array de personajes con relaciones

#### `GET /characters/:id`
- **Descripción**: Obtener detalles de un personaje
- **Autenticación**: Requiere JWT
- **Parámetros**: `id` (number)
- **Respuesta**: Character con todas las relaciones

#### `PATCH /characters/:id`
- **Descripción**: Actualizar personaje
- **Autenticación**: Requiere JWT
- **Body**:
  ```json
  {
    "name": "Nuevo Nombre",
    "experience": 500,
    "currentHp": 150,
    "skillIds": [1, 2, 3]
  }
  ```

#### `POST /characters/:id/level-up`
- **Descripción**: Subir de nivel un personaje
- **Autenticación**: Requiere JWT
- **Validación**: Verifica experiencia suficiente
- **Efectos**: Actualiza stats y cura completamente

#### `DELETE /characters/:id`
- **Descripción**: Eliminar personaje (muerte permanente)
- **Autenticación**: Requiere JWT

### Endpoints Adicionales

#### `GET /characters/:id/stats`
- **Descripción**: Obtener estadísticas detalladas
- **Respuesta**: Stats calculadas y formato legible

#### `GET /characters/:id/inventory`
- **Descripción**: Obtener inventario del personaje
- **Respuesta**: Items con cantidad y estado de equipamiento

## Sistema de Progresión

### Niveles y Experiencia
- **Fórmula**: `level * 100` XP por nivel
- **Ejemplo**: Nivel 5 requiere 500 XP total
- **Subida de nivel**: Cura HP/MP, actualiza stats base

### Costos
- **Creación**: Basado en rareza y tipo de plantilla
- **Fórmula**: `100 * rarity * typeMultiplier`
- **Multiplicadores**: Goblin (1.0), Halfling (1.5), Lizardfolk (2.0)

### Estadísticas
- **Crecimiento**: Cada plantilla define crecimiento por nivel
- **Cálculo**: `baseValue + (growthPerLevel * (level - 1))`
- **Tipos**: HP, MP, Attack, Defense, Speed

## Sistema de Combate (Integración)

### Participación en Batalla
- Los personajes pueden ser asignados a mazmorras
- Muerte permanente si mueren en mazmorras
- Estados: Active, Dead, Stunned, Poisoned, etc.

### Habilidades en Combate
- **Costos**: MP consumido por uso
- **Cooldowns**: Tiempo de espera entre usos
- **Efectos**: Daño, curación, buffs, debuffs

## Assets Disponibles

### Humanoids (Personajes Jugables)
- **Goblins**: 5 clases con animaciones completas
- **Halflings**: 5 clases con estilos sigilosos
- **Lizardfolk**: 5 clases con aspecto reptiliano

### Enemigos (No Jugables)
- **Monsters**: 15 tipos (Ogres, Trolls, Slimes, etc.)
- **Demonios**: 10 tipos (Imps, Abominations, etc.)
- **Undead Bosses**: 10 tipos (de 10 Undead JRPG assets)

## Validaciones y Reglas

### Creación de Personajes
- Nombre único por usuario
- Nivel inicial máximo: 100
- Verificación de oro suficiente
- Solo plantillas jugables (isPlayable: true)

### Actualizaciones
- Solo personajes del usuario autenticado
- Experiencia no puede disminuir
- HP/MP no pueden ser negativos

### Muerte Permanente
- Eliminación definitiva del personaje
- Pérdida de todo el equipamiento
- Registro en estadísticas del usuario

## Futuras Mejoras

1. **Sistema de Clases Avanzadas**: Especializaciones al nivel 10+
2. **Equipamiento Único**: Items legendales con efectos especiales
3. **Sistema de Afinidades**: Bonificaciones por tipo de personaje
4. **Habilidades Pasivas**: Efectos automáticos en combate
5. **Sistema de Reputación**: Desbloqueo de contenido especial

## Consideraciones Técnicas

- **Performance**: Índices en userId para búsquedas rápidas
- **Seguridad**: Validación estricta de propiedad
- **Escalabilidad**: Diseño modular para nuevos tipos
- **Data Integrity**: Relaciones CASCADE para eliminación segura
