import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { LogOut, Pencil, Save, X, User as UserIcon } from "lucide-react";

export function ProfileMenu() {
  const token = localStorage.getItem("access_token");
  const decoded: Record<string, string> = jwtDecode(token!);
  const lsUser = localStorage.getItem("user");
  const user = lsUser ? JSON.parse(lsUser) : {};

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [saving, setSaving] = useState(false);

  const initials =
    (name || user.name || decoded?.name || "")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const handleSave = async () => {
    const trimmed = (name || "").trim();
    if (!trimmed) return toast.error("Name cannot be empty");

    try {
      setSaving(true);
      // keep your existing API shape
      await axiosInstance.patch(`/users/${decoded.id}`, { name: trimmed });
      localStorage.setItem("user", JSON.stringify({ ...user, name: trimmed }));
      setName(trimmed);
      setEditMode(false);
      toast.success("Name updated successfully");
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setName(user.name || decoded.name || "");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            My Profile
          </span>
          <Badge variant="secondary" className="rounded">
            {decoded.role}
          </Badge>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72" align="start">
        {/* Header card */}
        <div className="flex items-center gap-3 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <DropdownMenuLabel className="p-0">
              {name || "N/A"}
            </DropdownMenuLabel>
            <p className="truncate text-xs text-muted-foreground">
              {user.email || decoded.email || "no-email@example.com"}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Inline editing */}
        {editMode ? (
          <div className="p-3 space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Display Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              This name will be visible to examiners and on certificates.
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <Button
              onClick={() => setEditMode(true)}
              className="w-full"
              variant="secondary"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Update Name
            </Button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Keep your display name up to date so evaluators can identify you
              correctly.
            </p>
          </div>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            window.location.reload();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
