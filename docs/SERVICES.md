# Architecture des Services - Zenquo

## Pourquoi des services ?

Nous avons implémenté une **architecture en couches** avec des services pour chaque modèle Prisma. C'est une bonne pratique recommandée pour :

### Avantages

1. **Réutilisabilité** : La logique métier est centralisée et peut être réutilisée dans plusieurs endpoints API
2. **Testabilité** : Les services peuvent être testés indépendamment des endpoints
3. **Séparation des responsabilités** :
   - Les endpoints API gèrent : routing, validation des paramètres, réponses HTTP
   - Les services gèrent : logique métier, interactions avec la DB
4. **Maintenance** : Plus facile de modifier la logique métier sans toucher aux routes
5. **Transactions** : Gestion centralisée des transactions Prisma complexes
6. **Sécurité** : Centralisation de la sécurité (hash passwords, validation)

## Structure

```
/server/
  /services/
    setting.service.ts    ← Gestion des settings
    theme.service.ts      ← Gestion des thèmes
    user.service.ts       ← Gestion des utilisateurs
    page.service.ts       ← Gestion des pages
    product.service.ts    ← (à créer) Gestion des produits
    order.service.ts      ← (à créer) Gestion des commandes
  /api/
    /themes/
      index.get.ts        ← GET /api/themes → utilise ThemeService
      active.get.ts       ← GET /api/themes/active → utilise ThemeService
      [name]/
        activate.post.ts  ← POST /api/themes/:name/activate → utilise ThemeService
    /settings/
      index.get.ts        ← GET /api/settings → utilise SettingService
      index.put.ts        ← PUT /api/settings → utilise SettingService
      [key].get.ts        ← GET /api/settings/:key → utilise SettingService
```

## Exemples d'utilisation

### 1. SettingService

Gère tous les paramètres de configuration stockés en base de données.

#### Méthodes disponibles :

```typescript
// Récupérer tous les settings
await SettingService.getAll()

// Récupérer un setting par clé
await SettingService.getByKey('siteName')

// Créer ou mettre à jour un setting
await SettingService.upsert('siteName', 'Mon Site', 'string', 'Nom du site')

// Mettre à jour un setting existant
await SettingService.update('siteName', 'Nouveau Nom')

// Créer plusieurs settings en batch
await SettingService.createMany([
  { key: 'siteName', value: 'Zenquo', type: 'string' },
  { key: 'currency', value: 'EUR', type: 'string' }
])

// Récupérer les settings sous forme de Map (pour le kernel)
const settingsMap = await SettingService.getAllAsMap()
```

#### Utilisation dans un endpoint :

```typescript
// server/api/settings/index.get.ts
import { SettingService } from '../../services/setting.service'

export default defineEventHandler(async (event) => {
  const settings = await SettingService.getAll()
  return settings
})
```

#### Utilisation dans le seed :

```typescript
// prisma/seed.ts
import { SettingService } from '../server/services/setting.service'

await SettingService.createMany([
  { key: 'siteName', value: 'Zenquo', type: 'string', description: 'Nom du site' },
  { key: 'currency', value: 'EUR', type: 'string', description: 'Devise' }
])
```

### 2. ThemeService

Gère les thèmes disponibles et le thème actif.

#### Méthodes disponibles :

```typescript
// Récupérer tous les thèmes
await ThemeService.getAll()

// Récupérer un thème par ID
await ThemeService.getById('cuid123')

// Récupérer un thème par nom
await ThemeService.getByName('default')

// Récupérer le thème actif
await ThemeService.getActive()

// Créer un thème
await ThemeService.create({
  name: 'modern',
  active: false,
  config: { /* config du thème */ }
})

// Activer un thème (désactive automatiquement les autres)
await ThemeService.setActive('default')

// Créer ou mettre à jour un thème
await ThemeService.upsert('default', { /* config */ }, true)

// Supprimer un thème (interdit si actif)
await ThemeService.delete('cuid123')
```

#### Utilisation dans le kernel :

```typescript
// app/plugins/kernel.ts
import { ThemeService } from '~~/server/services/theme.service'

const activeTheme = await ThemeService.getActive()
kernel.setConfig('theme', activeTheme.name)
```

#### Utilisation dans un endpoint :

```typescript
// server/api/themes/[name]/activate.post.ts
import { ThemeService } from '../../../services/theme.service'

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  const activatedTheme = await ThemeService.setActive(name)
  return { success: true, theme: activatedTheme }
})
```

### 3. UserService

Gère les utilisateurs avec hash automatique des mots de passe.

#### Méthodes disponibles :

```typescript
// Récupérer tous les utilisateurs (sans les passwords)
await UserService.getAll()

// Récupérer un utilisateur par ID
await UserService.getById('cuid123')

// Récupérer un utilisateur par email
await UserService.getByEmail('admin@zenquo.local')

// Créer un utilisateur (password automatiquement hashé)
await UserService.create({
  email: 'user@example.com',
  password: 'password123', // Sera hashé avec bcrypt
  name: 'John Doe',
  role: 'CUSTOMER'
})

// Mettre à jour un utilisateur
await UserService.update('cuid123', { name: 'Jane Doe' })

// Vérifier les credentials (pour l'authentification)
const user = await UserService.verifyCredentials('admin@zenquo.local', 'admin123')

// Vérifier si un email existe
const exists = await UserService.emailExists('test@example.com')

// Compter les utilisateurs
const count = await UserService.count()
```

#### Utilisation dans NextAuth :

```typescript
// server/api/auth/[...].ts
import { UserService } from '../../services/user.service'

CredentialsProvider({
  async authorize(credentials) {
    const user = await UserService.verifyCredentials(
      credentials.email,
      credentials.password
    )
    return user
  }
})
```

### 4. PageService

Gère les pages du CMS avec leurs sections.

#### Méthodes disponibles :

```typescript
// Récupérer toutes les pages
await PageService.getAll()
await PageService.getAll(true) // Seulement les pages publiées

// Récupérer une page par ID
await PageService.getById('cuid123')

// Récupérer une page par slug
await PageService.getBySlug('home')
await PageService.getBySlug('home', true) // Seulement si publiée

// Créer une page
await PageService.create({
  slug: 'about',
  title: 'À propos',
  sections: [/* ... */],
  published: true
})

// Mettre à jour une page
await PageService.update('cuid123', { title: 'Nouveau titre' })

// Mettre à jour seulement les sections
await PageService.updateSections('cuid123', [/* nouvelles sections */])

// Publier/dépublier une page
await PageService.togglePublish('cuid123')

// Dupliquer une page
await PageService.duplicate('cuid123', 'about-2', 'À propos - Copie')

// Vérifier si un slug existe
const exists = await PageService.slugExists('home')
```

#### Utilisation dans l'API :

```typescript
// server/api/pages/[slug].get.ts
import { PageService } from '../../services/page.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const page = await PageService.getBySlug(slug, true) // Seulement publiées

  if (!page) {
    throw createError({ statusCode: 404, message: 'Page non trouvée' })
  }

  return page
})
```

## Pattern d'utilisation dans les endpoints API

### Structure type d'un endpoint :

```typescript
// server/api/resource/action.ts
import { ResourceService } from '../../services/resource.service'

export default defineEventHandler(async (event) => {
  try {
    // 1. Validation des paramètres
    const param = getRouterParam(event, 'param')
    const body = await readBody(event)

    if (!param) {
      throw createError({
        statusCode: 400,
        message: 'Paramètre requis'
      })
    }

    // 2. Appel au service (logique métier)
    const result = await ResourceService.method(param, body)

    // 3. Retour de la réponse
    return {
      success: true,
      data: result,
      message: 'Opération réussie'
    }
  } catch (error: any) {
    // 4. Gestion des erreurs
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur serveur'
    })
  }
})
```

## Bonnes pratiques

### 1. Services

- ✅ **Utiliser des méthodes statiques** : `static async method()`
- ✅ **Gérer les transactions Prisma** : Utiliser `prisma.$transaction()` pour les opérations complexes
- ✅ **Exclure les données sensibles** : Ne jamais retourner les passwords
- ✅ **Hash automatique** : Hasher les passwords dans le service, pas dans l'endpoint
- ✅ **Validation métier** : Valider la logique métier dans le service
- ❌ **Pas de gestion HTTP** : Ne pas throw createError() dans les services

### 2. Endpoints API

- ✅ **Validation des paramètres** : Vérifier les paramètres avant d'appeler le service
- ✅ **Gestion des erreurs HTTP** : Utiliser `createError()` avec les bons status codes
- ✅ **Réponses cohérentes** : Format uniforme `{ success, data, message }`
- ❌ **Pas de logique métier** : Déléguer au service

### 3. Sécurité

```typescript
// UserService - Hash automatique des passwords
static async create(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10)
  return await prisma.user.create({
    data: { ...data, password: hashedPassword }
  })
}

// UserService - Exclusion du password dans les retours
static async getById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
      // password exclu
    }
  })
}
```

## Services à créer prochainement

### ProductService
```typescript
// server/services/product.service.ts
export class ProductService {
  static async getAll(filters?: ProductFilters)
  static async getById(id: string)
  static async getBySlug(slug: string)
  static async getByCollection(collectionId: string)
  static async create(data: ProductCreateInput)
  static async update(id: string, data: ProductUpdateInput)
  static async delete(id: string)
  static async updateStock(id: string, quantity: number)
}
```

### OrderService
```typescript
// server/services/order.service.ts
export class OrderService {
  static async getAll(userId?: string)
  static async getById(id: string)
  static async create(data: OrderCreateInput)
  static async updateStatus(id: string, status: OrderStatus)
  static async cancel(id: string)
  static async getByUser(userId: string)
}
```

### CollectionService
```typescript
// server/services/collection.service.ts
export class CollectionService {
  static async getAll()
  static async getById(id: string)
  static async getBySlug(slug: string)
  static async create(data: CollectionCreateInput)
  static async update(id: string, data: CollectionUpdateInput)
  static async delete(id: string)
  static async addProduct(collectionId: string, productId: string)
  static async removeProduct(collectionId: string, productId: string)
}
```

## Résumé

L'architecture en services permet de :
- ✅ Séparer la logique métier des routes HTTP
- ✅ Réutiliser facilement le code
- ✅ Tester plus facilement
- ✅ Maintenir un code propre et organisé
- ✅ Centraliser la sécurité et les validations

Tous les endpoints API doivent utiliser les services correspondants plutôt que d'accéder directement à Prisma.
