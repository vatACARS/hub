import { useEffect } from 'react';
import { useRouter } from 'next/router';

import Loader from '../comp/meta/Loader';

export default function ServiceIndex() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => window.ipc.send('openApp', null), 5000);
  }, [router]);

  return <Loader label="Loading the hub..." />;
}
