export function lerp(from: number, to: number, t: number) {
    return from + (to - from) * t;
}

export function easeInOut(t: number) {
    return t < .5 ?
        4 * t * t * t :
        1 - (-2 * t + 2) ** 3 / 2;
}
