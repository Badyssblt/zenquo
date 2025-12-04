<template>
  <div 
    class="media-card cursor-pointer"
    @click="select"
  >
    <img :src="media.url" class="w-full h-32 object-cover rounded" />
    <div class="p-2 text-sm">{{ media.name }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Media } from '~~/types'
import { useMedia } from '@/composables/useMedia'

const props = defineProps<{
  media: Media
}>()

const { selectedKey, selectMedia } = useMedia()

const select = () => {
  if (!selectedKey.value) return   // sécurité, pas de key → pas de sélection
  selectMedia(props.media, selectedKey.value)
}
</script>
