export default defineNuxtRouteMiddleware((to) => {
  // Vérifier si l'utilisateur a un token d'authentification
  const token = useCookie('auth-token');

  if (!token.value) {
    return navigateTo("/login");
  }
});
