'use client';

import Navbar from "@/components/navbar";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | undefined>();

  useEffect(() => {
    const userRole = Cookies.get("role");
    setRole(userRole);
  }, []);

  return (
    <div>
        <Navbar role={role} />
        <div className="mt-20">{children}</div>
    </div>
  );
}