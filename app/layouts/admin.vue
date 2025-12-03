<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import AdminSidebar from "~/components/common/admin/AdminSidebar.vue"

const route = useRoute()

/**
 * Mapping des segments de route vers des labels lisibles
 * et leurs catégories parentes
 */
const routeLabels: Record<string, { label: string; parent?: string }> = {
  // Dashboard
  'admin': { label: 'Tableau de bord' },

  // Contenu
  'pages': { label: 'Pages', parent: 'Contenu' },
  'media': { label: 'Médias', parent: 'Contenu' },

  // E-commerce
  'products': { label: 'Produits', parent: 'E-commerce' },
  'collections': { label: 'Collections', parent: 'E-commerce' },
  'orders': { label: 'Commandes', parent: 'E-commerce' },
  'customers': { label: 'Clients', parent: 'E-commerce' },

  // Apparence
  'themes': { label: 'Thèmes', parent: 'Apparence' },
  'menus': { label: 'Menus', parent: 'Apparence' },

  // Extensions
  'plugins': { label: 'Plugins', parent: 'Extensions' },

  // Configuration
  'settings': { label: 'Paramètres', parent: 'Configuration' },
  'general': { label: 'Général', parent: 'Paramètres' },
  'payments': { label: 'Paiements', parent: 'Paramètres' },
  'shipping': { label: 'Livraison', parent: 'Paramètres' },

  // Actions communes
  'new': { label: 'Nouveau' },
  'edit': { label: 'Modifier' }
}

/**
 * Générer le breadcrumb en fonction de la route actuelle
 */
const breadcrumbs = computed(() => {
  const path = route.path
  const segments = path.split('/').filter(Boolean) // ['admin', 'themes', 'edit', 'default']

  const crumbs: Array<{ label: string; path: string }> = []
  let currentPath = ''

  // Parcourir les segments
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    // Skip 'admin' dans le breadcrumb
    if (segment === 'admin') {
      currentPath = '/admin'
      continue
    }

    currentPath += `/${segment}`

    // Récupérer les infos du segment
    const routeInfo = routeLabels[segment]

    if (routeInfo) {
      // Si le segment a un parent et qu'on est au premier niveau après admin
      if (routeInfo.parent && i === 1) {
        // Ajouter d'abord le parent (ex: "Apparence" pour "themes")
        crumbs.push({
          label: routeInfo.parent,
          path: currentPath // Le parent pointe vers la page actuelle
        })
      }

      // Ajouter le segment actuel
      crumbs.push({
        label: routeInfo.label,
        path: currentPath
      })
    } else {
      // Si pas de mapping, utiliser le segment tel quel (capitalisé)
      const label = segment.charAt(0).toUpperCase() + segment.slice(1)
      crumbs.push({
        label,
        path: currentPath
      })
    }
  }

  // Si aucun breadcrumb, on est sur le dashboard
  if (crumbs.length === 0) {
    crumbs.push({
      label: 'Tableau de bord',
      path: '/admin'
    })
  }

  return crumbs
})
</script>

<template>
  <SidebarProvider>
    <AdminSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator
          orientation="vertical"
          class="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <template v-for="(crumb, index) in breadcrumbs" :key="index">
              <BreadcrumbItem>
                <BreadcrumbLink v-if="index < breadcrumbs.length - 1" :href="crumb.path">
                  {{ crumb.label }}
                </BreadcrumbLink>
                <BreadcrumbPage v-else>
                  {{ crumb.label }}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
            </template>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div class="flex-1 p-4">
        <slot/>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
