<script lang="ts">
import type { SettingDefinition } from '~/types'

// SettingsDefinition pour l'admin (exporté en dehors du setup)
export const settingsDefinition: Record<string, SettingDefinition> = {
  title: {
    type: 'string',
    default: 'Bienvenue sur Zenquo!',
    label: 'Titre principal',
    properties: {
      type: 'alignment',
      default: 'center'
    }
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
    type: 'object',
    default: {
      text: 'Commencer',
      link: '/products',
      variant: 'primary'
    },
    label: 'Bouton CTA',
    properties: {
      text: {
        type: 'string',
        default: 'Commencer',
        label: 'Texte du bouton'
      },
      link: {
        type: 'string',
        default: '/products',
        label: 'Lien'
      },
      variant: {
        type: 'select',
        options: ['primary', 'secondary'],
        default: 'primary',
        label: 'Variante'
      }
    }
  }
}
</script>

<script setup lang="ts">
interface HeroSettings {
  title: string
  subtitle: string
  backgroundImage: string
  ctaButton?: {
    text: string
    link: string
    variant: 'primary' | 'secondary'
  }
}

// Utiliser defineModel pour v-model bi-directionnel
const settings = defineModel<HeroSettings>('settings', {
  default: () => ({
    title: 'Bienvenue sur Zenquo!',
    subtitle: 'Créez votre boutique en ligne facilement',
    backgroundImage: '',
    ctaButton: {
      text: 'Commencer',
      link: '/products',
      variant: 'primary'
    }
  })
})

// Computed pour accès facile aux propriétés
const title = computed(() => settings.value.title || 'Bienvenue sur Zenquo!')
const subtitle = computed(() => settings.value.subtitle || 'Créez votre boutique en ligne facilement')
const backgroundImage = computed(() => {
  const img = settings.value.backgroundImage || ''
  return img
})
const ctaButton = computed(() => settings.value.ctaButton)

const { $kernel } = useNuxtApp()

// Hook avant le rendu
onMounted(async () => {
  await $kernel.doAction('beforeRenderSection', {
    type: 'Hero',
    settings: settings.value
  })
})


</script>

<template>
  <section
    class="hero relative min-h-[600px] bg-blue-600 flex items-center justify-center text-white"
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
        <NuxtLink
          :to="ctaButton.link"
          class="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-colors"
          :class="ctaButton.variant === 'primary' ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-500 text-white hover:bg-blue-600'"
        >
          {{ ctaButton.text }}
        </NuxtLink>
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
