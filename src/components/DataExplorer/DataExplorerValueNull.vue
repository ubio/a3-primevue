<template>
    <span class="DataExplorerValueNull">
        {{ node.value }}
    </span>
</template>

<script>
export default {
    props: {
        node: { type: Object, required: true },
    },
};
</script>

<style scoped>
.DataExplorerValueNull {
    font-style: italic;
}
</style>
