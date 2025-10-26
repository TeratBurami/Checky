"use client";

import { FaBell, FaCircleUser } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import Link from "next/link";

type NavbarProps = {
    role?: string;
};

export default function Navbar({ role }: NavbarProps) {
    const currentPath = usePathname();
    const userRole = role; 

    const baseLinkClass = "px-4 h-18 text-center content-center";
    const activeLinkClass = "border-b-4 border-orange-500";
    const inactiveLinkClass = "border-b-4 border-transparent";

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

            <div className="flex gap-6">
                <div className="bg-[#EFECDA] rounded-full p-2">
                    <div className="absolute bg-red-500 w-2.5 h-2.5 rounded-full ml-4"></div>
                    <Link href="/notification">
                        <FaBell className="text-2xl"></FaBell>
                    </Link>
                </div>
                <div className="bg-[#EFECDA] rounded-full p-2">
                    <FaCircleUser className="text-2xl"></FaCircleUser>
                </div>
            </div>
        </nav>
    );
}