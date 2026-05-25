<template>
    <canvas
        ref="canvas"
        class="Backdrop"
        aria-hidden="true" />
</template>

<script>
import { easeInOut, lerp } from '../util/math.js';

import {
    buildBackdropPalette,
    repositionBlobs,
} from '../util/backdropPalette.js';
import { isDarkScheme, oklchColor } from '../util/color.js';

const ANIMATION_MS = 1000;

function interpolateBlobs(from, to, t) {
    return from.map((blob, index) => ({
        ...blob,
        x: lerp(blob.x, to[index].x, t),
        y: lerp(blob.y, to[index].y, t),
        radius: lerp(blob.radius, to[index].radius, t),
    }));
}

export default {

    data() {
        return {
            dpr: 1,
            palette: null,
            animation: null,
            raf: 0,
            themeQuery: null,
        };
    },

    watch: {

        '$route.fullPath'() {
            this.animateToNewLayout();
        },

    },

    mounted() {
        this.themeQuery = matchMedia('(prefers-color-scheme: dark)');
        this.themeQuery.addEventListener('change', this.refresh);
        window.addEventListener('resize', this.onResize);
        window.addEventListener('pageshow', this.onPageShow);
        this.reset();
    },

    unmounted() {
        cancelAnimationFrame(this.raf);
        this.themeQuery?.removeEventListener('change', this.refresh);
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('pageshow', this.onPageShow);
    },

    methods: {

        onPageShow(event) {
            if (event.persisted) {
                this.reset();
            }
        },

        onResize() {
            this.resizeCanvas();
            this.renderCurrent();
        },

        reset() {
            cancelAnimationFrame(this.raf);
            this.animation = null;
            this.palette = buildBackdropPalette(isDarkScheme());
            this.resizeCanvas();
            this.render(this.palette);
        },

        refresh() {
            this.reset();
        },

        currentBlobs() {
            const animation = this.animation;
            if (!this.palette) {
                return [];
            }
            if (!animation) {
                return this.palette.blobs;
            }
            const t = easeInOut(Math.min(1, (performance.now() - animation.start) / ANIMATION_MS));
            return interpolateBlobs(animation.from, animation.to, t);
        },

        animateToNewLayout() {
            if (!this.palette) {
                return;
            }
            cancelAnimationFrame(this.raf);
            const from = this.currentBlobs();
            this.palette = { ...this.palette, blobs: from };
            this.animation = {
                from,
                to: repositionBlobs(from),
                start: performance.now(),
            };
            this.raf = requestAnimationFrame(this.tick);
        },

        tick(now) {
            const animation = this.animation;
            if (!animation) {
                return;
            }
            const t = easeInOut(Math.min(1, (now - animation.start) / ANIMATION_MS));
            const blobs = interpolateBlobs(animation.from, animation.to, t);
            this.render({ ...this.palette, blobs });
            if (t < 1) {
                this.raf = requestAnimationFrame(this.tick);
                return;
            }
            this.palette = { ...this.palette, blobs: animation.to };
            this.animation = null;
        },

        renderCurrent() {
            if (!this.palette) {
                return;
            }
            this.render({ ...this.palette, blobs: this.currentBlobs() });
        },

        resizeCanvas() {
            const canvas = this.$refs.canvas;
            if (!canvas) {
                return;
            }
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const { clientWidth, clientHeight } = canvas;
            canvas.width = Math.round(clientWidth * dpr);
            canvas.height = Math.round(clientHeight * dpr);
            this.dpr = dpr;
        },

        render(palette) {
            const canvas = this.$refs.canvas;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx || !palette) {
                return;
            }
            const dpr = this.dpr ?? 1;
            const viewWidth = canvas.width / dpr;
            const viewHeight = canvas.height / dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const base = ctx.createLinearGradient(0, 0, viewWidth, viewHeight);
            base.addColorStop(0, palette.base[0]);
            base.addColorStop(.45, palette.base[1]);
            base.addColorStop(1, palette.base[2]);
            ctx.fillStyle = base;
            ctx.fillRect(0, 0, viewWidth, viewHeight);
            ctx.globalCompositeOperation = isDarkScheme() ? 'screen' : 'soft-light';
            for (const blob of palette.blobs) {
                const x = blob.x * viewWidth;
                const y = blob.y * viewHeight;
                const radius = blob.radius * Math.max(viewWidth, viewHeight);
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, oklchColor(blob.l, blob.c, blob.h, blob.alpha));
                gradient.addColorStop(.45, oklchColor(blob.l, blob.c * .65, blob.h, blob.alpha * .55));
                gradient.addColorStop(1, oklchColor(blob.l, blob.c * .2, blob.h, 0));
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, viewWidth, viewHeight);
            }
            ctx.globalCompositeOperation = 'source-over';
        },

    },

};
</script>

<style scoped>
.Backdrop {
    position: fixed;
    inset: 0;
    z-index: 0;
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
</style>
