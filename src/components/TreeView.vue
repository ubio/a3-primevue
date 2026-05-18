<template>
    <div class="TreeView">
        <TreeItem
            v-for="item in items"
            :key="item.id"
            :item="item"
            :storageKey="storageKey"
            :itemClass="itemClass"
            @itemClick="onItemClick">
            <template #default="{ item, isExpanded, toggleExpanded }">
                <slot
                    :item="item"
                    :isExpanded="isExpanded"
                    :toggleExpanded="toggleExpanded" />
            </template>
        </TreeItem>
    </div>
</template>

<script>
import TreeItem from './TreeItem.vue';

export default {

    components: {
        TreeItem,
    },

    props: {
        items: { type: Array, required: true },
        storageKey: { type: Function, required: false },
        itemClass: { type: Function, required: false },
    },

    emits: [
        'itemClick',
    ],

    methods: {

        onItemClick(item) {
            this.$emit('itemClick', item);
        },

    },

};
</script>
