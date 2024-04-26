const { useEffect, useState } = require("react");

import BarLoader from "react-spinners/BarLoader";
import { HiOutlineDownload } from "react-icons/hi";
import { GiCancel } from "react-icons/gi";
import { TbRefresh, TbCheck } from "react-icons/tb";
import { VscChromeClose } from "react-icons/vsc";

export default function Home() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [downloadingUpdate, setDownloadingUpdate] = useState(false);
    const [updateProgress, setUpdateProgress] = useState(0);
    const [updateComplete, setUpdateComplete] = useState(false);

    const [interfaceState, setInterfaceState] = useState({
        selectedTab: 0,
        clients: [{
            name: "Controller",
            localVersion: "0.0.1",
            description: "The vatACARS plugin for vatSys is a faithfully recreated CPDLC interface designed to seamlessly assist with a controller's workflow. Providing a direct integration with Hoppies ACARS, controllers are immediately able to connect with pilots that are using either our pilot client or one of many others publicly available.",
            status: "disabled",
            selectedVersion: -1,
            versions: [{
                id: 0,
                label: "Stable",
                version: "0.0.1"
            }/*, {
                id: 1,
                label: "Bleeding Edge",
                version: "0.0.1-be"
            }*/]
        }, {
            name: "Pilot",
            localVersion: "",
            description: "To be announced!",
            status: "disabled",
            selectedVersion: -1,
            versions: [{
                id: 0,
                label: "Not Available",
                version: "X.X.X"
            }]
        }]
    });

    useEffect(() => {
        window.ipc.send("windowControl", "unrestrictSize");

        window.ipc.on("updateAvailable", _arg => setUpdateAvailable(true));
        window.ipc.on("updateProgress", (arg: number) => setUpdateProgress(arg));
        window.ipc.on("updateComplete", _arg => setUpdateComplete(true));
    }, []);

    return (
        <div className="px-12 py-6 h-full text-slate-300">
            {updateAvailable ? (
                <div id="toast-interactive" className="w-full shadow-2xl max-w-xs p-4 text-gray-500 rounded-lg shadow bg-slate-800 fixed top-12 right-5" role="alert">
                    <div className="flex">
                        {updateComplete ? (
                            <>
                                <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-200 bg-green-500 rounded-lg">
                                    <TbCheck className="text-lg" />
                                    <span className="sr-only">Success icon</span>
                                </div>
                                <div className="ms-3 text-sm font-normal">
                                    <span className="mb-1 text-sm font-semibold text-white">Hub update completed!</span>
                                    <div className="mb-2 text-sm font-normal">The hub must be restarted to apply the updates.</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <a onClick={() => window.ipc.send('restartApp', null)} className="cursor-pointer inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-green-500 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800">Restart Now</a>
                                        </div>
                                        <div>
                                            <a onClick={() => setUpdateAvailable(false)} className="cursor-pointer inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700">Later</a>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setUpdateAvailable(false)} type="button" className="ms-auto -mx-1.5 -my-1.5 bg-white items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-interactive" aria-label="Close">
                                    <span className="sr-only">Close</span>
                                    <VscChromeClose className="text-xl" />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-200 bg-blue-500 rounded-lg">
                                    <TbRefresh className="text-lg" />
                                    <span className="sr-only">Refresh icon</span>
                                </div>
                                {downloadingUpdate ? (
                                    <div className="ms-3 text-sm font-normal flex flex-col space-y-1">
                                        <div className="flex flex-row items-center space-x-1">
                                            <span className="text-sm font-semibold text-white">Downloading hub update...</span>
                                            <span>{updateProgress}%</span>
                                        </div>
                                        <BarLoader width={192} color={"#3b82f6"} />
                                    </div>
                                ) : (
                                    <>
                                        <div className="ms-3 text-sm font-normal">
                                            <span className="mb-1 text-sm font-semibold text-white">Hub update available</span>
                                            <div className="mb-2 text-sm font-normal">A new software version is available for download.</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <a onClick={() => {
                                                        setDownloadingUpdate(true);
                                                        window.ipc.send('installUpdate', null);
                                                    }} className="cursor-pointer inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">Update</a>
                                                </div>
                                                <div>
                                                    <a onClick={() => setUpdateAvailable(false)} className="cursor-pointer inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700">Next time</a>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setUpdateAvailable(false)} type="button" className="ms-auto -mx-1.5 -my-1.5 bg-white items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-interactive" aria-label="Close">
                                            <span className="sr-only">Close</span>
                                            <VscChromeClose className="text-xl" />
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div >
            ) : <></>
            }


            <section className="mt-4">
                <div className="w-full h-12">
                    <div className="mx-auto h-full flex flex-row space-x-12 uppercase text-lg font-semibold items-center w-2/3">
                        <div onClick={() => setInterfaceState({ ...interfaceState, selectedTab: 0 })} className={`w-full h-full flex items-center rounded-sm shadow-lg transition-all duration-300 ${interfaceState.selectedTab == 0 ? "bg-blue-500" : "bg-slate-700 hover:bg-slate-500 cursor-pointer"}`}><a className="w-full text-center">Controller Client</a></div>
                        <div onClick={() => setInterfaceState({ ...interfaceState, selectedTab: 1 })} className={`w-full h-full flex items-center rounded-sm shadow-lg transition-all duration-300 ${interfaceState.selectedTab == 1 ? "bg-blue-500" : "bg-slate-700 hover:bg-slate-500 cursor-pointer"}`}><a className="w-full text-center">Pilot Client</a></div>
                    </div>
                </div>
            </section>

            <section className="mt-12 px-0 xl:px-24 2xl:px-48">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row space-x-2">
                        <span className="text-4xl tracking-wide">{interfaceState.clients[interfaceState.selectedTab].name} Client</span>
                        <sup className="mt-2 font-semibold text-lg text-slate-700">{interfaceState.clients[interfaceState.selectedTab].localVersion ? `v${interfaceState.clients[interfaceState.selectedTab].localVersion}` : ""}</sup>
                    </div>
                    <div className="w-48 h-12 flex font-bold items-center rounded-full shadow-lg bg-slate-700 text-slate-200 cursor-pointer hover:bg-blue-500 transition-all duration-300"><span className="w-full text-center uppercase">Changelog</span></div>
                </div>
                <div className="w-full mt-6 h-[2px] bg-slate-600 rounded-md" />
                <div className="flex flex-col space-y-6 mt-4 text-slate-500">
                    <p>{interfaceState.clients[interfaceState.selectedTab].description}</p>

                    {/*DEBUG <p className="mt-4">{require("util").inspect(interfaceState, 2, null)}</p> DEBUG*/}
                </div>
            </section>

            <div className="absolute left-0 bottom-12 w-full px-12 xl:px-36 2xl:px-64">
                <div className="w-full flex flex-col space-y-2 mt-12">
                    <span className="text-2xl">Version</span>
                    <div className="flex justify-between items-center">
                        <div className="flex flex-row space-x-4">
                            {interfaceState.clients[interfaceState.selectedTab].versions.map(version => (
                                <a onClick={() => interfaceState.clients[interfaceState.selectedTab].status == "waiting" && setInterfaceState({ ...interfaceState, clients: { ...interfaceState.clients, [interfaceState.selectedTab]: { ...interfaceState.clients[interfaceState.selectedTab], selectedVersion: version.id } } })} className={`border-4 shadow-lg rounded-xl h-14 w-36 flex items-center px-4 transition-all duration-200 ${interfaceState.clients[interfaceState.selectedTab].status == "waiting" ? interfaceState.clients[interfaceState.selectedTab].selectedVersion == version.id ? "border-blue-500 bg-blue-500 cursor-pointer" : "border-blue-500 hover:bg-blue-400 cursor-pointer" : "text-slate-600 border-slate-800 bg-slate-800"}`}>
                                    <div className="flex flex-col -space-y-1">
                                        <p className="text-sm font-semibold">{version.label}</p>
                                        <span className="text-lg tracking-widest">v{version.version}</span>
                                    </div>
                                </a>
                            ))}
                        </div>

                        <div className="flex">
                            <span onClick={() => {
                                setInterfaceState({ ...interfaceState, clients: { ...interfaceState.clients, [interfaceState.selectedTab]: { ...interfaceState.clients[interfaceState.selectedTab], status: interfaceState.clients[interfaceState.selectedTab].status == "waiting" ? "download" : interfaceState.clients[interfaceState.selectedTab].status != "disabled" ? "waiting" : "disabled" } } });
                            }} className={`flex flex-row items-center space-x-2 rounded-full py-2 px-4 border-2 font-semibold ${interfaceState.clients[interfaceState.selectedTab].status == "disabled" ? "" : interfaceState.clients[interfaceState.selectedTab].status == "waiting" ? "text-slate-800 bg-slate-200 hover:bg-slate-900 hover:text-slate-200 cursor-pointer" : ""} transition-all duration-200`}>
                                {["waiting", "disabled"].includes(interfaceState.clients[interfaceState.selectedTab].status) ? (
                                    <>
                                        {interfaceState.clients[interfaceState.selectedTab].selectedVersion != -1 ? (
                                            <>
                                                <span>Install {interfaceState.clients[interfaceState.selectedTab].name} Client ({interfaceState.clients[interfaceState.selectedTab].versions[interfaceState.clients[interfaceState.selectedTab].selectedVersion].label})</span>
                                                <HiOutlineDownload className="text-xl" />
                                            </>
                                        ) : (
                                            <>
                                                <span>Download Unavailable</span>
                                                <GiCancel className="text-xl" />
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-row items-center space-x-4">
                                            <p className="font-normal text-slate-500">Downloading <span className="font-semibold text-slate-200">{interfaceState.clients[interfaceState.selectedTab].versions[interfaceState.clients[interfaceState.selectedTab].selectedVersion].label}</span></p>
                                            <BarLoader width={128} color={"#3b82f6"} />
                                            <span className="font-light">0%</span>
                                        </div>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}