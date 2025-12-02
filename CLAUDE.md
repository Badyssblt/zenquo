# Zenquo CMS / Framework e-commerce - Plan MVP (Nuxt 4 Architecture)

---

## 1️⃣ Base projet et setup Nuxt 4

* Initialiser un projet Nuxt 4 avec TypeScript
* Installer dépendances essentielles :
  * Tailwind CSS
  * Pinia (state management)
  * Prisma (ORM)
  * MariaDB (database)
  * @sidebase/nuxt-auth (authentication avec NextAuth.js)
  * Stripe SDK
  * PayPal SDK
* Structure initiale Nuxt 4 (App + Server) :

```
/app/
  /plugins/                  ← plugins exécutés côté client et SSR
    kernel.ts
  /themes/                   ← thèmes et sections
    /default/
      /sections/             ← Hero.vue, FeaturedProducts.vue, Newsletter.vue
      /components/           ← composants internes des sections (Button.vue, Card.vue...)
      theme.json
  /pages/                    ← Nuxt pages frontend
    /admin/                  ← dashboard backoffice (protected)
      index.vue              ← tableau de bord
      /page-builder/
        [slug].vue           ← éditeur visuel de pages
  /components/               ← composants globaux
    /admin/
      SectionEditor.vue      ← drawer pour éditer settings d'une section
      ComponentEditor.vue    ← drawer pour éditer settings d'un composant
/kernel-core.ts              ← logique kernel (hooks, plugins, config, erreurs)
/server/
  /api/                      ← API endpoints
    /pages/
      [slug].get.ts          ← récupérer page par slug
      [slug].put.ts          ← sauvegarder page
    /products/
      index.get.ts
      [id].get.ts
    /collections/
      [id]/products.get.ts
    /cart/
      index.get.ts
      add.post.ts
    /orders/
      index.post.ts
      /webhook/
        stripe.post.ts
        paypal.post.ts
    /auth/
      [...].ts               ← NextAuth endpoints
/prisma/
  schema.prisma              ← schéma DB (User, Page, Product, Order...)
  /migrations/```

---

## 2️⃣ Base de données et Prisma (MariaDB)

### Schéma Prisma (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?
  role          Role      @default(CUSTOMER)
  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  ADMIN
  CUSTOMER
}

model Page {
  id            String    @id @default(cuid())
  slug          String    @unique
  title         String
  sections      Json      // Array de sections avec settings
  published     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Product {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String?   @db.Text
  price         Float
  comparePrice  Float?
  images        Json      // Array d'URLs
  stock         Int       @default(0)
  collectionId  String?
  collection    Collection? @relation(fields: [collectionId], references: [id])
  orderItems    OrderItem[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Collection {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String?
  products      Product[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Order {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  status        OrderStatus @default(PENDING)
  total         Float
  items         OrderItem[]
  shippingAddress Json
  paymentMethod String      // 'stripe' ou 'paypal'
  paymentId     String?     // ID transaction Stripe/PayPal
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id            String    @id @default(cuid())
  orderId       String
  order         Order     @relation(fields: [orderId], references: [id])
  productId     String
  product       Product   @relation(fields: [productId], references: [id])
  quantity      Int
  price         Float     // Prix au moment de l'achat
}

model Theme {
  id            String    @id @default(cuid())
  name          String    @unique
  active        Boolean   @default(false)
  config        Json      // Configuration du thème
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Commandes Prisma

```bash
# Initialiser Prisma
npx prisma init

# Créer migration
npx prisma migrate dev --name init

# Générer client
npx prisma generate

# Ouvrir Prisma Studio
npx prisma studio
```

---

## 3️⃣ Authentification (NextAuth.js / @sidebase/nuxt-auth)

### Configuration `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: ['@sidebase/nuxt-auth'],
  auth: {
    baseURL: process.env.AUTH_ORIGIN,
    provider: {
      type: 'authjs'
    }
  }
})
```

### Configuration NextAuth `/server/api/auth/[...].ts`

```ts
import CredentialsProvider from 'next-auth/providers/credentials'
import { NuxtAuthHandler } from '#auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return { id: user.id, email: user.email, role: user.role }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      return session
    }
  }
})
```

### Middleware admin `/server/middleware/auth.ts`

```ts
export default defineEventHandler(async (event) => {
  if (event.path.startsWith('/api/admin')) {
    const session = await getServerSession(event)

    if (!session || session.user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Accès interdit'
      })
    }
  }
})
```

---

## 4️⃣ Kernel / point d'entrée et système de hooks

### Architecture du Kernel

Le Kernel est le cœur de Zenquo, inspiré de WordPress. Il fournit :
- **Hooks** : Actions et filtres pour étendre les fonctionnalités
- **Plugins** : Système de plugins modulaires
- **Config** : Configuration globale centralisée
- **Erreurs** : Gestion d'erreurs custom

### Implémentation `kernel-core.ts`

```ts
// kernel-core.ts
export class BlockError extends Error {
  constructor(message: string, public blockType: string) {
    super(message)
    this.name = 'BlockError'
  }
}

export class PluginError extends Error {
  constructor(message: string, public pluginName: string) {
    super(message)
    this.name = 'PluginError'
  }
}

interface Hook {
  name: string
  callbacks: Array<(...args: any[]) => any>
}

interface Filter {
  name: string
  callbacks: Array<(value: any, ...args: any[]) => any>
}

export class Kernel {
  private actions: Map<string, Hook> = new Map()
  private filters: Map<string, Filter> = new Map()
  private plugins: Map<string, any> = new Map()
  private config: Record<string, any> = {}

  // ==================== ACTIONS ====================

  /**
   * Enregistrer une action (point d'exécution)
   * @example kernel.addAction('beforeRenderSection', (section) => console.log(section))
   */
  addAction(hookName: string, callback: (...args: any[]) => any, priority: number = 10) {
    if (!this.actions.has(hookName)) {
      this.actions.set(hookName, { name: hookName, callbacks: [] })
    }

    const hook = this.actions.get(hookName)!
    hook.callbacks.push(callback)

    // Trier par priorité (plus petit = exécuté en premier)
    hook.callbacks.sort((a: any, b: any) => (a.priority || 10) - (b.priority || 10))
  }

  /**
   * Déclencher une action
   * @example kernel.doAction('beforeRenderSection', section)
   */
  async doAction(hookName: string, ...args: any[]) {
    const hook = this.actions.get(hookName)
    if (!hook) return

    for (const callback of hook.callbacks) {
      try {
        await callback(...args)
      } catch (error) {
        console.error(`Error in action ${hookName}:`, error)
      }
    }
  }

  // ==================== FILTERS ====================

  /**
   * Enregistrer un filtre (modification de valeur)
   * @example kernel.addFilter('sectionProps', (props) => ({ ...props, extra: true }))
   */
  addFilter(filterName: string, callback: (value: any, ...args: any[]) => any, priority: number = 10) {
    if (!this.filters.has(filterName)) {
      this.filters.set(filterName, { name: filterName, callbacks: [] })
    }

    const filter = this.filters.get(filterName)!
    filter.callbacks.push(callback)
    filter.callbacks.sort((a: any, b: any) => (a.priority || 10) - (b.priority || 10))
  }

  /**
   * Appliquer un filtre
   * @example const newProps = await kernel.applyFilters('sectionProps', props, section)
   */
  async applyFilters(filterName: string, value: any, ...args: any[]): Promise<any> {
    const filter = this.filters.get(filterName)
    if (!filter) return value

    let result = value
    for (const callback of filter.callbacks) {
      try {
        result = await callback(result, ...args)
      } catch (error) {
        console.error(`Error in filter ${filterName}:`, error)
      }
    }

    return result
  }

  // ==================== PLUGINS ====================

  /**
   * Enregistrer un plugin
   */
  registerPlugin(name: string, plugin: any) {
    if (this.plugins.has(name)) {
      throw new PluginError(`Plugin ${name} already registered`, name)
    }

    this.plugins.set(name, plugin)

    // Initialiser le plugin s'il a une méthode init
    if (plugin.init && typeof plugin.init === 'function') {
      plugin.init(this)
    }
  }

  /**
   * Récupérer un plugin
   */
  getPlugin(name: string) {
    return this.plugins.get(name)
  }

  /**
   * Lister tous les plugins
   */
  getPlugins() {
    return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
      name,
      version: plugin.version || '1.0.0',
      enabled: plugin.enabled !== false
    }))
  }

  // ==================== CONFIG ====================

  /**
   * Définir une config
   */
  setConfig(key: string, value: any) {
    this.config[key] = value
  }

  /**
   * Récupérer une config
   */
  getConfig(key: string, defaultValue?: any) {
    return this.config[key] ?? defaultValue
  }
}
```

### Plugin Nuxt `/app/plugins/kernel.ts`

```ts
import { defineNuxtPlugin } from '#app'
import { Kernel } from '~/kernel-core'

export default defineNuxtPlugin((nuxtApp) => {
  const kernel = new Kernel()

  // Charger config initiale
  kernel.setConfig('theme', 'default')
  kernel.setConfig('siteName', 'Zenquo')

  // Exposer le kernel globalement
  nuxtApp.provide('kernel', kernel)

  // Hooks SSR-safe
  if (import.meta.server) {
    console.log('Kernel initialized on server')
  }
})
```

### Hooks disponibles dans Zenquo

#### Hooks de sections

```ts
// Avant le rendu d'une section
kernel.addAction('beforeRenderSection', async (section) => {
  console.log('Rendering section:', section.type)
})

// Après le rendu d'une section
kernel.addAction('afterRenderSection', async (section) => {
  // Analytics, tracking...
})

// Modifier les props d'une section
kernel.addFilter('sectionProps', (props, section) => {
  if (section.type === 'Hero') {
    return { ...props, animated: true }
  }
  return props
})
```

#### Hooks e-commerce

```ts
// Avant d'ajouter au panier
kernel.addAction('beforeAddToCart', async (product, quantity) => {
  console.log(`Adding ${quantity}x ${product.name}`)
})

// Après ajout au panier
kernel.addAction('afterAddToCart', async (product, quantity, cart) => {
  // Déclencher analytics, notifications...
})

// Modifier le prix d'un produit
kernel.addFilter('productPrice', (price, product) => {
  // Appliquer des promotions dynamiques
  if (product.onSale) {
    return price * 0.9
  }
  return price
})

// Avant la création d'une commande
kernel.addAction('beforeCreateOrder', async (orderData) => {
  // Validation, vérification stock...
})

// Après paiement réussi
kernel.addAction('afterPaymentSuccess', async (order) => {
  // Envoyer email confirmation, webhook...
})
```

#### Hooks de page

```ts
// Avant de sauvegarder une page
kernel.addAction('beforeSavePage', async (page) => {
  console.log('Saving page:', page.slug)
})

// Modifier les sections avant sauvegarde
kernel.addFilter('pageSections', (sections, page) => {
  // Ajouter une section footer automatiquement
  return [...sections, { type: 'Footer', settings: {} }]
})
```

### Utilisation dans les composants

```vue
<script setup lang="ts">
const { $kernel } = useNuxtApp()

// Déclencher une action
await $kernel.doAction('customEvent', { data: 'test' })

// Appliquer un filtre
const modifiedData = await $kernel.applyFilters('myFilter', originalData)
</script>
```

---

## 5️⃣ Système de thèmes

* Répertoire `/app/themes` :

```
themes/
  default/
    theme.json
    sections/      ← Hero.vue, FeaturedProducts.vue, Newsletter.vue
    components/    ← Button.vue, Card.vue, Input.vue (composants réutilisables)
    layouts/       ← header, footer
```

* Chaque thème expose :
  * **Sections** : blocs principaux avec `settingsDefinition`
  * **Composants** : éléments réutilisables dans les sections (avec leur propre `settingsDefinition`)
  * layouts globaux (header, footer)
  * assets (images, CSS)
* Kernel charge le thème actif depuis la DB (table `Theme`)

---

## 6️⃣ Sections et Composants éditables

### Architecture Sections / Composants

* **Section** : Bloc principal d'une page (Hero, FeaturedProducts, Newsletter)
* **Composant** : Élément réutilisable dans une section (Button, Card, Input)
* Chaque section et composant a un `settingsDefinition` pour l'édition

### Exemple Section Hero.vue

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle: string
  backgroundImage: string
  ctaButton: {
    text: string
    link: string
    variant: 'primary' | 'secondary'
  }
}>()

// SettingsDefinition pour l'admin
export const settingsDefinition = {
  title: {
    type: 'string',
    default: 'Bienvenue sur Zenquo!',
    label: 'Titre principal'
  },
  subtitle: {
    type: 'text',
    default: 'Créez votre boutique en ligne',
    label: 'Sous-titre'
  },
  backgroundImage: {
    type: 'image',
    default: '',
    label: 'Image de fond'
  },
  ctaButton: {
    type: 'component',
    component: 'Button',
    default: {
      text: 'Commencer',
      link: '/products',
      variant: 'primary'
    },
    label: 'Bouton CTA'
  }
}
</script>

<template>
  <section
    class="hero"
    :style="{ backgroundImage: `url(${backgroundImage})` }"
    data-section="Hero"
  >
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
    <Button
      v-bind="ctaButton"
      data-component="Button"
      @click="$emit('edit-component', 'ctaButton')"
    />
  </section>
</template>
```

### Exemple Composant Button.vue

```vue
<script setup lang="ts">
const props = defineProps<{
  text: string
  link: string
  variant: 'primary' | 'secondary'
  icon?: string
}>()

export const settingsDefinition = {
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
  icon: {
    type: 'icon',
    default: '',
    label: 'Icône (optionnel)'
  }
}
</script>

<template>
  <NuxtLink
    :to="link"
    :class="['btn', `btn-${variant}`]"
    data-editable="true"
  >
    <Icon v-if="icon" :name="icon" />
    {{ text }}
  </NuxtLink>
</template>
```

### Types de settings supportés

```ts
type SettingType =
  | 'string'      // Input texte court
  | 'text'        // Textarea
  | 'number'      // Input numérique
  | 'boolean'     // Toggle
  | 'select'      // Dropdown
  | 'color'       // Color picker
  | 'image'       // Upload image
  | 'icon'        // Sélecteur d'icône
  | 'component'   // Composant nested éditable
  | 'array'       // Liste d'items répétables
```

---

## 7️⃣ Page Builder et stockage en DB

### Structure JSON des pages (stocké dans `Page.sections`)

```json
[
  {
    "id": "hero-1",
    "type": "Hero",
    "settings": {
      "title": "Bienvenue sur Zenquo!",
      "subtitle": "Créez votre boutique en ligne",
      "backgroundImage": "/images/hero-bg.jpg",
      "ctaButton": {
        "text": "Commencer",
        "link": "/products",
        "variant": "primary"
      }
    }
  },
  {
    "id": "featured-products-1",
    "type": "FeaturedProducts",
    "settings": {
      "title": "Produits en vedette",
      "collectionId": "cuid-collection-123",
      "layout": "grid",
      "columns": 4
    }
  },
  {
    "id": "newsletter-1",
    "type": "Newsletter",
    "settings": {
      "title": "Restez informé",
      "placeholder": "Entrez votre email",
      "submitButton": {
        "text": "S'inscrire",
        "variant": "primary"
      }
    }
  }
]
```

* JSON stocké dans la colonne `sections` de la table `Page` (Prisma)
* Chaque section a un `id` unique pour faciliter l'édition
* Admin génère l'UI d'édition dynamiquement via `settingsDefinition`

---

## 6️⃣ Rendu dynamique côté Nuxt

* Page `[slug].vue` charge JSON depuis API `/server/api/pages/:slug`
* Parcourt `page.sections` et rend chaque bloc :

```vue
<component
  v-for="(block, i) in page.sections"
  :key="i"
  :is="themeSections[block.type]"
  v-bind="block.settings"
/>
```

* Bloc récupère données dynamiques via API si nécessaire
* Hooks et plugins peuvent intervenir avant/après rendu

---

## 7️⃣ API interne

* Endpoints MVP dans `/server/api` :

  * `/pages/:slug` → récupérer JSON page
  * `/collections/:id/products` → produits dynamiques
  * `/cart` → gérer panier
  * `/admin/...` → CRUD pages, produits, plugins
* Gestion erreurs custom via `createError`

---

## 8️⃣ Système de Plugins

### Architecture des plugins

Les plugins Zenquo permettent d'étendre les fonctionnalités sans modifier le core. Chaque plugin :
- S'enregistre auprès du Kernel
- Utilise les hooks pour s'intégrer
- Peut ajouter des endpoints API
- Peut créer des tables DB via Prisma

### Structure d'un plugin

```
/plugins/
  /wishlist/
    plugin.ts           ← Point d'entrée
    manifest.json       ← Métadonnées
    /composables/
      useWishlist.ts    ← Logique client
    /server/
      /api/
        wishlist.get.ts ← API endpoints
    schema.prisma       ← Extension DB (optionnel)
```

### Manifest du plugin (`manifest.json`)

```json
{
  "name": "wishlist",
  "version": "1.0.0",
  "displayName": "Wishlist",
  "description": "Système de liste de souhaits pour les produits",
  "author": "Zenquo Team",
  "dependencies": [],
  "hooks": [
    "afterAddToCart",
    "productCard"
  ],
  "routes": [
    "/api/wishlist"
  ],
  "settings": {
    "maxItems": {
      "type": "number",
      "default": 50,
      "label": "Nombre max d'articles"
    },
    "allowGuests": {
      "type": "boolean",
      "default": true,
      "label": "Autoriser les invités"
    }
  }
}
```

### Exemple complet : Plugin Wishlist

#### 1. Point d'entrée `/plugins/wishlist/plugin.ts`

```ts
import type { Kernel } from '~/kernel-core'

export default {
  name: 'wishlist',
  version: '1.0.0',
  enabled: true,

  /**
   * Initialisation du plugin
   */
  init(kernel: Kernel) {
    console.log('Wishlist plugin initialized')

    // Hook : Ajouter un bouton wishlist sur les cartes produit
    kernel.addFilter('productCard', (cardData, product) => {
      return {
        ...cardData,
        showWishlistButton: true
      }
    })

    // Hook : Logger quand un produit est ajouté au panier
    kernel.addAction('afterAddToCart', async (product, quantity) => {
      // Retirer du wishlist si ajouté au panier
      const wishlist = useWishlist()
      if (wishlist.has(product.id)) {
        wishlist.remove(product.id)
      }
    })

    // Hook : Ajouter une section dans le header
    kernel.addFilter('headerActions', (actions) => {
      return [
        ...actions,
        {
          name: 'wishlist',
          icon: 'heart',
          count: 0, // Sera mis à jour dynamiquement
          link: '/wishlist'
        }
      ]
    })

    // Config du plugin
    kernel.setConfig('wishlist.maxItems', 50)
    kernel.setConfig('wishlist.allowGuests', true)
  },

  /**
   * Désinstallation du plugin
   */
  uninstall(kernel: Kernel) {
    // Cleanup si nécessaire
    console.log('Wishlist plugin uninstalled')
  }
}
```

#### 2. Composable `/plugins/wishlist/composables/useWishlist.ts`

```ts
import { ref, computed } from 'vue'

const wishlistItems = ref<string[]>([])

export const useWishlist = () => {
  const { $kernel } = useNuxtApp()

  // Charger depuis localStorage au montage
  if (import.meta.client) {
    const stored = localStorage.getItem('wishlist')
    if (stored) {
      wishlistItems.value = JSON.parse(stored)
    }
  }

  const add = async (productId: string) => {
    const maxItems = $kernel.getConfig('wishlist.maxItems', 50)

    if (wishlistItems.value.length >= maxItems) {
      throw new Error(`Maximum ${maxItems} items in wishlist`)
    }

    if (!wishlistItems.value.includes(productId)) {
      wishlistItems.value.push(productId)
      save()

      // Hook : Notifier l'ajout
      await $kernel.doAction('afterAddToWishlist', productId)
    }
  }

  const remove = (productId: string) => {
    wishlistItems.value = wishlistItems.value.filter(id => id !== productId)
    save()
  }

  const has = (productId: string) => {
    return wishlistItems.value.includes(productId)
  }

  const clear = () => {
    wishlistItems.value = []
    save()
  }

  const save = () => {
    if (import.meta.client) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems.value))
    }
  }

  const count = computed(() => wishlistItems.value.length)

  return {
    items: wishlistItems,
    count,
    add,
    remove,
    has,
    clear
  }
}
```

#### 3. API Endpoint `/plugins/wishlist/server/api/wishlist.get.ts`

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  // Récupérer la wishlist de l'utilisateur depuis la DB
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: true }
  })

  return wishlist
})
```

#### 4. Extension Prisma (optionnel) `/plugins/wishlist/schema.prisma`

```prisma
model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}
```

### Enregistrement des plugins

#### Dans `/app/plugins/kernel.ts`

```ts
import { defineNuxtPlugin } from '#app'
import { Kernel } from '~/kernel-core'
import wishlistPlugin from '~/plugins/wishlist/plugin'
import analyticsPlugin from '~/plugins/analytics/plugin'

export default defineNuxtPlugin((nuxtApp) => {
  const kernel = new Kernel()

  // Enregistrer les plugins
  kernel.registerPlugin('wishlist', wishlistPlugin)
  kernel.registerPlugin('analytics', analyticsPlugin)

  // Exposer le kernel
  nuxtApp.provide('kernel', kernel)
})
```

### Gestion des plugins dans l'admin

#### Interface admin `/app/pages/admin/plugins/index.vue`

```vue
<script setup lang="ts">
const { $kernel } = useNuxtApp()

const plugins = ref($kernel.getPlugins())

const togglePlugin = async (pluginName: string) => {
  const plugin = $kernel.getPlugin(pluginName)
  plugin.enabled = !plugin.enabled

  // Sauvegarder en DB
  await $fetch('/api/admin/plugins/toggle', {
    method: 'POST',
    body: { name: pluginName, enabled: plugin.enabled }
  })

  // Recharger
  if (plugin.enabled) {
    plugin.init($kernel)
  }
}
</script>

<template>
  <div class="plugins-manager">
    <h1>Plugins</h1>

    <div v-for="plugin in plugins" :key="plugin.name" class="plugin-card">
      <h3>{{ plugin.name }}</h3>
      <p>Version {{ plugin.version }}</p>
      <button @click="togglePlugin(plugin.name)">
        {{ plugin.enabled ? 'Désactiver' : 'Activer' }}
      </button>
    </div>
  </div>
</template>
```

### Hooks recommandés pour les plugins

```ts
// E-commerce
'beforeAddToCart'
'afterAddToCart'
'beforeCheckout'
'afterPaymentSuccess'
'productPrice'          // Filter
'productCard'           // Filter

// Sections
'beforeRenderSection'
'afterRenderSection'
'sectionProps'          // Filter

// Pages
'beforeSavePage'
'afterSavePage'
'pageSections'          // Filter

// User
'afterUserLogin'
'afterUserRegister'
'userPermissions'       // Filter

// Admin
'adminMenu'             // Filter
'dashboardWidgets'      // Filter
```

### Exemples d'autres plugins possibles

1. **Analytics** : Google Analytics, tracking événements
2. **SEO** : Meta tags dynamiques, sitemap
3. **Reviews** : Système d'avis produits
4. **Coupons** : Codes promo et réductions
5. **Email** : Notifications email (commandes, newsletter)
6. **Social** : Partage réseaux sociaux
7. **Search** : Recherche avancée avec Algolia/Meilisearch
8. **Multi-langue** : i18n pour contenu multilingue

---

## 9️⃣ Page Builder visuel dans l'Admin

### Fonctionnement du Page Builder

#### 1. Mode édition dans `/admin/page-builder/[slug].vue`

```vue
<script setup lang="ts">
const route = useRoute()
const page = ref<Page | null>(null)
const selectedSection = ref<string | null>(null)
const selectedComponent = ref<{ sectionId: string, path: string } | null>(null)
const drawerOpen = ref(false)

// Charger la page
const { data } = await useFetch(`/api/pages/${route.params.slug}`)
page.value = data.value

// Clic sur une section
const selectSection = (sectionId: string) => {
  selectedSection.value = sectionId
  selectedComponent.value = null
  drawerOpen.value = true
}

// Clic sur un composant dans une section
const selectComponent = (sectionId: string, componentPath: string) => {
  selectedComponent.value = { sectionId, path: componentPath }
  drawerOpen.value = true
}

// Sauvegarder les modifications
const savePage = async () => {
  await $fetch(`/api/pages/${route.params.slug}`, {
    method: 'PUT',
    body: { sections: page.value.sections }
  })
}
</script>

<template>
  <div class="page-builder">
    <!-- Preview de la page -->
    <div class="preview">
      <component
        v-for="section in page.sections"
        :key="section.id"
        :is="themeSections[section.type]"
        v-bind="section.settings"
        :data-section-id="section.id"
        @click="selectSection(section.id)"
        @edit-component="(path) => selectComponent(section.id, path)"
      />
    </div>

    <!-- Drawer d'édition -->
    <Drawer v-model="drawerOpen">
      <SectionEditor
        v-if="selectedSection && !selectedComponent"
        :section="findSection(selectedSection)"
        @update="updateSection"
      />
      <ComponentEditor
        v-else-if="selectedComponent"
        :section="findSection(selectedComponent.sectionId)"
        :component-path="selectedComponent.path"
        @update="updateComponent"
      />
    </Drawer>

    <!-- Toolbar -->
    <div class="toolbar">
      <button @click="savePage">Sauvegarder</button>
      <button @click="addSection">+ Ajouter section</button>
    </div>
  </div>
</template>
```

#### 2. Composant `SectionEditor.vue`

Génère dynamiquement les champs d'édition basés sur `settingsDefinition` :

```vue
<script setup lang="ts">
const props = defineProps<{
  section: Section
}>()

const emit = defineEmits<{
  update: [settings: Record<string, any>]
}>()

// Récupérer le settingsDefinition du composant Section
const sectionComponent = themeSections[props.section.type]
const settingsDefinition = sectionComponent.settingsDefinition

// Local state pour l'édition
const localSettings = ref({ ...props.section.settings })

const save = () => {
  emit('update', localSettings.value)
}
</script>

<template>
  <div class="section-editor">
    <h3>Éditer {{ section.type }}</h3>

    <!-- Générer les champs dynamiquement -->
    <div v-for="(def, key) in settingsDefinition" :key="key">
      <label>{{ def.label }}</label>

      <!-- String -->
      <input
        v-if="def.type === 'string'"
        v-model="localSettings[key]"
        type="text"
      />

      <!-- Boolean -->
      <input
        v-else-if="def.type === 'boolean'"
        v-model="localSettings[key]"
        type="checkbox"
      />

      <!-- Image -->
      <ImageUpload
        v-else-if="def.type === 'image'"
        v-model="localSettings[key]"
      />

      <!-- Component nested -->
      <ComponentField
        v-else-if="def.type === 'component'"
        v-model="localSettings[key]"
        :component-type="def.component"
      />

      <!-- ... autres types ... -->
    </div>

    <button @click="save">Enregistrer</button>
  </div>
</template>
```

#### 3. Composant `ComponentEditor.vue`

Fonctionne de la même manière, mais édite un composant nested dans une section :

```vue
<script setup lang="ts">
const props = defineProps<{
  section: Section
  componentPath: string // ex: 'ctaButton'
}>()

// Récupérer le composant et son settingsDefinition
const componentData = get(props.section.settings, props.componentPath)
const componentType = themeSections[props.section.type].settingsDefinition[props.componentPath].component
const component = themeComponents[componentType]
const settingsDefinition = component.settingsDefinition

// ... même logique que SectionEditor
</script>
```

### Interactions utilisateur

1. **Clic sur une section** → Ouvre le drawer avec `SectionEditor`
2. **Clic sur un composant** (ex: bouton) → Ouvre le drawer avec `ComponentEditor`
3. **Modification** → Mise à jour du state local
4. **Sauvegarde** → PUT `/api/pages/:slug` avec le JSON mis à jour

---

## 9️⃣ Admin / Dashboard

* Route `/admin` protégée par middleware auth (rôle ADMIN requis)
* Dashboard contient :
  * **Pages** : Liste des pages avec lien vers le page builder
  * **Produits** : CRUD produits et collections
  * **Commandes** : Liste des commandes avec statuts
  * **Thèmes** : Changer le thème actif
  * **Plugins** : Voir et activer/désactiver les plugins
  * **Paramètres** : Config générale (paiement, shipping...)

---

## 🔟 Gestion des erreurs / fallback

* Bloc peut lancer `BlockError`
* Renderer affiche fallback visuel
* Plugins peuvent logger/intercepter erreurs

---

## 🔟 Paiements (Stripe + PayPal)

### Configuration Stripe

```ts
// server/api/orders/create-stripe-intent.post.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export default defineEventHandler(async (event) => {
  const { items, amount } = await readBody(event)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // En centimes
    currency: 'eur',
    metadata: { items: JSON.stringify(items) }
  })

  return { clientSecret: paymentIntent.client_secret }
})
```

### Webhook Stripe

```ts
// server/api/orders/webhook/stripe.post.ts
export default defineEventHandler(async (event) => {
  const sig = getHeader(event, 'stripe-signature')!
  const body = await readRawBody(event)

  const stripeEvent = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (stripeEvent.type === 'payment_intent.succeeded') {
    const paymentIntent = stripeEvent.data.object

    // Mettre à jour la commande dans la DB
    await prisma.order.update({
      where: { paymentId: paymentIntent.id },
      data: { status: 'PAID' }
    })
  }

  return { received: true }
})
```

### Configuration PayPal

```ts
// server/api/orders/create-paypal-order.post.ts
import { PayPalHttpClient } from '@paypal/checkout-server-sdk'

export default defineEventHandler(async (event) => {
  const { items, amount } = await readBody(event)

  const request = new paypal.orders.OrdersCreateRequest()
  request.prefer('return=representation')
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'EUR',
        value: amount.toFixed(2)
      }
    }]
  })

  const order = await paypalClient.execute(request)
  return { orderId: order.result.id }
})
```

---

## 1️⃣1️⃣ Caching / Performance (optionnel MVP)

* Cache SSR pour produits et collections (Nitro cache)
* Lazy load sections dynamiques si nécessaire
* CDN pour images (Cloudflare, Vercel...)
* Optimisation images (nuxt/image)

---

## 1️⃣2️⃣ Étapes concrètes pour coder le MVP

### Phase 1 : Infrastructure

1. ✅ Init Nuxt 4 + TypeScript + structure App/Server
2. ✅ Setup Prisma + MariaDB + migrations
3. ✅ Setup @sidebase/nuxt-auth (NextAuth.js)
4. ✅ Créer kernel-core.ts + hooks + erreurs custom
5. ✅ Plugin kernel.ts pour exposer $kernel

### Phase 2 : Thèmes et Sections

6. Créer structure `/app/themes/default`
7. Créer sections MVP :
   - Hero.vue + settingsDefinition
   - FeaturedProducts.vue + settingsDefinition
   - Newsletter.vue + settingsDefinition
8. Créer composants réutilisables :
   - Button.vue + settingsDefinition
   - Card.vue + settingsDefinition
   - Input.vue + settingsDefinition

### Phase 3 : API et DB

9. Créer API endpoints :
   - `/api/pages/[slug].get.ts`
   - `/api/pages/[slug].put.ts`
   - `/api/products/index.get.ts`
   - `/api/products/[id].get.ts`
   - `/api/collections/[id]/products.get.ts`
   - `/api/cart/*`
   - `/api/orders/*`
10. Créer webhooks Stripe + PayPal

### Phase 4 : Admin et Page Builder

11. Créer `/admin/index.vue` (dashboard)
12. Créer `/admin/page-builder/[slug].vue` (éditeur visuel)
13. Créer composants admin :
    - SectionEditor.vue (drawer édition sections)
    - ComponentEditor.vue (drawer édition composants)
    - Drawer.vue
    - ImageUpload.vue
    - ComponentField.vue
14. Implémenter drag & drop pour réordonner sections

### Phase 5 : Frontend et rendu

15. Créer page dynamique `[slug].vue` avec rendu sections
16. Implémenter panier (Pinia store)
17. Créer pages checkout et paiement
18. Intégrer Stripe Elements + PayPal SDK côté client

### Phase 6 : Plugins et hooks

19. Créer système de plugins
20. Créer plugin exemple (Wishlist)
21. Implémenter hooks dans le workflow

### Phase 7 : Tests et optimisation

22. Tests E2E (Playwright)
23. Tests unitaires composants (Vitest)
24. Optimisation performance (cache, lazy loading)
25. SEO (meta tags, sitemap)

---

## ✅ Résultat attendu MVP

* **Pages dynamiques** : Rendu via JSON stocké en DB avec sections éditables
* **Page Builder visuel** : Clic sur section/composant → drawer d'édition
* **E-commerce complet** : Produits, collections, panier, checkout, paiements (Stripe + PayPal)
* **Admin dashboard** : Gestion pages, produits, commandes, thèmes, plugins
* **Système de thèmes** : Sections + composants modulaires avec `settingsDefinition`
* **Plugins et hooks** : Extensibilité via système de hooks WordPress-like
* **Auth robuste** : NextAuth.js avec rôles (ADMIN, CUSTOMER)
* **DB structurée** : Prisma + MariaDB avec migrations
* **SSR optimisé** : Nuxt 4 avec cache et lazy loading

---

## 1️⃣3️⃣ Types TypeScript essentiels

```ts
// types/index.ts

export interface Section {
  id: string
  type: string
  settings: Record<string, any>
}

export interface Page {
  id: string
  slug: string
  title: string
  sections: Section[]
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SettingDefinition {
  type: 'string' | 'text' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'icon' | 'component' | 'array'
  default: any
  label: string
  options?: string[]
  component?: string
}

export interface SectionComponent {
  settingsDefinition: Record<string, SettingDefinition>
}

export interface KernelHook {
  name: string
  callbacks: Array<(...args: any[]) => any>
}

export interface Plugin {
  name: string
  version: string
  init: (kernel: Kernel) => void
}
```

---

## 1️⃣4️⃣ Variables d'environnement (.env)

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/zenquo"

# Auth
AUTH_SECRET="your-secret-key-here"
AUTH_ORIGIN="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_MODE="sandbox" # ou "live"

# App
NUXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## 1️⃣5️⃣ Structure finale complète

```
zenquo/
├── app/
│   ├── plugins/
│   │   └── kernel.ts              ← Plugin Kernel (SSR + client)
│   ├── themes/
│   │   └── default/
│   │       ├── theme.json
│   │       ├── sections/          ← Hero.vue, FeaturedProducts.vue, Newsletter.vue
│   │       ├── components/        ← Button.vue, Card.vue, Input.vue
│   │       └── layouts/
│   ├── pages/
│   │   ├── index.vue
│   │   ├── [slug].vue             ← Rendu dynamique des pages
│   │   ├── products/
│   │   │   ├── index.vue
│   │   │   └── [slug].vue
│   │   ├── cart.vue
│   │   ├── checkout.vue
│   │   └── admin/
│   │       ├── index.vue          ← Dashboard
│   │       ├── page-builder/
│   │       │   └── [slug].vue     ← Éditeur visuel
│   │       ├── products/
│   │       ├── orders/
│   │       └── settings/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── SectionEditor.vue
│   │   │   ├── ComponentEditor.vue
│   │   │   ├── Drawer.vue
│   │   │   └── ImageUpload.vue
│   │   └── Cart.vue
│   └── composables/
│       ├── useCart.ts
│       └── useCheckout.ts
├── server/
│   ├── api/
│   │   ├── pages/
│   │   │   ├── [slug].get.ts
│   │   │   └── [slug].put.ts
│   │   ├── products/
│   │   │   ├── index.get.ts
│   │   │   └── [id].get.ts
│   │   ├── collections/
│   │   │   └── [id]/
│   │   │       └── products.get.ts
│   │   ├── cart/
│   │   │   ├── index.get.ts
│   │   │   └── add.post.ts
│   │   ├── orders/
│   │   │   ├── index.post.ts
│   │   │   ├── create-stripe-intent.post.ts
│   │   │   ├── create-paypal-order.post.ts
│   │   │   └── webhook/
│   │   │       ├── stripe.post.ts
│   │   │       └── paypal.post.ts
│   │   └── auth/
│   │       └── [...].ts
│   └── middleware/
│       └── auth.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── kernel-core.ts                 ← Kernel (hooks, plugins, config)
├── types/
│   └── index.ts
├── nuxt.config.ts
├── package.json
└── .env
```

---

## 🎯 Prochaines étapes

Maintenant que le plan est défini, on peut commencer l'implémentation :

1. **Init projet** : `npx nuxi@latest init zenquo`
2. **Installer dépendances** : Prisma, auth, Stripe, PayPal, Tailwind
3. **Setup DB** : Créer schema Prisma + migrations
4. **Créer Kernel** : kernel-core.ts + plugin
5. **Créer sections MVP** : Hero, FeaturedProducts, Newsletter
6. **Créer admin** : Dashboard + page builder visuel

Voulez-vous que je commence l'implémentation ?
