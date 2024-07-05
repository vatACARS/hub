const { useEffect, useState } = require('react');
import cmp from 'semver-compare';

import Modal from '../comp/ui/Modal';

import BarLoader from 'react-spinners/BarLoader';
import { TbRefresh, TbCheck } from 'react-icons/tb';
import { VscChromeClose, VscDebugBreakpointLog } from 'react-icons/vsc';
import { MdDeleteOutline } from 'react-icons/md';
import { HiOutlineDownload } from 'react-icons/hi';
import { FaLink } from 'react-icons/fa6';
import PuffLoader from 'react-spinners/PuffLoader';

export default function Home() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateComplete, setUpdateComplete] = useState(false);

  const [serverFailedMessage, setServerFailedMessage] = useState('');

  const [warningShown, setWarningShown] = useState(false);

  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState({});
  const [clientFailMessage, setClientFailMessage] = useState('');
  const [clientStatus, setClientStatus] = useState('waiting');
  const [downloadStatus, setDownloadStatus] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [installedVersion, setInstalledVersion] = useState('');

  async function getAvailableClients() {
    let data = await fetch('https://api.vatacars.com/hub/clientInformation', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((resp) => resp.json())
      .catch(() => {
        setServerFailedMessage('Unable to contact the server.');
      });
    if (!data[0]) setServerFailedMessage('Unexpected response from the server.');

    if (data) setAvailableClients(data);

    setSelectedClient(data[0]);

    window.ipc.on('downloadPluginReply', (arg: { status: string; percent?: number }) => {
      if (arg.status == 'running') {
        setClientFailMessage('Close vatSys and try again.');
        return setClientStatus('waiting');
      }

      if (arg.status == 'downloading') {
        setDownloadStatus(arg.percent);
        return;
      }

      if (arg.status == 'installing') {
        setClientStatus('installing');
        return;
      }

      if (arg.status == 'done') {
        setClientStatus('done');
        setDownloadStatus(0);
        setInstalled(true);
        return;
      }

      if (arg.status == 'failed') {
        setClientFailMessage('Something went wrong, please try again.');
        setClientStatus('waiting');
        return;
      }
    });

    window.ipc.on('uninstallPluginReply', (arg: { status: string }) => {
      if (arg.status == 'running') {
        setClientFailMessage('Close vatSys and try again.');
        return setClientStatus('waiting');
      }

      if (arg.status == 'done') {
        setClientStatus('done');
        setDownloadStatus(0);
        setInstalled(false);
        return;
      }

      if (arg.status == 'failed') {
        setClientFailMessage('Something went wrong, please try again.');
        setClientStatus('waiting');
        return;
      }
    });
  }

  useEffect(() => {
    window.ipc.send('windowControl', 'unrestrictSize');

    window.ipc.on('updateAvailable', (_arg) => setUpdateAvailable(true));
    window.ipc.on('updateProgress', (arg: number) => setUpdateProgress(arg));
    window.ipc.on('updateComplete', (_arg) => setUpdateComplete(true));

    window.ipc.on('checkDownloadedPluginReply', (arg: { installed: boolean; version?: string }) => {
      setInstalledVersion(arg.version);
      setInstalled(arg.installed);
    });
    window.ipc.send('checkDownloadedPlugin', null);
  }, []);

  useEffect(() => {
    getAvailableClients();
  }, []);

  if (serverFailedMessage)
    return (
      <div className="h-full w-full flex flex-col space-y-4 items-center justify-center">
        <p className="font-semibold text-red-500 text-lg">{serverFailedMessage}</p>
        <span className="text-slate-400">
          Please email{' '}
          <a className="font-semibold hover:underline" href="mailto://contact@vatacars.com">
            contact@vatacars.com
          </a>{' '}
          for assistance.
        </span>
      </div>
    );

  if (!selectedClient)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <PuffLoader size={48} color={'#E2E8F0'} />
      </div>
    );

  return (
    <div className="h-full text-slate-300">
      {updateAvailable ? (
        <div
          id="toast-interactive"
          className="w-full shadow-2xl max-w-xs p-4 text-gray-500 rounded-lg shadow bg-slate-800 fixed top-12 right-5"
          role="alert"
        >
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
                      <a
                        onClick={() => window.ipc.send('restartApp', null)}
                        className="cursor-pointer inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-green-500 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
                      >
                        Restart Now
                      </a>
                    </div>
                    <div>
                      <a
                        onClick={() => setUpdateAvailable(false)}
                        className="cursor-pointer inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700"
                      >
                        Later
                      </a>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setUpdateAvailable(false)}
                  type="button"
                  className="ms-auto -mx-1.5 -my-1.5 bg-white items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                  data-dismiss-target="#toast-interactive"
                  aria-label="Close"
                >
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
                    <BarLoader width={192} color={'#3b82f6'} />
                  </div>
                ) : (
                  <>
                    <div className="ms-3 text-sm font-normal">
                      <span className="mb-1 text-sm font-semibold text-white">Hub update available</span>
                      <div className="mb-2 text-sm font-normal">A new software version is available for download.</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <a
                            onClick={() => {
                              setDownloadingUpdate(true);
                              window.ipc.send('installUpdate', null);
                            }}
                            className="cursor-pointer inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                          >
                            Update
                          </a>
                        </div>
                        <div>
                          <a
                            onClick={() => setUpdateAvailable(false)}
                            className="cursor-pointer inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700"
                          >
                            Next time
                          </a>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setUpdateAvailable(false)}
                      type="button"
                      className="ms-auto -mx-1.5 -my-1.5 bg-white items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                      data-dismiss-target="#toast-interactive"
                      aria-label="Close"
                    >
                      <span className="sr-only">Close</span>
                      <VscChromeClose className="text-xl" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}

      <div className="flex flex-row">
        <section className="w-64 shrink-0">
          <div className="flex flex-col flex-1">
            <nav
              className="flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-800 border-r-2 border-slate-600"
              style={{ height: 'calc(100vh - 2rem)' }}
            >
              <div className="text-lg font-semibold text-slate-200 p-4 border-b-2 border-slate-600 flex flex-col items-center">
                <img src="/img/vatacars-logo-dark.png" className="h-8" />
              </div>
              <div className="flex flex-col space-y-2">
                {availableClients.map((client) => (
                  <>
                    {client.latestVersion == '' ? (
                      <div className="relative text-slate-300 px-4 py-2 h-24">
                        <img
                          src={client.bgImageUrl}
                          alt="Background Image"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute transition-all duration-200 inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-700 opacity-90" />
                        <div className="flex flex-col relative opacity-50">
                          <span
                            className={`transition-all duration-200 font-bold text-shadow-lg ${selectedClient.name == client.name ? 'text-slate-200 text-xl' : 'text-blue-300 text-lg group-hover:text-slate-300 group-hover:text-xl'}`}
                          >
                            {client.name}
                          </span>
                          <span className="text-slate-200 opacity-70 text-sm font-semibold text-shadow-lg">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    ) : (
                      <a
                        onClick={() => {
                          if (clientStatus != 'download') setSelectedClient(client);
                        }}
                        className={`relative text-slate-300 px-4 py-2 h-24 ${selectedClient.name == client.name ? '' : 'cursor-pointer group'}`}
                      >
                        <img
                          src={client.bgImageUrl}
                          alt="Background Image"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div
                          className={`absolute transition-all duration-200 inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-700 ${selectedClient.name == client.name ? 'opacity-70' : 'opacity-50 group-hover:opacity-70'}`}
                        />
                        <div className="flex flex-col relative">
                          <span
                            className={`transition-all duration-200 font-bold text-shadow-lg ${selectedClient.name == client.name ? 'text-slate-200 text-xl' : 'text-blue-300 text-lg group-hover:text-slate-300 group-hover:text-xl'}`}
                          >
                            {client.name}
                          </span>
                          <span className="text-slate-200 opacity-70 text-sm font-semibold text-shadow-lg">
                            v{client.latestVersion}
                          </span>
                          {installed && cmp(installedVersion, client.latestVersion) == -1 ? (
                            <div className="flex mt-2 -mr-2 justify-end">
                              <div className="px-2 py-1 flex items-center justify-center rounded-full animate-pulse bg-green-700 shadow-lg flex flex-row space-x-2">
                                <span className="text-slate-200 text-xs font-semibold">Update Available</span>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </a>
                    )}
                  </>
                ))}
              </div>
              <div className="h-full flex flex-col justify-end">
                <div className="p-4 flex flex-col space-y-2">
                  <a
                    href="https://vatacars.com/"
                    target="_blank"
                    className="transition-all duration-200 text-sm flex flex-row space-x-2 items-center cursor-pointer hover:text-slate-400"
                  >
                    <FaLink />
                    <span>Visit our Website</span>
                  </a>
                  <a
                    href="https://status.vatacars.com/"
                    target="_blank"
                    className="transition-all duration-200 text-sm flex flex-row space-x-2 items-center cursor-pointer hover:text-slate-400"
                  >
                    <FaLink />
                    <span>Service Status</span>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </section>
        <section className="p-12 flex flex-col justify-between" style={{ height: 'calc(100vh - 2rem)' }}>
          <Modal title="Product Disclaimer" isOpen={warningShown} onClose={() => setWarningShown(false)}>
            <div className="mt-4 flex flex-col space-y-2 text-justify">
              <span className="text-sm">
                VatACARS is currently available in a prerelease state for public use. Please note that it may not be
                stable or work as expected. By continuing, you acknowledge that you understand the risks associated with
                using this software.
              </span>
            </div>
            <div className="flex flex-row justify-end mt-4">
              <button
                onClick={() => {
                  setWarningShown(false);
                  setClientStatus('download');
                  setClientFailMessage('');
                  window.ipc.send('downloadPlugin', {
                    downloadUrl: selectedClient.downloadUrl,
                    client: selectedClient.name,
                    version: selectedClient.availableDownloads[selectedClient.selectedDownload].version,
                  });
                }}
                className="px-2 py-1 bg-blue-500 text-white font-semibold text-sm rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                Acknowledge
              </button>
            </div>
          </Modal>
          <div>
            <div className="flex flex-row space-x-2 border-b-2 border-slate-700">
              <h1 className="text-3xl font-semibold text-slate-200">{selectedClient.name}</h1>
              {/*<p className="rounded-full bg-blue-300 px-3 -py-1 mt-2 font-semibold tracking-wide text-lg text-slate-900">v{selectedClient.latestVersion}</p>*/}
            </div>
            <section className="py-3">
              <h2 className="mt-4 font-semibold tracking-wide text-xl text-slate-200 mb-2">Description</h2>
              <p className="text-[15px] text-slate-500 text-justify">{selectedClient.description}</p>
            </section>
            <section className="py-3">
              <h2 className="font-semibold tracking-wide text-xl text-slate-200 mb-2">Changelog</h2>
              {selectedClient.latestChangelog &&
                selectedClient.latestChangelog.map((log) => (
                  <div className="flex flex-col space-y-2 px-6">
                    {log.logType == 1 ? (
                      <div className="flex flex-row items-center space-x-2">
                        <TbCheck className="text-xl text-green-400" />
                        <span className="text-slate-300">{log.label}</span>
                      </div>
                    ) : log.logType == 2 ? (
                      <div className="flex flex-row items-center space-x-2">
                        <VscChromeClose className="text-xl text-red-400" />
                        <span className="text-slate-300">{log.label}</span>
                      </div>
                    ) : (
                      <div className="flex flex-row items-center space-x-2">
                        <VscDebugBreakpointLog className="text-xl text-blue-400" />
                        <span className="text-slate-300">{log.label}</span>
                      </div>
                    )}
                  </div>
                ))}
            </section>
          </div>
          <div className="w-full flex flex-col space-y-2 mt-12">
            {!installed ? (
              <>
                <span className="font-semibold tracking-wide text-xl text-slate-200">Version</span>
                <div className="flex justify-between items-center">
                  <div className="flex flex-row space-x-4">
                    {selectedClient.availableDownloads &&
                      selectedClient.availableDownloads.map((version, index) => (
                        <div
                          onClick={() =>
                            clientStatus != 'download' &&
                            setSelectedClient({ ...selectedClient, selectedDownload: index })
                          }
                          className={`border-4 shadow-lg rounded-xl h-14 w-36 flex items-center px-4 transition-all duration-200 ${clientStatus != 'download' ? (selectedClient.selectedDownload == index ? 'border-blue-500 bg-blue-500 cursor-pointer' : 'border-blue-500 hover:bg-blue-400 cursor-pointer') : 'bg-slate-700 opacity-50'}`}
                        >
                          <div className="flex flex-col -space-y-1">
                            <p className="text-sm font-semibold">{version.label}</p>
                            <span className="text-lg tracking-widest">v{version.version}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="flex flex-row items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <span
                        onClick={() => {
                          if (
                            selectedClient.selectedDownload == -1 ||
                            ['download', 'installing'].includes(clientStatus)
                          )
                            return;
                          return setWarningShown(true);
                        }}
                        className={`flex flex-row items-center space-x-4 rounded-full py-2 px-4 border-2 text-sm font-semibold ${['download', 'installing'].includes(clientStatus) ? 'text-slate-600 border-slate-800 bg-slate-800' : 'text-slate-200 border-blue-500 bg-blue-500 hover:bg-blue-400 hover:text-slate-200 cursor-pointer'} transition-all duration-200`}
                      >
                        {clientStatus == 'download' ? (
                          <>
                            <p className="font-normal text-slate-500">
                              Downloading{' '}
                              <span className="font-semibold text-slate-200">
                                {selectedClient.availableDownloads[selectedClient.selectedDownload].label}
                              </span>
                            </p>
                            <BarLoader width={128} color={'#3b82f6'} />
                            <span className="font-light">{downloadStatus}%</span>
                          </>
                        ) : clientStatus == 'installing' ? (
                          <>
                            <p className="font-normal text-slate-500">
                              Installing{' '}
                              <span className="font-semibold text-slate-200">
                                {selectedClient.availableDownloads
                                  ? selectedClient.availableDownloads[selectedClient.selectedDownload].label
                                  : '...'}
                              </span>
                            </p>
                            <BarLoader width={128} color={'#3b82f6'} />
                          </>
                        ) : (
                          <>
                            <span>
                              Install {selectedClient.name} (
                              {selectedClient.availableDownloads
                                ? selectedClient.availableDownloads[selectedClient.selectedDownload].label
                                : '...'}
                              )
                            </span>
                            <HiOutlineDownload className="text-xl" />
                          </>
                        )}
                      </span>
                      <span className="text-sm text-red-500">{clientFailMessage}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg text-green-400">Installed</span>
                    <span className="text-slate-400">
                      {selectedClient.name} v{installedVersion}
                    </span>
                  </div>

                  <div className="flex flex-row items-center space-x-4">
                    <div className="flex flex-col items-center">
                      {installedVersion &&
                      selectedClient.latestVersion &&
                      cmp(installedVersion, selectedClient.latestVersion) == -1 ? (
                        <span
                          onClick={() => {
                            if (
                              selectedClient.selectedDownload == -1 ||
                              ['download', 'installing'].includes(clientStatus)
                            )
                              return;
                            setClientStatus('download');
                            setClientFailMessage('');
                            return window.ipc.send('downloadPlugin', {
                              downloadUrl: selectedClient.downloadUrl,
                              client: selectedClient.name,
                              version: selectedClient.availableDownloads[selectedClient.selectedDownload].version,
                            });
                          }}
                          className={`flex flex-row items-center rounded-full py-2 px-4 border-2 text-sm font-semibold ${['download', 'installing'].includes(clientStatus) ? 'space-x-4 text-slate-600 border-slate-800 bg-slate-800' : 'space-x-2 text-slate-200 border-blue-500 bg-slate-700 hover:bg-blue-400 hover:text-slate-200 cursor-pointer'} transition-all duration-200`}
                        >
                          {clientStatus == 'download' ? (
                            <>
                              <p className="font-normal text-slate-500">
                                Downloading{' '}
                                <span className="font-semibold text-slate-200">
                                  {selectedClient.availableDownloads[selectedClient.selectedDownload].label}
                                </span>
                              </p>
                              <BarLoader width={128} color={'#3b82f6'} />
                              <span className="font-light">{downloadStatus}%</span>
                            </>
                          ) : clientStatus == 'installing' ? (
                            <>
                              <p className="font-normal text-slate-500">
                                Installing{' '}
                                <span className="font-semibold text-slate-200">
                                  {selectedClient.availableDownloads
                                    ? selectedClient.availableDownloads[selectedClient.selectedDownload].label
                                    : '...'}
                                </span>
                              </p>
                              <BarLoader width={128} color={'#3b82f6'} />
                            </>
                          ) : (
                            <>
                              <span>
                                Update {selectedClient.name} (
                                {selectedClient.availableDownloads
                                  ? selectedClient.availableDownloads[selectedClient.selectedDownload].label
                                  : '...'}
                                )
                              </span>
                              <HiOutlineDownload className="text-xl" />
                            </>
                          )}
                        </span>
                      ) : (
                        <span
                          onClick={() => {
                            if (selectedClient.selectedDownload == -1 || ['uninstalling'].includes(clientStatus))
                              return;
                            setClientStatus('uninstalling');
                            return window.ipc.send('uninstallPlugin', {
                              client: selectedClient.name,
                              version: selectedClient.availableDownloads[selectedClient.selectedDownload].version,
                            });
                          }}
                          className={`flex flex-row items-center rounded-full py-2 px-4 border-2 text-sm font-semibold ${['uninstalling'].includes(clientStatus) ? 'space-x-4 text-slate-600 border-slate-800 bg-slate-800' : 'space-x-2 text-slate-200 border-red-500 bg-slate-700 hover:bg-red-400 hover:text-slate-200 cursor-pointer'} transition-all duration-200`}
                        >
                          {clientStatus == 'uninstalling' ? (
                            <>
                              <p className="font-normal text-slate-500">
                                Uninstalling{' '}
                                <span className="font-semibold text-slate-200">
                                  {selectedClient.availableDownloads
                                    ? selectedClient.availableDownloads[selectedClient.selectedDownload].label
                                    : '...'}
                                </span>
                              </p>
                              <BarLoader width={128} color={'#3b82f6'} />
                            </>
                          ) : (
                            <>
                              <span>
                                Uninstall {selectedClient.name} (
                                {selectedClient.availableDownloads
                                  ? selectedClient.availableDownloads[selectedClient.selectedDownload].label
                                  : '...'}
                                )
                              </span>
                              <MdDeleteOutline className="text-xl" />
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-red-500">{clientFailMessage}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
