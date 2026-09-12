import { useEffect } from 'react';
import { useWindowsStore } from '../../store/useWindows';
import { Window } from './Window';

export function WindowManager() {
  const windows = useWindowsStore((s) => s.windows);

  useEffect(() => {
    const onResize = () => useWindowsStore.getState().reflowMaximized();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      {Object.values(windows).map((win) => (
        <Window key={win.id} win={win} />
      ))}
    </>
  );
}
