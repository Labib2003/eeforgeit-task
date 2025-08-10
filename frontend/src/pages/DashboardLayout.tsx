import { ProfileMenu } from "@/components/custom/ProfileMenu";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import { Outlet } from "react-router";
import {
  Home,
  HelpCircle,
  FileQuestion,
  Users,
  PlayCircle,
  ClipboardList,
} from "lucide-react";
import clsx from "clsx";

export default function DashboardLayout() {
  const location = useLocation();
  const slug = location.pathname.split("/").pop();

  const lsUser = localStorage.getItem("user");
  const user = lsUser ? JSON.parse(lsUser) : null;
  if (!user) window.location.href = "/";

  const Item = ({
    to,
    target,
    icon: Icon,
    label,
  }: {
    to: string;
    target: string;
    icon: any;
    label: string;
  }) => {
    const active = slug === target;
    return (
      <Link to={to} className="block">
        <Button
          variant={active ? "outline" : "ghost"}
          className={clsx(
            "w-full justify-start gap-2",
            "transition-colors",
            active
              ? "border-primary/30 bg-primary/5"
              : "hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="capitalize">{label}</span>
          {active && (
            <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </Link>
    );
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r bg-gradient-to-b from-muted/40 to-background">
        <SidebarHeader className="px-3 pt-4">
          <div className="rounded-xl bg-gradient-to-r from-primary/15 via-yellow-30/10 to-teal-500/15 p-3 text-center">
            <h2 className="font-semibold text-lg">✅ Test_School</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {user?.role ?? "User"} Dashboard
            </p>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-3 space-y-2">
          {["ADMIN"].includes(user.role) && (
            <Item
              to="/dashboard"
              target="dashboard"
              icon={Home}
              label="dashboard"
            />
          )}
          {["ADMIN"].includes(user.role) && (
            <Item
              to="/dashboard/questions"
              target="questions"
              icon={FileQuestion}
              label="questions"
            />
          )}
          {["ADMIN"].includes(user.role) && (
            <Item
              to="/dashboard/users"
              target="users"
              icon={Users}
              label="users"
            />
          )}
          {["STUDENT"].includes(user.role) && (
            <Item
              to="/dashboard/evaluate"
              target="evaluate"
              icon={PlayCircle}
              label="evaluate"
            />
          )}
          {["ADMIN", "SUPERVISOR"].includes(user.role) && (
            <Item
              to="/dashboard/submissions"
              target="submissions"
              icon={ClipboardList}
              label="submissions"
            />
          )}

          <div className="pt-2">
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-start gap-2">
                <HelpCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-xs font-medium">Tip</p>
                  <p className="text-xs text-muted-foreground">
                    Use the filters at the top of each page to narrow results.
                    Click a row’s actions to edit, delete, or evaluate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SidebarContent>

        <SidebarFooter className="border-t p-3">
          <ProfileMenu />
        </SidebarFooter>
      </Sidebar>

      <main className="w-full">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/80 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">
            {location.pathname}
          </span>
        </div>

        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
