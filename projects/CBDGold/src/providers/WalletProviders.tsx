import React, { useMemo } from 'react';
import { WalletProvider, WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';

// Host the official use-wallet-react provider with Pera enabled on TestNet
type Props = { children: React.ReactNode };
const WalletProviders: React.FC<Props> = ({ children }) => {
	const manager = useMemo(() => {
		const network = (import.meta.env.VITE_ALGOD_NETWORK as string)?.toLowerCase() || NetworkId.TESTNET;
		const wcProjectId = (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string) || '';

			const wallets: any[] = [WalletId.PERA];
			if (wcProjectId) {
				wallets.push({ id: WalletId.WALLETCONNECT, options: { projectId: wcProjectId, chainId: network === 'testnet' ? 416001 : 416002 } });
			}
			return new WalletManager({
				wallets,
				defaultNetwork: network
			});
	}, []);

	return <WalletProvider manager={manager}>{children}</WalletProvider>;
};

export default WalletProviders;
