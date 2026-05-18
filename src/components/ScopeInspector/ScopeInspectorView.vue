<template>
    <div class="ScopeInspectorView">
        <div
            v-if="!scopeInspector.rootNodes.length"
            class="Empty">
            No paused scope
        </div>
        <ScopePropertyNode
            v-for="node of scopeInspector.rootNodes"
            :key="node.path"
            :node="node"
            :scopeInspector="scopeInspector" />
    </div>
</template>

<script>
import ScopePropertyNode from './ScopePropertyNode.vue';

export default {

    components: {
        ScopePropertyNode,
    },

    props: {
        scopeInspector: { type: Object, required: true },
    },

};
</script>

<style scoped>
.ScopeInspectorView {
    min-width: 0;
    overflow: auto;
    font-family: var(--font-monospace);
    font-size: 11px;
    font-variant-ligatures: none;
}

.Empty {
    padding: var(--sp);
    color: var(--p-text-muted-color);
}
</style>
