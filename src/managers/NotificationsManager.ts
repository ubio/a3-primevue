import ToastEventBus from 'primevue/toasteventbus';

export type NotificationLevel = 'info' | 'warn' | 'error';

export interface NotificationOptions {
    message: string;
    level?: NotificationLevel;
    timeout?: number;
}

export class NotificationsManager {

    add(options: NotificationOptions) {
        const level = options.level ?? 'info';
        const timeout = options.timeout ?? (level === 'error' ? 10000 : 5000);
        const summary = this.getSummary(level);
        ToastEventBus.emit('add', {
            severity: level === 'warn' ? 'warn' : level,
            summary,
            detail: options.message,
            life: timeout,
        });
    }

    addInfo(message: string, timeout = 5000) {
        this.add({ message, level: 'info', timeout });
    }

    addWarning(message: string, timeout = 7000) {
        this.add({ message, level: 'warn', timeout });
    }

    addError(message: string, timeout = 10000) {
        this.add({ message, level: 'error', timeout });
    }

    private getSummary(level: NotificationLevel): string {
        switch (level) {
            case 'info': return 'Info';
            case 'warn': return 'Warning';
            case 'error': return 'Error';
        }
    }

}
