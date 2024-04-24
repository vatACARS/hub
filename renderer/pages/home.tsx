import Navbar from "../comp/ui/Navbar";

import { VscChromeMinimize, VscChromeMaximize, VscChromeClose } from "react-icons/vsc";


export default function HomePage() {
  return (
    <div className="bg-slate-900 h-screen">
      <div className="h-8 titlebar flex space-x-2 justify-end items-center text-slate-200 font-semibold pr-4">
        <a onClick={() => window.ipc.send('windowControl', 'minimize')} className="py-1 px-4 titlebar-button hover:bg-slate-800 transition-all rounded-md"><VscChromeMinimize /></a>
        <a onClick={() => window.ipc.send('windowControl', 'maximize')} className="py-1 px-4 titlebar-button hover:bg-slate-800 transition-all rounded-md"><VscChromeMaximize /></a>
        <a onClick={() => window.ipc.send('windowControl', 'close')} className="py-1 px-4 titlebar-button hover:bg-slate-800 transition-all rounded-md"><VscChromeClose /></a>
      </div>
      <Navbar />
      <div className="text-slate-200">
        <p>Test</p>
      </div>
    </div>
  )
}
