import { useEffect, useState } from "react";

export default function useBannerManager({ fetchFn, enabled = true }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterStatus, setShowFilterStatus] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [stats, setStats] = useState({
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
  });

  const fetch = async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const response = await fetchFn({
        status: showFilterStatus === "all" ? undefined : showFilterStatus,
        search: searchQuery || undefined,
        page: 1,
        limit: 100,
      });
      if (response.success) {
        setBanners(response.data);
        setStats({
          totalBanners: response.stats.total,
          activeBanners: response.stats.active,
          inactiveBanners: response.stats.inactive,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [showFilterStatus, searchQuery, enabled]);

  return {
    banners,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    showFilterStatus,
    setShowFilterStatus,
    showFilterMenu,
    setShowFilterMenu,
    refetch: fetch,
  };
}
