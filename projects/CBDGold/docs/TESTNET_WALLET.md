# Testing Wallet on Algorand TestNet

This app is wired to TestNet via Algonode endpoints and the use-wallet provider:

- VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
- VITE_ALGOD_NETWORK=testnet
- Wallet providers: Pera, Defly, Exodus, Daffi

## Steps
1) Start the dev server and open the app.
2) Click Connect in the Wallet panel and choose your wallet (Pera/Defly/etc.) with TestNet selected.
3) Use the "Receive Test ALGO" helper in the Wallet panel:
   - Click "Open TestNet Faucet" to fund your address.
   - After funding, click "Refresh Balance" to update ALGO in the UI.

Tip: You can also view your address on testnet explorer: https://lora.algokit.io/testnet/account/<your-address>
