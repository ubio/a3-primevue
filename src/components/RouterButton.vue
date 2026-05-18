<template>
    <RouterLink
        v-slot="{ href, navigate, isActive, isExactActive }"
        :to="to"
        custom>
        <Button
            as="a"
            :href="href"
            v-bind="actualAttrs(isActive, isExactActive)"
            @click="navigate" />
    </RouterLink>
</template>

<script>
export default {

    props: {
        to: { required: true },
        activeOverrides: { type: Object },
        exactActiveOverrides: { type: Object },
    },

    methods: {

        actualAttrs(isActive, isExactActive) {
            return {
                ...this.$attrs,
                ...(isActive ? this.activeOverrides : {}),
                ...(isExactActive ? this.exactActiveOverrides : {}),
            };
        }

    }

};
</script>
