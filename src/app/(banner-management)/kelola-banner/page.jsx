"use client";

import React, { useState } from "react";

// Professional Icon Components
const Icons = {
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Image: () => (
    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Pencil: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
};

export default function KelolaBannerPage() {
  // State Management
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    subJudul: "",
    judul: "",
    deskripsi: "",
    fokusKategori: ["Semua"],
    linkUrl: "",
    textButton: "Daftar Sekarang",
    statusAktif: true,
    posisi: "Hero Banner",
    prioritas: "1",
    targetDevice: "Semua Device",
    targetPenonton: "Semua",
    berlakuDari: "",
    berlakuSampai: "",
    imageFile: null,
    imagePreview: null
  });

  // Dummy Data - Replace with API call
  const [banners, setBanners] = useState([
    {
      id: 1,
      image: "filename_01.png",
      title: "Social Media Ads",
      desc: "Iklan Promosi untuk Meningkatkan Engagement",
      kategori: "Promosi",
      priority: "Priority 1",
      status: "Aktif",
      impression: "4,200",
      klik: "200",
      linkUrl: "https://gateplus.id/promo",
      subJudul: "Promosi Spesial",
      fokusKategori: ["Semua", "Merdu"],
      posisi: "Hero Banner",
      targetDevice: "Semua Device"
    },
    {
      id: 2,
      image: "filename_03.png",
      title: "Email Campaign",
      desc: "Kampanye Email untuk Pelanggan Potensial",
      kategori: "Email",
      priority: "Priority 2",
      status: "Aktif",
      impression: "3,000",
      klik: "300",
      linkUrl: "https://gateplus.id/email",
      subJudul: "Campaign 2024",
      fokusKategori: ["Email"],
      posisi: "Hero Banner",
      targetDevice: "Semua Device"
    },
    {
      id: 3,
      image: "filename_04.png",
      title: "Content Marketing",
      desc: "Pembuatan Konten untuk Meningkatkan Brand Awareness",
      kategori: "Konten",
      priority: "Priority 3",
      status: "Aktif",
      impression: "2,800",
      klik: "120",
      linkUrl: "https://gateplus.id/content",
      subJudul: "Brand Building",
      fokusKategori: ["Series"],
      posisi: "Hero Banner",
      targetDevice: "Mobile"
    },
    {
      id: 4,
      image: "filename_06.png",
      title: "Influencer Partnership",
      desc: "Kolaborasi dengan Influencer untuk Reach yang Lebih Luas",
      kategori: "Kolaborasi",
      priority: "Priority 2",
      status: "Nonaktif",
      impression: "3,800",
      klik: "175",
      linkUrl: "https://gateplus.id/partnership",
      subJudul: "Collaboration Hub",
      fokusKategori: ["Komik"],
      posisi: "Sidebar",
      targetDevice: "Desktop"
    },
    {
      id: 5,
      image: "filename_05.png",
      title: "SEO Optimization",
      desc: "Optimasi SEO untuk Meningkatkan Visibilitas Mesin Pencari",
      kategori: "SEO",
      priority: "Priority 1",
      status: "Aktif",
      impression: "6,700",
      klik: "450",
      linkUrl: "https://gateplus.id/seo",
      subJudul: "Search Power",
      fokusKategori: ["E-Book"],
      posisi: "Hero Banner",
      targetDevice: "Semua Device"
    },
    {
      id: 6,
      image: "filename_07.png",
      title: "Webinar Series",
      desc: "Seri Webinar untuk Edukasi dan Engagement Pelanggan",
      kategori: "Event",
      priority: "Priority 3",
      status: "Aktif",
      impression: "1,200",
      klik: "90",
      linkUrl: "https://gateplus.id/webinar",
      subJudul: "Learn More",
      fokusKategori: ["Podcast"],
      posisi: "Hero Banner",
      targetDevice: "Semua Device"
    },
    {
      id: 7,
      image: "filename_08.png",
      title: "Trade Show Participation",
      desc: "Partisipasi dalam Pameran untuk Networking",
      kategori: "Event",
      priority: "Priority 2",
      status: "Nonaktif",
      impression: "1,500",
      klik: "80",
      linkUrl: "https://gateplus.id/tradeshow",
      subJudul: "Network Event",
      fokusKategori: ["Semua"],
      posisi: "Sidebar",
      targetDevice: "Desktop"
    },
    {
      id: 8,
      image: "filename_09.png",
      title: "Affiliate Program",
      desc: "Program Afiliasi untuk Meningkatkan Penjualan",
      kategori: "Partnership",
      priority: "Priority 3",
      status: "Aktif",
      impression: "2,500",
      klik: "110",
      linkUrl: "https://gateplus.id/affiliate",
      subJudul: "Join & Earn",
      fokusKategori: ["Merdu"],
      posisi: "Hero Banner",
      targetDevice: "Semua Device"
    },
    {
      id: 9,
      image: "filename_10.png",
      title: "Video Marketing",
      desc: "Pembuatan Video untuk Meningkatkan Daya Tarik Visual",
      kategori: "Video",
      priority: "Priority 1",
      status: "Aktif",
      impression: "3,900",
      klik: "250",
      linkUrl: "https://gateplus.id/video",
      subJudul: "Visual Impact",
      fokusKategori: ["Series", "Komik"],
      posisi: "Hero Banner",
      targetDevice: "Mobile"
    }
  ]);

  // Calculate Stats
  const stats = {
    totalBanners: banners.length,
    activeBanners: banners.filter(b => b.status === "Aktif").length,
    totalClicks: banners.reduce((sum, b) => sum + parseInt(b.klik.replace(/,/g, '')), 0),
    avgClickRate: "7.2"
  };

  // Filtered Banners
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         banner.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "aktif" && banner.status === "Aktif") ||
                         (filterStatus === "nonaktif" && banner.status === "Nonaktif");
    return matchesSearch && matchesFilter;
  });

  // Handle Form Input Change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle Kategori Toggle
  const toggleKategori = (kategori) => {
    if (kategori === "Semua") {
      setFormData(prev => ({
        ...prev,
        fokusKategori: ["Semua"]
      }));
    } else {
      setFormData(prev => {
        const filtered = prev.fokusKategori.filter(k => k !== "Semua");
        const exists = filtered.includes(kategori);
        return {
          ...prev,
          fokusKategori: exists 
            ? filtered.filter(k => k !== kategori)
            : [...filtered, kategori]
        };
      });
    }
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Modal for Create
  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      subJudul: "",
      judul: "",
      deskripsi: "",
      fokusKategori: ["Semua"],
      linkUrl: "https://gateplus.id/promo",
      textButton: "Daftar Sekarang",
      statusAktif: true,
      posisi: "Hero Banner",
      prioritas: "1",
      targetDevice: "Semua Device",
      targetPenonton: "Semua",
      berlakuDari: "",
      berlakuSampai: "",
      imageFile: null,
      imagePreview: null
    });
    setShowModal(true);
  };

  // Open Modal for Edit
  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      subJudul: banner.subJudul || "",
      judul: banner.title,
      deskripsi: banner.desc,
      fokusKategori: banner.fokusKategori || ["Semua"],
      linkUrl: banner.linkUrl,
      textButton: "Daftar Sekarang",
      statusAktif: banner.status === "Aktif",
      posisi: banner.posisi,
      prioritas: banner.priority.split(" ")[1],
      targetDevice: banner.targetDevice,
      targetPenonton: "Semua",
      berlakuDari: "",
      berlakuSampai: "",
      imageFile: null,
      imagePreview: null
    });
    setShowModal(true);
  };

  // Handle Create/Update Banner
  const handleSubmit = () => {
    // Validate required fields
    if (!formData.judul.trim()) {
      alert("Judul banner harus diisi!");
      return;
    }

    if (editingBanner) {
      // UPDATE - Replace with API call: PUT /api/banners/:id
      setBanners(prev => prev.map(banner => 
        banner.id === editingBanner.id 
          ? {
              ...banner,
              title: formData.judul,
              desc: formData.deskripsi,
              subJudul: formData.subJudul,
              linkUrl: formData.linkUrl,
              status: formData.statusAktif ? "Aktif" : "Nonaktif",
              kategori: formData.fokusKategori[0],
              priority: `Priority ${formData.prioritas}`,
              posisi: formData.posisi,
              targetDevice: formData.targetDevice,
              fokusKategori: formData.fokusKategori
            }
          : banner
      ));
      alert("Banner berhasil diperbarui!");
    } else {
      // CREATE - Replace with API call: POST /api/banners
      const newBanner = {
        id: banners.length + 1,
        image: `filename_${String(banners.length + 1).padStart(2, '0')}.png`,
        title: formData.judul,
        desc: formData.deskripsi,
        subJudul: formData.subJudul,
        kategori: formData.fokusKategori[0],
        priority: `Priority ${formData.prioritas}`,
        status: formData.statusAktif ? "Aktif" : "Nonaktif",
        impression: "0",
        klik: "0",
        linkUrl: formData.linkUrl,
        posisi: formData.posisi,
        targetDevice: formData.targetDevice,
        fokusKategori: formData.fokusKategori
      };
      setBanners(prev => [...prev, newBanner]);
      alert("Banner berhasil ditambahkan!");
    }

    setShowModal(false);
  };

  // Handle Delete Banner
  const handleDelete = (bannerId) => {
    if (confirm("Apakah Anda yakin ingin menghapus banner ini?")) {
      // DELETE - Replace with API call: DELETE /api/banners/:id
      setBanners(prev => prev.filter(banner => banner.id !== bannerId));
      alert("Banner berhasil dihapus!");
    }
  };

  // Handle View Banner
  const handleView = (banner) => {
    // Replace with actual view logic (e.g., open preview modal or navigate to detail page)
    alert(`Melihat detail banner: ${banner.title}`);
    console.log("Banner details:", banner);
  };

  const kategoris = ["Semua", "Merdu", "Series", "E-Book", "Komik", "Podcast"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Banners</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalBanners}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Active Banners</div>
          <div className="text-3xl font-bold text-green-600">{stats.activeBanners}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalClicks.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Avg. Click Rate</div>
          <div className="text-3xl font-bold text-red-600">{stats.avgClickRate} %</div>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">Kelola Banner</h1>
            <p className="text-sm text-gray-600">Mengelola banner promosi di halaman utama</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            <Icons.Pencil /> Tambah Banner Baru
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari berdasarkan judul atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Icons.Search />
            </span>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Icons.Filter /> Filter Status <Icons.ChevronDown />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <button
                  onClick={() => { setFilterStatus("all"); setShowFilterMenu(false); }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === "all" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  Semua Banner
                </button>
                <button
                  onClick={() => { setFilterStatus("aktif"); setShowFilterMenu(false); }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === "aktif" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  Aktif
                </button>
                <button
                  onClick={() => { setFilterStatus("nonaktif"); setShowFilterMenu(false); }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === "nonaktif" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  Nonaktif
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredBanners.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Icons.Image />
              <p className="mt-4 text-gray-500">Tidak ada banner yang ditemukan</p>
            </div>
          </div>
        ) : (
          filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              {/* Banner Image */}
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-40 flex items-center justify-center">
                <Icons.Image />
                <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white px-2 py-0.5 rounded">
                  {banner.image}
                </div>
              </div>

              {/* Banner Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1 truncate">{banner.title}</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{banner.desc}</p>

                {/* Tags */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    {banner.kategori}
                  </span>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                    {banner.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    banner.status === "Aktif" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {banner.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <div className="text-gray-500">Impression</div>
                    <div className="font-semibold">{banner.impression}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Klik</div>
                    <div className="font-semibold">{banner.klik}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleView(banner)}
                    className="px-3 py-1.5 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition flex items-center justify-center gap-1"
                  >
                    <Icons.Eye /> Lihat
                  </button>
                  <button 
                    onClick={() => openEditModal(banner)}
                    className="px-3 py-1.5 text-xs text-green-600 border border-green-600 rounded hover:bg-green-50 transition flex items-center justify-center gap-1"
                  >
                    <Icons.Edit /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="px-3 py-1.5 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50 transition flex items-center justify-center gap-1"
                  >
                    <Icons.Trash /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">
                {editingBanner ? "Edit Banner" : "Tambah Banner Baru"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icons.X />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <h3 className="font-semibold mb-4">Tambahkan Banner</h3>
                  
                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 text-center hover:border-blue-400 transition">
                    {formData.imagePreview ? (
                      <div className="relative">
                        <img 
                          src={formData.imagePreview} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, imageFile: null, imagePreview: null }))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-32 rounded flex items-center justify-center mb-2">
                        <Icons.Upload />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label
                      htmlFor="banner-upload"
                      className="cursor-pointer text-blue-500 hover:text-blue-600 font-medium inline-flex items-center gap-2"
                    >
                      <Icons.Plus /> Upload Gambar
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Rekomendasi: 1920x1080px, maksimal 5MB
                    </p>
                    {formData.imageFile && (
                      <p className="text-xs text-gray-600 mt-1">
                        1. {formData.imageFile.name}
                      </p>
                    )}
                  </div>

                  {/* Schedule Settings */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Pengaturan Jadwal</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Posisi Banner</label>
                      <select 
                        value={formData.posisi}
                        onChange={(e) => handleInputChange('posisi', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Hero Banner">Hero Banner</option>
                        <option value="Sidebar">Sidebar</option>
                        <option value="Footer">Footer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Prioritas Tampil</label>
                      <select 
                        value={formData.prioritas}
                        onChange={(e) => handleInputChange('prioritas', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Target Device</label>
                      <select 
                        value={formData.targetDevice}
                        onChange={(e) => handleInputChange('targetDevice', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Semua Device">Semua Device</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Mobile">Mobile</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Target Penonton</label>
                      <div className="flex gap-2 flex-wrap">
                        {["Semua", "Pengguna Baru", "Pengguna Lama"].map(target => (
                          <button
                            key={target}
                            type="button"
                            onClick={() => handleInputChange('targetPenonton', target)}
                            className={`px-3 py-1 text-xs rounded transition ${
                              formData.targetPenonton === target
                                ? "bg-blue-500 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {target}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <h3 className="font-semibold mb-4">Informasi Dasar</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Sub Judul Banner</label>
                      <input
                        type="text"
                        placeholder="Deskripsi kecil"
                        value={formData.subJudul}
                        onChange={(e) => handleInputChange('subJudul', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Judul Banner <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan judul banner"
                        value={formData.judul}
                        onChange={(e) => handleInputChange('judul', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Deskripsi</label>
                      <textarea
                        placeholder="Deskripsi banner.."
                        value={formData.deskripsi}
                        onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Fokus Kategori</label>
                      <div className="flex gap-2 flex-wrap">
                        {kategoris.map(kategori => (
                          <button
                            key={kategori}
                            type="button"
                            onClick={() => toggleKategori(kategori)}
                            className={`px-3 py-1 text-xs rounded transition ${
                              formData.fokusKategori.includes(kategori)
                                ? "bg-blue-500 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {kategori}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Link URL</label>
                      <input
                        type="url"
                        placeholder="https://gateplus.id/promo"
                        value={formData.linkUrl}
                        onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Text Button</label>
                      <input
                        type="text"
                        value={formData.textButton}
                        onChange={(e) => handleInputChange('textButton', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <label className="block text-sm font-medium">Status Aktif</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.statusAktif}
                          onChange={(e) => handleInputChange('statusAktif', e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Pengaturan Jadwal</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Berlaku Dari <Icons.Calendar />
                          </label>
                          <input
                            type="date"
                            value={formData.berlakuDari}
                            onChange={(e) => handleInputChange('berlakuDari', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Berlaku Sampai <Icons.Calendar />
                          </label>
                          <input
                            type="date"
                            value={formData.berlakuSampai}
                            onChange={(e) => handleInputChange('berlakuSampai', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t sticky bottom-0 bg-white">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition font-medium"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-medium"
              >
                {editingBanner ? "Update Banner" : "Tambah Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}