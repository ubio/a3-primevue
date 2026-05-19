import { Mesh, MESH_REF } from 'mesh-ioc';

import { BaseRouter } from '../managers/BaseRouter.js';
import { NotificationLevel, NotificationsManager } from '../managers/NotificationsManager.js';

export interface HandleErrorOptions {
    genericMessage?: string;
    errorMessages?: Record<string, string>;
    level?: NotificationLevel;
    timeout?: number;
    route?: string;
}

export function handleError(options: HandleErrorOptions) {
    return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (this: { [MESH_REF]: Mesh }, ...args: unknown[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (error: unknown) {
                console.warn(error);
                const mesh = this[MESH_REF];
                const errorName = error instanceof Error ? error.name : 'Error';
                const message = options.errorMessages?.[errorName] ?? options.genericMessage;
                if (message) {
                    const notifications = mesh.resolve(NotificationsManager);
                    notifications.add({
                        message,
                        level: options.level ?? 'error',
                        timeout: options.timeout ?? 5000,
                    });
                }
                if (options.route) {
                    const router = mesh.resolve<BaseRouter>('RouterManager');
                    router.goto({ name: options.route });
                }
            }
        };
        return descriptor;
    };
}
