"use client";

import { motion, Variants, easeIn, easeOut } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthForm, Field } from "@/components/auth/auth-form";
import { signUpSchema, type SignUpFormData } from "@/lib/schemas/auth-schemas";
import { useAuth } from "@/hooks/use-auth";

const pageVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: 0.5,
      ease: easeIn,
    },
  },
};

export default function SignUpPage() {
  const { signUp, isLoading } = useAuth();
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      await signUp.mutateAsync(data);
    } catch (error: unknown) {
      const errorResponse = error as Error;
      const errorMessage = errorResponse?.message ?? "Unable to create account. Please try again.";

      form.setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <AuthForm
        title="Create your account"
        description="Join us today and get started with your journey"
        form={form}
        onSubmit={handleSignUp}
        alternativeText="Already have an account?"
        alternativeLink="/signin"
        alternativeLinkText="Sign in"
        isLoading={isLoading}
      >
        <Field form={form} name="name" label="Full Name" placeholder="Enter your full name" type="text" index={0} />
        <Field form={form} name="email" label="Email" placeholder="Enter your email address" type="email" index={1} />
        <Field form={form} name="username" label="Username" placeholder="Choose a username" type="text" index={2} />
        <Field form={form} name="password" label="Password" placeholder="Create a password" type="password" index={3} />
        <Field
          form={form}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          type="password"
          index={4}
        />
      </AuthForm>
    </motion.div>
  );
}
