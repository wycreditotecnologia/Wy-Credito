"use client"

import * as React from "react"
import {
    Building2,
    FileText,
    Users,
    Settings,
    LayoutDashboard,
    ShieldCheck,
    Search,
    Bell,
    LogOut,
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
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type MenuItem = {
    title: string
    url: string
    icon: React.ElementType
}

const mainNavItems: MenuItem[] = [
    { title: "Bandeja de Entrada", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Base de Clientes", url: "/admin/customers", icon: Users },
    //   { title: "Reportes (Fase 2)", url: "/admin/reports", icon: BarChart3 },
]

const settingsNavItems: MenuItem[] = [
    { title: "Configuración", url: "/admin/settings", icon: Settings },
    { title: "Usuarios Admin", url: "/admin/users", icon: ShieldCheck },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-slate-200 dark:border-slate-800">
            <SidebarHeader className="h-16 border-b border-sidebar-border bg-sidebar px-4 flex flex-row items-center gap-2">
                {/* Logo simplificado para admin */}
                <div className="flex bg-slate-900 aspect-square size-8 items-center justify-center rounded-lg text-white">
                    <ShieldCheck className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-slate-900 dark:text-white">Wy Backoffice</span>
                    <span className="truncate text-xs text-slate-500">Panel de Riesgos</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Búsqueda Global (Opcional) */}
                {/* <div className="p-4 group-data-[collapsible=icon]:hidden">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar empresa o NIT..." className="pl-8 bg-slate-50 dark:bg-slate-900/50" />
            </div>
         </div> */}

                <SidebarGroup>
                    <SidebarGroupLabel>Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={false}>
                                        <a href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Sistema</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {settingsNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url}>
                                            <item.icon className="h-4 w-4" />
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
                            onClick={() => console.log("Admin Logout")} // TODO: Logout
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
