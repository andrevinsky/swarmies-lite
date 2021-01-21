import NoSleep from 'nosleep.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { safelyExecuteAsync } from 'swarmies-lite-shared';

export const useNoSleepDirect = () => {
  const noSleep = useMemo(() => new NoSleep(), []);
  const [ isEnabled, setIsEnabled ] = useState(noSleep.isEnabled);

  const toggle = useCallback(async () => {
    setIsEnabled(noSleep.isEnabled);
    void await safelyExecuteAsync(noSleep[ noSleep.isEnabled ? 'disable' : 'enable' ]());
    setIsEnabled(noSleep.isEnabled);
  }, [ noSleep ]);

  useEffect(() => {
    return () => noSleep.disable();
  }, [ noSleep ]);

  return [ isEnabled, toggle ];
};
