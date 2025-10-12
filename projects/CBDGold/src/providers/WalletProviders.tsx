import React from 'react';

// No-op wrapper for now; ready to host real wallet providers when needed.
// TestNet endpoints are already configured via VITE_ALGOD_* envs.
type Props = { children: React.ReactNode };
const WalletProviders: React.FC<Props> = ({ children }) => <>{children}</>;
export default WalletProviders;
