import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="bg-slate-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="px-12 relative flex h-16 items-center justify-between border-b border-gray-200">
                    <div className="relative w-32 flex items-center">
                        <div className="flex-shrink-0">
                            <div className="font-semibold text-lg h-8 cursor-pointer">
                                <Link href="/">
                                    <Image src="/img/vatacars-logo.png" alt="vatACARS Logo" layout="fill" objectFit="contain" />
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex space-x-8">
                            <Link href=""><span className="hover:text-slate-700 px-3 py-2 rounded-md text-sm font-medium text-slate-900 cursor-pointer">Login</span></Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}