import { createContext, useContext, useMemo, useRef } from 'react';

interface ModalRequestCloseRegistry {
  registerRequestCloseHandler: (handler: () => void) => () => void;
  requestClose: () => boolean;
}

export const ModalRequestCloseContext = createContext<ModalRequestCloseRegistry | null>(null);

export function useModalRequestCloseContext(): ModalRequestCloseRegistry | null {
  return useContext(ModalRequestCloseContext);
}

export function useModalRequestCloseRegistry(): ModalRequestCloseRegistry {
  const handlersRef = useRef<Array<{ id: number; handler: () => void }>>([]);
  const nextIdRef = useRef(0);

  return useMemo(
    () => ({
      registerRequestCloseHandler: (handler: () => void) => {
        const id = nextIdRef.current++;
        handlersRef.current.push({ id, handler });
        return () => {
          handlersRef.current = handlersRef.current.filter((item) => item.id !== id);
        };
      },
      requestClose: () => {
        const latestHandler = handlersRef.current[handlersRef.current.length - 1];
        if (!latestHandler) return false;
        latestHandler.handler();
        return true;
      },
    }),
    [],
  );
}
