<template>
    <span class="DataExplorerValueObject">
        <template v-if="node.isError">
            <span class="ErrorName">
                {{ value.name }}
            </span>
            <span class="ErrorMessage">
                {{ node.ctl.abbreviateValue(value.message) }}
            </span>
        </template>

        <template v-else-if="node.isTypedArray">
            <span class="TypeName">
                {{ className }}
            </span>
            <span>
                {{ value.byteLength }} bytes
            </span>
        </template>

        <template v-else-if="isFileSystemHandle">
            <i
                v-if="value.kind === 'directory'"
                class="fa-solid fa-folder" />
            <i
                v-if="value.kind === 'file'"
                class="fa-solid fa-file" />
            <span>
                {{ value.name }}
            </span>
        </template>

        <template v-else-if="isCustomClass">
            <span class="TypeName">
                {{ className }}
            </span>
            <template v-if="hasCustomToString">
                <span class="ToStringValue">{{ node.ctl.abbreviateValue(value.toString()) }}</span>
            </template>
        </template>

        <template v-else-if="!isExpanded">
            <span class="ObjectPreview">
                {
                <template
                    v-for="(v, k, i) in valueEntries"
                    :key="k">
                    <span v-if="i !== 0">, </span>
                    <span :title="String(v)">{{ k }}: {{ node.ctl.abbreviateValue(v, 20) }}</span>
                </template>
                }
            </span>
        </template>

        <template v-else>
            { {{ node.ownKeysCount }} key{{ node.ownKeysCount === 1 ? '' : 's' }} }
        </template>
    </span>
</template>

<script>
export default {
    props: {
        node: { type: Object, required: true },
    },

    computed: {
        value() {
            return this.node.value;
        },

        isExpanded() {
            return this.node.isExpanded();
        },

        className() {
            return this.value.constructor.name ?? 'Object';
        },

        isCustomClass() {
            return this.className !== 'Object';
        },

        isFileSystemHandle() {
            return window.FileSystemHandle && this.value instanceof window.FileSystemHandle;
        },

        hasCustomToString() {
            return this.value.toString !== Object.prototype.toString;
        },

        valueEntries() {
            return this.node.getValueEntries(10);
        },
    },
};
</script>

<style scoped>
.DataExplorerValueObject {
    display: inline-flex;
    flex-flow: row;
    align-items: center;
    gap: 0.25rem;
}

.ErrorName {
    font-weight: bold;
}

.ErrorMessage {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.TypeName {
    font-weight: bold;
}

.ToStringValue {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ObjectPreview {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
