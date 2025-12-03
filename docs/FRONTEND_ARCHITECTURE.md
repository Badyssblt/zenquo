# Architecture Frontend - Zenquo

## Structure en couches

```
Composants Vue
    ↓
Composables (useTheme, useSettings, useCart...)
    ↓
Services Frontend (/app/services/*.service.ts)
    ↓
API REST (/api/*)
    ↓
Services Backend (/server/services/*.service.ts)
    ↓
Prisma ORM
    ↓
Database (MariaDB)
```

## Responsabilités de chaque couche

### 1. Composants Vue (`.vue` files)

**Rôle :** Interface utilisateur

**Responsabilités :**
- Affichage de l'UI
- Gestion des événements utilisateur
- Appel des composables

**Ne doit PAS :**
- ❌ Appeler directement les APIs
- ❌ Contenir de la logique métier complexe
- ❌ Gérer directement les états globaux

**Exemple :**
```vue
<script setup lang="ts">
const { activeTheme, setTheme, getAvailableThemes } = useTheme()
const themes = ref([])

onMounted(async () => {
  themes.value = await getAvailableThemes()
})

const handleThemeChange = async (themeName: string) => {
  try {
    await setTheme(themeName)
    // Afficher un toast de succès
  } catch (error) {
    // Afficher un toast d'erreur
  }
}
</script>

<template>
  <div>
    <h2>Thème actif : {{ activeTheme }}</h2>
    <select @change="handleThemeChange($event.target.value)">
      <option v-for="theme in themes" :key="theme.name" :value="theme.name">
        {{ theme.name }}
      </option>
    </select>
  </div>
</template>
```

### 2. Composables (`/app/composables/*.ts`)

**Rôle :** Logique réutilisable et gestion d'état

**Responsabilités :**
- Encapsuler la logique métier frontend
- Gérer l'état local/global (via useState, ref, computed)
- Appeler les services pour les opérations API
- Interagir avec le kernel (hooks, config)

**Ne doit PAS :**
- ❌ Faire des appels `$fetch` directs
- ❌ Contenir de la logique de transformation de données API

**Exemple :**
```typescript
// app/composables/useTheme.ts
import { ThemeApiService } from '~/services/theme.service'

export const useTheme = () => {
  const { $kernel } = useNuxtApp()
  const activeTheme = computed(() => $kernel.getConfig('theme', 'default'))

  const setTheme = async (themeName: string) => {
    // 1. Appel au service
    const response = await ThemeApiService.activate(themeName)

    // 2. Mise à jour du kernel
    $kernel.setConfig('theme', themeName)

    // 3. Déclencher les hooks
    await $kernel.doAction('themeChanged', themeName)

    return response
  }

  return { activeTheme, setTheme }
}
```

### 3. Services Frontend (`/app/services/*.service.ts`)

**Rôle :** Abstraction des appels API

**Responsabilités :**
- Centraliser tous les appels API
- Gérer les transformations de données (DTO)
- Gérer les erreurs HTTP
- Typage TypeScript fort
- Cache frontend si nécessaire

**Ne doit PAS :**
- ❌ Gérer l'état de l'application
- ❌ Interagir avec le kernel directement
- ❌ Contenir de la logique UI

**Exemple :**
```typescript
// app/services/theme.service.ts
export interface Theme {
  id: string
  name: string
  active: boolean
  config: any
}

export class ThemeApiService {
  /**
   * Récupérer tous les thèmes
   */
  static async getAll(): Promise<Theme[]> {
    try {
      const themes = await $fetch<Theme[]>('/api/themes')
      return themes
    } catch (error) {
      console.error('Erreur API:', error)
      throw error
    }
  }

  /**
   * Activer un thème
   */
  static async activate(themeName: string): Promise<ThemeActivateResponse> {
    const response = await $fetch<ThemeActivateResponse>(
      `/api/themes/${themeName}/activate`,
      { method: 'POST' }
    )

    if (!response.success) {
      throw new Error(response.message)
    }

    return response
  }
}
```

## Pourquoi séparer Composables et Services ?

### Sans Services (❌ Mauvais)

```typescript
// app/composables/useTheme.ts
export const useTheme = () => {
  const setTheme = async (themeName: string) => {
    // Appel API direct dans le composable
    const response = await $fetch(`/api/themes/${themeName}/activate`, {
      method: 'POST'
    })
    // ...
  }
}
```

**Problèmes :**
- Code dupliqué si plusieurs composables appellent la même API
- Difficile à tester
- Mélange des responsabilités

### Avec Services (✅ Bon)

```typescript
// app/services/theme.service.ts
export class ThemeApiService {
  static async activate(themeName: string) {
    return await $fetch(`/api/themes/${themeName}/activate`, {
      method: 'POST'
    })
  }
}

// app/composables/useTheme.ts
export const useTheme = () => {
  const setTheme = async (themeName: string) => {
    const response = await ThemeApiService.activate(themeName)
    // Logique métier spécifique au composable
  }
}
```

**Avantages :**
- ✅ Code réutilisable
- ✅ Facile à tester (mock du service)
- ✅ Séparation claire des responsabilités
- ✅ Un seul endroit pour les appels API

## Flux de données complet

### Exemple : Changer le thème

```
1. Composant Vue
   ↓ handleThemeChange('shadcn')

2. Composable useTheme
   ↓ setTheme('shadcn')

3. Service Frontend ThemeApiService
   ↓ activate('shadcn')

4. API Endpoint /api/themes/shadcn/activate
   ↓ POST request

5. Service Backend ThemeService
   ↓ setActive('shadcn')

6. Prisma ORM
   ↓ UPDATE theme SET active = true WHERE name = 'shadcn'

7. Database MariaDB
   ✅ Thème activé

8. Réponse remonte la chaîne
   API → Service Frontend → Composable → Composant

9. Composable met à jour le kernel
   $kernel.setConfig('theme', 'shadcn')

10. Composant réagit au changement (computed)
    UI mise à jour automatiquement
```

## Services Frontend disponibles

### ThemeApiService (`/app/services/theme.service.ts`)

```typescript
ThemeApiService.getAll()              // Récupérer tous les thèmes
ThemeApiService.getActive()           // Récupérer le thème actif
ThemeApiService.activate(name)        // Activer un thème
ThemeApiService.loadConfig(name)      // Charger la config d'un thème
```

### SettingApiService (`/app/services/setting.service.ts`)

```typescript
SettingApiService.getAll()                    // Tous les settings
SettingApiService.getByKey(key)               // Un setting par clé
SettingApiService.upsert(key, value, type)    // Créer/MAJ un setting
SettingApiService.getAllAsObject()            // Settings en objet clé/valeur
```

## Composables disponibles

### useTheme (`/app/composables/useTheme.ts`)

```typescript
const {
  activeTheme,          // computed: thème actif
  loadSection,          // Charger une section du thème
  loadComponent,        // Charger un composant du thème
  loadThemeConfig,      // Charger config JSON du thème
  setTheme,             // Changer de thème
  getAvailableThemes,   // Liste des thèmes
  fetchActiveTheme      // Récupérer thème actif depuis API
} = useTheme()
```

### useSettings (`/app/composables/useSettings.ts`)

```typescript
const {
  getSetting,                  // Récupérer depuis cache kernel
  setSetting,                  // Définir dans cache (ne persiste pas)
  saveSetting,                 // Sauvegarder en DB via API
  fetchSetting,                // Récupérer depuis API
  loadSettings,                // Charger tous depuis API
  getAllSettingsAsObject       // Récupérer en objet
} = useSettings()
```

## Bonnes pratiques

### ✅ À FAIRE

1. **Toujours passer par les services pour les appels API**
```typescript
// ✅ Bon
const themes = await ThemeApiService.getAll()
```

2. **Utiliser les composables dans les composants**
```vue
<script setup>
const { setTheme } = useTheme()
</script>
```

3. **Typer fortement les services**
```typescript
static async getAll(): Promise<Theme[]> { }
```

4. **Gérer les erreurs à chaque niveau**
```typescript
try {
  const response = await ThemeApiService.activate(name)
  // Succès
} catch (error) {
  // Gestion d'erreur
}
```

### ❌ À ÉVITER

1. **Appels $fetch directs dans les composables**
```typescript
// ❌ Mauvais
const themes = await $fetch('/api/themes')
```

2. **Logique métier dans les composants**
```vue
<!-- ❌ Mauvais -->
<script setup>
const themes = await $fetch('/api/themes')
const activeTheme = themes.find(t => t.active)
$kernel.setConfig('theme', activeTheme.name)
</script>
```

3. **Services qui gèrent l'état**
```typescript
// ❌ Mauvais - le service ne doit pas gérer l'état
export class ThemeApiService {
  private static currentTheme = ref('default') // ❌
}
```

4. **Composables qui font des transformations de données API**
```typescript
// ❌ Mauvais - la transformation doit être dans le service
export const useTheme = () => {
  const themes = await $fetch('/api/themes')
  return themes.map(t => ({ ...t, displayName: t.name })) // ❌
}
```

## Tests

### Tester un service

```typescript
// theme.service.spec.ts
import { ThemeApiService } from '~/services/theme.service'

describe('ThemeApiService', () => {
  it('should fetch all themes', async () => {
    // Mock $fetch
    global.$fetch = vi.fn().mockResolvedValue([
      { name: 'default', active: true }
    ])

    const themes = await ThemeApiService.getAll()

    expect(themes).toHaveLength(1)
    expect(themes[0].name).toBe('default')
  })
})
```

### Tester un composable

```typescript
// useTheme.spec.ts
import { useTheme } from '~/composables/useTheme'
import { ThemeApiService } from '~/services/theme.service'

vi.mock('~/services/theme.service')

describe('useTheme', () => {
  it('should change theme', async () => {
    vi.mocked(ThemeApiService.activate).mockResolvedValue({
      success: true,
      theme: { name: 'shadcn' }
    })

    const { setTheme } = useTheme()
    await setTheme('shadcn')

    expect(ThemeApiService.activate).toHaveBeenCalledWith('shadcn')
  })
})
```

## Services à créer prochainement

- `ProductApiService` : Gestion des produits
- `OrderApiService` : Gestion des commandes
- `CartApiService` : Gestion du panier
- `UserApiService` : Gestion des utilisateurs
- `PageApiService` : Gestion des pages

## Résumé

| Couche | Responsabilité | Peut appeler | Ne doit pas |
|--------|---------------|--------------|-------------|
| **Composants** | UI | Composables | API, Services, Kernel |
| **Composables** | Logique métier | Services, Kernel | API directement |
| **Services Frontend** | Appels API | API endpoints | Kernel, État |
| **API Endpoints** | Routing HTTP | Services Backend | Prisma |
| **Services Backend** | Logique métier | Prisma | - |
| **Prisma** | ORM | Database | - |

Cette architecture garantit :
- ✅ Code maintenable
- ✅ Testabilité maximale
- ✅ Réutilisabilité du code
- ✅ Séparation claire des responsabilités
