import Layout from "../components/Layout";

export default function AccountPage() {
    return (
        <Layout>
            <div className="relative w-full h-screen flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl font-bold text-blue-400">Account Management</h1>
                <p className="text-slate-300 mt-4 max-w-md">
                    Manage your personal information, view your activity, and update your account settings.
                </p>
            </div>
        </Layout>
    );
}
