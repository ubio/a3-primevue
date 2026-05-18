<template>
    <div
        ref="root"
        class="SplitPanel"
        :class="{
            'SplitPanel-horizontal': dir === 'h',
            'SplitPanel-vertical': dir === 'v',
        }">
        <template v-for="(panel, index) in visiblePanels" :key="panel.key">
            <div
                class="Pane"
                :style="paneStyle(index)">
                <slot
                    v-if="panel.slotName"
                    :name="panel.slotName"
                    :isCollapsed="isPanelCollapsed(panel.key)"
                    :setCollapsed="(nextValue) => setPanelCollapsed(panel.key, nextValue)"
                    :toggleCollapsed="() => togglePanelCollapsed(panel.key)" />
                <component
                    :is="panel.component"
                    v-else-if="panel.component"
                    v-bind="panel.props ?? {}" />
            </div>
            <div
                v-if="index < visiblePanels.length - 1"
                class="Divider"
                :class="{ 'Divider-active': activeDividerIndex === index, }"
                @pointerdown="onPointerDown($event, index)" />
        </template>
    </div>
</template>

<script>
export default {

    props: {
        dir: { type: String, required: true, },
        splitId: { type: String, required: true, },
        defaultSplit: { type: Number, default: 0.5, },
        defaultSplits: { type: Array, default: null, },
        minSplit: { type: Number, default: 0.1, },
        stretchPanelKey: { type: String, default: null, },
        panels: {
            type: Array,
            required: true,
        },
    },

    emits: [
        'resizing'
    ],

    data() {
        return {
            splits: [this.defaultSplit, 1 - this.defaultSplit],
            panelSizesByKey: {},
            collapsedByKey: {},
            isMoving: false,
            activeDividerIndex: null,
        };
    },

    computed: {
        normalizedMinSplit() {
            const min = Math.max(0.01, this.minSplit);
            return Math.min(0.49, min);
        },

        panelDefs() {
            return this.panels.map((panel, index) => ({
                key: panel?.key ?? `panel-${index}`,
                slotName: panel?.slot ?? null,
                component: panel?.component ?? null,
                props: panel?.props ?? {},
                isShown: panel?.isShown !== false,
                isCollapsed: panel?.isCollapsed === true,
                sizePx: Number.isFinite(panel?.sizePx) && panel.sizePx > 0 ?
                    panel.sizePx :
                    null,
            }));
        },

        visiblePanels() {
            return this.panelDefs.filter(panel => panel.isShown);
        },

    },

    watch: {
        panelDefs: {
            deep: true,
            handler() {
                this.collapsedByKey = this.normalizeCollapsedMap(this.collapsedByKey);
            },
        },
        visiblePanels: {
            deep: true,
            handler() {
                this.splits = this.normalizeSplits(this.splits);
            },
        },
    },

    mounted() {
        const stored = this.loadStoredState();
        this.splits = this.normalizeSplits(stored.splits);
        this.panelSizesByKey = this.normalizePanelSizesMap(stored.panelSizesByKey);
        this.collapsedByKey = this.normalizeCollapsedMap(stored.collapsedByKey);
    },

    methods: {

        getStorageKey() {
            return `split:v4:${this.splitId}`;
        },

        getLegacyStorageKey() {
            return `split:v2:${this.splitId}`;
        },

        loadStoredState() {
            const raw = localStorage.getItem(this.getStorageKey());
            if (!raw) {
                return this.loadLegacyStoredState();
            }
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.every(v => Number.isFinite(v))) {
                    return {
                        splits: parsed,
                        panelSizesByKey: {},
                        collapsedByKey: {},
                    };
                }
                if (parsed && typeof parsed === 'object') {
                    return {
                        splits: Array.isArray(parsed.splits) ? parsed.splits : this.getDefaultSplits(),
                        panelSizesByKey: parsed.panelSizesByKey ?? {},
                        collapsedByKey: parsed.collapsedByKey ?? {},
                    };
                }
            } catch {
                // Corrupted payload.
            }
            return {
                splits: this.getDefaultSplits(),
                panelSizesByKey: {},
                collapsedByKey: {},
            };
        },

        loadLegacyStoredState() {
            const raw = localStorage.getItem(this.getLegacyStorageKey());
            if (!raw) {
                return {
                    splits: this.getDefaultSplits(),
                    panelSizesByKey: {},
                    collapsedByKey: {},
                };
            }
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.every(v => Number.isFinite(v))) {
                    return {
                        splits: parsed,
                        panelSizesByKey: {},
                        collapsedByKey: {},
                    };
                }
            } catch {
                // Corrupted payload.
            }
            return {
                splits: this.getDefaultSplits(),
                panelSizesByKey: {},
                collapsedByKey: {},
            };
        },

        saveStoredState() {
            localStorage.setItem(this.getStorageKey(), JSON.stringify({
                splits: this.splits,
                panelSizesByKey: this.panelSizesByKey,
                collapsedByKey: this.collapsedByKey,
            }));
        },

        getDefaultSplits() {
            const panelCount = this.visiblePanels.length;
            return this.getDefaultSplitsForCount(panelCount);
        },

        getDefaultSplitsForCount(panelCount) {
            if (panelCount <= 1) {
                return [1];
            }
            if (Array.isArray(this.defaultSplits) && this.defaultSplits.length > 0) {
                const normalized = this.normalizeSplits(this.defaultSplits, { allowFallback: false, });
                if (normalized) {
                    return normalized;
                }
            }
            if (panelCount === 2) {
                return this.normalizeSplits([this.defaultSplit, 1 - this.defaultSplit]);
            }
            return this.normalizeSplits(new Array(panelCount).fill(1 / panelCount));
        },

        normalizeSplits(candidate, options = {}) {
            const { allowFallback = true, } = options;
            const panelCount = this.visiblePanels.length;
            if (panelCount <= 1) {
                return [1];
            }
            const raw = Array.isArray(candidate) ? candidate : [];
            if (raw.length !== panelCount) {
                return allowFallback ? this.getDefaultSplitsForCount(panelCount) : null;
            }
            const values = [];
            for (let i = 0; i < panelCount; i += 1) {
                const next = raw[i];
                if (!Number.isFinite(next) || next <= 0) {
                    return allowFallback ? this.getDefaultSplitsForCount(panelCount) : null;
                }
                values.push(next);
            }
            const total = values.reduce((sum, value) => sum + value, 0);
            if (total <= 0) {
                return allowFallback ? this.getDefaultSplitsForCount(panelCount) : null;
            }
            return values.map(value => value / total);
        },

        paneStyle(index) {
            const panel = this.visiblePanels[index];
            if (!panel) {
                return {};
            }
            if (this.isPanelCollapsed(panel.key)) {
                return {
                    flexShrink: 0,
                    flexBasis: 'auto',
                };
            }
            if (this.dir === 'h' && this.stretchPanelKey) {
                if (panel.key === this.stretchPanelKey) {
                    return {
                        flexGrow: 1,
                        flexShrink: 1,
                        flexBasis: 'auto',
                    };
                }
                return {
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: `${this.getPanelSizePx(panel.key)}px`,
                };
            }
            const split = this.splits[index] ?? 0;
            const expandedIndices = this.visiblePanels
                .map((item, idx) => ({ item, idx }))
                .filter(({ item }) => !this.isPanelCollapsed(item.key))
                .map(({ idx }) => idx);
            const expandedTotal = expandedIndices
                .reduce((sum, idx) => sum + (this.splits[idx] ?? 0), 0);
            const effectiveSplit = expandedTotal > 0 ? split / expandedTotal : 1;
            return {
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: `${effectiveSplit * 100}%`,
            };
        },

        normalizePanelSizesMap(candidate) {
            const source = candidate && typeof candidate === 'object' ? candidate : {};
            return this.panelDefs.reduce((result, panel) => {
                if (!panel?.key || panel.key === this.stretchPanelKey) {
                    return result;
                }
                const fromStore = source[panel.key];
                if (Number.isFinite(fromStore) && fromStore > 0) {
                    result[panel.key] = fromStore;
                    return result;
                }
                if (Number.isFinite(panel.sizePx) && panel.sizePx > 0) {
                    result[panel.key] = panel.sizePx;
                    return result;
                }
                result[panel.key] = 320;
                return result;
            }, {});
        },

        getPanelSizePx(panelKey) {
            const panel = this.panelDefs.find(entry => entry.key === panelKey);
            if (!panel || panel.key === this.stretchPanelKey) {
                return 0;
            }
            const fromState = this.panelSizesByKey[panelKey];
            if (Number.isFinite(fromState) && fromState > 0) {
                return fromState;
            }
            if (Number.isFinite(panel.sizePx) && panel.sizePx > 0) {
                return panel.sizePx;
            }
            return 320;
        },

        isPanelCollapsed(panelKey) {
            if (!panelKey) {
                return false;
            }
            return this.collapsedByKey[panelKey] === true;
        },

        setPanelCollapsed(panelKey, nextValue) {
            const normalizedValue = nextValue === true;
            if (this.isPanelCollapsed(panelKey) === normalizedValue) {
                return;
            }
            this.collapsedByKey = {
                ...this.collapsedByKey,
                [panelKey]: normalizedValue,
            };
            this.saveStoredState();
            this.$emit('resizing');
        },

        togglePanelCollapsed(panelKey) {
            this.setPanelCollapsed(panelKey, !this.isPanelCollapsed(panelKey));
        },

        normalizeCollapsedMap(candidate) {
            const fallback = {};
            const source = candidate && typeof candidate === 'object' ? candidate : fallback;
            return this.panelDefs.reduce((result, panel) => {
                if (!panel?.key) {
                    return result;
                }
                if (Object.prototype.hasOwnProperty.call(source, panel.key)) {
                    result[panel.key] = source[panel.key] === true;
                    return result;
                }
                result[panel.key] = panel.isCollapsed;
                return result;
            }, {});
        },

        getPointerRatio(event) {
            const rect = this.$refs.root.getBoundingClientRect();
            if (this.dir === 'h') {
                return (event.clientX - rect.left) / rect.width;
            }
            return (event.clientY - rect.top) / rect.height;
        },

        getPointerPixels(event) {
            const rect = this.$refs.root.getBoundingClientRect();
            if (this.dir === 'h') {
                return event.clientX - rect.left;
            }
            return event.clientY - rect.top;
        },

        getPaneElements() {
            const root = this.$refs.root;
            if (!root) {
                return [];
            }
            return Array.from(root.children).filter(child => child.classList?.contains('Pane'));
        },

        getPanePixelSize(el) {
            if (!el) {
                return 0;
            }
            return this.dir === 'h' ? el.offsetWidth : el.offsetHeight;
        },

        getResizablePairIndices(dividerIndex) {
            let leftIndex = dividerIndex;
            while (leftIndex >= 0) {
                const panel = this.visiblePanels[leftIndex];
                if (panel && !this.isPanelCollapsed(panel.key)) {
                    break;
                }
                leftIndex -= 1;
            }
            let rightIndex = dividerIndex + 1;
            while (rightIndex < this.visiblePanels.length) {
                const panel = this.visiblePanels[rightIndex];
                if (panel && !this.isPanelCollapsed(panel.key)) {
                    break;
                }
                rightIndex += 1;
            }
            if (
                leftIndex < 0 ||
                rightIndex >= this.visiblePanels.length ||
                leftIndex === rightIndex
            ) {
                return null;
            }
            return { leftIndex, rightIndex };
        },

        onPointerDown(event, dividerIndex) {
            if (this.visiblePanels.length < 2) {
                return;
            }
            event.preventDefault();
            this.isMoving = true;
            this.activeDividerIndex = dividerIndex;
            window.addEventListener('pointermove', this.onPointerMove);
            window.addEventListener('pointerup', this.onPointerUp);
        },

        onPointerMove(ev) {
            const dividerIndex = this.activeDividerIndex;
            if (dividerIndex == null) {
                return;
            }
            const pairIndices = this.getResizablePairIndices(dividerIndex);
            if (!pairIndices) {
                return;
            }
            const { leftIndex, rightIndex } = pairIndices;
            if (this.dir === 'h' && this.stretchPanelKey) {
                this.onPointerMovePixelSizing(ev, leftIndex, rightIndex);
                return;
            }
            const nextSplits = [...this.splits];
            const left = nextSplits[leftIndex] ?? 0;
            const right = nextSplits[rightIndex] ?? 0;
            const pairWeight = left + right;
            if (!Number.isFinite(pairWeight) || pairWeight <= 0) {
                return;
            }
            const paneElements = this.getPaneElements();
            if (paneElements.length !== this.visiblePanels.length) {
                return;
            }
            const expandedEntries = this.visiblePanels
                .map((panel, panelIndex) => ({ panel, panelIndex, el: paneElements[panelIndex] }))
                .filter(({ panel }) => !this.isPanelCollapsed(panel.key))
                .map(({ panelIndex, el }) => ({
                    panelIndex,
                    size: this.getPanePixelSize(el),
                }));
            if (expandedEntries.length < 2) {
                return;
            }
            const leftExpandedIndex = expandedEntries.findIndex(entry => entry.panelIndex === leftIndex);
            const rightExpandedIndex = expandedEntries.findIndex(entry => entry.panelIndex === rightIndex);
            if (
                leftExpandedIndex < 0 ||
                rightExpandedIndex < 0 ||
                rightExpandedIndex - leftExpandedIndex !== 1
            ) {
                return;
            }
            const expandedTotalSize = expandedEntries.reduce((sum, entry) => sum + entry.size, 0);
            const pairSize = expandedEntries[leftExpandedIndex].size + expandedEntries[rightExpandedIndex].size;
            if (expandedTotalSize <= 0 || pairSize <= 0) {
                return;
            }
            const firstExpandedPanelIndex = expandedEntries[0].panelIndex;
            const expandedStartOffset = paneElements
                .slice(0, firstExpandedPanelIndex)
                .reduce((sum, el) => sum + this.getPanePixelSize(el), 0);
            const pointerInExpanded = this.getPointerPixels(ev) - expandedStartOffset;
            const before = expandedEntries
                .slice(0, leftExpandedIndex)
                .reduce((sum, entry) => sum + entry.size, 0);
            const min = this.normalizedMinSplit * expandedTotalSize;
            const minPos = before + min;
            const maxPos = before + pairSize - min;
            const target = Math.min(maxPos, Math.max(minPos, pointerInExpanded));
            const leftRatio = (target - before) / pairSize;
            nextSplits[leftIndex] = pairWeight * leftRatio;
            nextSplits[rightIndex] = pairWeight - nextSplits[leftIndex];
            this.splits = this.normalizeSplits(nextSplits);
            this.$emit('resizing');
        },

        onPointerMovePixelSizing(ev, leftIndex, rightIndex) {
            const paneElements = this.getPaneElements();
            if (paneElements.length !== this.visiblePanels.length) {
                return;
            }
            const leftPanel = this.visiblePanels[leftIndex];
            const rightPanel = this.visiblePanels[rightIndex];
            if (!leftPanel || !rightPanel) {
                return;
            }
            const leftSize = this.getPanePixelSize(paneElements[leftIndex]);
            const rightSize = this.getPanePixelSize(paneElements[rightIndex]);
            const pairSize = leftSize + rightSize;
            if (pairSize <= 0) {
                return;
            }
            const before = paneElements
                .slice(0, leftIndex)
                .reduce((sum, el) => sum + this.getPanePixelSize(el), 0);
            const pointer = this.getPointerPixels(ev);
            const minPanelPx = 120;
            const minPos = before + minPanelPx;
            const maxPos = before + pairSize - minPanelPx;
            const target = Math.min(maxPos, Math.max(minPos, pointer));
            const nextLeft = target - before;
            const nextRight = pairSize - nextLeft;
            const nextSizesByKey = { ...this.panelSizesByKey };
            if (leftPanel.key !== this.stretchPanelKey) {
                nextSizesByKey[leftPanel.key] = nextLeft;
            }
            if (rightPanel.key !== this.stretchPanelKey) {
                nextSizesByKey[rightPanel.key] = nextRight;
            }
            this.panelSizesByKey = this.normalizePanelSizesMap(nextSizesByKey);
            this.$emit('resizing');
        },

        onPointerUp() {
            window.removeEventListener('pointermove', this.onPointerMove);
            window.removeEventListener('pointerup', this.onPointerUp);
            this.saveStoredState();
            this.isMoving = false;
            this.activeDividerIndex = null;
            this.$emit('resizing');
        },

    },

};
</script>

<style scoped>
.SplitPanel {
    --Split-divider-size: 1px;
    --Split-divider-color: var(--iso-surface-200);

    display: flex;
    min-width: 0;
    min-height: 0;
    flex: 1;
}

.SplitPanel-horizontal {
    flex-flow: row;
}

.SplitPanel-vertical {
    flex-flow: column;
}

.Pane {
    position: relative;
    z-index: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-flow: column nowrap;
}

.Pane {
    flex-grow: 0;
    flex-shrink: 1;
}

.Divider {
    position: relative;
    z-index: 2;
    flex: 0 0 0;
    background: var(--iso-surface-200);
}

.Divider::before,
.Divider::after {
    content: '';
    position: absolute;
}

.SplitPanel-horizontal > .Divider::before {
    top: 0;
    bottom: 0;
    width: var(--Split-divider-size);
    background: var(--Split-divider-color);
}

.SplitPanel-horizontal > .Divider::after {
    left: -4px;
    right: -4px;
    top: 0;
    bottom: 0;
}

.SplitPanel-vertical > .Divider::before {
    left: 0;
    right: 0;
    height: var(--Split-divider-size);
    background: var(--Split-divider-color);
}

.SplitPanel-vertical > .Divider::after {
    left: 0;
    right: 0;
    top: -4px;
    bottom: -4px;
}

.SplitPanel-horizontal > .Divider {
    cursor: col-resize;
}

.SplitPanel-vertical > .Divider {
    cursor: row-resize;
}

.Divider-active::before {
    background: var(--iso-primary-color) !important;
}

.SplitPanel-horizontal > .Divider-active::before {
    width: 4px;
}

.SplitPanel-vertical > .Divider-active::before {
    height: 4px;
}
</style>
