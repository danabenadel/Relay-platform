interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
}

export const useApi = () => {
  const config = useRuntimeConfig();
  const { token } = useAuth();

  // Instance $fetch configurée
  const $api = $fetch.create({
    baseURL: config.public.apiBaseUrl,

    onRequest({ options }) {
      // Ajouter le token d'authentification
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
        };
      }
    },

    onResponseError({ response }) {
      // Gestion des erreurs globales
      const toast = useToast();

      if (response.status === 401) {
        // Token expiré, déconnexion automatique
        const { logout } = useAuth();
        logout();
        return;
      }

      if (response.status >= 500) {
        toast.add({
          title: "Erreur serveur",
          description: "Une erreur est survenue, veuillez réessayer",
          color: "red",
        });
      }
    },
  });

  // Méthodes API spécifiques
  const getServices = () => $api<any[]>("/services");

  const getAbout = () => $api<any>("/about.json");

  const getStats = () =>
    $api<{
      services: number;
      areas: number;
      executions: number;
    }>("/dashboard/stats");

  const getRecentAreas = (limit = 5) =>
    $api<any[]>(`/areas/recent?limit=${limit}`);

  const createArea = (data: any) =>
    $api("/areas", {
      method: "POST",
      body: data,
    });

  const toggleArea = (id: string, active: boolean) =>
    $api(`/areas/${id}`, {
      method: "PATCH",
      body: { active },
    });

  const deleteArea = (id: string) =>
    $api(`/areas/${id}`, {
      method: "DELETE",
    });

  return {
    $api,
    // Méthodes spécifiques
    getServices,
    getAbout,
    getStats,
    getRecentAreas,
    createArea,
    toggleArea,
    deleteArea,
  };
};
