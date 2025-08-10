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

export function ProfileMenu() {
  const token = localStorage.getItem("access_token");
  const decoded: Record<string, string> = jwtDecode(token!);
  const lsUser = localStorage.getItem("user");
  const user = lsUser ? JSON.parse(lsUser) : {};

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user.name);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    try {
      await axiosInstance.patch(`/users/${decoded.id}`, {
        name,
      });
      toast.success("Name updated successfully");
      localStorage.setItem("user", JSON.stringify({ ...user, name }));
      setEditMode(false);
    } catch {
      toast.error("Failed to update name");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">My Profile</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>
          {decoded.role} Account of {name || "N/A"}
        </DropdownMenuLabel>

        {/* Inline Name Editing */}
        {editMode ? (
          <div className="p-2 space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="w-full">
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setName(decoded.name || "");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setEditMode(true)} className="w-full">
            Update Name
          </Button>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            window.location.reload();
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
