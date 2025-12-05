<template>
  <component
    :is="tag"
    :class="classes"
    :style="styles"
  >
    {{ content }}
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TextStyle } from '~/types/settings'

const props = withDefaults(defineProps<{
  content?: string
  tag?: string
  align?: string
  size?: string
  weight?: string
  italic?: boolean
  color?: string
  lineHeight?: string
}>(), {
  content: '',
  tag: 'p',
  align: 'left',
  size: 'base',
  weight: 'normal',
  italic: false,
  color: '',
  lineHeight: 'normal'
})

const classes = computed(() => {
  const classList = []

  // Alignement
  const alignMap: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  }
  classList.push(alignMap[props.align] || 'text-left')

  // Taille
  const sizeMap: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
    '7xl': 'text-7xl',
    '8xl': 'text-8xl',
    '9xl': 'text-9xl'
  }
  classList.push(sizeMap[props.size] || 'text-base')

  // Poids
  const weightMap: Record<string, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  }
  classList.push(weightMap[props.weight] || 'font-normal')

  // Italique
  if (props.italic) {
    classList.push('italic')
  }

  // Line height
  const lineHeightMap: Record<string, string> = {
    none: 'leading-none',
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  }
  classList.push(lineHeightMap[props.lineHeight] || 'leading-normal')

  return classList.join(' ')
})

const styles = computed(() => {
  const styleObj: Record<string, string> = {}

  if (props.color) {
    styleObj.color = props.color
  }

  return styleObj
})
</script>
