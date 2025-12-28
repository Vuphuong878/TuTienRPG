

// Fix: Corrected import path for types.
import { TerrainType } from '../types';

export const TERRAIN_BACKGROUNDS: { [key in TerrainType]: string } = {
    [TerrainType.PLAIN]: 'https://img.freepik.com/free-photo/pathway-middle-green-leafed-trees-with-sun-shining-through-branches_181624-4539.jpg?w=1380',
    [TerrainType.FOREST]: 'https://img.freepik.com/free-photo/dirt-road-through-forest_181624-5937.jpg?w=1380',
    [TerrainType.MOUNTAIN]: 'https://img.freepik.com/free-photo/beautiful-shot-mountains-trees-covered-snow-fog_181624-17590.jpg?w=1380',
    [TerrainType.VILLAGE]: 'https://img.freepik.com/free-photo/old-village-with-traditional-houses-mountains-romania_181624-30044.jpg?w=1380',
    [TerrainType.WATER]: 'https://img.freepik.com/free-photo/beautiful-shot-sea-with-mountain-background-sunrise_181624-1524.jpg?w=1380',
    [TerrainType.VOLCANO]: 'https://img.freepik.com/premium-photo/erupting-volcano-with-lava-flow-smoke-billowing-out-generative-ai_900396-54528.jpg?w=1380',
};