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
import myAxios from "@/lib/axios";
import nProgress from "nprogress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BlurFade } from "../ui/blurFade";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(50),
    name: z.string().min(3).max(50),
  });

  const navigate = useNavigate();

  // formschema for confirm password
  // const formSchema = z.object({
  //   email: z.string().email(),
  //   password: z.string().min(8).max(50),
  //   confirmPassword: z.string(),
  //   name: z.string().min(3).max(50),
  // }).refine((data) => data.password === data.confirmPassword, {
  //   message: "Passwords don't match",
  //   path: ["confirmPassword"],
  // });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      // confirmPassword: "",
      name: "",
    },
  });

  const registerUser = async (values: z.infer<typeof formSchema>) => {
    try {
      nProgress.start();
      const response: any = await myAxios.post(
        `http://localhost:8000/auth/register`,
        {
          name: values.name,
          password: values.password,
          email: values.email,
        }
      );

      toast("Success", {
        description: "User successfully registered",
      });

      listUsers();

      if (response.data.success) {
        setTimeout(() => {
          toast("Verification Link Sent", {
            description: response.data.message,
          });
        }, 1500);

        setTimeout(() => {
          navigate("/");
        }, 6000);
      } else {
        setTimeout(() => {
          toast("Failed", {
            description: response.data.message,
          });
        }, 1500);
      }

      return response.data;
    } catch (error: any) {
       const status = error.response?.status;
        status == 400
        ? toast("Error", {
            description: error.response?.data.detail,
            action: {
              label: "Login",
              onClick: () => navigate("/login"),
            },
          })
        : toast("Error", {
            description: error.response?.data.detail,
          });

    } finally {
      nProgress.done();
    }
  };

  const listUsers = async () => {
    try {
      nProgress.start();
      const response = await myAxios.get(`http://localhost:8000/auth/users`);
      console.log(response.data);
      // alert("fetched")
      return response.data;
    } catch (error: any) {
      alert(error.response.data.detail);
    } finally {
      nProgress.done();
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(registerUser)}>
            <div className="grid gap-6">
              <BlurFade delay={0.1}>
                <div className="grid gap-4">
                  <div className="grid gap-1">
                    <Label className="text-start" htmlFor="name">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      autoFocus
                      placeholder="Alex Stevens"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-sm text-start">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-start" htmlFor="email">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="alexstevens@gmail.com"
                      required
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm text-start">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1">
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
                  {/* Confirm Password - Functionality */}
                  {/* <div className="grid gap-1">
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
                </div> */}
                  <Button type="submit" className="w-full">
                    Register
                  </Button>
                </div>
              </BlurFade>

              <BlurFade delay={0.2}>
                {/* Continue with Google & Github - Functionality */}
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </BlurFade>
              <BlurFade delay={0.3}>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.26.793-.577v-2.022c-3.338.725-4.043-1.613-4.043-1.613-.546-1.387-1.333-1.755-1.333-1.755-1.09-.745.084-.729.084-.729 1.204.084 1.837 1.236 1.837 1.236 1.07 1.832 2.807 1.303 3.492.997.108-.775.42-1.303.762-1.602-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.382 1.236-3.222-.123-.303-.534-1.522.117-3.176 0 0 1.008-.324 3.3 1.23a11.52 11.52 0 013.006-.403c1.02.005 2.047.138 3.006.403 2.29-1.554 3.297-1.23 3.297-1.23.653 1.654.243 2.873.12 3.176.77.84 1.236 1.912 1.236 3.222 0 4.61-2.807 5.626-5.479 5.922.429.37.81 1.096.81 2.21v3.285c0 .32.192.695.8.576C20.565 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Github
                  </Button>
                </div>
              </BlurFade>

              <BlurFade delay={0.3}>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login">
                    <span className="underline underline-offset-4">
                      Sign in
                    </span>
                  </Link>
                </div>
              </BlurFade>
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