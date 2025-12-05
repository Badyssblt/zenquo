<script lang="ts">
import type { SettingDefinition } from '~/types'

// SettingsDefinition pour l'admin
export const settingsDefinition: Record<string, SettingDefinition> = {
  variant: {
    type: 'select',
    options: ['default', 'fade', 'cards'],
    default: 'default',
    label: 'Variante'
  },
  autoplay: {
    type: 'boolean',
    default: true,
    label: 'Lecture automatique'
  },
  autoplayDelay: {
    type: 'number',
    default: 5000,
    label: 'Délai entre slides (ms)'
  },
  showIndicators: {
    type: 'boolean',
    default: true,
    label: 'Afficher les indicateurs'
  },
  showArrows: {
    type: 'boolean',
    default: true,
    label: 'Afficher les flèches'
  },
  slides: {
    type: 'array',
    default: [],
    label: 'Slides',
    itemType: 'object',
    itemProperties: {
      title: {
        type: 'object',
        default: {
          content: 'Titre du slide',
          align: 'center',
          size: '4xl',
          weight: 'bold',
          color: '#ffffff',
          tag: 'h2',
          italic: false,
          lineHeight: 'normal'
        },
        label: 'Titre',
        properties: {
          content: {
            type: 'text',
            default: 'Titre du slide',
            label: 'Contenu'
          },
          tag: {
            type: 'select',
            options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            default: 'h2',
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
            default: '4xl',
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
      image: {
        type: 'image',
        default: '',
        label: 'Image de fond'
      },
      ctaButton: {
        type: 'object',
        default: {
          text: 'En savoir plus',
          link: '#',
          variant: 'primary',
          show: true
        },
        label: 'Bouton CTA',
        properties: {
          show: {
            type: 'boolean',
            default: true,
            label: 'Afficher le bouton'
          },
          text: {
            type: 'string',
            default: 'En savoir plus',
            label: 'Texte du bouton'
          },
          link: {
            type: 'string',
            default: '#',
            label: 'Lien'
          },
          variant: {
            type: 'select',
            options: ['primary', 'secondary', 'outline'],
            default: 'primary',
            label: 'Variante'
          }
        }
      }
    }
  }
}
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { TitleSettings, SubtitleSettings } from '~/types/settings'
import TextRenderer from '~/components/framework/TextRenderer.vue'

interface Slide {
  title: TitleSettings
  description: SubtitleSettings
  image: string
  ctaButton: {
    show: boolean
    text: string
    link: string
    variant: 'primary' | 'secondary' | 'outline'
  }
}

interface CarouselSettings {
  variant: 'default' | 'fade' | 'cards'
  autoplay: boolean
  autoplayDelay: number
  showIndicators: boolean
  showArrows: boolean
  slides: Slide[]
}

// Utiliser defineModel pour v-model bi-directionnel
const settings = defineModel<CarouselSettings>('settings', {
  default: () => ({
    variant: 'default',
    autoplay: true,
    autoplayDelay: 5000,
    showIndicators: true,
    showArrows: true,
    slides: []
  })
})

const currentSlide = ref(0)
let autoplayInterval: NodeJS.Timeout | null = null

const slides = computed(() => settings.value.slides || [])

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

const startAutoplay = () => {
  if (settings.value.autoplay && slides.value.length > 0) {
    autoplayInterval = setInterval(() => {
      nextSlide()
    }, settings.value.autoplayDelay)
  }
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})

watch(() => settings.value.autoplay, (newVal) => {
  if (newVal) {
    startAutoplay()
  } else {
    stopAutoplay()
  }
})

const getButtonClass = (variant: string) => {
  const variants = {
    primary: 'bg-white text-blue-600 hover:bg-gray-100',
    secondary: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border-2 border-white text-white hover:bg-white hover:text-blue-600'
  }
  return variants[variant as keyof typeof variants] || variants.primary
}
</script>

<template>
  <section class="carousel relative overflow-hidden bg-gray-900" data-section="Carousel">
    <!-- Slides -->
    <div class="relative h-[600px]">
      <TransitionGroup :name="settings.variant === 'fade' ? 'fade' : 'slide'">
        <div
          v-for="(slide, index) in slides"
          v-show="index === currentSlide"
          :key="index"
          class="absolute inset-0"
        >
          <!-- Background Image -->
          <div
            class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: slide.image ? `url(${slide.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
          />

          <!-- Overlay -->
          <div class="absolute inset-0 bg-black/50" />

          <!-- Content -->
          <div class="relative z-10 h-full flex items-end ">
            <div class="container mx-auto px-4 text-center">
                <div class="flex justify-between items-center border-b border-white/40 mb-18">
                  <TextRenderer
                    v-if="slide.title"
                    :content="slide.title.content"
                    :tag="slide.title.tag"
                    :align="slide.title.align"
                    :size="slide.title.size"
                    :weight="slide.title.weight"
                    :color="slide.title.color"
                    :italic="slide.title.italic"
                    :lineHeight="slide.title.lineHeight"
                    class="text-left"
                    />

                <!-- CTA Button -->
                <NuxtLink
                  v-if="slide.ctaButton?.show"
                  :to="slide.ctaButton.link"
                  class="flex rounded-full h-fit px-4 py-2 transition-colors"
                  :class="getButtonClass(slide.ctaButton.variant)"
                >
                  {{ slide.ctaButton.text }}
                </NuxtLink>
                </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Navigation Arrows -->
    <div v-if="settings.showArrows && slides.length > 1" class="absolute inset-0 flex items-center justify-between px-4 pointer-events-none z-20">
      <button
        @click="prevSlide"
        class="pointer-events-auto bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-colors"
        aria-label="Slide précédent"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        @click="nextSlide"
        class="pointer-events-auto bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-colors"
        aria-label="Slide suivant"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Indicators -->
    <div v-if="settings.showIndicators && slides.length > 1" class="absolute bottom-4 left-0 right-0 z-20">
      <div class="flex justify-center gap-2">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          @click="goToSlide(index)"
          class="w-3 h-3 rounded-full transition-all"
          :class="index === currentSlide ? 'bg-white w-8' : 'bg-white/50'"
          :aria-label="`Aller au slide ${index + 1}`"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease-in-out;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
