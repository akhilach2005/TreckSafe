/**
 * TrailSafe — Safety Result Context
 *
 * Provides a lightweight in-memory store for the most recent safety assessment.
 * Used to pass data from Start Screen → Result Screen without serializing
 * the full JSON into URL query parameters.
 *
 * Scope: single app session. Data is NOT persisted to disk.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { SafetyResult } from '../services/apiService';

interface SafetyResultContextType {
  result:    SafetyResult | null;
  setResult: (result: SafetyResult | null) => void;
}

const SafetyResultContext = createContext<SafetyResultContextType>({
  result:    null,
  setResult: () => {},
});

/**
 * Wrap your root layout with this provider.
 */
export function SafetyResultProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<SafetyResult | null>(null);

  return (
    <SafetyResultContext.Provider value={{ result, setResult }}>
      {children}
    </SafetyResultContext.Provider>
  );
}

/**
 * Hook to access the shared safety result from any screen.
 */
export function useSafetyResult(): SafetyResultContextType {
  return useContext(SafetyResultContext);
}
