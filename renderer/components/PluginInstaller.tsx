import React, { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";

interface PluginInstallerProps {
    pluginName: string;
    repo: string; // e.g., 'maxrumsey/OzStrips'
}

export default function PluginInstaller({ pluginName, repo }: PluginInstallerProps) {
    const [status, setStatus] = useState<"not_installed" | "installed" | "update_available" | "not_available">("not_installed");
    const [installing, setInstalling] = useState(false);
    const [progress, setProgress] = useState(0);
    const [flash, setFlash] = useState(false);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const [pluginVersion, setPluginVersion] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [pluginLog, setPluginLog] = useState<string[]>([]);
    const [pluginType, setPluginType] = useState<'zip' | 'dll' | null>(null);
    const [installedVersion, setInstalledVersion] = useState<string | null>(null);
    const [showLog, setShowLog] = useState(false);

    // Log helper
    const log = (msg: string) => {
        setPluginLog(prev => [...prev.slice(-9), msg]);
    };

    // Fetch latest release info from GitHub
    const fetchLatestRelease = async () => {
        try {
            const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
            if (!response.ok) {
                // If the repo or release doesn't exist, mark as not available
                log("No release found for this plugin.");
                setStatus("not_available");
                setDownloadUrl(null);
                setPluginVersion(null);
                setPluginType(null);
                return;
            }
            const data = await response.json();
            const asset = data.assets?.find((a: any) => a.name.endsWith('.zip') || a.name.endsWith('.dll'));

            if (asset) {
                setDownloadUrl(asset.browser_download_url);
                setPluginVersion(data.tag_name);
                setPluginType(asset.name.endsWith('.zip') ? 'zip' : 'dll');
                log(`Fetched latest plugin version: ${data.tag_name}`);
            } else {
                log("No DLL or ZIP asset found in latest release.");
                setStatus("not_available");
                setDownloadUrl(null);
                setPluginVersion(null);
                setPluginType(null);
            }
        } catch (error: any) {
            console.error("Error fetching release:", error);
            log("Failed to fetch release info from GitHub.");
            setStatus("not_available");
            setDownloadUrl(null);
            setPluginVersion(null);
            setPluginType(null);
        }
    };

    // Read installed version from file in appdata
    const fetchInstalledVersionFromFile = async () => {
        // Use Electron's IPC to read the file from the main process
        window.ipc.send('readInstalledVersion', { pluginName });
        const unsubscribe = window.ipc.on('readInstalledVersionReply', (reply: any) => {
            if (reply.pluginName !== pluginName) return;
            setInstalledVersion(reply.installedVersion || null);
            unsubscribe();
        });
    };

    // On mount, fetch latest release and installed version
    useEffect(() => {
        fetchLatestRelease();
        fetchInstalledVersionFromFile();
        // eslint-disable-next-line
    }, []);

    // Check installed plugin version when version/type changes
    useEffect(() => {
        if (!pluginVersion || !pluginType) return;
        log("Checking for installed plugin...");
        window.ipc.send('checkDownloadedPlugin', {
            pluginName,
            pluginType,
            remoteVersion: pluginVersion,
            extract: pluginType === 'zip'
        });

        const unsubscribe = window.ipc.on('checkDownloadedPluginReply', (reply: any) => {
            if (reply.pluginName !== pluginName) return;

            if (reply.installed) {
                log(`Installed version: ${reply.installedVersion}`);
                setInstalledVersion(reply.installedVersion || null);
                if (reply.updateAvailable) {
                    log(`Update available: ${pluginVersion}`);
                    setStatus("update_available");
                } else {
                    setStatus("installed");
                }
            } else {
                log("Plugin not installed.");
                setInstalledVersion(null);
                setStatus("not_installed");
            }

            unsubscribe();
        });
    }, [pluginVersion, pluginType]);

    // Install handler
    const handleInstall = () => {
        if (!downloadUrl || !pluginType) {
            log("❌ Cannot install plugin. Missing download URL or plugin type.");
            return;
        }

        log(`⬇️ Starting installation of ${pluginName} (${pluginType})`);
        log(`Download URL: ${downloadUrl}`);
        setInstalling(true);
        setProgress(0);

        window.ipc.send('downloadPlugin', {
            pluginName,
            downloadUrl,
            version: pluginVersion,
            extract: pluginType === 'zip',
            pluginType,
        });

        const unsubscribe = window.ipc.on('downloadPluginReply', (reply: any) => {
            if (reply.pluginName !== pluginName) return;

            switch (reply.status) {
                case 'downloading':
                    setProgress(reply.percent);
                    log(`📦 Downloading... ${reply.percent.toFixed(1)}%`);
                    break;
                case 'installing':
                    log("🔧 Installing plugin...");
                    break;
                case 'done':
                    log("✅ Plugin installed successfully.");
                    setInstalling(false);
                    setStatus("installed");
                    window.ipc.send('checkDownloadedPlugin', { pluginName, pluginType, remoteVersion: pluginVersion, extract: pluginType === 'zip' });
                    fetchInstalledVersionFromFile();
                    unsubscribe();
                    break;
                case 'failed':
                    log(`❌ Installation failed: ${reply.error}`);
                    setInstalling(false);
                    unsubscribe();
                    break;
                default:
                    log(`❌ Unknown status: ${reply.status}`);
                    break;
            }
        });
    };

    // Uninstall handler
    const handleUninstall = () => {
        log("🗑️ Uninstalling plugin...");
        setInstalling(true);
        setProgress(0);

        window.ipc.send('uninstallPlugin', { pluginName, pluginType, extract: pluginType === 'zip' });

        const unsubscribe = window.ipc.on('uninstallPluginReply', (reply: any) => {
            if (reply.pluginName !== pluginName) return;

            if (reply.status === 'done') {
                log("🗑️ Plugin uninstalled.");
                setStatus("not_installed");
                setInstalledVersion(null);
            } else if (reply.status === 'failed') {
                log(`❌ Failed to uninstall plugin: ${reply.error}`);
            } else if (reply.status === 'running') {
                log("❌ Cannot uninstall while vatSys is running.");
            }

            setInstalling(false);
            setProgress(0);
            unsubscribe();
        });
    };

    // Button label logic
    const getButtonLabel = () => {
        if (installing) {
            return status === 'installed' ? `Uninstalling...` : `Installing... ${progress.toFixed(1)}%`;
        }
        if (status === "not_installed") return "Install Plugin";
        if (status === "update_available") return "Update Plugin";
        if (status === "installed") return "Uninstall Plugin";
        return "Not Available";
    };

    // Button disabled logic
    const isButtonDisabled = () => {
        return status === "not_available" || installing;
    };

    // Button click handler
    const handleButtonClick = () => {
        if (status === "installed") {
            handleUninstall();
        } else {
            handleInstall();
        }
    };

    // Button color logic
    const getButtonColor = () => {
        if (status === "installed") return "bg-red-500 hover:bg-red-600 text-white";
        if (status === "not_available") return "bg-gray-500 cursor-not-allowed text-white";
        return "bg-green-500 hover:bg-green-600 text-white";
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="mb-2 text-slate-200 font-semibold">
                Installed Version: {installedVersion ?? "Not installed"}
            </div>
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

            {/* Floating log button and panel */}
            <button
                className="fixed bottom-6 right-6 z-50 bg-slate-800 text-slate-200 px-4 py-2 rounded shadow hover:bg-slate-700 transition"
                onClick={() => setShowLog(v => !v)}
                style={{ minWidth: 44 }}
            >
                {showLog ? "Hide Log" : "Show Log"}
            </button>
            {showLog && (
                <div className="fixed bottom-20 right-6 z-50 w-96 max-w-full bg-slate-900 text-left p-4 rounded shadow-xl text-sm text-slate-400 border border-slate-700">
                    <h2 className="font-semibold mb-2 text-slate-200">Plugin Log</h2>
                    <ul className="space-y-1 list-disc list-inside max-h-60 overflow-y-auto">
                        {pluginLog.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                        ))}
                    </ul>
                </div>
            )}

            <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
        </div>
    );
}