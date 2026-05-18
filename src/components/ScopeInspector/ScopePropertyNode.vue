<template>
    <div
        class="ScopePropertyNode"
        :class="`Type-${node.displayType}`">
        <div
            class="Line"
            @click="toggle">
            <div class="Expand">
                <template v-if="node.canExpand">
                    <i
                        v-if="!node.expanded"
                        class="far fa-angle-right"
                        title="Show more" />
                    <i
                        v-if="node.expanded"
                        class="far fa-angle-down"
                        title="Show less" />
                </template>
            </div>
            <span
                class="Name"
                :title="node.name">{{ node.name }}:&nbsp;</span>
            <span class="Value">{{ node.displayValue }}</span>
            <span
                v-if="node.loading"
                class="Loading">loading</span>
        </div>
        <div
            v-if="node.expanded"
            class="Body">
            <div
                class="Gutter"
                :title="`Collapse ${node.name}`"
                @click.stop="toggle" />
            <ScopePropertyNode
                v-for="child of node.children"
                :key="child.path"
                :node="child"
                :scopeInspector="scopeInspector" />
        </div>
    </div>
</template>

<script>
export default {

    name: 'ScopePropertyNode',

    props: {
        node: { type: Object, required: true },
        scopeInspector: { type: Object, required: true },
    },

    methods: {

        toggle() {
            this.scopeInspector.toggle(this.node);
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
    font-family: var(--font-monospace);
    font-size: 11px;
    line-height: 20px;
    white-space: nowrap;
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
    color: var(--p-text-muted-color);
    cursor: pointer;
}

.Name {
    flex: 0 0 auto;
    min-width: 80px;
    max-width: 160px;
    overflow: hidden;
    color: var(--p-text-color);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.Value {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    color: var(--ScopeProperty-value-color);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.Loading {
    flex: 0 0 auto;
    color: var(--p-text-muted-color);
}

.Type-number { --ScopeProperty-value-color: light-dark(#0550ae, #79c0ff) }
.Type-string { --ScopeProperty-value-color: light-dark(#0a3069, #a5d6ff) }
.Type-boolean { --ScopeProperty-value-color: light-dark(#cf222e, #ff7b72) }
.Type-object { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-array { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-function { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-date { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-error { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-map { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-promise { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-proxy { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-regexp { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-set { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-typedarray { --ScopeProperty-value-color: light-dark(#8250df, #d2a8ff) }
.Type-any { --ScopeProperty-value-color: light-dark(#6e7781, #8b949e) }
.Type-undefined { --ScopeProperty-value-color: light-dark(#6e7781, #8b949e) }
.Type-null { --ScopeProperty-value-color: light-dark(#6e7781, #8b949e) }

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
</style>
