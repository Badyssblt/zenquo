<script lang="ts">
import type { SettingDefinition } from '~/types'

// SettingsDefinition pour l'admin
export const settingsDefinition: Record<string, SettingDefinition> = {
  title: {
    type: 'string',
    default: 'Card Title',
    label: 'Titre'
  },
  description: {
    type: 'text',
    default: '',
    label: 'Description'
  },
  image: {
    type: 'image',
    default: '',
    label: 'Image'
  },
  link: {
    type: 'string',
    default: '',
    label: 'Lien (optionnel)'
  },
  button: {
    type: 'component',
    component: 'Button',
    default: {
      text: 'En savoir plus',
      link: '#',
      variant: 'primary'
    },
    label: 'Bouton (optionnel)'
  }
}
</script>

<script setup lang="ts">
interface CardProps {
  title: string
  description?: string
  image?: string
  link?: string
  button?: {
    text: string
    link: string
    variant: 'primary' | 'secondary'
  }
}

const props = withDefaults(defineProps<CardProps>(), {
  title: 'Card Title',
  description: '',
  image: '',
  link: ''
})

const emit = defineEmits<{
  'edit-component': [path: string]
}>()
</script>

<template>
  <div
    class="card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    data-component="Card"
  >
    <!-- Image -->
    <div v-if="image" class="card-image">
      <img
        :src="image"
        :alt="title"
        class="w-full h-48 object-cover"
      >
    </div>

    <!-- Content -->
    <div class="card-content p-6">
      <h3 class="text-2xl font-bold mb-2 text-gray-800">
        {{ title }}
      </h3>

      <p v-if="description" class="text-gray-600 mb-4">
        {{ description }}
      </p>

      <!-- Button -->
      <div v-if="button" class="mt-4">
        <Button
          v-bind="button"
          data-component="Button"
          @click="emit('edit-component', 'button')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
}
</style>
