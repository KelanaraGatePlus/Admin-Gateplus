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

export const bannerAPI = {
  // GET semua banners dengan filter
  getAllBanners: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append("status", params.status);
    if (params.position) queryParams.append("position", params.position);
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const response = await fetch(
      `${backendUrl}/api/banners?${queryParams.toString()}`,
      {
        headers: getAuthHeader(),
      },
    );

    if (!response.ok) throw new Error("Failed to fetch banners");
    return response.json();
  },

  // GET banner by ID
  getBannerById: async (id) => {
    const response = await fetch(`${backendUrl}/api/banners/${id}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch banner");
    return response.json();
  },

  // CREATE banner (support image + trailer)
  createBanner: async (data) => {
    const response = await fetch(`${backendUrl}/api/banners`, {
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

  // UPDATE banner (support image + trailer)
  updateBanner: async (id, data) => {
    const response = await fetch(`${backendUrl}/api/banners/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: getAuthHeader(),
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update banner");
    }

    return response.json();
  },

  // DELETE banner
  deleteBanner: async (id) => {
    const response = await fetch(`${backendUrl}/api/banners/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete banner");
    }

    return response.json();
  },

  // PATCH toggle status
  toggleBannerStatus: async (id) => {
    const response = await fetch(`${backendUrl}/api/banners/${id}/toggle`, {
      method: "PATCH",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to toggle banner status");
    }

    return response.json();
  },
};
