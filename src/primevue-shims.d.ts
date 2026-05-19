declare module 'primevue/toasteventbus' {
    const ToastEventBus: {
        emit(event: string, message: unknown): void;
    };
    export default ToastEventBus;
}
