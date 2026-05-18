<template>
    <div class="TreeItem">
        <div
            class="Row"
            :class="getItemClass()"
            @click="onClick">
            <i
                v-if="isExpandable"
                class="ExpandIcon"
                :class="isExpanded ? 'far fa-angle-down' : 'far fa-angle-right'" />
            <slot
                :item="item"
                :isExpanded="isExpanded"
                :toggleExpanded="toggleExpanded" />
        </div>
        <div
            v-if="isExpanded"
            class="Children">
            <TreeView
                :items="item.children"
                :storageKey="storageKey"
                :itemClass="itemClass"
                @itemClick="emitClick">
                <template #default="{ item, isExpanded, toggleExpanded }">
                    <slot
                        :item="item"
                        :isExpanded="isExpanded"
                        :toggleExpanded="toggleExpanded" />
                </template>
            </TreeView>
        </div>
    </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';

export default {

    components: {
        TreeView: defineAsyncComponent(() => import('./TreeView.vue')),
    },

    props: {
        item: { type: Object, required: true },
        storageKey: { type: Function, required: false },
        itemClass: { type: Function, required: false },
    },

    emits: [
        'itemClick',
    ],

    data() {
        return {
            isCollapsed: this.getCollapsedValue(),
        };
    },

    computed: {

        isExpandable() {
            return this.item.children?.length > 0;
        },

        isExpanded() {
            return this.isExpandable && !this.isCollapsed;
        },

    },

    methods: {

        getItemClass() {
            if (!this.itemClass) {
                return '';
            }
            return this.itemClass(this.item);
        },

        getCollapsedValue() {
            if (!this.storageKey) {
                return false;
            }
            return localStorage.getItem(this.storageKey(this.item)) === '1';
        },

        toggleExpanded() {
            this.isCollapsed = !this.isCollapsed;
            if (!this.storageKey) {
                return;
            }
            const key = this.storageKey(this.item);
            if (this.isCollapsed) {
                localStorage.setItem(key, '1');
            } else {
                localStorage.removeItem(key);
            }
        },

        onClick() {
            if (this.isExpandable) {
                this.toggleExpanded();
            }
            this.$emit('itemClick', this.item);
        },

        emitClick(ev) {
            this.$emit('itemClick', ev);
        }

    },

};
</script>

<style scoped>
.TreeItem {
    --tree-expand-icon-size: var(--sp2);
    --tree-children-margin: var(--sp2);
    --tree-row-padding: var(--sp);
}

.Row {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 2px var(--tree-row-padding);
}

.Row:hover {
    background: var(--iso-surface-50);
}

.ExpandIcon {
    flex: 0 0 var(--tree-expand-icon-size);
    width: var(--tree-expand-icon-size);
    display: flex;
    align-items: center;
    justify-content: center;
}

.Children {
    margin-left: calc(var(--tree-children-margin) - 1px);
    border-left: 2px solid var(--iso-surface-200);
}
</style>
