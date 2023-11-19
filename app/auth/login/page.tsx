"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { AuthClient } from "@/app/lib/enums";

type Inputs = {
  email: string;
  password: string;
};

export default function Login(): JSX.Element {
  const { register, handleSubmit } = useForm<Inputs>();
  const router = useRouter();

  const onSubmit = async (data: Inputs) => {
    await signIn(AuthClient.CREDENTIALS, {
      email: data.email,
      password: data.password,
      redirect: false,
    })
      .then((res) => {
        console.log("res: ", res);
        if (res?.error) {
          toast.error(res.error);
        } else {
          // redirect to root page where we will decide based on session where to redirect the user
          router.push("/");
        }
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const providerLogin = async (provider: string) => {
    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/auth/login",
      });

      console.log("result: ", result);

      if (!result) {
        toast.error("Something went wrong");
      } else if (result.error) {
        toast.error(result.error);
      } else {
        // Successful authentication
        router.push("/");
      }
    } catch (error) {
      // Handle errors locally without triggering the redirect
      console.error("Authentication error:", error);
      toast.error("Something went wrong");
    }
  };

  const formSchema = z.object({
    email: z.string({
      required_error: "Email is required",
    }),
    password: z.string({
      required_error: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email and password below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-6">
          <Button
            onClick={() => providerLogin(AuthClient.GITHUB)}
            variant="outline"
          >
            <Icons.gitHub className="w-4 h-4 mr-2" />
            Github
          </Button>
          <Button
            onClick={() => providerLogin(AuthClient.GOOGLE)}
            variant="outline"
          >
            <Icons.google className="w-4 h-4 mr-2" />
            Google
          </Button>
        </div>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={() => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="example@example.com"
                      {...register("email")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={() => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="current-password"
                      type="password"
                      {...register("password")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
