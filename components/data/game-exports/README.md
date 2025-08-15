# Game Exports Directory

This directory contains automatically exported entity information from the RPG AI Simulator.

## File Structure

### Auto-Generated Files
Files are automatically created every 5-10 turns (configurable) with the following naming pattern:
```
{CharacterName}_{Category}_turn{TurnNumber}_{Timestamp}.json
```

### Categories
- **characters.json**: NPCs, companions, and player character info
- **locations.json**: Places, buildings, areas discovered
- **items.json**: Weapons, tools, consumables encountered
- **factions.json**: Organizations, groups, societies
- **concepts.json**: Abstract entities, ideas, phenomena
- **skills.json**: Abilities, techniques, spells
- **statusEffects.json**: Buffs, debuffs, conditions

### Metadata Files
- **export_metadata.json**: Export history and statistics

## File Format Example

```json
{
  "metadata": {
    "exportedAt": "2024-01-01T12:00:00.000Z",
    "turn": 15,
    "category": "characters",
    "entityCount": 5,
    "characterName": "Naruto"
  },
  "entities": {
    "sasuke_uchiha": {
      "name": "Sasuke Uchiha",
      "hanVietName": "Vũ Trí Ba Tá Trợ",
      "type": "companion",
      "description": "Ninja thiên tài từ gia tộc Uchiha...",
      "skills": ["sharingan", "chidori"],
      "exportedAt": 1704110400000,
      "exportTurn": 15
    }
  }
}
```

## Usage
- Files are automatically downloaded to your browser's download folder
- Import these files to restore entity knowledge in new games
- Use for token optimization by referencing IDs instead of full descriptions
- Backup and share game world data

## Configuration
Export settings can be configured in the game settings:
- Export interval (turns between exports)
- Enable/disable auto-export
- Debug logging
- File size limits