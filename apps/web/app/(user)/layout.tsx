import { Header } from "@/components/ui/header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function UserLayout({ children }: PropsWithChildren) {
  const accessToken = (await cookies()).get("auth_token");
  if (!accessToken) redirect("/signin");
  return (
    <>
      <Header />
      {children}
    </>
  );
}
