import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div>{children}</div>
      <Toaster />
    </div>
  );
}
