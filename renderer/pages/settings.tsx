import Layout from "../components/Layout";

export default function SettingsPage() {
    return (
        <Layout>
            <div className="relative w-full h-screen flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl font-bold text-emerald-400">Application Settings</h1>
                <p className="text-slate-300 mt-4 max-w-md">
                    Configure your preferences and adjust application behavior to your needs.
                </p>
            </div>
        </Layout>
    );
}
