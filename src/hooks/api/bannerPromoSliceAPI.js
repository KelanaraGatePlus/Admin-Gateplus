import backendUrl from "@/const/backendUrl";

export const bannerPromoAPI = {
  // get semua banner dengan filter
  getAllBannersPromo: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const response = await fetch(
      `${backendUrl}/api/bannersPromo?${queryParams.toString()}`,
    );

    if (!response.ok) throw new Error("Failed to fetch banners");
    return response.json();
  },

  getBannerPromoById: async (id) => {
    const response = await fetch(`${backendUrl}/api/bannersPromo/${id}`);
    if (!response.ok) throw new Error("Failed to fetch banner");
    return response.json();
  },

  createBannerPromo: async (data) => {
    const response = await fetch(`${backendUrl}/api/bannersPromo`, {
      method: "POST",
      credentials: "include",
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create banner");
    }

    return response.json();
  },

  updateBannerPromo: async (id, data) => {
    const response = await fetch(`${backendUrl}/api/bannersPromo/${id}`, {
      method: "PATCH",
      credentials: "include",
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed update data");
    }

    return response.json();
  },

  deleteBannerPromo: async (id) => {
    const response = await fetch(`${backendUrl}/api/bannersPromo/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete banner");
    }

    return response.json();
  },

  toggleBannerPromoStatus: async (id) => {
    const response = await fetch(
      `${backendUrl}/api/bannersPromo/${id}/toggle`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to toggle banner status");
    }
  },
};
