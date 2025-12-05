<script lang="ts">
import type { SettingDefinition } from '~/types'

// SettingsDefinition pour l'admin (exporté en dehors du setup)
export const settingsDefinition: Record<string, SettingDefinition> = {
  title: {
    type: 'object',
    default: {
      content: 'Bienvenue sur Zenquo!',
      align: 'center',
      size: '5xl',
      weight: 'bold',
      color: '#ffffff',
      tag: 'h1',
      italic: false,
      lineHeight: 'normal'
    },
    label: 'Titre principal',
    properties: {
      content: {
        type: 'text',
        default: 'Bienvenue sur Zenquo!',
        label: 'Contenu'
      },
      tag: {
        type: 'select',
        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        default: 'h1',
        label: 'Balise HTML'
      },
      align: {
        type: 'select',
        options: ['left', 'center', 'right', 'justify'],
        default: 'center',
        label: 'Alignement'
      },
      size: {
        type: 'select',
        options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'],
        default: '5xl',
        label: 'Taille'
      },
      weight: {
        type: 'select',
        options: ['normal', 'medium', 'semibold', 'bold', 'extrabold'],
        default: 'bold',
        label: 'Épaisseur'
      },
      color: {
        type: 'color',
        default: '#ffffff',
        label: 'Couleur'
      },
      italic: {
        type: 'boolean',
        default: false,
        label: 'Italique'
      },
      lineHeight: {
        type: 'select',
        options: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
        default: 'normal',
        label: 'Hauteur de ligne'
      }
    }
  },
  subtitle: {
    type: 'object',
    default: {
      content: 'Créez votre boutique en ligne facilement',
      align: 'center',
      size: 'xl',
      weight: 'normal',
      color: '#ffffff',
      tag: 'p',
      italic: false,
      lineHeight: 'normal'
    },
    label: 'Sous-titre',
    properties: {
      content: {
        type: 'text',
        default: 'Créez votre boutique en ligne facilement',
        label: 'Contenu'
      },
      tag: {
        type: 'select',
        options: ['p', 'h2', 'h3', 'h4', 'h5', 'h6'],
        default: 'p',
        label: 'Balise HTML'
      },
      align: {
        type: 'select',
        options: ['left', 'center', 'right', 'justify'],
        default: 'center',
        label: 'Alignement'
      },
      size: {
        type: 'select',
        options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
        default: 'xl',
        label: 'Taille'
      },
      weight: {
        type: 'select',
        options: ['normal', 'medium', 'semibold', 'bold', 'extrabold'],
        default: 'normal',
        label: 'Épaisseur'
      },
      color: {
        type: 'color',
        default: '#ffffff',
        label: 'Couleur'
      },
      italic: {
        type: 'boolean',
        default: false,
        label: 'Italique'
      },
      lineHeight: {
        type: 'select',
        options: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
        default: 'normal',
        label: 'Hauteur de ligne'
      }
    }
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
import type { TitleSettings, SubtitleSettings } from '~/types/settings'
import TextRenderer from '~/components/framework/TextRenderer.vue'

interface HeroSettings {
  title: TitleSettings
  subtitle: SubtitleSettings
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
    title: {
      content: 'Bienvenue sur Zenquo!',
      align: 'center',
      size: '5xl',
      weight: 'bold',
      color: '#ffffff',
      tag: 'h1',
      italic: false,
      lineHeight: 'normal'
    },
    subtitle: {
      content: 'Créez votre boutique en ligne facilement',
      align: 'center',
      size: 'xl',
      weight: 'normal',
      color: '#ffffff',
      tag: 'p',
      italic: false,
      lineHeight: 'normal'
    },
    backgroundImage: '',
    ctaButton: {
      text: 'Commencer',
      link: '/products',
      variant: 'primary'
    }
  })
})

// Computed pour accès facile aux propriétés
const title = computed(() => settings.value.title || {
  content: 'Bienvenue sur Zenquo!',
  align: 'center',
  size: '5xl',
  weight: 'bold',
  color: '#ffffff',
  tag: 'h1',
  italic: false,
  lineHeight: 'normal'
})
const subtitle = computed(() => settings.value.subtitle || {
  content: 'Créez votre boutique en ligne facilement',
  align: 'center',
  size: 'xl',
  weight: 'normal',
  color: '#ffffff',
  tag: 'p',
  italic: false,
  lineHeight: 'normal'
})
const backgroundImage = computed(() => settings.value.backgroundImage || '')
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
    <div class="relative z-10 container mx-auto px-4">
      <TextRenderer
        :content="title.content"
        :tag="title.tag"
        :align="title.align"
        :size="title.size"
        :weight="title.weight"
        :color="title.color"
        :italic="title.italic"
        :lineHeight="title.lineHeight"
        class="mb-6"
      />
      <TextRenderer
        :content="subtitle.content"
        :tag="subtitle.tag"
        :align="subtitle.align"
        :size="subtitle.size"
        :weight="subtitle.weight"
        :color="subtitle.color"
        :italic="subtitle.italic"
        :lineHeight="subtitle.lineHeight"
        class="mb-8 max-w-2xl mx-auto"
      />

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
