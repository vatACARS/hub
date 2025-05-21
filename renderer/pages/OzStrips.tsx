import React from "react";
import Layout from "../components/Layout";
import PluginInstaller from "../components/PluginInstaller";

export default function OzStrips() {
  return (
    <Layout>
      <div className="w-full h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">OzStrips Install Page</h1>
        <p className="text-slate-300 mb-8">
          Download and install the OzStrips plugin into your vatSys Plugins folder.
        </p>
        <PluginInstaller pluginName="OzStrips" repo="maxrumsey/OzStrips" />
      </div>
    </Layout>
  );
}
