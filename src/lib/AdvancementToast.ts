import Advancement from "./UI Components/Advancement.svelte";

export type AdvancementToast = {
    title: string;
    description: string;
    src?: string;
    alt?: string;
    duration?: number;
}

let toasters: Advancement[] = [];

function remove(adv: Advancement) {
    const index = toasters.indexOf(adv);
    if (index > -1) toasters.splice(index, 1);

    adv.$$set({ exit: true });

    setTimeout(() => {
        adv.$destroy();
    }, 200);
}

export function toast(opts: AdvancementToast): void {
    const toaster_hook = document.getElementById('mc_adv_toaster');
    if (!toaster_hook) return console.error('Toaster hook not found');

    if (opts.src && !opts.alt) opts.alt = opts.title;
    if (toaster_hook.childElementCount >= 5) {
        remove(toasters[0]);
    }

    const adv = new Advancement({
        target: toaster_hook,
        props: {
            ...opts,
            intro: true
        }
    });

    toasters.push(adv);

    if (!opts.duration) opts.duration = 5000;

    setTimeout(() => {
        remove(adv);
    }, opts.duration);
}

export function clear_toasts() {
    toasters.forEach(toast => toast.$destroy());
    toasters = [];
}