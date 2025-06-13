import { Header } from "@/components/ui/header";
import { PropsWithChildren } from "react";

export default function WorkspaceLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
