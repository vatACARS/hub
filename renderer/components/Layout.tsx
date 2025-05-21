import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaUserCircle, FaArrowLeft } from 'react-icons/fa';

const appClientsList = [
    { name: 'Home', path: '/home' },
    { name: 'vatSys Plugin', path: '/vatsys' },
    { name: 'Euroscope Plugin', path: '/euroscope' },
    { name: 'Pilot Client', path: '/pilot' },
    { name: 'OzStrips', path: '/OzStrips' },
];

const accountClientsList = [
    { name: 'Account', path: '/account' },
    { name: 'Settings', path: '/settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [accountView, setAccountView] = useState(false);
    const [fadeOutContent, setFadeOutContent] = useState(false);
    const [fadeOutSidebar, setFadeOutSidebar] = useState(false);
    const [navigatingPath, setNavigatingPath] = useState<string | null>(null);

    const handleNavigation = (path: string) => {
        if (path === router.pathname) return;
        setNavigatingPath(path);
        setFadeOutContent(true);
        setTimeout(() => {
            router.push(path);
        }, 300);
    };

    useEffect(() => {
        if (!navigatingPath) return;

        setFadeOutContent(false);

        const fadeTimer = setTimeout(() => {
            setFadeOutSidebar(true);
        }, 500);

        const collapseTimer = setTimeout(() => {
            setSidebarOpen(false);
            setFadeOutSidebar(false);
            setNavigatingPath(null);
        }, 1000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(collapseTimer);
        };
    }, [router.pathname]);

    return (
        <div className="relative h-screen w-screen flex overflow-hidden">
            <motion.button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                initial={{ x: 0 }}
                animate={{ x: sidebarOpen ? 256 : 16, y: 72 }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed top-[-30px] z-30 p-2 bg-slate-700 rounded-md text-white hover:bg-slate-600"
                style={{ left: sidebarOpen ? '5px' : '-10px' }}
            >
                {sidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </motion.button>

            <motion.aside
                initial={{ x: -300 }}
                animate={{
                    x: sidebarOpen ? 0 : -300,
                    opacity: fadeOutSidebar ? 0 : 1,
                }}
                transition={{
                    x: { type: 'tween', duration: 0.3 },
                    opacity: { type: 'tween', duration: 0.5 },
                }}
                className="fixed top-0 left-0 w-64 h-screen bg-gradient-to-br from-slate-900 to-slate-800 border-r-2 border-slate-600 p-4 flex flex-col z-20"
            >
                <div className="flex flex-col space-y-2">
                    <h2 className="text-white text-xl font-bold mb-2 text-center">
                        {accountView ? 'User Area' : 'Applications'}
                    </h2>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={accountView ? 'account-view' : 'app-view'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col space-y-2"
                        >
                            {(accountView ? accountClientsList : appClientsList).map((client) => (
                                <button
                                    key={client.name}
                                    onClick={() => handleNavigation(client.path)}
                                    className={`p-3 rounded-md cursor-pointer hover:bg-slate-700 text-slate-300 ${router.pathname === client.path ? 'bg-blue-500 text-white font-bold' : ''
                                        }`}
                                    disabled={!!navigatingPath}
                                >
                                    {client.name}
                                </button>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex-grow"></div>

                <div className="flex flex-col space-y-2">
                    {accountView ? (
                        <button
                            onClick={() => setAccountView(false)}
                            className="p-3 rounded-md bg-slate-700 text-white hover:bg-slate-600 flex items-center justify-center space-x-2"
                        >
                            <FaArrowLeft />
                            <span>Back</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setAccountView(true)}
                            className="p-3 rounded-md bg-slate-700 text-white hover:bg-slate-600 flex items-center justify-center space-x-2"
                        >
                            <FaUserCircle size={24} />
                            <span>Account</span>
                        </button>
                    )}
                </div>
            </motion.aside>

            <motion.main
                className="relative overflow-hidden"
                animate={{
                    marginLeft: sidebarOpen ? 256 : 0,
                    opacity: fadeOutContent ? 0 : 1,
                }}
                transition={{
                    marginLeft: { type: 'tween', duration: 0.3 },
                    opacity: { type: 'tween', duration: 0.3 },
                }}
                style={{
                    width: '100%',
                    height: '100vh',
                }}
            >
                {children}
            </motion.main>
        </div>
    );
}
