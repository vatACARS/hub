import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import PuffLoader from 'react-spinners/PuffLoader';

export default function HomePage() {
  const router = useRouter();
  const labels = ['Language Select', 'Welcome', 'Hang tight, nearly done...'];
  const [state, setState] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.ipc.on('storeInteractionReply', (arg: { setting: string; property: any }) => {
      if (arg.setting == 'consentProvided') {
        if (arg.property) return setTimeout(() => router.push('/home'), 1000);
        setReady(true);
      }
    });

    window.ipc.send('storeInteraction', {
      action: 'get',
      setting: 'consentProvided',
    });
  }, []);

  useEffect(() => {
    if (state == 2) {
      window.ipc.send('storeInteraction', {
        action: 'set',
        setting: 'consentProvided',
        property: 'true',
      });
      setTimeout(() => router.push('/home'), 3000);
    }
  }, [state]);

  function progress() {
    setState(state + 1);
  }

  return (
    <>
      {ready ? (
        <div className="px-12 py-6 h-full text-slate-300">
          {/*<section>
            <div className="w-full h-8">
              <div className="mx-auto h-full rounded-sm shadow-lg flex items-center w-2/3 bg-slate-200 text-slate-800">
                <span className="bg-blue-500 px-6 rounded-l-sm h-full text-xs flex items-center font-semibold uppercase text-slate-200">Announcement</span>
                <span className="px-4 w-full text-center text-sm">vatACARS v1.0.0 has been released! Download it below.</span>
              </div>
            </div>
        </section>*/}

          <section className="w-full px-12 pt-12">
            <div className="-ml-[60px] flex flex-row space-x-2 items-center">
              <div className="relative w-12 h-12">
                <Image src="/img/vatacars-logo-sm-dark.png" alt="vatACARS Logo" layout="fill" objectFit="contain" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-xs text-slate-500 font-semibold">vatACARS Hub</span>
                <span className="text-4xl tracking-wide">{labels[state]}</span>
              </div>
            </div>
            <div className="w-full mt-8 h-[2px] bg-slate-600 rounded-md" />
            {state == 0 && <></>}
            {state == 1 && (
              <div className="flex flex-col space-y-6 mt-4 text-slate-500 text-sm">
                <span id="internet">You will need to be connected to the internet to utilise this software.</span>
                <span id="subjectTo">
                  This software is subject to the following policies and terms, including transfer of your data to
                  countries that may have different levels of privacy protection than your own:
                </span>
                <div className="flex flex-col">
                  <p id="privacy">
                    Terms and Conditions, available at{' '}
                    <a href="https://vatacars.com/terms" target="_blank" className="text-blue-500">
                      www.vatacars.com/terms
                    </a>
                  </p>
                  <p id="privacy">
                    and Privacy Policy, available at{' '}
                    <a href="https://vatacars.com/privacy" target="_blank" className="text-blue-500">
                      www.vatacars.com/privacy
                    </a>
                  </p>
                </div>
              </div>
            )}
          </section>
          <div className="absolute left-0 bottom-24 w-full px-24">
            <div className="w-full flex flex-row justify-end mt-12">
              <a
                onClick={() => state < 2 && progress()}
                className="rounded-full shadow-lg h-10 items-center px-6 py-2 uppercase font-bold cursor-pointer bg-slate-200 text-slate-900 hover:bg-blue-500 transition-all duration-200"
              >
                {state < 2 ? 'Continue' : <PuffLoader size={24} />}
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <PuffLoader size={48} color={'#E2E8F0'} />
        </div>
      )}
    </>
  );
}
