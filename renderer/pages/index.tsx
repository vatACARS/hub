import Layout from "../components/Layout";
import { Toaster } from "react-hot-toast";

export default function HomePage() {
  return (
    <Layout>
      <Toaster position="top-center" />
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
          <h1 className="text-4xl font-bold">Welcome to vatACARS</h1>
        </div>
      </div>
    </Layout>
  );
}
