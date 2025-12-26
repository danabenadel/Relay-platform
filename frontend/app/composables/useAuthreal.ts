interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const useAuth = () => {
  // État global persistant
  const user = useState<User | null>("auth.user", () => null);

  // Token stocké dans un cookie sécurisé
  const token = useCookie("auth-token", {
    default: () => null,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });

  // Computed pour vérifier l'authentification
  const isAuthenticated = computed(() => !!user.value && !!token.value);

  // Méthodes d'authentification
  const login = async (credentials: LoginCredentials): Promise<void> => {
    const { $api } = useNuxtApp();

    try {
      const response = await $api<AuthResponse>("/auth/login", {
        method: "POST",
        body: credentials,
      });

      // Stocker les données utilisateur
      user.value = response.user;
      token.value = response.token;

      // Toast de succès
      const toast = useToast();
      toast.add({
        title: "Connexion réussie",
        description: `Bienvenue ${response.user.name} !`,
        color: "green",
      });
    } catch (error: any) {
      throw new Error(error.data?.message || "Erreur de connexion");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Optionnel : appeler l'API de déconnexion
      const { $api } = useNuxtApp();
      await $api("/auth/logout", { method: "POST" });
    } catch (error) {
      console.warn("Erreur lors de la déconnexion côté serveur:", error);
    } finally {
      // Nettoyer les données locales
      user.value = null;
      token.value = null;

      // Redirection vers la page de connexion
      await navigateTo("/login");

      // Toast d'information
      const toast = useToast();
      toast.add({
        title: "Déconnexion réussie",
        description: "À bientôt !",
        color: "blue",
      });
    }
  };

  const loginWithOAuth = (provider: "google" | "facebook" | "github"): void => {
    const config = useRuntimeConfig();
    const redirectUrl = `${config.public.apiBaseUrl}/auth/oauth/${provider}`;

    // Stocker l'URL de retour
    const returnUrl = useRoute().fullPath;
    const returnUrlCookie = useCookie("oauth-return-url");
    returnUrlCookie.value = returnUrl;

    // Redirection vers le provider OAuth
    navigateTo(redirectUrl, { external: true });
  };

  // Initialisation - vérifier si l'utilisateur est toujours valide
  const init = async (): Promise<void> => {
    if (token.value && !user.value) {
      try {
        const { $api } = useNuxtApp();
        const userData = await $api<User>("/auth/me");
        user.value = userData;
      } catch (error) {
        // Token invalide, nettoyer
        token.value = null;
        console.warn("Token invalide, déconnexion automatique");
      }
    }
  };

  return {
    // État
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,

    // Méthodes
    login,
    logout,
    loginWithOAuth,
    init,
  };
};
