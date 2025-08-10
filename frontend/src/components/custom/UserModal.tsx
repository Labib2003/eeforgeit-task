import * as React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ROLE_OPTIONS } from "@/constants";

type UserBody = {
  name?: string;
  email: string;
  role: string;
  active?: boolean;
};

const userSchema = z.object({
  name: z.string().optional(),
  email: z.email("Invalid email"),
  role: z.string().min(1, "Role is required"),
  active: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserDialogFormProps {
  mode: "create" | "update";
  setRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  id?: string;
  defaultValues?: Partial<UserFormData>;
  trigger?: React.ReactNode;
}

export function UserDialogForm({
  mode,
  setRefetch,
  id,
  defaultValues,
  trigger,
}: UserDialogFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      role: defaultValues?.role ?? "",
      active: defaultValues?.active ?? true,
    },
  });

  // reset values every time dialog opens to keep rows isolated
  useEffect(() => {
    if (open) {
      form.reset({
        name: defaultValues?.name ?? "",
        email: defaultValues?.email ?? "",
        role: defaultValues?.role ?? "",
        active: defaultValues?.active ?? true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    defaultValues?.name,
    defaultValues?.email,
    defaultValues?.role,
    defaultValues?.active,
  ]);

  const onSubmit = async (values: UserFormData) => {
    try {
      if (mode === "create") {
        const body: UserBody = {
          name: values.name,
          email: values.email,
          role: values.role,
        };
        await axiosInstance.post("/users", { ...body });
        toast.success("User created");
      } else {
        if (!id) return toast.error("Missing user id");
        const body: Partial<UserBody> = {
          name: values.name,
          email: values.email,
          role: values.role,
          active: values.active,
        };
        await axiosInstance.patch(`/users/${id}`, { ...body });
        toast.success("User updated");
      }
      setRefetch((p) => !p);
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? `Failed to ${mode} user`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant={mode === "create" ? "default" : "secondary"}
            size="sm"
          >
            {mode === "create" ? "New User" : "Edit"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create User" : "Update User"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="jane@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mode === "update" && (
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={String(field.value ?? true)}
                        onValueChange={(v) => field.onChange(v === "true")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Save" : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
