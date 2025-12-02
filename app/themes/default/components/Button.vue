<script lang="ts">
import type { SettingDefinition } from '~/types'

// SettingsDefinition pour l'admin
export const settingsDefinition: Record<string, SettingDefinition> = {
  text: {
    type: 'string',
    default: 'Cliquez ici',
    label: 'Texte du bouton'
  },
  link: {
    type: 'string',
    default: '#',
    label: 'Lien'
  },
  variant: {
    type: 'select',
    options: ['primary', 'secondary'],
    default: 'primary',
    label: 'Variante'
  },
  size: {
    type: 'select',
    options: ['sm', 'md', 'lg'],
    default: 'md',
    label: 'Taille'
  },
  icon: {
    type: 'string',
    default: '',
    label: 'Icône (optionnel)'
  }
}
</script>

<script setup lang="ts">
interface ButtonProps {
  text: string
  link: string
  variant?: 'primary' | 'secondary'
  icon?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  text: 'Cliquez ici',
  link: '#',
  variant: 'primary',
  size: 'md'
})

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white'
}
</script>

<template>
  <NuxtLink
    :to="link"
    :class="[
      'btn inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200',
      sizeClasses[size],
      variantClasses[variant]
    ]"
    data-editable="true"
  >
    <span v-if="icon" class="icon">{{ icon }}</span>
    <span>{{ text }}</span>
  </NuxtLink>
</template>

<style scoped>
.btn {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}
</style>
