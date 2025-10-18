import React, { useMemo } from 'react';
import { WalletProvider, WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';
import type { SupportedWallet } from '@txnlab/use-wallet';
// Ensure WalletConnect dependencies are bundled
import '@walletconnect/sign-client';

// Host the official use-wallet-react provider with Pera enabled on TestNet
type Props = { children: React.ReactNode };
const WalletProviders: React.FC<Props> = ({ children }) => {
	const manager = useMemo(() => {
		const rawNetwork = (import.meta.env.VITE_ALGOD_NETWORK as string)?.toLowerCase();
		const defaultNetwork = (Object.values(NetworkId) as string[]).includes(rawNetwork ?? '')
			? (rawNetwork as NetworkId)
			: NetworkId.TESTNET;
		const wcProjectId = (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string) || '';
		const wallets: SupportedWallet[] = [WalletId.PERA];
		if (wcProjectId) {
			const metadata = {
				name: 'CBD Gold ShopFi',
				description: 'CBD Gold rewards commerce experiences on Algorand.',
				url: typeof window !== 'undefined' ? window.location.origin : 'https://cbdgold.life',
				icons: ['https://cbdgold.life/favicon.ico']
			};
			wallets.push({
				id: WalletId.WALLETCONNECT,
				options: {
					projectId: wcProjectId,
					relayUrl: 'wss://relay.walletconnect.com',
					metadata,
					themeMode: 'dark'
				}
			});
		}
		return new WalletManager({
			wallets,
			defaultNetwork
		});
	}, []);

	return <WalletProvider manager={manager}>{children}</WalletProvider>;
};

export default WalletProviders;
