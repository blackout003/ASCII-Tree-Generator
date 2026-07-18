'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface RightSidebarContextValue {
  content: React.ReactNode | null;
  setContent: (content: React.ReactNode | null) => void;
}

const RightSidebarContext = createContext<RightSidebarContextValue>({
  content: null,
  setContent: () => {},
});

export function RightSidebarProvider({ children }: { children: React.ReactNode }) {
  const [content, setContentState] = useState<React.ReactNode | null>(null);

  const setContent = useCallback((newContent: React.ReactNode | null) => {
    setContentState(newContent);
  }, []);

  return (
    <RightSidebarContext.Provider value={{ content, setContent }}>
      {children}
    </RightSidebarContext.Provider>
  );
}

export function useRightSidebar() {
  return useContext(RightSidebarContext);
}
