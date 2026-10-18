import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LogOut, Settings, Upload } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { ImportCsvDialog } from "@/components/app/ImportCsvDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_workspace")({ component: Workspace });

function Workspace() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur">
            <SidebarTrigger />
            <div className="mx-1 h-4 w-px bg-border" />
            <span className="truncate text-sm text-muted-foreground">My first project</span>
            <div className="ml-auto flex items-center gap-2">
              <ImportCsvDialog><Button variant="outline" size="sm"><Upload /> <span className="hidden sm:inline">Import CSV</span></Button></ImportCsvDialog>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-7 w-7"><AvatarFallback className="bg-accent text-xs text-accent-foreground">AC</AvatarFallback></Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">Not signed in</p>
                    <p className="text-xs text-muted-foreground">Sign-in not connected yet</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/settings"><Settings /> Settings</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/login"><LogOut /> Log out</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
