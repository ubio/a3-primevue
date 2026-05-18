<template>
    <div
        class="CodeEditor"
        :class="{ 'CodeEditor--lineNumbers': lineNumbers }">
        <div
            ref="editor"
            class="CodeEditorContainer"
            role="textbox" />
    </div>
</template>

<script>
import { CodeMirrorController } from './CodeMirrorController.js';

export default {

    components: {},

    props: {
        modelValue: { type: String, default: '' },
        label: { type: String, default: '' },
        language: { type: String, default: 'javascript' },
        zoom: { type: Number, default: 1 },
        placeholder: { type: String, default: '' },
        lineWrapping: { type: Boolean },
        lineNumbers: { type: Boolean, default: false },
        focus: { type: Boolean, default: true },
        readOnly: { type: Boolean, default: false },
        debugEnabled: { type: Boolean, default: false },
        breakpoints: { type: Array, default: () => [] },
        executionLine: { type: Number, default: null },
    },

    emits: [
        'update:modelValue',
        'breakpointsChanged',
        'toggleBreakpoint',
    ],

    data() {
        return {
            loading: false,
            codeMirror: null,
        };
    },

    watch: {
        modelValue(newValue) {
            this.codeMirror?.syncDocument(newValue);
        },

        language(newLanguage, oldLanguage) {
            if (newLanguage === oldLanguage) {
                return;
            }
            this.rebuildEditor();
        },

        readOnly(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.rebuildEditor();
            }
        },

        debugEnabled(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.rebuildEditor();
            }
        },

        breakpoints: {
            deep: true,
            handler(value) {
                this.updateBreakpoints(value);
            },
        },

        executionLine(value) {
            this.updateExecutionLine(value);
        },
    },

    mounted() {
        this.init();
    },

    beforeUnmount() {
        this.destroyEditor();
    },

    methods: {

        async init() {
            try {
                this.loading = true;
                await this.initEditor();
            } finally {
                this.loading = false;
            }
        },

        async initEditor() {
            this.codeMirror = new CodeMirrorController({
                doc: this.modelValue,
                language: this.language,
                placeholder: this.placeholder,
                lineWrapping: this.lineWrapping,
                lineNumbers: this.lineNumbers,
                readOnly: this.readOnly,
                debugEnabled: this.debugEnabled,
                breakpoints: this.breakpoints ?? [],
                executionLine: this.executionLine ?? null,
                onChange: content => this.$emit('update:modelValue', content),
                onToggleBreakpoint: line => this.$emit('toggleBreakpoint', line),
                onBreakpointsChanged: breakpoints => this.$emit('breakpointsChanged', breakpoints),
            });
            await this.codeMirror.mount(this.$refs.editor);
        },

        async rebuildEditor() {
            if (this.loading) {
                return;
            }
            this.destroyEditor();
            await this.init();
        },

        destroyEditor() {
            this.codeMirror?.unmount();
            this.codeMirror = null;
        },

        updateBreakpoints(breakpoints) {
            this.codeMirror?.updateBreakpoints(breakpoints ?? []);
        },

        updateExecutionLine(line) {
            this.codeMirror?.updateExecutionLine(line ?? null);
        },

    },

};
</script>

<style scoped>
.CodeEditor {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
}

.CodeEditorContainer {
    flex: 1 1 auto;
    align-self: stretch;
    position: relative;
    overflow: auto;
    display: flex;
    flex-flow: row;
    min-height: 0;
    min-width: 0;
    margin: 0;
}
</style>

<style>
.cm-editor {
    flex: 1;
    min-width: 0;
    min-height: 0;
    height: 100%;
}

.cm-editor.cm-focused {
    outline: 0;
}

.cm-editor .cm-content {
    padding: 4px 0;
    min-width: max-content;
}

.cm-editor .cm-gutters {
    display: none;
}

.CodeEditor--lineNumbers .cm-editor .cm-gutters {
    display: flex;
}

.cm-editor .cm-gutters {
    background: var(--iso-surface-100);
    border-color: var(--iso-surface-200);
    color: var(--iso-surface-500);
}

.cm-editor .cm-scroller {
    overflow: auto;
    min-height: 0;
    font-family: var(--font-monospace);
    font-variant-ligatures: none;
    font-size: 11px;
    line-height: 16px;
}

/* Interactive elements */

.cm-editor .cm-activeLine {
    background: transparent;
}

.cm-editor.cm-focused .cm-activeLine {
    background: color-mix(in srgb, var(--iso-primary-100), transparent 50%);
}

.cm-editor .cm-line.cm-execution-line {
    background: light-dark(var(--p-amber-100), color-mix(in srgb, var(--p-amber-700), transparent 55%));
    font-weight: 700;
}

.cm-editor .cm-breakpoint-gutter {
    width: 16px;
    cursor: pointer;
}

.cm-editor .cm-breakpoint {
    display: block;
    width: 8px;
    height: 8px;
    margin: 4px;
    border-radius: 50%;
    background: var(--iso-danger-600);
}

.cm-editor .cm-cursor {
    border-width: 2px;
}

.cm-editor .cm-matchingBracket {
    background: color-mix(in srgb, var(--iso-primary-200), transparent 40%);
}

.cm-editor .cm-selectionBackground {
    background: color-mix(in srgb, var(--iso-primary-100), transparent 70%);
}

.cm-editor.cm-focused .cm-selectionBackground {
    background: color-mix(in srgb, var(--iso-primary-200), transparent 40%);
}

/* Syntax highlighting */

.tok-link {
    color: var(--iso-primary-500);
}
.tok-heading {
    font-weight: bold;
}
.tok-emphasis {
    font-style: italic;
}
.tok-strong {
    font-weight: bold;
}
.tok-keyword {
    color: var(--iso-primary-700);
}
.tok-atom {
    color: var(--iso-primary-600);
}
.tok-bool {
    color: var(--iso-primary-600);
}
.tok-url {
    color: var(--iso-primary-500);
}
.tok-labelName {
    color: var(--iso-primary-400);
}
.tok-inserted {
    color: var(--iso-primary-700);
}
.tok-deleted {
    color: var(--iso-primary-900);
}
.tok-literal {
    color: var(--iso-primary-600);
}
.tok-string {
    color: var(--iso-primary-700);
}
.tok-number {
    color: var(--iso-primary-800);
}
.tok-variableName {
    color: var(--iso-primary-950);
}
.tok-typeName {
    color: var(--iso-primary-800);
}
.tok-namespace {
    color: var(--iso-primary-800);
}
.tok-className {
    color: var(--iso-primary-800);
}
.tok-macroName {
    color: var(--iso-primary-800);
}
.tok-propertyName {
    color: var(--iso-primary-950);
}
.tok-operator {
    color: var(--iso-primary-500);
}
.tok-comment {
    color: var(--p-text-muted-color);
}
.tok-meta {
    color: var(--iso-primary-600);
}
.tok-punctuation {
    color: var(--iso-primary-900);
}
.tok-invalid {
    color: var(--iso-primary-900);
}
</style>
