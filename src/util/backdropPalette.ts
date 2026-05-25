import { isDarkScheme, Oklch, oklchColor, readPrimaryOklch } from './color.js';

export type Range = [number, number];

export interface BackdropBaseStop {
    l?: number;
    lMult?: number;
    cMult: number;
    hueJitter?: Range;
}

export interface BackdropBlobTheme {
    /** Random hue offset range (deg) from primary, before hueJitter. */
    hueSpread: number;
    hueJitter: Range;
    /** Light theme: absolute OKLCH lightness. Dark theme: multiplied by primary lightness. */
    lightness: number;
    lightnessJitter: Range;
    /** Multiplier applied to primary chroma. */
    chromaMult: number;
    chromaJitter: Range;
    alpha: number;
    alphaJitter: Range;
    maxLightness: number;
}

export interface BackdropThemeConfig {
    base: [BackdropBaseStop, BackdropBaseStop, BackdropBaseStop];
    blob: BackdropBlobTheme;
}

export interface BackdropLayout {
    x: Range;
    y: Range;
    radius: Range;
}

export interface BackdropConfig {
    blobCount: number;
    layout: BackdropLayout;
    light: BackdropThemeConfig;
    dark: BackdropThemeConfig;
}

export interface BackdropBlobLayout {
    x: number;
    y: number;
    radius: number;
}

/** Tweak backdrop appearance here. */
export const backdropConfig: BackdropConfig = {
    blobCount: 16,
    layout: {
        x: [0.05, 0.95],
        y: [0.05, 0.90],
        radius: [0.32, 0.64],
    },
    light: {
        base: [
            { l: 0.88, cMult: 0.20 },
            { l: 0.92, cMult: 0.24, hueJitter: [-6, 8] },
            { l: 0.85, cMult: 0.20, hueJitter: [-16, -4] },
        ],
        blob: {
            hueSpread: 150,
            hueJitter: [-24, 24],
            lightness: 0.70,
            lightnessJitter: [-0.05, 0.05],
            chromaMult: 0.76,
            chromaJitter: [0.88, 1.15],
            alpha: 0.36,
            alphaJitter: [0.88, 1.10],
            maxLightness: 0.85,
        },
    },
    dark: {
        base: [
            { lMult: 0.48, cMult: 0.32 },
            { lMult: 0.42, cMult: 0.40, hueJitter: [-6, 8] },
            { lMult: 0.32, cMult: 0.28, hueJitter: [-14, -4] },
        ],
        blob: {
            hueSpread: 150,
            hueJitter: [-24, 24],
            lightness: 0.94,
            lightnessJitter: [-0.05, 0.05],
            chromaMult: 0.85,
            chromaJitter: [0.85, 1.15],
            alpha: 0.16,
            alphaJitter: [0.85, 1.12],
            maxLightness: 0.76,
        },
    },
};

export interface BackdropBlob extends BackdropBlobLayout {
    l: number;
    c: number;
    h: number;
    alpha: number;
}

export interface BackdropPalette {
    base: [string, string, string];
    blobs: BackdropBlob[];
}

function rand([min, max]: Range) {
    return min + Math.random() * (max - min);
}

function tone(primary: Oklch, l: number, c: number, h = primary.h, alpha = 1) {
    return oklchColor(l, c, h, alpha);
}

export function randomBlobLayouts(
    count: number,
    layout: BackdropLayout = backdropConfig.layout,
): BackdropBlobLayout[] {
    const blobs: BackdropBlobLayout[] = [];
    for (let i = 0; i < count; i++) {
        blobs.push({
            x: rand(layout.x),
            y: rand(layout.y),
            radius: rand(layout.radius),
        });
    }
    return blobs;
}

function buildBaseStops(
    primary: Oklch,
    stops: BackdropThemeConfig['base'],
    isDark: boolean,
): [string, string, string] {
    const { l, c, h } = primary;
    const colors = stops.map(stop => {
        const stopL = isDark ? l * (stop.lMult ?? 1) : (stop.l ?? l);
        const stopH = h + (stop.hueJitter ? rand(stop.hueJitter) : 0);
        return tone(primary, stopL, c * stop.cMult, stopH);
    });
    return [colors[0], colors[1], colors[2]];
}

function buildBlobColor(
    primary: Oklch,
    theme: BackdropBlobTheme,
    isDark: boolean,
) {
    const { l, c, h } = primary;
    const halfSpread = theme.hueSpread / 2;
    const blobHue = h + rand([-halfSpread, halfSpread]) + rand(theme.hueJitter);
    const blobChroma = c * theme.chromaMult * rand(theme.chromaJitter);
    const blobLightness = Math.min(
        (isDark ? l * theme.lightness : theme.lightness) + rand(theme.lightnessJitter),
        theme.maxLightness,
    );
    const blobAlpha = theme.alpha * rand(theme.alphaJitter);
    return {
        l: blobLightness,
        c: blobChroma,
        h: blobHue,
        alpha: blobAlpha,
    };
}

export function buildBackdropPalette(
    isDark = isDarkScheme(),
    config: BackdropConfig = backdropConfig,
    layouts = randomBlobLayouts(config.blobCount, config.layout),
) {
    const primary = readPrimaryOklch();
    const theme = isDark ? config.dark : config.light;
    const base = buildBaseStops(primary, theme.base, isDark);
    const blobs = layouts.map(layout => ({
        ...layout,
        ...buildBlobColor(primary, theme.blob, isDark),
    }));
    return { base, blobs };
}

export function repositionBlobs(
    blobs: BackdropBlob[],
    layout: BackdropLayout = backdropConfig.layout,
): BackdropBlob[] {
    const layouts = randomBlobLayouts(blobs.length, layout);
    return blobs.map((blob, index) => ({
        ...blob,
        ...layouts[index],
    }));
}
