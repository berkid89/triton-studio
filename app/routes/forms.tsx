import type { Route } from "./+types/forms";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  age: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 18;
  }, "Must be at least 18 years old"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Forms - TailAdmin" },
    { name: "description", content: "Form Examples" },
  ];
}

export default function Forms() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: "18",
    },
  });

  const onSubmit = async (data: FormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form data:", data);
    alert("Form submitted successfully!");
    reset();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Forms
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Example form with validation using React Hook Form and Zod.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  {...register("age")}
                  placeholder="25"
                />
                {errors.age && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

