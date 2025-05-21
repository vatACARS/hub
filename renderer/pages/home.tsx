// pages/home.tsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Toaster } from "react-hot-toast";

// --- Update Modal Component ---
function UpdateModal({ updateInfo, onUpdate, onSkip }: {
  updateInfo: { latestVersion: string, releaseNotes: string, downloadUrl: string },
  onUpdate: () => void,
  onSkip: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full p-8 border border-slate-700 relative">
        <h2 className="text-3xl font-bold mb-3 text-blue-400">Update Available</h2>
        <p className="mb-3 text-slate-200 text-lg">
          A new version <span className="font-semibold text-blue-300">{updateInfo.latestVersion}</span> is available!
        </p>
        <div className="mb-6 max-h-72 min-h-[120px] overflow-y-auto border border-slate-700 rounded-lg p-4 bg-slate-800">
          <h3 className="font-semibold mb-2 text-slate-100 text-lg">Changelog:</h3>
          <div
            className="prose prose-sm prose-invert text-slate-200"
            style={{ fontSize: "1.1rem" }}
            dangerouslySetInnerHTML={{ __html: updateInfo.releaseNotes || "No changelog provided." }}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onSkip}
            className="px-5 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 transition font-medium"
          >
            Skip
          </button>
          <button
            onClick={onUpdate}
            className="px-5 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}

const description = "Welcome to vatACARS Hub, the new home for all things to do with vatSys Plugins";

export default function HomePage() {
  const [typed, setTyped] = useState("");
  const [updateInfo, setUpdateInfo] = useState<null | {
    latestVersion: string,
    releaseNotes: string,
    downloadUrl: string
  }>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    setTyped(""); // Reset on mount
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

  // Check for app update on mount
  useEffect(() => {
    (async () => {
      try {
        // @ts-ignore
        const info = await window.ipc.invoke('checkAppUpdate');
        if (info && info.updateAvailable && info.downloadUrl) {
          setUpdateInfo({
            latestVersion: info.latestVersion,
            releaseNotes: info.releaseNotes,
            downloadUrl: info.downloadUrl
          });
          setShowUpdateModal(true);
        }
      } catch (e) {
        // Optionally handle error
      }
    })();
  }, []);

  const handleUpdate = async () => {
    if (!updateInfo) return;
    setShowUpdateModal(false);
    // @ts-ignore
    await window.ipc.invoke('downloadAndInstallAppUpdate', updateInfo.downloadUrl);
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
          onUpdate={handleUpdate}
          onSkip={handleSkip}
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
