import Layout from "../components/Layout";
import PluginInstaller from "../components/PluginInstaller";

export default function VatpacPluginPage() {
    return (
        <Layout>
            <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10"
                    style={{ backgroundImage: "url('/img/vatpac-background.jpg')" }}
                />
                <div className="relative z-10 flex flex-col items-center text-center">
                    <h1 className="text-4xl font-bold text-cyan-400">VATPAC Plugin</h1>
                    <p className="text-slate-300 mt-2">Plugin for VATPAC integration.</p>
                    <div className="mt-8 w-full max-w-xl">
                        <PluginInstaller
                            pluginName="VatpacPlugin"
                            repo="badvectors/VatpacPlugin"
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}