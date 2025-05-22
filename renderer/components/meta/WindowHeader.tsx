import Image from "next/legacy/image";

import { VscChromeMinimize, VscChromeMaximize, VscChromeClose } from 'react-icons/vsc';

const handleClose = () => {
  // @ts-ignore
  window.ipc.send('saveAndClose');
};

export default () => {
  return (
    <div className="h-7 titlebar flex justify-between items-center bg-zinc-900 text-zinc-200 font-semibold border-b border-zinc-600">
      <div className="flex flex-row items-center">
        <div className="relative items-center space-x-1 px-4 h-4">
          <Image src="/img/vatacars-logo-sm-dark.png" alt="vatACARS Logo" layout="fill" objectFit="contain" />
        </div>
        <span className="text-sm">Hub {require("../../../package.json").version}</span>
      </div>
      <div className="flex h-full">
        <a
          onClick={() => window.ipc.send('windowControl', 'minimize')}
          className="px-4 flex items-center h-full titlebar-button hover:bg-zinc-700 transition-all"
        >
          <VscChromeMinimize />
        </a>
        <a
          onClick={() => window.ipc.send('windowControl', 'maximize')}
          className="px-4 flex items-center titlebar-button hover:bg-zinc-700 transition-all"
        >
          <VscChromeMaximize />
        </a>
        <button onClick={handleClose} className="px-4 flex items-center titlebar-button hover:bg-red-600 transition-all">
          <VscChromeClose />
        </button>
      </div>
    </div>
  );
}
