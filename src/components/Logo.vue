<template>
    <div class="Logo">
        <svg
            viewBox="0 0 128 128"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true">
            <path
                class="LogoMark"
                d="m 64,8 48.5,28 0,56 L 64,120 15.5,92 l 0,-56 z" />
            <path
                class="LogoMark2"
                d="M 102.1,42 64,64 25.9,42 64,20 z" />
        </svg>
    </div>
</template>

<style scoped>
.Logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--sp4);
    height: var(--sp4);
}

.Logo svg {
    display: block;
    width: 100%;
    height: 100%;
}

.LogoMark {
    fill: none;
    stroke: var(--iso-primary-color);
    stroke-width: 12;
    stroke-linejoin: round;
}

.LogoMark2 {
    fill: none;
    stroke: none;
}
</style>
