import React, { createContext, useContext } from 'react';
// Placeholder for wallet context
export const WalletContext = createContext<any>(null);
export const useWalletContext = () => useContext(WalletContext);
