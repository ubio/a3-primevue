<template>
    <div
        class="DataExplorer"
        @contextmenu.stop>
        <DataExplorerNode
            :node="ctl.root"
            @linemenu="$emit('linemenu', $event)">
            <template #controls="{ node }">
                <slot
                    name="controls"
                    :node="node" />
            </template>
        </DataExplorerNode>
    </div>
</template>

<script>
import { DataExplorerController } from './DataExplorerController.js';
import DataExplorerNode from './DataExplorerNode.vue';

export default {

    components: {
        DataExplorerNode,
    },

    props: {
        value: { type: [Object, Array, String, Number, Boolean], default: null },
        defaultState: {
            type: String,
            default: 'collapsed',
        },
    },

    emits: [
        'linemenu',
    ],

    data() {
        return {
            ctl: new DataExplorerController(this.value, this.defaultState),
        };
    },

    watch: {

        value(newValue) {
            this.ctl.setRoot(newValue);
        },

    },
};
</script>

<style scoped>
.DataExplorer {
    font-family: monospace;
    font-variant-ligatures: none;
    font-size: 11px;
}
</style>
