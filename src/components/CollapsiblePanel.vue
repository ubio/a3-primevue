<template>
    <div class="CollapsiblePanel">
        <HGroup
            class="PanelHeader"
            :aria-expanded="String(!isCollapsed)"
            @click="toggle">
            <i
                class="ToggleIcon far"
                :class="isCollapsed ? 'fa-angle-right' : 'fa-angle-down'" />
            <slot name="header" />
        </HGroup>

        <div
            v-if="!isCollapsed"
            class="PanelBody">
            <slot />
        </div>
    </div>
</template>

<script>
export default {

    props: {
        initiallyCollapsed: { type: Boolean, default: true },
        persistedId: { type: String, default: null },
    },

    data() {
        return {
            isCollapsed: this.getInitialCollapsedValue(),
        };
    },

    methods: {

        toggle() {
            this.isCollapsed = !this.isCollapsed;
            this.persistCollapsedValue();
        },

        getInitialCollapsedValue() {
            if (!this.persistedId) {
                return this.initiallyCollapsed;
            }
            try {
                const value = localStorage.getItem(this.getStorageKey());
                return value == null ? this.initiallyCollapsed : value === 'true';
            } catch {
                return this.initiallyCollapsed;
            }
        },

        persistCollapsedValue() {
            if (!this.persistedId) {
                return;
            }
            try {
                localStorage.setItem(this.getStorageKey(), String(this.isCollapsed));
            } catch {
                // Ignore storage failures (private mode/quota/etc).
            }
        },

        getStorageKey() {
            return `collapsiblePanel.${this.persistedId}`;
        },
    },

};
</script>

<style scoped>
.CollapsiblePanel {
    border: 1px solid var(--iso-surface-200);
    border-radius: var(--p-border-radius-md);
    overflow: hidden;
}

.PanelHeader {
    min-height: var(--form-field-height);
    padding: 0 var(--sp);
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    gap: var(--sp0-5);
    text-align: left;
    cursor: pointer;
}

.PanelHeader:hover {
    background: var(--iso-surface-50);
}

.ToggleIcon {
    width: var(--sp2);
    color: var(--iso-surface-600);
    flex: 0 0 auto;
}

.HeaderContent {
    min-width: 0;
    flex: 1;
}

.PanelBody {
    border-top: 1px solid var(--iso-surface-200);
    padding: var(--sp);
}
</style>
