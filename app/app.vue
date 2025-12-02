<script setup lang="ts">
const { $kernel } = useNuxtApp()

useHead({
  title: $kernel.getConfig('siteName')
})
</script>

<template>
  <div>
    <h1>Zenquo CMS</h1>
    <p>Kernel initialisé ✅</p>
    <p>Ouvrez la console pour voir les tests du kernel</p>
  </div>
</template>
