"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import {
  buttonVariants,
  cardVariants,
  fieldVariants,
  headerVariants,
  linkVariants,
} from "@/constants/variants/auth.variants";

interface AuthFormProps<T extends FieldValues> {
  title: string;
  description: string;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  alternativeText: string;
  alternativeLink: string;
  alternativeLinkText: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

const getSubmitButtonText = (isLoading: boolean, isSubmitting: boolean): string => {
  if (isLoading) return "Please wait...";
  if (isSubmitting) return "Submitting...";
  return "Submit";
};

export function AuthForm<T extends FieldValues>({
  title,
  description,
  form,
  onSubmit,
  alternativeText,
  alternativeLink,
  alternativeLinkText,
  isLoading = false,
  children,
}: AuthFormProps<T>) {
  const rootError = form.formState.errors.root;

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="backdrop-blur-sm bg-card/95 border-border/50 shadow">
        <CardHeader className="space-y-1 text-center pb-4">
          <motion.div variants={headerVariants}>
            <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="text-muted-foreground">{description}</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              {/* Display root error at the top of the form */}
              <AnimatePresence mode="wait">
                {rootError && (
                  <motion.div
                    key={`root-error-${rootError.message}`}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 rounded-md bg-destructive/15 border border-destructive text-destructive text-sm font-medium"
                  >
                    {rootError.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">{children}</div>

              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium transition-all duration-200 hover:shadow-lg"
                  disabled={isLoading}
                >
                  <motion.span
                    animate={isLoading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                    transition={isLoading ? { repeat: Infinity, duration: 1.5 } : {}}
                  >
                    {getSubmitButtonText(isLoading, form.formState.isSubmitting)}
                  </motion.span>
                </Button>
              </motion.div>
            </form>
          </Form>

          <motion.div className="mt-4 text-center" variants={linkVariants}>
            <p className="text-sm text-muted-foreground flex items-center justify-between">
              {alternativeText}{" "}
              <Link
                href={alternativeLink}
                className="font-medium text-primary hover:text-primary/80 transition-colors duration-200 "
              >
                <motion.span whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  {alternativeLinkText}
                </motion.span>
              </Link>
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Reusable form field component with animations
interface FormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  type?: string;
  index: number;
}

export function Field<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type = "text",
  index,
}: FormFieldProps<T>) {
  const fieldId = `field-${String(name)}-${index}`;

  return (
    <motion.div
      key={fieldId}
      variants={fieldVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
    >
      <FormField
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">{label}</FormLabel>
            <FormControl>
              <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Input
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  className={cn(
                    "transition-all duration-200",
                    fieldState.error && "border-destructive focus:border-destructive"
                  )}
                />
              </motion.div>
            </FormControl>
            <AnimatePresence mode="wait">
              {fieldState.error && (
                <motion.div
                  key={`error-${fieldId}-${fieldState.error.message}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormMessage />
                </motion.div>
              )}
            </AnimatePresence>
          </FormItem>
        )}
      />
    </motion.div>
  );
}
