<template>
  <nav v-if="headerMenu" class="border-b">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo / Site name -->
        <div class="flex-shrink-0">
          <NuxtLink to="/" class="text-xl font-bold">
            {{ siteName }}
          </NuxtLink>
        </div>

        <!-- Menu items -->
        <div class="hidden md:flex items-center space-x-6">
          <template v-for="item in headerMenu.items" :key="item.id">
            <MenuItemRenderer :item="item" />
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu v-if="!mobileMenuOpen" class="h-6 w-6" />
            <X v-else class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4 space-y-2">
        <template v-for="item in headerMenu.items" :key="item.id">
          <MenuItemRenderer :item="item" mobile />
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import MenuItemRenderer from './MenuItemRenderer.vue'
import type { Menu as MenuType } from '~/services/menu.service'

const { $kernel } = useNuxtApp()

const mobileMenuOpen = ref(false)

// Récupérer le menu header depuis le kernel
const headerMenu = computed<MenuType | null>(() => $kernel.getConfig('menus.header'))

// Récupérer le nom du site depuis les settings
const siteName = computed(() => $kernel.getConfig('settings.siteName', 'Zenquo'))
</script>
