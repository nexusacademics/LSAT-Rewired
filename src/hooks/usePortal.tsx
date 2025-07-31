// hooks/usePortal.tsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const usePortal = (id: string = 'modal-root') => {
  const rootElemRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Look for existing portal root
    const existingParent = document.getElementById(id);
    const parentElem = existingParent || createRootElement(id);

    // Add the detached element to the parent
    if (!existingParent) {
      addRootElement(parentElem);
    }

    // Add the portal root to ref
    rootElemRef.current = parentElem;

    return () => {
      // Clean up when component unmounts
      if (rootElemRef.current && rootElemRef.current.parentNode) {
        rootElemRef.current.parentNode.removeChild(rootElemRef.current);
      }
    };
  }, [id]);

  const createRootElement = (id: string) => {
    const rootContainer = document.createElement('div');
    rootContainer.setAttribute('id', id);
    return rootContainer;
  };

  const addRootElement = (rootElem: HTMLElement) => {
    document.body.appendChild(rootElem);
  };

  const Portal = ({ children }: { children: React.ReactNode }) => {
    if (rootElemRef.current) {
      return createPortal(children, rootElemRef.current);
    }
    return null;
  };

  return Portal;
};