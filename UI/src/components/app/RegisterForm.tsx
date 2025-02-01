import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import { FormEvent, useState } from "react";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import nProgress from "nprogress";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(50),
    confirmPassword: z.string(),
    name: z.string().min(3).max(50),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  const registerUser = async (values: z.infer<typeof formSchema>) => {
    try {
      nProgress.start()
      const response = await axios.post(`http://localhost:8000/auth/register`, {
        name: values.name,
        password: values.password,
        email: values.email
      });
      alert("Successfully registered user");
      listUsers();
      return response.data;
    } catch (error: any) {
      alert(JSON.stringify(error.response.data.detail));
    } finally {
      nProgress.done()
    }
  };

  const listUsers = async () => {
    try {
      nProgress.start()
      const response = await axios.get(`http://localhost:8000/auth/users`);
      console.log(response.data);
      alert("fetched");
      return response.data;
    } catch (error: any) {
      alert(error.response.data.detail);
    } finally {
      nProgress.done()
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(registerUser)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label className="text-start" htmlFor="name">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Alex Stevens"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm text-start">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label className="text-start" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="r@example.com"
                    required
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm text-start">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label className="text-start" htmlFor="password">
                    Password
                  </Label>
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <PasswordInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="••••••••••"
                      />
                    )}
                  />
                  {form.formState.errors.password && (
                    <p className="text-red-500 text-sm text-start">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label className="text-start" htmlFor="confirmPassword">
                    Confirm Password
                  </Label>
                  <Controller
                    name="confirmPassword"
                    control={form.control}
                    render={({ field }) => (
                      <PasswordInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="••••••••••"
                      />
                    )}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm text-start">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login">
                  <span className="underline underline-offset-4">Sign in</span>
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

export default RegisterForm;