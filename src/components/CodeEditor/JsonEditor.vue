<template>
    <div class="JsonEditor">
        <CodeEditor
            v-bind="{
                modelValue: stringValue,
                label,
                labelStyle,
                language: 'json',
                placeholder,
                lineWrapping,
                focus,
            }"
            @update:modelValue="onUpdate($event)" />
        <div
            v-if="error"
            class="Error">
            {{ errorMessage }}
        </div>
    </div>
</template>

<script>
import CodeEditor from './CodeEditor.vue';

export default {

    components: {
        CodeEditor,
    },

    props: {
        modelValue: {},
        label: { type: String },
        labelStyle: { type: String },
        placeholder: { type: String },
        lineWrapping: { type: Boolean },
        focus: { type: Boolean },
    },

    emits: [
        'update:modelValue',
        'error:modelValue',
    ],

    data() {
        return {
            stringValue: JSON.stringify(this.modelValue, null, 2),
            error: null,
        };
    },

    computed: {

        errorMessage() {
            const { error } = this;
            return error?.message ?? error ?? '';
        },

    },

    methods: {

        onUpdate(value) {
            try {
                this.$emit('update:modelValue', JSON.parse(value));
                this.error = null;
            } catch (error) {
                this.error = error;
                this.$emit('error:modelValue', error);
            }
        },

    },

};
</script>

<style scoped>
.JsonEditor {
    display: flex;
    flex-flow: column;
    min-height: 0;
}

.Error {
    display: flex;
    flex-flow: row;
    padding: 1rem;
    color: var(--iso-danger-600);
}
</style>
