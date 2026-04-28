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
    "analitik-dan-laporan":
      pathname?.startsWith("/analitik-dan-laporan") ?? false,
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
      icon: "solar:chart-2-bold-duotone",
      key: "analitik-dan-laporan",
      url: "/analitik-dan-laporan",
      children: [
        {
          title: "Platform Profitability",
          icon: "solar:dollar-minimalistic-bold-duotone",
          url: "/analitik-dan-laporan/profitability-analytics",
        },
        {
          title: "Revenue Management",
          icon: "solar:dollar-minimalistic-bold-duotone",
          url: "/analitik-dan-laporan/revenue-management",
        },
        {
          title: "Expense & Payable",
          icon: "solar:bill-list-bold-duotone",
          url: "/analitik-dan-laporan/expense-payable",
        },
        {
          title: "Creator Payout Control",
          icon: "solar:users-group-two-rounded-bold-duotone",
          url: "/analitik-dan-laporan/creator-payout-control",
        },
      ],
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
      title: "Kelola Gift Card",
      icon: "solar:tag-bold-duotone",
      url: "/kelola-gift-card",
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
      title: "Pengaturan umum",
      icon: "solar:book-bookmark-bold-duotone",
      key: "pengaturan-umum",
      url: "/pengaturan-umum",
      children: [
        {
          title: "Role Management",
          icon: "solar:user-hands-bold-duotone",
          url: "/pengaturan-umum/role-management",
        },
        {
          title: "Financial Settings",
          icon: "solar:play-circle-bold-duotone",
          url: "/pengaturan-umum/financial-settings",
        },
        {
          title: "Content Policy",
          icon: "solar:tag-bold-duotone",
          url: "/pengaturan-umum/content-policy",
        },
        {
          title: "Security & Access",
          icon: "solar:tag-bold-duotone",
          url: "/pengaturan-umum/security-access",
        },
        {
          title: "Audit Logs",
          icon: "solar:tag-bold-duotone",
          url: "/pengaturan-umum/audit-logs",
        },
        {
          title: "System Configuration",
          icon: "solar:tag-bold-duotone",
          url: "/pengaturan-umum/system-configuration",
        },
      ],
    },
  ];

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-gray-100 shadow-[1px_0_8px_0_rgba(0,0,0,0.04)] data-[state=collapsed]:w-[64px] md:data-[state=expanded]:w-64"
    >
      {/* ===================== HEADER ===================== */}
      <SidebarHeader className="px-0 py-0">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1 border-b border-gray-100 py-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white">
              <Image
                src={LogoGateplus}
                alt="Logo Gateplus"
                className="h-full w-full object-contain"
              />
            </div>
            <SidebarTrigger className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors duration-150 hover:bg-[#1297DC]/10 hover:text-[#1297DC]" />
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex flex-1 items-center">
              <div
                className="overflow-hidden rounded-lg"
                style={{ background: "transparent" }}
              >
                <Image
                  src={LogoGateplus}
                  alt="Logo Gateplus"
                  className="h-8 w-auto object-contain"
                  style={{ mixBlendMode: "multiply" }}
                />
              </div>
            </div>
            <SidebarTrigger className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors duration-150 hover:bg-[#1297DC]/10 hover:text-[#1297DC]" />
          </div>
        )}
      </SidebarHeader>

      {/* ===================== CONTENT ===================== */}
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup
          className={cn(
            "mt-3 flex flex-col gap-0.5",
            isCollapsed ? "px-2" : "px-3",
          )}
        >
          {!isCollapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase select-none">
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
                          "group relative flex w-full items-center rounded-xl transition-all duration-200",
                          isActive ? "bg-[#1297DC]/10" : "hover:bg-gray-50",
                          isCollapsed
                            ? "justify-start p-1.5"
                            : "justify-between py-1.5 pr-1 pl-2",
                        )}
                      >
                        {isActive && !isCollapsed && (
                          <span className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#1297DC]" />
                        )}

                        <Link
                          href={item.url}
                          className="flex min-w-0 flex-1 items-center gap-2.5"
                        >
                          <span
                            className={cn(
                              "flex flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                              isCollapsed ? "h-8 w-8" : "h-7 w-7",
                              isActive
                                ? "bg-[#1297DC]/15"
                                : "bg-gray-100 group-hover:bg-[#1297DC]/10",
                            )}
                          >
                            <Icon
                              icon={item.icon}
                              className="h-4 w-4 text-[#1297DC]"
                            />
                          </span>

                          {!isCollapsed && (
                            <span
                              className={cn(
                                "truncate text-sm font-medium transition-colors duration-200",
                                isActive
                                  ? "text-[#1297DC]"
                                  : "text-gray-600 group-hover:text-gray-900",
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
                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-colors duration-150 hover:bg-[#1297DC]/15"
                          >
                            <Icon
                              icon={
                                isOpen
                                  ? "solar:alt-arrow-up-bold"
                                  : "solar:alt-arrow-down-bold"
                              }
                              className={cn(
                                "h-3.5 w-3.5 transition-all duration-200",
                                isActive ? "text-[#1297DC]" : "text-gray-400",
                              )}
                            />
                          </button>
                        )}
                      </div>
                    </SidebarMenuItem>
                  </SidebarMenu>

                  {/* Children - Expanded */}
                  {!isCollapsed && isOpen && (
                    <div className="relative mt-0.5 mb-1 ml-5 flex flex-col gap-0.5">
                      <span className="absolute top-1 bottom-1 left-[11px] w-px bg-gray-200" />
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
                                  "group relative flex items-center gap-2 rounded-lg px-2 py-1.5 pl-7 text-sm transition-all duration-200",
                                  isChildActive
                                    ? "bg-[#1297DC]/8 font-medium text-[#1297DC]"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
                                )}
                              >
                                <span
                                  className={cn(
                                    "absolute top-1/2 left-[9px] h-[7px] w-[7px] -translate-y-1/2 rounded-full border-2 transition-all duration-200",
                                    isChildActive
                                      ? "border-[#1297DC] bg-[#1297DC]"
                                      : "border-gray-300 bg-white group-hover:border-[#1297DC]/60",
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

                  {/* Children - Collapsed */}
                  {isCollapsed && (
                    <div className="relative mt-0.5 flex flex-col gap-0.5">
                      <span className="absolute top-0 bottom-0 left-[14px] w-px bg-[#1297DC]/20" />
                      {item.children.map((child, childIndex) => {
                        const isChildActive =
                          pathname === child.url ||
                          pathname?.startsWith(child.url + "/");

                        return (
                          <SidebarMenu key={childIndex}>
                            <SidebarMenuItem>
                              <Link
                                href={child.url}
                                title={child.title}
                                className={cn(
                                  "group flex items-center rounded-lg transition-all duration-200",
                                  "py-0.5 pr-1 pl-4",
                                  isChildActive
                                    ? "bg-[#1297DC]/8"
                                    : "hover:bg-gray-50",
                                )}
                              >
                                <span className="mr-1 h-px w-2 flex-shrink-0 bg-[#1297DC]/25" />
                                <span
                                  className={cn(
                                    "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-all duration-200",
                                    isChildActive
                                      ? "bg-[#1297DC]/20"
                                      : "bg-gray-100/80 group-hover:bg-[#1297DC]/10",
                                  )}
                                >
                                  <Icon
                                    icon={child.icon}
                                    className={cn(
                                      "h-3 w-3 text-[#1297DC] transition-all duration-200",
                                      isChildActive
                                        ? "opacity-100"
                                        : "opacity-55 group-hover:opacity-100",
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
              pathname === item.url || pathname?.startsWith(item.url + "/");

            return (
              <SidebarMenu key={index}>
                <SidebarMenuItem>
                  <Link
                    href={item.url}
                    className={cn(
                      "group relative flex items-center rounded-xl transition-all duration-200",
                      isActive ? "bg-[#1297DC]/10" : "hover:bg-gray-50",
                      isCollapsed
                        ? "justify-start p-1.5"
                        : "gap-2.5 py-1.5 pr-3 pl-2",
                    )}
                  >
                    {isActive && !isCollapsed && (
                      <span className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#1297DC]" />
                    )}

                    <span
                      className={cn(
                        "flex flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                        isCollapsed ? "h-8 w-8" : "h-7 w-7",
                        isActive
                          ? "bg-[#1297DC]/15"
                          : "bg-gray-100 group-hover:bg-[#1297DC]/10",
                      )}
                    >
                      <Icon
                        icon={item.icon}
                        className="h-4 w-4 text-[#1297DC]"
                      />
                    </span>

                    {!isCollapsed && (
                      <span
                        className={cn(
                          "truncate text-sm font-medium transition-colors duration-200",
                          isActive
                            ? "text-[#1297DC]"
                            : "text-gray-600 group-hover:text-gray-900",
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
            <div className="flex items-center justify-center px-2 py-3">
              <button
                title="Logout"
                className="group flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 transition-colors duration-200 hover:bg-red-100"
              >
                <Icon
                  icon="solar:logout-3-bold-duotone"
                  className="h-4 w-4 text-[#D00416]/70 transition-colors duration-200 group-hover:text-[#D00416]"
                />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3 py-3">
              <Avatar className="size-9 flex-shrink-0 ring-2 ring-[#1297DC]/20 ring-offset-1">
                <AvatarImage src={DefaultAvatar.src} alt="User Avatar" />
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-sm leading-tight font-semibold text-gray-800">
                  Nama Admin
                </p>
                <span className="mt-0.5 truncate text-[11px] leading-tight text-gray-400">
                  Role
                </span>
              </div>
              <button
                title="Logout"
                className="group flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-red-50"
              >
                <Icon
                  icon="solar:logout-3-bold-duotone"
                  className="h-4 w-4 text-gray-400 transition-colors duration-200 group-hover:text-[#D00416]"
                />
              </button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
