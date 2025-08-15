import { THEME_COLORS } from '../GameSettingsModal';

export const getThemeColors = (themeId: string) => {
    const theme = THEME_COLORS.find(t => t.id === themeId);
    return theme ? theme.colors : THEME_COLORS.find(t => t.id === 'purple')!.colors;
};

export const getThemeCSS = (themeId: string) => {
    const colors = getThemeColors(themeId);
    return {
        primary: `bg-gradient-to-br ${colors.primary}`,
        secondary: `bg-gradient-to-r ${colors.secondary}`,
        accent: `bg-gradient-to-r ${colors.accent}`,
        text: `text-${colors.text}`,
        // Glass-morphism variants
        glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
        glassHover: 'hover:bg-white/15',
        glassBorder: 'border-white/20',
        glassText: 'text-white/90',
        glassTextLight: 'text-white/70',
        // Gradient variants for accents
        gradientPrimary: `from-${colors.text.split('-')[0]}-500/30 to-${colors.text.split('-')[0]}-600/30`,
        gradientSecondary: `from-${colors.text.split('-')[0]}-400/20 to-${colors.text.split('-')[0]}-500/20`,
    };
};

export const applyThemeToElement = (element: HTMLElement, themeId: string) => {
    const colors = getThemeColors(themeId);
    element.style.setProperty('--theme-primary', colors.primary);
    element.style.setProperty('--theme-secondary', colors.secondary);
    element.style.setProperty('--theme-accent', colors.accent);
    element.style.setProperty('--theme-text', colors.text);
};