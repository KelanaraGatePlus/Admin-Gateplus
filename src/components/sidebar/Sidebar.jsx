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
    useSidebar, // <-- ini penting
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils";
import React from "react";
import LogoGateplus from "@@/images/logo_gateplus.jpg"
import DefaultAvatar from "@@/images/default_avatar.webp"
import Icon from '@/lib/IconClient';
import Image from "next/image"
import { Avatar, AvatarImage } from "../ui/avatar";
import Link from "next/link";

export function AppSidebar() {
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    const items = [
        {
            title: "Dashboard",
            icon: 'solar:widget-4-bold-duotone',
            url: "/"
        },
        {
            title: "Manajemen Konten",
            icon: 'solar:chart-square-bold-duotone',
            url: "/manajemen-konten"
        },
        {
            title: "Analitik dan Laporan",
            icon: 'solar:chart-square-bold-duotone',
            url: "/analitik-dan-laporan"
        },
        {
            title: "Kelola Voucher",
            icon: 'solar:ticket-sale-bold',
            url: "/analitik-laporan-keuangan"
        },
        {
            title: "Kelola Banner",
            icon: 'solar:gallery-wide-bold-duotone',
            url: "/kelola-banner"
        },
        {
            title: "Kelola Artikel FAQ",
            icon: 'solar:question-square-broken',
            url: "/faq-article"
        },
        {
            title: "Pengaturan Konten",
            icon: 'solar:folder-favourite-bookmark-bold-duotone',
            url: "/pengaturan-konten"
        },
        {
            title: "Kelola Kreator",
            icon: 'solar:user-hands-bold-duotone',
            url: "/kelola-kreator"
        },
        {
            title: "Manajemen Layanan",
            icon: 'solar:users-group-two-rounded-bold-duotone',
            url: "/pengaturan-akun"
        },
        {
            title: "Pengaturan",
            icon: 'solar:settings-bold-duotone',
            url: "/pengaturan"
        }
    ];

    return (
        <Sidebar
            collapsible="icon"
            className="data-[state=collapsed]:w-16 md:data-[state=expanded]:w-64"
        >
            <SidebarHeader className={cn(`grid ${isCollapsed ? "grid-cols-1" : "grid-cols-3"} items-center justify-center`)}>
                <div></div>

                {/* Hanya tampilkan logo jika tidak collapsed */}
                <div className="flex justify-center items-center font-bold">
                    <Image src={LogoGateplus} alt="Logo Gateplus" />
                </div>

                <SidebarTrigger className="self-end" />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className={'flex flex-col mt-6 gap-3'}>
                    {items.map((item, index) => (
                        <SidebarMenu key={index}>
                            <SidebarMenuItem asChild>
                                <Link href={item.url} className={`flex items-center ${isCollapsed ? "justify-center" : "justify-start" } gap-2 opacity-50 hover:opacity-100 rounded-md`}>
                                    {<Icon icon={item.icon} className={cn(`${isCollapsed ? 'w-7 h-7 flex self-center h-auto' : 'h-5 w-5'} text-[#1297DC]`)} />}
                                    {!isCollapsed && <span className="text-sidebar-accent-foreground">{item.title}</span>}
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    ))}
                </SidebarGroup>
            </SidebarContent>


            <SidebarFooter>
                <div className="w-full flex justify-between items-center">
                    <div className="w-full flex gap-1">
                        <Avatar className={'size-12'}>
                            <AvatarImage src={DefaultAvatar.src} alt="User Avatar" />
                        </Avatar>
                        <div className="flex flex-col text-black">
                            <p className="font-bold">Nama Admin</p>
                            <div className="flex text-xs w-max items-center px-8 justify-center bg-[#C6C6C6] rounded-full">
                                <p>Role</p>
                            </div>
                        </div>
                    </div>
                    <button>
                        <Icon icon={'solar:logout-3-bold-duotone'} className="w-6 h-6 text-[#D00416]" />
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
