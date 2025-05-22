import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiChevronLeft } from 'react-icons/hi';

const appClientsList = [
    { name: 'Home', path: '/home' },
    { name: 'vatSys Plugin', path: '/vatsys' },
    { name: 'Euroscope Plugin', path: '/euroscope' },
    { name: 'Pilot Client', path: '/pilot' },
];

const recommendedPluginsList = [
    { name: 'OzStrips', path: '/OzStrips' },
    { name: 'Vatpac Plugin (vatSys Server Lite)', path: '/vatpacplugin' },
    { name: 'Discord Plugin', path: '/discordplugin' },
    { name: 'Events Plugin', path: '/eventsplugin' },
    { name: 'Airports Plugin', path: '/airportsplugin' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [fadeOutContent, setFadeOutContent] = useState(false);
    const [fadeOutSidebar, setFadeOutSidebar] = useState(false);
    const [navigatingPath, setNavigatingPath] = useState<string | null>(null);
    // Use sessionStorage to remember sidebar state for the session only
    const [showRecommended, setShowRecommended] = useState(() => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            // Always default to main area on first load (not recommended)
            return false;
        }
        return false;
    });

    const handleNavigation = (path: string) => {
        if (path === router.pathname) return;
        setNavigatingPath(path);
        setFadeOutContent(true);
        setTimeout(() => {
            router.push(path).then(() => {
                setNavigatingPath(null); // Reset navigatingPath after navigation
            });
        }, 300);
    };

    const toggleSidebarState = (state: boolean) => {
        setShowRecommended(state);
        // Save the state to sessionStorage for this session only
        if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem('sidebarState', state ? 'recommended' : 'applications');
        }
    };

    // On mount, restore sidebar state for this session only
    useEffect(() => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            const sidebarState = window.sessionStorage.getItem('sidebarState');
            setShowRecommended(sidebarState === 'recommended');
        }
    }, []);

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
                        {showRecommended ? 'Recommended Plugins' : 'Applications'}
                    </h2>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={showRecommended ? "recommended-view" : "app-view"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col space-y-2"
                        >
                            {!showRecommended ? (
                                <>
                                    {appClientsList.map((client) => (
                                        <button
                                            key={client.name}
                                            onClick={() => handleNavigation(client.path)}
                                            className={`p-3 rounded-md cursor-pointer hover:bg-slate-700 text-slate-300 ${router.pathname === client.path ? 'bg-blue-500 text-white font-bold' : ''
                                                }`}
                                        >
                                            {client.name}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => toggleSidebarState(true)}
                                        className="p-3 rounded-md cursor-pointer hover:bg-emerald-700 text-emerald-300 font-semibold border-t border-slate-700 mt-2"
                                    >
                                        Recommended Plugins
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => toggleSidebarState(false)}
                                        className="flex items-center gap-2 p-2 mb-2 text-slate-400 hover:text-white"
                                    >
                                        <HiChevronLeft /> Back
                                    </button>
                                    {recommendedPluginsList.map((plugin) => (
                                        <button
                                            key={plugin.name}
                                            onClick={() => handleNavigation(plugin.path)}
                                            className={`p-3 rounded-md cursor-pointer hover:bg-slate-700 text-slate-300 ${router.pathname === plugin.path ? 'bg-blue-500 text-white font-bold' : ''
                                                }`}
                                        >
                                            {plugin.name}
                                        </button>
                                    ))}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
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
