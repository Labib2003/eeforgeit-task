import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Schema ---
const configSchema = z.object({
  examLengthInMinutes: z
    .number()
    .int("Must be an integer")
    .positive("Must be positive"),
});

type ConfigFormData = z.infer<typeof configSchema>;

export default function ConfigPage() {
  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: { examLengthInMinutes: 0 },
  });

  // Fetch config on mount
  const fetchConfig = async () => {
    try {
      const res = await axiosInstance.get("/config");
      const data = res?.data?.data;
      if (data?.examLengthInMinutes !== undefined) {
        form.reset({ examLengthInMinutes: data.examLengthInMinutes });
      }
    } catch {
      toast.error("Failed to load config");
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const onSubmit = async (values: ConfigFormData) => {
    try {
      await axiosInstance.patch("/config", values);
      toast.success("Config updated successfully");
    } catch {
      toast.error("Failed to update config");
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Exam Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="examLengthInMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Length (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : "",
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={fetchConfig}>
                  Reset
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
