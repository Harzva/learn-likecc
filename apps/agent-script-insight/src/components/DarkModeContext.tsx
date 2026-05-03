import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface DarkModeContextType {
  isDark: boolean;
  toggle: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggle: () => {},
});

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}
