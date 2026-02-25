"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import LogoGateplus from "@@/images/logo_gateplus.jpg";
import DefaultAvatar from "@@/images/default_avatar.webp";
import Icon from "@/lib/IconClient";
import Image from "next/image";
import { Avatar, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState({
    "manajemen-konten": pathname?.startsWith("/manajemen-konten") ?? false,
  });

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    {
      title: "Dashboard",
      icon: "solar:widget-4-bold-duotone",
      url: "/dashboard",
    },
    {
      title: "Manajemen Konten",
      icon: "solar:book-bookmark-bold-duotone",
      key: "manajemen-konten",
      url: "/manajemen-konten",
      children: [
        {
          title: "Kelola Kreator",
          icon: "solar:user-hands-bold-duotone",
          url: "/manajemen-konten/kelola-kreator",
        },
        {
          title: "Kelola Konten",
          icon: "solar:play-circle-bold-duotone",
          url: "/manajemen-konten/kelola-konten",
        },
        {
          title: "Kelola Genre",
          icon: "solar:tag-bold-duotone",
          url: "/manajemen-konten/kelola-genre",
        },
      ],
    },
    {
      title: "Analitik & Laporan",
      icon: "solar:chart-square-bold-duotone",
      url: "/analitik-laporan",
    },
    {
      title: "Analitik Laporan Keuangan",
      icon: "solar:chart-square-bold-duotone",
      url: "/analitik-dan-laporan",
    },
    {
      title: "Kelola Voucher",
      icon: "solar:ticket-sale-bold",
      url: "/voucher",
    },
    {
      title: "Kelola Banner",
      icon: "solar:gallery-wide-bold-duotone",
      url: "/kelola-banner",
    },
    {
      title: "Kelola Artikel FAQ",
      icon: "solar:question-square-broken",
      url: "/faq-article",
    },
    {
      title: "Pengaturan Konten",
      icon: "solar:folder-favourite-bookmark-bold-duotone",
      url: "/pengaturan-konten",
    },
    {
      title: "Manajemen Layanan",
      icon: "solar:users-group-two-rounded-bold-duotone",
      url: "/pengaturan-akun",
    },
    {
      title: "Pengaturan",
      icon: "solar:settings-bold-duotone",
      url: "/pengaturan",
    },
  ];

  return (
    <Sidebar
      collapsible="icon"
      className="data-[state=collapsed]:w-[64px] md:data-[state=expanded]:w-64 border-r border-gray-100 shadow-[1px_0_8px_0_rgba(0,0,0,0.04)]"
    >
      {/* ===================== HEADER ===================== */}
      <SidebarHeader className="px-0 py-0">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1 py-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              <Image
                src={LogoGateplus}
                alt="Logo Gateplus"
                className="w-full h-full object-contain"
              />
            </div>
            <SidebarTrigger className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#1297DC]/10 text-gray-400 hover:text-[#1297DC] transition-colors duration-150" />
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex-1 flex items-center">
              <div className="rounded-lg overflow-hidden" style={{ background: "transparent" }}>
                <Image
                  src={LogoGateplus}
                  alt="Logo Gateplus"
                  className="h-8 w-auto object-contain"
                  style={{ mixBlendMode: "multiply" }}
                />
              </div>
            </div>
            <SidebarTrigger className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#1297DC]/10 text-gray-400 hover:text-[#1297DC] transition-colors duration-150" />
          </div>
        )}
      </SidebarHeader>

      {/* ===================== CONTENT ===================== */}
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup
          className={cn(
            "flex flex-col mt-3 gap-0.5",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          {!isCollapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-2 select-none">
              Menu
            </p>
          )}

          {items.map((item, index) => {

            // =========================
            // ITEM DENGAN CHILDREN
            // =========================
            if (item.children) {
              const isOpen = openMenus[item.key];
              const isActive = pathname?.startsWith(item.url);

              return (
                <div key={index}>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <div
                        className={cn(
                          "w-full flex items-center rounded-xl transition-all duration-200 group relative",
                          isActive ? "bg-[#1297DC]/10" : "hover:bg-gray-50",
                          isCollapsed
                            ? "justify-start p-1.5"  // rata kiri seperti item biasa
                            : "justify-between pl-2 pr-1 py-1.5"
                        )}
                      >
                        {isActive && !isCollapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#1297DC] rounded-r-full" />
                        )}

                        <Link
                          href={item.url}
                          className="flex items-center gap-2.5 flex-1 min-w-0"
                        >
                          {/* Icon parent — ukuran penuh w-8 h-8, rata kiri */}
                          <span
                            className={cn(
                              "flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-200",
                              isCollapsed ? "w-8 h-8" : "w-7 h-7",
                              isActive
                                ? "bg-[#1297DC]/15"
                                : "bg-gray-100 group-hover:bg-[#1297DC]/10"
                            )}
                          >
                            <Icon icon={item.icon} className="w-4 h-4 text-[#1297DC]" />
                          </span>

                          {!isCollapsed && (
                            <span
                              className={cn(
                                "text-sm font-medium truncate transition-colors duration-200",
                                isActive
                                  ? "text-[#1297DC]"
                                  : "text-gray-600 group-hover:text-gray-900"
                              )}
                            >
                              {item.title}
                            </span>
                          )}
                        </Link>

                        {!isCollapsed && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleMenu(item.key);
                            }}
                            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#1297DC]/15 transition-colors duration-150"
                          >
                            <Icon
                              icon={isOpen ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"}
                              className={cn(
                                "w-3.5 h-3.5 transition-all duration-200",
                                isActive ? "text-[#1297DC]" : "text-gray-400"
                              )}
                            />
                          </button>
                        )}
                      </div>
                    </SidebarMenuItem>
                  </SidebarMenu>

                  {/* Children - Expanded */}
                  {!isCollapsed && isOpen && (
                    <div className="relative ml-5 mt-0.5 mb-1 flex flex-col gap-0.5">
                      <span className="absolute left-[11px] top-1 bottom-1 w-px bg-gray-200" />
                      {item.children.map((child, childIndex) => {
                        const isChildActive =
                          pathname === child.url ||
                          pathname?.startsWith(child.url + "/");
                        return (
                          <SidebarMenu key={childIndex}>
                            <SidebarMenuItem>
                              <Link
                                href={child.url}
                                className={cn(
                                  "relative flex items-center gap-2 rounded-lg px-2 py-1.5 pl-7 text-sm transition-all duration-200 group",
                                  isChildActive
                                    ? "text-[#1297DC] font-medium bg-[#1297DC]/8"
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                )}
                              >
                                <span
                                  className={cn(
                                    "absolute left-[9px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full transition-all duration-200 border-2",
                                    isChildActive
                                      ? "border-[#1297DC] bg-[#1297DC]"
                                      : "border-gray-300 bg-white group-hover:border-[#1297DC]/60"
                                  )}
                                />
                                <span className="truncate">{child.title}</span>
                              </Link>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        );
                      })}
                    </div>
                  )}

                  {/*
                    Children - Collapsed
                    ─────────────────────────────────────────
                    Layout tree structure:
                    • Parent  → rata kiri, icon w-8 h-8
                    • Children → indent ke kanan (pl-3), icon lebih kecil w-6 h-6
                    • Garis vertikal tipis di sisi kiri children sebagai konektor
                    ─────────────────────────────────────────
                  */}
                  {isCollapsed && (
                    <div className="relative flex flex-col gap-0.5 mt-0.5">
                      {/* Garis vertikal konektor */}
                      <span className="absolute left-[14px] top-0 bottom-0 w-px bg-[#1297DC]/20" />

                      {item.children.map((child, childIndex) => {
                        const isChildActive =
                          pathname === child.url ||
                          pathname?.startsWith(child.url + "/");
                        const isLast = childIndex === item.children.length - 1;

                        return (
                          <SidebarMenu key={childIndex}>
                            <SidebarMenuItem>
                              <Link
                                href={child.url}
                                title={child.title}
                                className={cn(
                                  "flex items-center rounded-lg transition-all duration-200 group",
                                  // indent ke kanan — inilah efek "maju"
                                  "pl-4 pr-1 py-0.5",
                                  isChildActive ? "bg-[#1297DC]/8" : "hover:bg-gray-50"
                                )}
                              >
                                {/* Garis horizontal konektor pendek */}
                                <span className="w-2 h-px bg-[#1297DC]/25 flex-shrink-0 mr-1" />

                                {/* Icon child — lebih kecil dari parent */}
                                <span
                                  className={cn(
                                    "flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 transition-all duration-200",
                                    isChildActive
                                      ? "bg-[#1297DC]/20"
                                      : "bg-gray-100/80 group-hover:bg-[#1297DC]/10"
                                  )}
                                >
                                  <Icon
                                    icon={child.icon}
                                    className={cn(
                                      "w-3 h-3 text-[#1297DC] transition-all duration-200",
                                      isChildActive
                                        ? "opacity-100"
                                        : "opacity-55 group-hover:opacity-100"
                                    )}
                                  />
                                </span>
                              </Link>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // =========================
            // ITEM BIASA
            // =========================
            const isActive =
              pathname === item.url ||
              pathname?.startsWith(item.url + "/");

            return (
              <SidebarMenu key={index}>
                <SidebarMenuItem>
                  <Link
                    href={item.url}
                    className={cn(
                      "flex items-center rounded-xl transition-all duration-200 group relative",
                      isActive ? "bg-[#1297DC]/10" : "hover:bg-gray-50",
                      isCollapsed
                        ? "justify-start p-1.5"   // rata kiri, sejajar dengan parent
                        : "gap-2.5 pl-2 pr-3 py-1.5"
                    )}
                  >
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#1297DC] rounded-r-full" />
                    )}

                    <span
                      className={cn(
                        "flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-200",
                        isCollapsed ? "w-8 h-8" : "w-7 h-7",
                        isActive
                          ? "bg-[#1297DC]/15"
                          : "bg-gray-100 group-hover:bg-[#1297DC]/10"
                      )}
                    >
                      <Icon icon={item.icon} className="w-4 h-4 text-[#1297DC]" />
                    </span>

                    {!isCollapsed && (
                      <span
                        className={cn(
                          "text-sm font-medium truncate transition-colors duration-200",
                          isActive
                            ? "text-[#1297DC]"
                            : "text-gray-600 group-hover:text-gray-900"
                        )}
                      >
                        {item.title}
                      </span>
                    )}
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            );
          })}
        </SidebarGroup>
      </SidebarContent>

      {/* ===================== FOOTER ===================== */}
      <SidebarFooter className="px-0 py-0">
        <div className="border-t border-gray-100">
          {isCollapsed ? (
            /* Collapsed: hanya tombol logout, terpusat */
            <div className="flex items-center justify-center py-3 px-2">
              <button
                title="Logout"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 transition-colors duration-200 group"
              >
                <Icon
                  icon="solar:logout-3-bold-duotone"
                  className="w-4 h-4 text-[#D00416]/70 group-hover:text-[#D00416] transition-colors duration-200"
                />
              </button>
            </div>
          ) : (
            /* Expanded: avatar + nama + role + logout */
            <div className="flex items-center gap-2.5 px-3 py-3">
              <Avatar className="size-9 flex-shrink-0 ring-2 ring-[#1297DC]/20 ring-offset-1">
                <AvatarImage src={DefaultAvatar.src} alt="User Avatar" />
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                  Nama Admin
                </p>
                <span className="text-[11px] text-gray-400 leading-tight mt-0.5 truncate">
                  Role
                </span>
              </div>
              <button
                title="Logout"
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors duration-200 group"
              >
                <Icon
                  icon="solar:logout-3-bold-duotone"
                  className="w-4 h-4 text-gray-400 group-hover:text-[#D00416] transition-colors duration-200"
                />
              </button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}