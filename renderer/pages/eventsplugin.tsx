import Layout from "../components/Layout";
import PluginInstaller from "../components/PluginInstaller";

export default function EventsPluginPage() {
    return (
        <Layout>
            <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10"
                    style={{ backgroundImage: "url('/img/events-background.jpg')" }}
                />
                <div className="relative z-10 flex flex-col items-center text-center">
                    <h1 className="text-4xl font-bold text-pink-400">Events Plugin</h1>
                    <p className="text-slate-300 mt-2">Plugin for VATSIM events integration.</p>
                    <div className="mt-8 w-full max-w-xl">
                        <PluginInstaller
                            pluginName="EventsPlugin"
                            repo="badvectors/EventsPlugin"
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}