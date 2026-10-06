import { useEffect, useState } from 'react';

const MODAL_EXIT_DURATION_MS = 180;

/** Keep a controlled modal mounted briefly so its exit animation can finish. */
export const useModalPresence = (isOpen: boolean) => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsExiting(false);
      return;
    }

    if (!isMounted) return;
    setIsExiting(true);
    const timeout = window.setTimeout(() => {
      setIsMounted(false);
      setIsExiting(false);
    }, MODAL_EXIT_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [isOpen, isMounted]);

  return { isMounted, isExiting };
};
