<template>
    <span class="DataExplorerValue">
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
