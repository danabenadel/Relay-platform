<template>
  <div class="skip-links">
    <a href="#main-content" class="skip-link" tabindex="-1">
      Aller au contenu principal
    </a>
    <a href="#navigation" class="skip-link" tabindex="-1">
      Aller à la navigation
    </a>
    <a href="#footer" class="skip-link" tabindex="-1">
      Aller au pied de page
    </a>
  </div>
</template>

<style scoped>
.skip-links {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  border: 0;
}

.skip-link {
  display: block;
  width: 1px;
  height: 1px;
  overflow: hidden;
  white-space: nowrap;
}
</style>
