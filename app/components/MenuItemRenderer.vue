<template>
  <!-- Menu item with submenu -->
  <div
    v-if="item.children && item.children.length > 0"
    class="relative group"
    :class="mobile ? 'w-full' : ''"
  >
    <!-- Parent item -->
    <button
      class="flex items-center gap-1 hover:text-primary transition-colors"
      :class="mobile ? 'w-full text-left py-2' : ''"
      @click="mobile && toggleSubmenu()"
    >
      <component
        v-if="item.icon"
        :is="getIcon(item.icon)"
        class="h-4 w-4"
      />
      <span>{{ item.label }}</span>
      <ChevronDown class="h-4 w-4" />
    </button>

    <!-- Submenu -->
    <div
      v-if="!mobile || submenuOpen"
      class="md:absolute p-4 md:left-0 md:top-full md:mt-2 z-50 md:min-w-[200px] md:bg-white md:border md:rounded-md md:shadow-lg md:opacity-0 md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all"
      :class="mobile ? 'pl-4 space-y-1' : ''"
    >
      <template v-for="child in item.children" :key="child.id">
        <MenuItemRenderer :item="child" :mobile="mobile" class="md:block" />
      </template>
    </div>
  </div>

  <!-- Simple menu item -->
  <NuxtLink
    v-else
    :to="getItemUrl(item)"
    :target="item.target"
    class="flex items-center gap-2 hover:text-primary transition-colors"
    :class="[
      mobile ? 'w-full py-2' : '',
      item.type === 'DIVIDER' ? 'border-t my-2' : ''
    ]"
  >
    <component
      v-if="item.icon"
      :is="getIcon(item.icon)"
      class="h-4 w-4"
    />
    <span>{{ item.label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import * as LucideIcons from 'lucide-vue-next'
import type { MenuItem } from '~/services/menu.service'

interface Props {
  item: MenuItem
  mobile?: boolean
}

const props = defineProps<Props>()

const submenuOpen = ref(false)

const toggleSubmenu = () => {
  submenuOpen.value = !submenuOpen.value
}

/**
 * Récupérer l'URL de l'item selon son type
 */
const getItemUrl = (item: MenuItem): string => {
  switch (item.type) {
    case 'PAGE':
      return item.pageId ? `/pages/${item.pageId}` : '#'
    case 'CATEGORY':
      return item.url || '#'
    case 'CUSTOM':
    case 'LINK':
    default:
      return item.url || '#'
  }
}

/**
 * Récupérer le composant d'icône Lucide
 */
const getIcon = (iconName: string) => {
  // Capitaliser la première lettre de chaque mot
  const capitalizedName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  // @ts-ignore
  return LucideIcons[capitalizedName] || LucideIcons.Circle
}
</script>
