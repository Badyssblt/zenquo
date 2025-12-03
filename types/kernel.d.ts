import type { Kernel } from '~/kernel-core'

declare module '#app' {
  interface NuxtApp {
    $kernel: Kernel
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $kernel: Kernel
  }
}

export {}
