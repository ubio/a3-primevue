export interface Oklch {
    l: number;
    c: number;
    h: number;
}

export function readCssRgb(varName: string): [number, number, number] | null {
    const probe = document.createElement('span');
    probe.style.color = `var(${varName})`;
    document.documentElement.appendChild(probe);
    const parsed = parseRgbString(getComputedStyle(probe).color);
    probe.remove();
    return parsed;
}

export function parseRgbString(color: string): [number, number, number] | null {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) {
        return null;
    }
    return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function rgbToOklch(r: number, g: number, b: number): Oklch {
    const sr = r / 255;
    const sg = g / 255;
    const sb = b / 255;
    const linear = [sr, sg, sb].map(channel =>
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
    const l = 0.4122214708 * linear[0] + 0.5363325363 * linear[1] + 0.0514459929 * linear[2];
    const m = 0.2119034982 * linear[0] + 0.6806995451 * linear[1] + 0.1073969566 * linear[2];
    const s = 0.0883024619 * linear[0] + 0.2817188376 * linear[1] + 0.6299787005 * linear[2];
    const lRoot = Math.cbrt(l);
    const mRoot = Math.cbrt(m);
    const sRoot = Math.cbrt(s);
    const okL = 0.2104542553 * lRoot + 0.7936177850 * mRoot - 0.0040720468 * sRoot;
    const okA = 1.9779984951 * lRoot - 2.4285922050 * mRoot + 0.4505937099 * sRoot;
    const okB = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.8086757660 * sRoot;
    const c = Math.hypot(okA, okB);
    let h = Math.atan2(okB, okA) * 180 / Math.PI;
    if (h < 0) {
        h += 360;
    }
    return { l: okL, c, h };
}

export function readPrimaryOklch(): Oklch {
    const rgb = readCssRgb('--p-primary-500');
    if (!rgb) {
        return { l: 0.55, c: 0.2, h: 264 };
    }
    return rgbToOklch(...rgb);
}

export function oklchColor(l: number, c: number, h: number, alpha = 1) {
    const lightness = `${(l * 100).toFixed(1)}%`;
    const chroma = c.toFixed(4);
    const hue = h.toFixed(1);
    if (alpha < 1) {
        return `oklch(${lightness} ${chroma} ${hue} / ${alpha.toFixed(3)})`;
    }
    return `oklch(${lightness} ${chroma} ${hue})`;
}

export function isDarkScheme() {
    return matchMedia('(prefers-color-scheme: dark)').matches;
}
