<template>
    <Dialog v-model:open="open">
        <DialogTrigger class="w-full">
            <Button variant="outline" class="w-full justify-start">
                <Folder/>
                Choisir un média
            </Button>
        </DialogTrigger>
      <DialogContent class="!max-w-3xl">
        <div class="flex flex-wrap gap-4 max-h-96 overflow-y-auto">
          <MediaCard  
            v-for="media in medias"
            :media="media"
            @click="select(media)"
          />
        </div>
      </DialogContent>
    </Dialog>
  </template>
  
<script setup lang="ts">
import { useMedia } from '@/composables/useMedia'
import MediaCard from './MediaCard.vue'
import type { Media } from '~~/types'
import { Folder } from 'lucide-vue-next';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Button from '~/components/ui/button/Button.vue';

  const props = defineProps<{
    targetKey: string
  }>()
  
  const { selectMedia } = useMedia()
  
  const open = ref(false)
  const { $kernel } = useNuxtApp()
  const medias = ref<Media[]>($kernel.getConfig('medias') || [])
  
  const select = (media: Media) => {
    selectMedia(media, props.targetKey)
    open.value = false
  }
  </script>
  