import backendUrl from "@/const/backendUrl";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found. Please login.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

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
      {
        headers: getAuthHeader(),
      },
    );

    if (!response.ok) throw new Error("Failed to fetch banners");
    return response.json();
  },

  getBannerPromoById: async (id) => {
    const response = await fetch(`${backendUrl}/api/bannersPromo/${id}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch banner");
    return response.json();
  },

  createBannerPromo: async (data) => {
    const response = await fetch(`${backendUrl}/api/bannersPromo`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeader(),
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
      headers: getAuthHeader(),
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
      headers: getAuthHeader(),
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
        headers: getAuthHeader(),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to toggle banner status");
    }
  },
};
