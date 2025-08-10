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
import { Link } from "react-router";
import { useLocation } from "react-router";
import { Outlet } from "react-router";

export default function DashboardLayout() {
  const location = useLocation();
  const slug = location.pathname.split("/").pop();

  const lsUser = localStorage.getItem("user");
  const user = lsUser ? JSON.parse(lsUser) : null;
  if (!user) window.location.href = "/";

  const StyledLink = ({ to, target }: { to: string; target: string }) => (
    <Link to={to}>
      <Button
        variant={slug === target ? "outline" : "ghost"}
        className="justify-baseline w-full capitalize"
      >
        {target}
      </Button>
    </Link>
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="font-semibold text-xl text-center">✅ Test_School</h2>
        </SidebarHeader>
        <SidebarContent className="p-3">
          {["ADMIN"].includes(user.role) && (
            <StyledLink to="/dashboard" target="dashboard" />
          )}
          {["ADMIN"].includes(user.role) && (
            <StyledLink to="/dashboard/questions" target="questions" />
          )}
          {["ADMIN"].includes(user.role) && (
            <StyledLink to="/dashboard/users" target="users" />
          )}
          {["STUDENT"].includes(user.role) && (
            <StyledLink to="/dashboard/evaluate" target="evaluate" />
          )}
          {["ADMIN", "SUPERVISOR"].includes(user.role) && (
            <StyledLink to="/dashboard/submissions" target="submissions" />
          )}
        </SidebarContent>
        <SidebarFooter>
          <ProfileMenu />
        </SidebarFooter>
      </Sidebar>
      <main className="w-full">
        <SidebarTrigger />
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
