"use client"

import * as React from "react"
import {
    Building2,
    FileText,
    HelpCircle,
    Home,
    User,
    LogOut,
    CreditCard,
    Settings,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

// Tipos para el menú
type MenuItem = {
    title: string
    url: string
    icon: React.ElementType
    isExternal?: boolean
}

const mainNavItems: MenuItem[] = [
    {
        title: "Inicio",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Mis Solicitudes",
        url: "/dashboard/requests",
        icon: FileText,
    },
    {
        title: "Mi Empresa",
        url: "/dashboard/company",
        icon: Building2,
    },
]

const userNavItems: MenuItem[] = [
    {
        title: "Perfil",
        url: "/dashboard/profile",
        icon: User,
    },
    {
        title: "Ayuda y Soporte",
        url: "https://wa.me/573000000000", // Placeholder WhatsApp
        icon: HelpCircle,
        isExternal: true,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-primary text-sidebar-primary-foreground">
                                    <CreditCard className="size-4 text-white" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-brand-primary">Wy Crédito</span>
                                    <span className="truncate text-xs text-slate-500">Torre de Control</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Grupo Principal */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navegación</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Grupo Usuario */}
                <SidebarGroup>
                    <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {userNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a
                                            href={item.url}
                                            target={item.isExternal ? "_blank" : undefined}
                                            rel={item.isExternal ? "noopener noreferrer" : undefined}
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            variant="outline"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => console.log("Logout triggered")} // TODO: Implement logout
                        >
                            <LogOut />
                            <span>Cerrar Sesión</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
