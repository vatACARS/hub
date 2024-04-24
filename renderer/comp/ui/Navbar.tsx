import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="bg-slate-800 border-t border-gray-600">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="px-12 relative flex h-16 items-center justify-between">
                    <div className="relative w-32 flex items-center">
                        <div className="flex-shrink-0">
                            <div className="font-semibold text-lg h-8 cursor-pointer">
                                <Link href="/">
                                    <Image src="/img/vatacars-logo-dark.png" alt="vatACARS Logo" layout="fill" objectFit="contain" />
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex space-x-8">
                            <Link href=""><span className="hover:text-slate-500 px-3 py-2 rounded-md text-sm font-medium text-slate-300 cursor-pointer">Login</span></Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}