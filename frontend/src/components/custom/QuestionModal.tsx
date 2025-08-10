import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, type Dispatch, type SetStateAction } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

// shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // ⬅️ add trigger
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
import { EVALUATION_LEVELS, EVALUATION_STEPS } from "@/constants";
import { AxiosError } from "axios";

// ---- Zod schema ---
const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  imageUrl: z.string().optional(),
  step: z.string().min(1, "Step is required"),
  level: z.string().min(1, "Level is required"),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionDialogFormProps {
  mode: "create" | "update";
  defaultValues?: Partial<QuestionFormData>;
  id?: string; // Optional ID for update mode
  setRefetch: Dispatch<SetStateAction<boolean>>;

  // NEW optional prop (non-breaking) to customize the trigger
  trigger?: React.ReactNode;
}

export function QuestionDialogForm({
  mode,
  defaultValues,
  id,
  setRefetch,
  trigger,
}: QuestionDialogFormProps) {
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: defaultValues?.question ?? "",
      imageUrl: defaultValues?.imageUrl ?? "",
      step: defaultValues?.step ?? "",
      level: defaultValues?.level ?? "",
    },
  });
  const [open, onOpenChange] = useState(false);

  const onSubmit = async (values: QuestionFormData) => {
    try {
      if (mode === "create") await axiosInstance.post("/questions", values);
      else await axiosInstance.patch(`/questions/${id}`, values);

      setRefetch((prev) => !prev);
      form.reset();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof AxiosError)
        toast.error(err.response?.data?.message || "An error occurred");
      else toast.error(`Failed to ${mode} question`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ⬇️ Encapsulated trigger follows ShadCN pattern */}
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant={mode === "create" ? "default" : "secondary"}
            key={id}
            onClick={() => {
              console.log(defaultValues);
            }}
          >
            {mode === "create" ? "New" : "Edit"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Question" : "Update Question"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* QUESTION */}
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the question..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* IMAGE URL */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* STEP */}
              <FormField
                control={form.control}
                name="step"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Step</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select step" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVALUATION_STEPS.map((step) => (
                            <SelectItem key={step} value={step}>
                              {step}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LEVEL */}
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVALUATION_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
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

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
