<script lang="ts">
import type { SettingDefinition } from '~/types'

// SettingsDefinition pour l'admin (exporté en dehors du setup)
export const settingsDefinition: Record<string, SettingDefinition> = {
  title: {
    type: 'string',
    default: 'Bienvenue sur Zenquo!',
    label: 'Titre principal'
  },
  subtitle: {
    type: 'text',
    default: 'Créez votre boutique en ligne facilement',
    label: 'Sous-titre'
  },
  backgroundImage: {
    type: 'image',
    default: '',
    label: 'Image de fond'
  },
  ctaButton: {
    type: 'component',
    component: 'Button',
    default: {
      text: 'Commencer',
      link: '/products',
      variant: 'primary'
    },
    label: 'Bouton CTA'
  }
}
</script>

<script setup lang="ts">
interface HeroProps {
  title: string
  subtitle: string
  backgroundImage: string
  ctaButton?: {
    text: string
    link: string
    variant: 'primary' | 'secondary'
  }
}

const props = withDefaults(defineProps<HeroProps>(), {
  title: 'Bienvenue sur Zenquo!',
  subtitle: 'Créez votre boutique en ligne facilement',
  backgroundImage: '',
})

const emit = defineEmits<{
  'edit-component': [path: string]
}>()

const { $kernel } = useNuxtApp()

// Hook avant le rendu
onMounted(async () => {
  await $kernel.doAction('beforeRenderSection', {
    type: 'Hero',
    settings: props
  })
})
</script>

<template>
  <section
    class="hero relative min-h-[600px] flex items-center justify-center text-white"
    :style="{
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }"
    data-section="Hero"
  >
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/40"></div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-4 text-center">
      <h1 class="text-5xl md:text-6xl font-bold mb-6">
        {{ title }}
      </h1>
      <p class="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
        {{ subtitle }}
      </p>

      <!-- CTA Button -->
      <div v-if="ctaButton" class="flex justify-center">
        <Button
          v-bind="ctaButton"
          data-component="Button"
          @click="emit('edit-component', 'ctaButton')"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
}
</style>
