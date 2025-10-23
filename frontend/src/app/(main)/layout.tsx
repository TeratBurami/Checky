'use client';

import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {JwtPayload} from '@/lib/types';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | undefined>();

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const decodedPayload = jwtDecode<JwtPayload>(token);
        
        console.log("Decoded role:", decodedPayload.role);
        setRole(decodedPayload.role);

      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    }
  }, []);

  return (
    <div>
        <Navbar role={role} />
        <div className="mt-20 px-18 py-10">{children}</div>
    </div>
  );
}