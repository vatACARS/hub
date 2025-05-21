// pages/vatsys.tsx
import Layout from "../components/Layout";
import { useEffect } from "react";
import PluginInstaller from "../components/PluginInstaller";

export default function VatSysPage() {
    useEffect(() => {
        const video = document.getElementById('background-video') as HTMLVideoElement;
        if (!video) return;

        const startTime = 165;
        const endTime = 330;

        video.currentTime = startTime;

        const checkTime = () => {
            if (video.currentTime >= endTime) {
                video.currentTime = startTime;
                video.play();
            }
        };

        video.addEventListener('timeupdate', checkTime);
        return () => video.removeEventListener('timeupdate', checkTime);
    }, []);

    return (
        <Layout>
            <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
                <div className="absolute inset-0 overflow-hidden">
                    <video
                        id="background-video"
                        className="w-full h-full object-cover pointer-events-none transition-opacity duration-300"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                    >
                        <source src="/videos/vatsys-background.webm" type="video/webm" />
                        <source src="/videos/vatsys-background.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black opacity-75"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <h1 className="text-4xl font-bold text-blue-400">vatSys Plugin</h1>
                    <p className="text-slate-300 mt-2">Plugin for vatSys integration.</p>
                    <div className="mt-8 w-full max-w-xl">
                        <PluginInstaller
                            pluginName="vatacars-vatsys-plugin"
                            repo="vatacars/vatsys-plugin"
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}