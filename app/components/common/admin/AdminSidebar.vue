<template>
  <Sidebar>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/admin">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  Z
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="font-semibold">Zenquo</span>
                  <span class="text-xs text-muted-foreground">CMS Admin</span>
                </div>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- TABLEAU DE BORD -->
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton as-child>
              <NuxtLink to="/admin">
                <LayoutDashboard class="h-4 w-4" />
                <span>Tableau de bord</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <!-- CONTENU -->
      <SidebarGroup>
        <SidebarGroupLabel>Contenu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible v-model:open="openSections.pages">
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton>
                    <FileText class="h-4 w-4" />
                    <span>Pages</span>
                    <ChevronRight class="ml-auto h-4 w-4 transition-transform" :class="{ 'rotate-90': openSections.pages }" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <NuxtLink to="/admin/pages">Toutes les pages</NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <NuxtLink to="/admin/pages/new">Nouvelle page</NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/admin/media">
                  <Image class="h-4 w-4" />
                  <span>Médias</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- E-COMMERCE -->
      <SidebarGroup>
        <SidebarGroupLabel>E-commerce</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible v-model:open="openSections.products">
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton>
                    <ShoppingBag class="h-4 w-4" />
                    <span>Produits</span>
                    <ChevronRight class="ml-auto h-4 w-4 transition-transform" :class="{ 'rotate-90': openSections.products }" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <NuxtLink to="/admin/products">Tous les produits</NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <NuxtLink to="/admin/products/new">Nouveau produit</NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <NuxtLink to="/admin/collections">Collections</NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <Collapsible v-model:open="openSections.orders">
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton>
                    <Package class="h-4 w-4" />
                    <span>Commandes</span>
                    <ChevronRight class="ml-auto h-4 w-4 transition-transform" :class="{ 'rotate-90': openSections.orders }" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <NuxtLink to="/admin/orders">Toutes les commandes</NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <NuxtLink to="/admin/orders?status=pending">En attente</NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/admin/customers">
                  <Users class="h-4 w-4" />
                  <span>Clients</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- APPARENCE -->
      <SidebarGroup>
        <SidebarGroupLabel>Apparence</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/admin/themes">
                  <Palette class="h-4 w-4" />
                  <span>Thèmes</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/admin/menus">
                  <Menu class="h-4 w-4" />
                  <span>Menus</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- EXTENSIONS -->
      <SidebarGroup>
        <SidebarGroupLabel>Extensions</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/admin/plugins">
                  <Puzzle class="h-4 w-4" />
                  <span>Plugins</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- PARAMÈTRES -->
      <SidebarGroup>
        <SidebarGroupLabel>Configuration</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible v-model:open="openSections.settings">
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton>
                    <Settings class="h-4 w-4" />
                    <span>Paramètres</span>
                    <ChevronRight class="ml-auto h-4 w-4 transition-transform" :class="{ 'rotate-90': openSections.settings }" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <NuxtLink to="/admin/settings/general">Général</NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <NuxtLink to="/admin/settings/payments">Paiements</NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <NuxtLink to="/admin/settings/shipping">Livraison</NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- FOOTER avec utilisateur -->
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton>
                <User class="h-4 w-4" />
                <span>admin@zenquo.local</span>
                <ChevronUp class="ml-auto h-4 w-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" class="w-56">
              <DropdownMenuItem>
                <User class="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut class="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  FileText,
  Image,
  ShoppingBag,
  Package,
  Users,
  Palette,
  Menu,
  Puzzle,
  Settings,
  User,
  LogOut,
  ChevronRight,
  ChevronUp
} from 'lucide-vue-next'

const openSections = ref({
  pages: false,
  products: false,
  orders: false,
  settings: false
})
</script>
