<template>
    <span class="DataExplorerValueArray">
        <template v-if="!node.isExpanded()">
            <span class="ArrayCount">
                {{ node.ownKeysCount }}
            </span>
            <span class="ArrayPreview">
                [
                <template
                    v-for="(v, i) in slice"
                    :key="i">
                    <span v-if="i !== 0">, </span>
                    <span :title="String(v)">{{ node.ctl.abbreviateValue(v, 20) }}</span>
                </template>
                <template v-if="slice.length < node.ownKeysCount">
                    <span v-if="slice.length > 0">, </span>
                    <span>&hellip;</span>
                </template>
                ]
            </span>
        </template>

        <template v-else>
            [{{ node.ownKeysCount }} item{{ node.ownKeysCount === 1 ? '' : 's' }}]
        </template>
    </span>
</template>

<script>
export default {
    props: {
        node: { type: Object, required: true },
    },

    computed: {
        slice() {
            return this.node.value.slice(0, 10);
        },
    },
};
</script>

<style scoped>
.DataExplorerValueArray {
    display: inline-flex;
    flex-flow: row;
    align-items: center;
    gap: 0.25rem;
}

.ArrayCount {
    display: inline-block;
    padding: 0 0.25rem;
    border-radius: 0.125rem;
    font-size: 0.75rem;
    background-color: var(--p-zinc-200);
    color: var(--p-zinc-700);
}

.ArrayPreview {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
