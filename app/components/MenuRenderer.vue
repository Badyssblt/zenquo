<template>
  <nav v-if="menuItems.length > 0" :class="containerClassFinal">
    <template v-for="item in menuItems" :key="item.id">
      <!-- Item avec enfants (dropdown) -->
      <div v-if="item.children && item.children.length > 0" :class="itemWithChildrenClassFinal">
        <component
          :is="getLinkComponent(item)"
          :to="item.url"
          :href="item.url"
          :target="item.target"
          :class="itemClassFinal"
          @click="handleClick(item, $event)"
        >
          <component v-if="item.icon" :is="getIcon(item.icon)" :class="iconClassFinal" />
          <span>{{ item.label }}</span>
          <ChevronDown v-if="variant === 'horizontal'" :class="chevronClassFinal" />
        </component>

        <!-- Sous-menu -->
        <div :class="submenuClassFinal">
          <component
            v-for="child in item.children"
            :key="child.id"
            :is="getLinkComponent(child)"
            :to="child.url"
            :href="child.url"
            :target="child.target"
            :class="submenuItemClassFinal"
            @click="handleClick(child, $event)"
          >
            <component v-if="child.icon" :is="getIcon(child.icon)" :class="iconClassFinal" />
            <span>{{ child.label }}</span>
          </component>
        </div>
      </div>

      <!-- Item simple (sans enfants) -->
      <component
        v-else-if="item.type !== 'DIVIDER'"
        :is="getLinkComponent(item)"
        :to="item.url"
        :href="item.url"
        :target="item.target"
        :class="itemClassFinal"
        @click="handleClick(item, $event)"
      >
        <component v-if="item.icon" :is="getIcon(item.icon)" :class="iconClassFinal" />
        <span>{{ item.label }}</span>
      </component>

      <!-- Divider -->
      <div v-else :class="dividerClassFinal" />
    </template>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import * as LucideIcons from 'lucide-vue-next'
import type { Menu, MenuItem } from '~/services/menu.service'

interface MenuRendererProps {
  slug: string
  variant?: 'horizontal' | 'vertical' | 'sidebar'
  containerClass?: string
  itemClass?: string
  itemWithChildrenClass?: string
  submenuClass?: string
  submenuItemClass?: string
  iconClass?: string
  chevronClass?: string
  dividerClass?: string,
  menuItem: MenuItem[]
}

const props = withDefaults(defineProps<MenuRendererProps>(), {
  variant: 'horizontal',
  containerClass: '',
  itemClass: '',
  itemWithChildrenClass: '',
  submenuClass: '',
  submenuItemClass: '',
  iconClass: '',
  chevronClass: '',
  dividerClass: ''
})

const emit = defineEmits<{
  itemClick: [item: MenuItem, event: Event]
}>()

const { getMenuBySlug, buildHierarchy } = useMenu()
const menu = ref<any>()
const menuItems = ref<MenuItem[]>(props.menuItem)

// Classes par défaut selon la variante
const defaultClasses = computed(() => {
  const base = {
    horizontal: {
      container: 'flex items-center gap-2',
      item: 'px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2',
      itemWithChildren: 'relative group',
      submenu: 'hidden group-hover:block absolute top-full left-0 mt-1 bg-popover border rounded-md shadow-lg min-w-[200px] py-2',
      submenuItem: 'px-4 py-2 hover:bg-accent transition-colors flex items-center gap-2',
      icon: 'h-4 w-4',
      chevron: 'h-4 w-4 ml-1',
      divider: 'w-px h-6 bg-border mx-2'
    },
    vertical: {
      container: 'flex flex-col gap-1',
      item: 'px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2',
      itemWithChildren: '',
      submenu: 'ml-4 mt-1 space-y-1',
      submenuItem: 'px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2 text-sm text-muted-foreground',
      icon: 'h-4 w-4',
      chevron: 'h-4 w-4 ml-auto',
      divider: 'h-px bg-border my-2'
    },
    sidebar: {
      container: 'flex flex-col gap-1',
      item: 'px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2 font-medium',
      itemWithChildren: '',
      submenu: 'ml-6 mt-1 space-y-1',
      submenuItem: 'px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2 text-sm',
      icon: 'h-4 w-4',
      chevron: 'h-4 w-4 ml-auto',
      divider: 'h-px bg-border my-2'
    }
  }

  return base[props.variant]
})

// Classes finales (custom ou défaut)
const containerClassFinal = computed(() => props.containerClass || defaultClasses.value.container)
const itemClassFinal = computed(() => props.itemClass || defaultClasses.value.item)
const itemWithChildrenClassFinal = computed(() => props.itemWithChildrenClass || defaultClasses.value.itemWithChildren)
const submenuClassFinal = computed(() => props.submenuClass || defaultClasses.value.submenu)
const submenuItemClassFinal = computed(() => props.submenuItemClass || defaultClasses.value.submenuItem)
const iconClassFinal = computed(() => props.iconClass || defaultClasses.value.icon)
const chevronClassFinal = computed(() => props.chevronClass || defaultClasses.value.chevron)
const dividerClassFinal = computed(() => props.dividerClass || defaultClasses.value.divider)

onMounted(async () => {
  await loadMenu()
})

const loadMenu = async () => {
  menu.value = await getMenuBySlug(props.slug)
  if (menu.value && menu.value.items) {
    menuItems.value = buildHierarchy(menu.value.items)
  }
}

const getLinkComponent = (item: MenuItem) => {
  // Si c'est une page interne, utiliser NuxtLink
  if (item.type === 'PAGE' || (item.url && item.url.startsWith('/'))) {
    return 'NuxtLink'
  }
  // Sinon, utiliser un lien externe
  return 'a'
}

const getIcon = (iconName: string) => {
  // Récupérer l'icône depuis lucide-vue-next
  const IconComponent = (LucideIcons as any)[iconName]
  return IconComponent || null
}

const handleClick = (item: MenuItem, event: Event) => {
  if (item.type === 'DIVIDER') {
    event.preventDefault()
    return
  }
  emit('itemClick', item, event)
}
</script>
