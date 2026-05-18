<template>
    <div
        class="Filler"
        :class="[
            `Filler-${fill}`,
        ]" />
</template>

<script>
export default {

    props: {
        fill: { type: String, default: 'none' },
    }

};
</script>

<style scoped>
.Filler {
    --Filler-color: light-dark(var(--p-surface-200), var(--p-surface-800));

    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
}

.Filler-dotted {
    border-bottom: 2px dotted var(--Filler-color);
}

.Filler-dashed {
    border-bottom: 2px dashed var(--Filler-color);
}

.Filler-solid {
    border-bottom: 2px solid var(--Filler-color);
}
</style>
