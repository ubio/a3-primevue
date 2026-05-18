<template>
    <div class="ErrorMessage">
        <Button
            v-if="dismissable"
            class="DismissBtn"
            icon="fa-solid fa-xmark"
            size="small"
            text
            rounded
            @click="dismiss()" />
        <div class="Name">{{ error.name }}</div>
        <div class="Message">{{ error.message }}</div>
    </div>
</template>

<script>
export default {

    props: {
        error: { type: Object, required: true },
        dismissable: { type: Boolean, default: false },
    },

    emits: [
        'dismiss'
    ],

    methods: {

        dismiss() {
            this.$emit('dismiss');
        }

    }

};
</script>

<style scoped>
.ErrorMessage {
    position: relative;
    padding: var(--sp);
    border-radius: var(--p-border-radius-md);
    border: 2px solid var(--iso-danger-500);
    background: var(--iso-danger-50);
}

.Name {
    font-weight: bold;
}

.Message {
    white-space: pre-wrap;
    overflow: auto;
}

.DismissBtn {
    position: absolute;
    top: var(--sp0-5);
    right: var(--sp0-5);
    z-index: 10;
    color: var(--iso-danger-500);
}
</style>
