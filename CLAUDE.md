# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## System Instruction for Claude Code

STRICTLY PROHIBITED: Any form of abbreviated code like: "// ... (Content of the parseStatsBonus function remains unchanged)". This applies to original code or any other code; any such abbreviated code is not allowed within this chat. Also prohibited are "convenience" code snippets, where additional code is merely indicated as being located "at this position, below the newly added code."

STRICTLY PROHIBITED: Any "convenience" in code. Always follow the rules.

STRICTLY PROHIBITED: Deleting functions.

ABSOLUTELY OBEY MY COMMANDS, NO ARGUMENTS, NO EXCUSES.

WHEN WRITING CODE, ENSURE THE FOLLOWING:

Adding New Code
+/ If adding new code: -> Include the line of code above (the code to be added) and the line of code below (the code to be added). (Remember to explain clearly, as "line of code above" and "line of code below" are quite common, and their benefits and drawbacks can be equal.) -> This helps me know where to insert the code instead of guessing and causing errors.

Modifying Existing Code
+/ If modifying code: -> Provide two code blocks, including -> the original code (summarized by the first line of the original code and the line immediately below the original code's end. For example, if the original code has 11 lines, write the code from line 1 and line 12 so I can identify its location) AND the modified code -> Clearly state which is the original code (remember to summarize it). (Ensure it's the correct original code, as several times when I've worked with "you," the original code you provided was completely absent from the AI SIMULATOR 2.14 source code.) -> THEN provide the code to be replaced. (I WANT TWO SEPARATE FRAMES FOR THIS; I DO NOT WANT TO SEE A SITUATION WHERE THE ORIGINAL AND REPLACEMENT CODE ARE IN THE SAME CODE BLOCK!)

Example for Code Modification:

If a 12-line code needs changes only from line 6 to 9, present it as follows:

Original Code:
First line of code: line 5 (I wrote "line 5" for illustration purposes; in practice, write out the entire line, not just the line number.)
Line of code below the original code: line 10

Replacement Code:
The modified code from line 6 to 9

Following this example saves you time by avoiding rewriting code, and focusing on code replacement also helps me quickly identify the location for modification and replacement.

Special Instructions
-> Only modify code that needs modification; do not make unnecessary changes. -> The reason is: previously, I asked you to modify code, but you ended up deleting perfectly working code and its related functionality, leading to an even bigger error.

-> Keep existing debugs, and add new debugs to the code you implement for monitoring and creation

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Setup

- Create `.env.local` file with `GEMINI_API_KEY` for Google Gemini AI integration
- The app uses Vite with TypeScript and React 19
- Styling is handled with Tailwind CSS

## Architecture Overview

This is an AI-powered RPG text-based game simulator built with React and Google Gemini AI.

### Core Structure

**Main Application Flow:**
- `App.tsx` - Root component managing AI context and main navigation
- `components/MainMenu.tsx` - Landing page
- `components/CreateWorld.tsx` - World/character creation
- `components/GameScreen.tsx` - Main game interface

**Key Data Types (`components/types.ts`):**
- `Entity` - Core game objects (NPCs, items, locations, skills, etc.)
- `SaveData` - Complete game state structure
- `FormData` - World creation parameters
- `Memory` - Game memory system with importance scoring
- `Quest` - Quest tracking system

### Game State Management

**State Hooks (`components/hooks/`):**
- `useGameState.ts` - Core game state management
- `useModalState.ts` - Modal visibility management
- `useHistoryCompression.ts` - Memory compression for token optimization
- `useGameSettings.ts` - Game configuration management

**Handlers (`components/handlers/`):**
- `gameActionHandlers.ts` - User action processing
- `entityHandlers.ts` - Entity CRUD operations
- `gameStateHandlers.ts` - Game state updates

### AI Integration

**Prompt System:**
- `components/promptBuilder.ts` - RAG-based prompt construction
- Token management with 90k limit per turn
- Enhanced RAG system in `components/utils/EnhancedRAG.ts`
- Reference-based RAG in `components/utils/ReferenceBasedRAG.ts`

**Memory Systems:**
- `components/utils/UnifiedMemoryManager.ts` - Centralized memory handling
- `components/utils/MemoryAnalytics.ts` - Memory importance scoring
- `components/utils/SmartMemoryGenerator.ts` - Auto-generated memories

### Entity Management

**Export System:**
- `components/utils/EntityExportManager.ts` - Auto-export entities to JSON
- Export files stored in `components/data/game-exports/`
- Vietnamese format with Hán Việt name conversion

**Reference System:**
- `components/utils/ReferenceIdGenerator.ts` - Unique ID generation
- Cross-referencing system for entity relationships

### UI Components

**Game Interface:**
- `components/game/` - Core game UI components
- `components/modals/` - Modal dialogs
- Mobile-responsive design with separate mobile components

**Key Features:**
- Real-time game state display
- Entity information panels
- Quest tracking system
- Memory management interface
- Settings and customization modals

### File Structure Notes

- All TypeScript files use `.tsx` extension for React components
- Utilities in `components/utils/` and `components/untils/` (typo directory exists)
- Data files in `components/data/`
- Game exports automatically saved to `components/data/game-exports/`

### Development Notes

- Uses `@` alias for root directory imports (configured in vite.config.ts)
- Strict TypeScript configuration with experimental decorators
- React 19 with modern hooks patterns
- TailwindCSS for styling with PostCSS
- No lint/test commands configured - manual code review required