import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { FaCheckCircle } from "react-icons/fa";
import axios from "axios";

export default function TestPage() {
    const pluginName = "OzStrips";

    const [status, setStatus] = useState<"not_installed" | "installed" | "update_available" | "not_available">("not_installed");
    const [installing, setInstalling] = useState(false);
    const [progress, setProgress] = useState(0);
    const [flash, setFlash] = useState(false);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const [pluginVersion, setPluginVersion] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [pluginLog, setPluginLog] = useState<string[]>([]);
    const [pluginType, setPluginType] = useState<'zip' | 'dll' | null>(null);

    useEffect(() => {
        fetchLatestRelease();
    }, []);

    useEffect(() => {
        if (!pluginVersion) return;
        log("Checking for installed plugin...");
        window.ipc.send('checkDownloadedPlugin', { pluginName });

        const unsubscribe = window.ipc.on('checkDownloadedPluginReply', (reply: any) => {
            if (reply.pluginName !== pluginName) return;

            if (reply.installed) {
                log(`Plugin is installed. Local version: ${reply.version}`);
                if (pluginVersion && reply.version && reply.version !== pluginVersion) {
                    setStatus("update_available");
                } else {
                    setStatus("installed");
                }
            } else {
                log("Plugin not installed.");
                setStatus("not_installed");
            }

            unsubscribe();
        });
    }, [pluginVersion]);

    const fetchLatestRelease = async () => {
        try {
            const response = await axios.get('https://api.github.com/repos/maxrumsey/OzStrips/releases/latest');
            const assets = response.data.assets;
            const asset = assets.find((a: any) => a.name.endsWith('.zip') || a.name.endsWith('.dll'));

            if (asset) {
                setDownloadUrl(asset.browser_download_url);
                setPluginVersion(response.data.tag_name);
                setPluginType(asset.name.endsWith('.zip') ? 'zip' : 'dll');
                log(`Fetched latest plugin version: ${response.data.tag_name}`);
            } else {
                log("No DLL or ZIP asset found in latest release.");
                setStatus("not_available");
            }
        } catch (error) {
            console.error("Error fetching release:", error);
            log("Failed to fetch release info from GitHub.");
            setStatus("not_available");
        }
    };

    const handleInstall = () => {
        if (!downloadUrl || !pluginType) {
            log("Missing plugin URL or type.");
            return;
        }

        log(`Starting install of ${pluginName} (${pluginType}) from ${downloadUrl}`);
        setInstalling(true);
        setProgress(0);
        setFlash(false);
        setShowCheckmark(false);

        window.ipc.send('downloadPlugin', {
            pluginName,
            downloadUrl,
            version: pluginVersion,
            extract: pluginType === 'zip',
            pluginType,
        });

        const unsubscribe = window.ipc.on('downloadPluginReply', (reply: any) => {
            if (reply.pluginName !== pluginName) return;

            if (reply.status === 'downloading') {
                setProgress(reply.percent);
            } else if (reply.status === 'installing') {
                log("Installing plugin...");
                setProgress(100);
            } else if (reply.status === 'done') {
                log("✅ Plugin installed successfully.");
                window.ipc.send('checkDownloadedPlugin', { pluginName });
                setInstalling(false);
                setStatus("installed");
                setFlash(true);
                setShowCheckmark(true);
                setTimeout(() => setFlash(false), 500);
                setTimeout(() => setShowCheckmark(false), 3000);
                unsubscribe();
            } else if (reply.status === 'failed') {
                log("❌ Plugin installation failed.");
                if (reply.error) log(`Error: ${reply.error}`);
                setInstalling(false);
                setProgress(0);
                setStatus("not_installed");
                unsubscribe();
            }
        });
    };

    const handleUninstall = () => {
        log("Uninstalling plugin...");
        setInstalling(true);
        setProgress(0);
        window.ipc.send('uninstallPlugin', { pluginName });

        const unsubscribe = window.ipc.on('uninstallPluginReply', (reply: any) => {
            if (reply.pluginName !== pluginName) return;

            if (reply.status === 'done') {
                log("🗑️ Plugin uninstalled.");
                setStatus("not_installed");
                setInstalling(false);
                setProgress(0);
                setFlash(false);
                setShowCheckmark(false);
            } else if (reply.status === 'failed') {
                log("❌ Failed to uninstall plugin.");
                setInstalling(false);
            }
            unsubscribe();
        });
    };

    const getButtonLabel = () => {
        if (installing) {
            return status === 'installed' ? `Uninstalling...` : `Installing... ${progress.toFixed(1)}%`;
        }

        if (status === "not_installed") return "Install Plugin";
        if (status === "update_available") return "Update Plugin";
        if (status === "installed") return "Uninstall Plugin";
        return "Not Available";
    };

    const isButtonDisabled = () => {
        return status === "not_available" || installing;
    };

    const handleButtonClick = () => {
        if (status === "installed") {
            handleUninstall();
        } else {
            handleInstall();
        }
    };

    const getButtonColor = () => {
        if (status === "installed") return "bg-red-500 hover:bg-red-600 text-white";
        if (status === "not_available") return "bg-gray-500 cursor-not-allowed text-white";
        return "bg-green-500 hover:bg-green-600 text-white";
    };

    const log = (msg: string) => {
        setPluginLog(prev => [...prev.slice(-9), msg]);
    };

    return (
        <Layout>
            <div className="relative w-full h-screen flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl font-bold text-blue-400 mb-4">Test Install Page</h1>
                <p className="text-slate-300 mb-8">Download and install the OzStrips plugin into your vatSys Plugins folder.</p>

                <div className={`flex items-center justify-center transition-all duration-500 ease-out ${showCheckmark ? "gap-4 translate-x-[-10px]" : "gap-0 translate-x-0"}`}>
                    <button
                        onClick={handleButtonClick}
                        disabled={isButtonDisabled()}
                        className={`px-6 py-3 rounded-lg font-semibold shadow transition-all duration-300 flex items-center justify-center gap-2 ${getButtonColor()} ${flash ? "animate-pulse" : ""}`}
                    >
                        {installing && (
                            <svg className="animate-spin h-5 w-5 text-white" style={{ animationDuration: "0.5s" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                        )}
                        <span className="transition-opacity duration-300">{getButtonLabel()}</span>
                    </button>

                    {showCheckmark && (
                        <FaCheckCircle className="text-green-400 text-3xl animate-fade-in" />
                    )}
                </div>

                {installing && (
                    <div className="mt-4 w-64 bg-slate-700 rounded-full h-4 overflow-hidden">
                        <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                )}

                <div className="mt-8 w-full max-w-xl bg-slate-900 text-left p-4 rounded shadow-inner text-sm text-slate-400">
                    <h2 className="font-semibold mb-2 text-slate-200">Plugin Log</h2>
                    <ul className="space-y-1 list-disc list-inside">
                        {pluginLog.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
        </Layout>
    );
}
