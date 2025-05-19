import Layout from "../components/Layout";

export default function PilotPage() {
    return (
        <Layout>
            <div className="relative w-full h-screen flex flex-col items-center justify-center">
                <div className="absolute inset-0 w-full h-full bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/img/pilot-background.jpg')" }} />
                <div className="relative z-10 flex flex-col items-center text-center">
                    <h1 className="text-4xl font-bold text-violet-400">Pilot Client</h1>
                    <p className="text-slate-300 mt-2">Plugin for pilots connecting to VATSIM.</p>
                </div>
            </div>
        </Layout>
    );
}
