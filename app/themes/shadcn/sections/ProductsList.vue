<template>

</template> 


<script setup lang="ts">

</script>


<script lang="ts">
import type { SettingDefinition } from '~~/types'

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