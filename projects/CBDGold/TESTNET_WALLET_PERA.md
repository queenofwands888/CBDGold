# TestNet with Pera Wallet

This app is wired with Pera via @txnlab/use-wallet-react (v4). Default network is TestNet.

Quick steps:

1) Install Pera Wallet
   - Browser: Pera extension, switch Network to TestNet
   - Mobile: Pera mobile, enable TestNet in Settings

2) Connect
   - Click Connect in the Wallet panel. If multiple wallets are available, Pera is selected automatically.

3) Fund address
   - Use the Faucet button in Wallet panel, then Refresh Balance

4) Run signing test
   - In Testnet Tools, click "Send 0.1 Test ALGO to myself" and approve in Pera

Environment (optional):

- VITE_ALGOD_NETWORK=testnet
- VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
- VITE_ALGOD_PORT=443
- VITE_ALGOD_TOKEN=

Troubleshooting:

- If Connect does nothing: open the Pera extension popup and try again.
- If signing fails: ensure Pera is on TestNet and you have funds from the faucet.
- Mobile with WalletConnect: supported by use-wallet; this setup currently prefers the Pera desktop extension.
