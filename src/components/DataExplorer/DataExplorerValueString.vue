<template>
    <div class="DataExplorerValueString">
        {{ node.ctl.abbreviateValue(node.value, maxLength) }}
    </div>
</template>

<script>
export default {

    props: {
        node: { type: Object, required: true },
    },

    data() {
        return {
            maxLength: 100,
        };
    },

};
</script>

<style scoped>
.DataExplorerValueString {
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
