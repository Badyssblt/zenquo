// kernel-core.ts
// Syst�me de hooks et plugins inspir� de WordPress

/**
 * Erreur custom pour les blocs/sections
 */
export class BlockError extends Error {
  constructor(message: string, public blockType: string) {
    super(message)
    this.name = 'BlockError'
  }
}

/**
 * Erreur custom pour les plugins
 */
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

/**
 * Kernel principal de Zenquo
 * G�re les hooks, filtres, plugins et configuration globale
 */
export class Kernel {
  private actions: Map<string, Hook> = new Map()
  private filters: Map<string, Filter> = new Map()
  private plugins: Map<string, any> = new Map()
  private config: Record<string, any> = {}

  // ==================== ACTIONS ====================

  /**
   * Enregistrer une action (point d'ex�cution)
   * @example kernel.addAction('beforeRenderSection', (section) => console.log(section))
   */
  addAction(hookName: string, callback: (...args: any[]) => any, priority: number = 10) {
    if (!this.actions.has(hookName)) {
      this.actions.set(hookName, { name: hookName, callbacks: [] })
    }

    const hook = this.actions.get(hookName)!

    // Ajouter la priorit� au callback
    const callbackWithPriority = Object.assign(callback, { priority })
    hook.callbacks.push(callbackWithPriority)

    // Trier par priorit� (plus petit = ex�cut� en premier)
    hook.callbacks.sort((a: any, b: any) => (a.priority || 10) - (b.priority || 10))
  }

  /**
   * D�clencher une action
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

    // Ajouter la priorit� au callback
    const callbackWithPriority = Object.assign(callback, { priority })
    filter.callbacks.push(callbackWithPriority)

    // Trier par priorit�
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

    // Initialiser le plugin s'il a une m�thode init
    if (plugin.init && typeof plugin.init === 'function') {
      try {
        plugin.init(this)
      } catch (error) {
        console.error(`Error initializing plugin ${name}:`, error)
        throw new PluginError(`Failed to initialize plugin ${name}`, name)
      }
    }
  }

  /**
   * R�cup�rer un plugin
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

  /**
   * D�sactiver un plugin
   */
  disablePlugin(name: string) {
    const plugin = this.plugins.get(name)
    if (plugin) {
      plugin.enabled = false
    }
  }

  /**
   * Activer un plugin
   */
  enablePlugin(name: string) {
    const plugin = this.plugins.get(name)
    if (plugin) {
      plugin.enabled = true
      if (plugin.init && typeof plugin.init === 'function') {
        plugin.init(this)
      }
    }
  }

  // ==================== CONFIG ====================

  /**
   * D�finir une config
   */
  setConfig(key: string, value: any) {
    this.config[key] = value
  }

  /**
   * R�cup�rer une config
   */
  getConfig(key: string, defaultValue?: any) {                
    return this.config[key] ?? defaultValue
  }

  /**
   * R�cup�rer toute la config
   */
  getAllConfig() {
    return { ...this.config }
  }
}
