<template>
    <div
        class="DataExplorerNode"
        :class="[
            `Type-${node.type}`,
            {
                'Error': node.isError,
            }
        ]">
        <div
            class="Line"
            @click="node.toggleExpanded()"
            @contextmenu.stop.prevent="onLineMenu()">
            <div
                v-if="!node.isRoot || node.canExpand"
                class="Expand">
                <template v-if="node.canExpand">
                    <i
                        v-if="!node.isExpanded()"
                        class="far fa-angle-right"
                        title="Show more" />
                    <i
                        v-if="node.isExpanded()"
                        class="far fa-angle-down"
                        title="Show less" />
                </template>
            </div>

            <div
                v-if="!node.isRoot"
                class="Key"
                :class="{
                    'ArrayKey': node.parent?.type === 'array',
                }"
                :title="node.key">
                {{ node.key }}:&nbsp;
            </div>

            <component
                :is="valueComponent"
                class="Value"
                :node="node" />

            <div class="Controls">
                <Button
                    v-if="node.type === 'string'"
                    icon="fa-solid fa-eye"
                    size="small"
                    text
                    rounded
                    title="Show full value in popup"
                    @click.stop="showStringPopup()" />
                <div v-if="node.isError">
                    <Button
                        ref="errorPopupToggle"
                        icon="fa-solid fa-eye"
                        size="small"
                        text
                        rounded
                        class="cursor-pointer ml-2 text-xs z-[100]"
                        title="Show full value in popup"
                        @click="popupShown = true"
                        @click.stop.prevent />
                    <Dialog
                        v-model:visible="popupShown"
                        modal
                        dismissableMask
                        header="Error Details"
                        :style="{ width: '50vw' }"
                        @hide="popupShown = false">
                        <div class="font-mono whitespace-pre-wrap break-words">
                            {{ node.value.message }}
                        </div>
                    </Dialog>
                </div>
                <Button
                    v-if="clipboardSupported"
                    size="small"
                    :icon="justCopied ? 'fa-solid fa-check' : 'fa-solid fa-clipboard'"
                    text
                    rounded
                    title="Copy to clipboard"
                    @click.stop="copyToClipboard()" />

                <slot
                    name="controls"
                    :node="node" />
            </div>
            <Dialog
                v-model:visible="stringPopupShown"
                modal
                dismissableMask
                header="Full Value"
                :style="{ width: '50vw' }"
                @hide="stringPopupShown = false">
                <div class="StringValue">
                    {{ node.value }}
                </div>
            </Dialog>
        </div>

        <div
            v-if="node.isExpanded()"
            class="Body">
            <div
                v-if="node.isImageData()"
                class="ImageData">
                <div class="text-sm text-muted-color">
                    ImageData: {{ node.value.width }}x{{ node.value.height }}
                </div>
            </div>

            <template v-else>
                <div
                    class="Gutter"
                    :title="`Collapse ${node.key || node.type}`"
                    @click.stop="node.toggleExpanded()" />

                <DataExplorerNode
                    v-for="(child, i) in children"
                    :key="i"
                    :node="child">
                    <template #controls="{ node: childNode }">
                        <slot
                            name="controls"
                            :node="childNode" />
                    </template>
                </DataExplorerNode>

                <div
                    v-if="hasMore"
                    class="More"
                    @click="showMore()">
                    Show more
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { DataExplorerNode } from './DataExplorerController.js';
import DataExplorerValueArray from './DataExplorerValueArray.vue';
import DataExplorerValueBoolean from './DataExplorerValueBoolean.vue';
import DataExplorerValueNull from './DataExplorerValueNull.vue';
import DataExplorerValueNumber from './DataExplorerValueNumber.vue';
import DataExplorerValueObject from './DataExplorerValueObject.vue';
import DataExplorerValueString from './DataExplorerValueString.vue';

export default {
    name: 'DataExplorerNode',

    components: {
        DataExplorerValueArray,
        DataExplorerValueBoolean,
        DataExplorerValueNull,
        DataExplorerValueNumber,
        DataExplorerValueObject,
        DataExplorerValueString,
    },

    props: {
        node: { type: Object, required: true },
    },

    emits: [
        'linemenu',
    ],

    data() {
        return {
            justCopied: false,
            clipboardSupported: !!navigator.clipboard,
            popupShown: false,
            stringPopupShown: false,
            childrenLimit: 100,
        };
    },

    computed: {
        valueComponent() {
            return 'DataExplorerValue' + this.capitalize(this.node.type);
        },

        valueColorClass() {
            return '';
        },

        hasMore() {
            return (this.node.value?.length ?? 0) > this.childrenLimit;
        },

        children() {
            const { node } = this;
            const children = [];
            for (const [key, value] of Object.entries(node.getValueEntries(this.childrenLimit))) {
                const child = new DataExplorerNode(node.ctl, node, value, key);
                children.push(child);
            }
            return children;
        },
    },

    methods: {
        showMore() {
            this.childrenLimit += 100;
        },

        showStringPopup() {
            this.stringPopupShown = true;
        },

        copyToClipboard() {
            if (!this.clipboardSupported) {
                return;
            }
            const value = this.node.value;
            const text = typeof value === 'string' ?
                value :
                JSON.stringify(value, null, 2) ?? String(value);
            navigator.clipboard.writeText(text)
                .then(() => {
                    this.justCopied = true;
                    setTimeout(() => {
                        this.justCopied = false;
                    }, 500);
                });
        },

        onLineMenu() {
            this.$emit('linemenu', {
                node: this.node,
            });
        },

        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
    },
};
</script>

<style scoped>
.Line {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    height: 20px;
    border-radius: 4px;
    gap: 2px;
    white-space: nowrap;
    line-height: 20px;
    cursor: pointer;
}

.Line:hover {
    background-color: var(--iso-surface-50);
}

.Expand {
    flex: 0 0 var(--sp2);
    width: var(--sp2);
    height: var(--sp2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--p-text-muted-color);
}

.Key {
    flex: 0 0 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 80px;
    max-width: 160px;
    color: var(--p-text-color);
}

.ArrayKey {
    min-width: 40px;
}

.Value {
    flex: 1 1 auto;
    min-width: 0;
    color: var(--DataExplorer-value-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.Type-number { --DataExplorer-value-color: light-dark(#0550ae, #79c0ff) }
.Type-string { --DataExplorer-value-color: light-dark(#0a3069, #a5d6ff) }
.Type-boolean { --DataExplorer-value-color: light-dark(#cf222e, #ff7b72) }
.Type-object { --DataExplorer-value-color: light-dark(#8250df, #d2a8ff) }
.Type-array { --DataExplorer-value-color: light-dark(#8250df, #d2a8ff) }
.Type-any { --DataExplorer-value-color: light-dark(#6e7781, #8b949e) }
.Type-null { --DataExplorer-value-color: light-dark(#6e7781, #8b949e) }

.Error {
    --DataExplorer-value-color: light-dark(#cf222e, #ff7b72);
}

.Body {
    position: relative;
    padding-left: 16px;
}

.Gutter {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 16px;
    border-radius: 2px;
    cursor: n-resize;
}

.Gutter::after {
    content: '';
    position: absolute;
    z-index: 0;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    margin-left: -1px;
    border-radius: 4px;
    background-color: var(--iso-surface-200);
}

.Gutter:hover::after {
    background-color: var(--iso-surface-200);
}

.Controls {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 2px;
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
}

.Line:hover .Controls {
    opacity: 1;
}

.More {
    color: var(--iso-primary-color);
    padding-left: 16px;
    cursor: pointer;
    line-height: 16px;
}

.StringValue {
    font-family: monospace;
    font-size: var(--font-size-sm);
    white-space: pre-wrap;
    word-break: break-word;
}
</style>
