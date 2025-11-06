"use client";

import {FaSignOutAlt} from 'react-icons/fa'

import {
  FaBell,
  FaCircleUser,
} from "react-icons/fa6";
import { usePathname, useRouter } from "next/navigation"; 
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

type NavbarProps = {
    role?: string;
};

export default function Navbar({ role }: NavbarProps) {
    const currentPath = usePathname();
    const userRole = role; 
    const router = useRouter();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const baseLinkClass = "px-4 h-18 text-center content-center transition-all delay-50 duration-300 ease-in-out";
    const activeLinkClass = "border-b-4 border-orange-500";
    const inactiveLinkClass = "border-b-4 border-transparent";

    const handleLogout = () => {
        Cookies.remove("token");
        setIsDropdownOpen(false);
        router.refresh(); 
        router.push("/");
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    return (
        <nav className="bg-[#FDFBEF] px-4 top-0 z-20 w-full h-18 fixed shadow shadow-slate-300 flex justify-between items-center">
            <div className="flex gap-8 items-center">
                <Link href="/">
                    <img src="/logo.png" className="w-10 h-12 mr-10" alt="" />
                </Link>

                <Link
                    href="/"
                    className={`${baseLinkClass} ${
                        currentPath === "/" ? activeLinkClass : inactiveLinkClass
                    }`}
                >
                    Dashboard
                </Link>

                <Link
                    href="/class"
                    className={`${baseLinkClass} ${
                        currentPath.startsWith("/class")
                            ? activeLinkClass : inactiveLinkClass
                    }`}
                >
                    Classes
                </Link>

                {userRole === "student" && (
                    <Link
                        href="/peer-review"
                        className={`${baseLinkClass} ${
                            currentPath.startsWith("/peer-review")
                                ? activeLinkClass
                                : inactiveLinkClass
                        }`}
                    >
                        Peer Reviews
                    </Link>
                )}

                {userRole === "student" && (
                    <Link
                        href="/performance"
                        className={`${baseLinkClass} ${
                            currentPath.startsWith("/performance")
                                ? activeLinkClass
                                : inactiveLinkClass
                        }`}
                    >
                        My Performance
                    </Link>
                )}

                {userRole === "student" && (
                    <Link
                        href="/ai-analysis"
                        className={`${baseLinkClass} ${
                            currentPath.startsWith("/ai-analysis")
                                ? activeLinkClass
                                : inactiveLinkClass
                        }`}
                    >
                        AI Analysis
                    </Link>
                )}

                {userRole === "teacher" && (
                    <Link
                        href="/rubric"
                        className={`${baseLinkClass} ${
                            currentPath.startsWith("/rubric")
                                ? activeLinkClass
                                : inactiveLinkClass
                        }`}
                    >
                        Rubrics
                    </Link>
                )}
            </div>

            <div className="flex gap-6 items-center"> 
                <div className="bg-[#EFECDA] rounded-full p-2">
                    <div className="absolute bg-red-500 w-2.5 h-2.5 rounded-full ml-4"></div>
                    <Link href="/notification">
                        <FaBell className="text-2xl"></FaBell>
                    </Link>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="bg-[#EFECDA] rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#FDFBEF] transition-all"
                        aria-label="User Menu"
                    >
                        <FaCircleUser className="text-2xl" />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100"
                            >
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                >
                                    <FaSignOutAlt className="text-orange-600" />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </nav>
    );
}