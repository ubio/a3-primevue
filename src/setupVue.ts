import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import { App as VueApp, Plugin } from 'vue';

export function setupVue(vue: VueApp) {
    vue.use(PrimeVue as unknown as Plugin, {
        theme: {
            preset: Aura,
            options: {
                cssLayer: {
                    name: 'primevue',
                    order: '',
                },
            },
        },
    });
}
