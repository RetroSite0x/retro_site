import { useWindowsStore } from '../../store/useWindows';
import { Window } from './Window';

export function WindowManager() {
  const windows = useWindowsStore((s) => s.windows);

  return (
    <>
      {Object.values(windows).map((win) => (
        <Window key={win.id} win={win} />
      ))}
    </>
  );
}
