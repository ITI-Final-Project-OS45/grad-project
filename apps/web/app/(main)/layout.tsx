"use client";
import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import { PropsWithChildren } from "react";

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
