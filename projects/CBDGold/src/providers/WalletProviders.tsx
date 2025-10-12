import React, { useMemo } from 'react';
import { WalletProvider, WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';

// Host the official use-wallet-react provider with Pera enabled on TestNet
type Props = { children: React.ReactNode };
const WalletProviders: React.FC<Props> = ({ children }) => {
	const manager = useMemo(() => {
		const network = (import.meta.env.VITE_ALGOD_NETWORK as string) || NetworkId.TESTNET;
		const baseServer = (import.meta.env.VITE_ALGOD_SERVER as string) || 'https://testnet-api.algonode.cloud';
		const port = (import.meta.env.VITE_ALGOD_PORT as string) || '443';
		const token = (import.meta.env.VITE_ALGOD_TOKEN as string) || '';

		return new WalletManager({
			wallets: [WalletId.PERA],
			defaultNetwork: network,
			networks: {
				[network]: {
					algod: { baseServer, port, token }
				}
			},
			options: { debug: false, resetNetwork: false }
		});
	}, []);

	return <WalletProvider manager={manager}>{children}</WalletProvider>;
};

export default WalletProviders;
