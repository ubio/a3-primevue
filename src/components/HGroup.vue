<template>
    <component
        :is="tagName"
        class="HGroup"
        :class="[
            `HGroup-align-${align}`,
            `HGroup-justify-${justify}`,
            `HGroup-gap-${gap}`,
            {
                'HGroup-wrap': wrap,
            }
        ]">
        <slot />
    </component>
</template>

<script>
export default {

    props: {
        tagName: { type: String, default: 'div' },
        align: { type: String, default: 'center' },
        justify: { type: String },
        gap: { type: String, default: '1' },
        wrap: { type: Boolean, default: false },
    }

};
</script>

<style scoped>
.HGroup {
    display: flex;
    flex-flow: row nowrap;
}

.HGroup-align-stretch { align-items: stretch; }
.HGroup-align-baseline { align-items: baseline; }
.HGroup-align-center { align-items: center; }
.HGroup-align-start { align-items: flex-start; }
.HGroup-align-end { align-items: flex-end; }

.HGroup-justify-center { justify-content: center; }
.HGroup-justify-start { justify-content: flex-start; }
.HGroup-justify-end { justify-content: flex-end; }
.HGroup-justify-space-around { justify-content: space-around; }
.HGroup-justify-space-between { justify-content: space-between; }

.HGroup-gap-0 { gap: 0 }
.HGroup-gap-0-5 { gap: var(--sp0-5) }
.HGroup-gap-1 { gap: var(--sp1) }
.HGroup-gap-1-5 { gap: var(--sp1-5) }
.HGroup-gap-2 { gap: var(--sp2) }
.HGroup-gap-2-5 { gap: var(--sp2-5) }
.HGroup-gap-3 { gap: var(--sp3) }
.HGroup-gap-4 { gap: var(--sp4) }
.HGroup-gap-5 { gap: var(--sp5) }
.HGroup-gap-6 { gap: var(--sp6) }
.HGroup-gap-7 { gap: var(--sp7) }
.HGroup-gap-8 { gap: var(--sp8) }

.HGroup-wrap { flex-wrap: wrap; }
</style>
