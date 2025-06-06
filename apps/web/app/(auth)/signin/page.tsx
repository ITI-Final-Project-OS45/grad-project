"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthForm, Field } from "@/components/auth/auth-form";
import { signInSchema, type SignInFormData } from "@/lib/schemas/auth-schemas";

const pageVariants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: 0.5,
      ease: "easeIn",
    },
  },
};

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <AuthForm
        title="Welcome back"
        description="Sign in to your account to continue"
        form={form}
        onSubmit={handleSignIn}
        alternativeText="Don't have an account?"
        alternativeLink="/signup"
        alternativeLinkText="Sign up"
        isLoading={isLoading}
      >
        <Field
          form={form}
          name="emailOrUsername"
          label="Email or Username"
          placeholder="Enter your email or username"
          type="text"
          index={0}
        />
        <Field
          form={form}
          name="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          index={1}
        />
      </AuthForm>
    </motion.div>
  );
}
