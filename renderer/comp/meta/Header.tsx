import Image from 'next/image';

import { VscChromeMinimize, VscChromeMaximize, VscChromeClose } from 'react-icons/vsc';

export default function Header({ maximiseDisabled }) {
  return (
    <div className="h-8 titlebar flex justify-between items-center bg-slate-900 text-slate-200 font-semibold pr-4 border-b border-slate-600">
      <div className="flex flex-row">
        <div className="relative items-center space-x-4 w-12 h-6">
          <Image src="/img/vatacars-logo-sm-dark.png" alt="vatACARS Logo" layout="fill" objectFit="contain" />
        </div>
        <span>Hub v1.0.2</span>
      </div>
      <div className="flex space-x-2">
        <a
          onClick={() => window.ipc.send('windowControl', 'minimize')}
          className="py-1 px-4 titlebar-button hover:bg-slate-800 transition-all rounded-md"
        >
          <VscChromeMinimize />
        </a>
        <a
          onClick={() => !maximiseDisabled && window.ipc.send('windowControl', 'maximize')}
          className={`py-1 px-4 titlebar-button ${maximiseDisabled ? 'text-slate-700' : 'hover:bg-slate-800'} transition-all rounded-md`}
        >
          <VscChromeMaximize />
        </a>
        <a
          onClick={() => window.ipc.send('windowControl', 'close')}
          className="py-1 px-4 titlebar-button hover:bg-red-600 transition-all rounded-md"
        >
          <VscChromeClose />
        </a>
      </div>
    </div>
  );
}
