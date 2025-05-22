import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Toaster } from "react-hot-toast";

// --- Update Modal Component ---
function UpdateModal({
  updateInfo,
  onUpdate,
  onSkip,
  progress,
  isDownloading
}: {
  updateInfo: { latestVersion: string, releaseNotes: string, downloadUrl: string },
  onUpdate?: () => void,
  onSkip?: () => void,
  progress?: number | null,
  isDownloading?: boolean
}) {
  const isPostInstall = !onUpdate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full p-8 border border-slate-700">
        <h2 className="text-3xl font-bold mb-4 text-blue-400">
          {isPostInstall ? "📝 What's New in this Version" : "🚀 Update Available!"}
        </h2>
        <p className="mb-4 text-slate-200 text-lg">
          Version <span className="font-semibold text-blue-300">{updateInfo.latestVersion}</span>
        </p>
        <div className="mb-6 max-h-72 overflow-y-auto border border-slate-700 rounded-lg p-4 bg-slate-800">
          <div
            className="prose prose-sm prose-invert text-slate-200"
            dangerouslySetInnerHTML={{ __html: updateInfo.releaseNotes || "No changelog provided." }}
          />
        </div>

        <div className="flex justify-end gap-3">
          {isPostInstall ? (
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onSkip}
                className="px-5 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 transition font-medium"
              >
                Later
              </button>
              <button
                onClick={onUpdate}
                className="px-5 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                {isDownloading ? "Downloading..." : "Update Now"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const description = "Welcome to vatACARS Hub. Manage your plugins and keep them up to date.";

export default function Home() {
  const [typed, setTyped] = useState("");
  const [updateInfo, setUpdateInfo] = useState<{
    latestVersion: string,
    releaseNotes: string,
    downloadUrl: string
  } | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setTyped("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < description.length) {
        setTyped(description.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkForUpdate();
    checkFirstRunVersion();
  }, []);

  const fetchChangelog = async (version: string): Promise<string> => {
    try {
      const response = await fetch("https://api.github.com/repos/vatACARS/hub/releases");
      const releases = await response.json();
      const match = releases.find((r: any) => r.tag_name?.includes(version));
      return match?.body || "No changelog provided.";
    } catch (err) {
      return "Could not fetch changelog.";
    }
  };

  const checkForUpdate = () => {
    window.ipc.invoke('checkAppUpdate').then(async (updateInfo: any) => {
      if (updateInfo?.updateAvailable) {
        const realChangelog = await fetchChangelog(updateInfo.latestVersion);
        setUpdateInfo({
          latestVersion: updateInfo.latestVersion,
          releaseNotes: realChangelog,
          downloadUrl: updateInfo.downloadUrl
        });
        await window.ipc.invoke('setSeenVersion', updateInfo.currentVersion);
        setShowUpdateModal(true);
      }
    }).catch((err) => {
      console.error("Update check failed:", err);
    });
  };

  const checkFirstRunVersion = async () => {
    const currentVersion = await window.ipc.invoke('getAppVersion');
    const seenVersion = await window.ipc.invoke('getSeenVersion');

    if (seenVersion !== currentVersion) {
      const realChangelog = await fetchChangelog(currentVersion);
      setUpdateInfo({
        latestVersion: currentVersion,
        releaseNotes: `<p>Welcome to version ${currentVersion}!</p>` + realChangelog,
        downloadUrl: ""
      });
      setShowUpdateModal(true);
      await window.ipc.invoke('setSeenVersion', currentVersion);
    }
  };

  const handleUpdate = async () => {
    if (!updateInfo) return;
    setIsDownloading(true);

    const lines: string[] = [];

    const listener = (_event: any, data: { percent: number | string }) => {
      const raw = typeof data.percent === 'string' ? parseFloat(data.percent) : data.percent;
      if (!isNaN(raw)) {
        lines.push(`Downloaded: ${Math.round(raw)}%`);
        setUpdateInfo(prev => prev && {
          ...prev,
          releaseNotes: `<p>${lines.join("<br/>")}</p>`
        });
      }
    };

    const unsubscribe = window.ipc.on('updateProgress', listener);

    try {
      await window.ipc.invoke('downloadAndInstallAppUpdate', updateInfo.downloadUrl);
      // Write the new version to file
      await window.ipc.invoke('setSeenVersion', updateInfo.latestVersion);
    } catch (error: any) {
      alert("Failed to download and install update.");
    } finally {
      setIsDownloading(false);
      unsubscribe();
    }
  };

  const handleSkip = () => {
    setShowUpdateModal(false);
  };

  return (
    <Layout>
      <Toaster position="top-center" />
      {showUpdateModal && updateInfo && (
        <UpdateModal
          updateInfo={updateInfo}
          onUpdate={updateInfo.downloadUrl ? handleUpdate : undefined}
          onSkip={updateInfo.downloadUrl ? handleSkip : undefined}
          isDownloading={isDownloading}
        />
      )}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/img/home-background.jpg')" }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <img
            src="/img/vatacars-logo-dark.png"
            alt="vatACARS Logo"
            className="w-full max-w-[400px] h-auto object-contain pointer-events-none mb-4"
          />
          <h1 className="text-4xl font-bold">
            <span>{typed}</span>
            <span className="animate-pulse text-slate-400">|</span>
          </h1>
        </div>
      </div>
    </Layout>
  );
}
