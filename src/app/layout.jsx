/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
"use client";
import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import "./globals.css";
import { AppSidebar } from "@/components/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppNavbar from "@/components/navbar/appNavbar";
import { Provider } from "react-redux";
import store from "@/hooks/store/store";
import { routeWithoutSidebar } from "@/const/routeWithoutSidebar";
import { AuthProvider } from "@/context/AuthContext";
import { routeWithoutNavbar } from "@/const/routeWithoutNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#DEDEDE]`}
      >
        <Provider store={store}>
          <AuthProvider>
            <SidebarProvider>
              {typeof window !== "undefined" && routeWithoutSidebar.includes(window.location.pathname) ? null : <AppSidebar />}
              <div className="p-4 w-full" asChild>
                {typeof window !== "undefined" && routeWithoutNavbar.includes(window.location.pathname) ? null : <AppNavbar />}
                <div className="mt-4 p-1">
                  {children}
                </div>
              </div>

            </SidebarProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}