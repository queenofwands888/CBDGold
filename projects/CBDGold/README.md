## Development

- Install dependencies:

```bash
npm install
npm run backend:install
```

- Regenerate Algorand contract clients when you update on-chain code:

```bash
npm run generate:app-clients
```

- Start the frontend (runs the generator automatically and launches Vite):

```bash
npm run dev
```

- Start the backend API for local testing:

```bash
npm run backend:dev
```

To run both services together use the convenience script:

```bash
npm run dev:full
```

The client generator now includes an automatic post-processing step (see `scripts/generate-app-clients.mjs`) that patches the generated files so bare-call transaction types only include supported `onComplete` values. This keeps TypeScript builds green even after regenerating clients from scratch.

### Testing

Vitest drives the unit/integration suite for both the frontend and lightweight backend utilities.

```bash
npm test
```

For watch mode during local development:

```bash
npm run test:watch
```

### Environment & Security Configuration

Backend `.env` keys:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
ENABLE_SECURITY_HEADERS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_API_KEY=change_me_to_strong_random
```
```

Frontend `.env.local` keys:
```
VITE_API_URL=http://localhost:3001
VITE_TX_SIM_FAIL_RATE=0.1

# Algorand connectivity (set to match LocalNet/TestNet/MainNet)
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=
VITE_ALGOD_TOKEN=
VITE_ALGOD_NETWORK=testnet

# Contract + ASA identifiers (all required for on-chain mode)
VITE_STAKING_APP_ID=
VITE_GOV_APP_ID=
VITE_PRIZE_APP_ID=
VITE_HEMP_ASA_ID=
VITE_WEED_ASA_ID=
VITE_USDC_ASA_ID=
```

Oracle / Pricing System:
- Tokens: ALGO, HEMP, WEED, USDC
- Poll interval: 10s (Dashboard tab only; can pause)
- History: last 90 points (≈15m)
- Delta alerts: ≥ ±2% with 30s per-token cooldown
- Fallback values if backend unreachable

Admin Security:
- All `/admin/*` endpoints now require header `x-admin-key: $ADMIN_API_KEY`.
- Replace the temporary API-key gate with wallet challenge/JWT before production.

### Transaction Simulation

Until real on-chain calls are integrated, UI actions use a simulator (`src/utils/txSimulator.ts`). You can control the default simulated failure rate via an environment variable:

```
VITE_TX_SIM_FAIL_RATE=0   # always succeed
VITE_TX_SIM_FAIL_RATE=0.1 # 10% failure (default)
```

Add this to a `.env.local` file for local development if desired.

## Deployment to Render

### 1. Frontend (Static Site)

1. Commit and push the latest code so Render can pull from GitHub.
2. In the Render dashboard, choose **New + → Static Site** and select this repository.
3. Set the **Root Directory** to `projects/CBDGold`.
4. Use the following build settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Add environment variables as needed:
   - `VITE_API_URL` pointing to the deployed backend URL (for example, `https://cbdgold-backend.onrender.com`).
   - `VITE_ALGOD_SERVER`, `VITE_ALGOD_NETWORK`, and the `VITE_*_APP_ID` / ASA variables for the network you plan to target.
   - `SKIP_CLIENT_GEN=1` if the build image does not provide the AlgoKit CLI (the generator will reuse the existing clients and still run the post-processing patch).
6. Click **Create Static Site**. Render will build and deploy automatically on future pushes.

### 2. Backend (Node Web Service)

1. From the Render dashboard, choose **New + → Web Service**.
2. Select the same repository, and set the **Root Directory** to `projects/CBDGold/backend`.
3. Configure the service with:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
4. Populate the required environment variables from `backend/.env.template` (API tokens, email credentials, Algorand indexer details, rate limits, etc.).
5. Set `FRONTEND_URL` to the static site URL Render gives you.
6. Create the service. Render will provision HTTPS automatically and redeploy on new commits.

### 3. Infrastructure as Code (Recommended)

A root-level `render.yaml` (located at the repository root) now defines both services. Enable **Blueprint Deploys** in Render and point the blueprint at `main` so Render uses the same build commands you run locally.

If you previously created Render services that expect a Dockerfile, delete or disable them after the blueprint deploy finishes—otherwise those Docker-based services will continue to fail builds. The blueprint-configured services run with the Node/Static buildpacks and automatically redeploy on new pushes.

## Milestones

- [2025-02-14 · Render Deploy Stability](./docs/milestones/2025-02-14-render-deploy-stability.md)
# CBDGold

This starter React project has been generated using AlgoKit. See below for default getting started instructions.

# Setup

### Initial Setup

#### 1. Clone the Repository
Start by cloning this repository to your local machine.

#### 2. Install Pre-requisites
Ensure the following pre-requisites are installed and properly configured:

- **npm**: Node package manager. Install from [Node.js Installation Guide](https://nodejs.org/en/download/). Verify with `npm -v` to see version `18.12`+.
- **AlgoKit CLI**: Essential for project setup and operations. Install the latest version from [AlgoKit CLI Installation Guide](https://github.com/algorandfoundation/algokit-cli#install). Verify installation with `algokit --version`, expecting `2.0.0` or later.

#### 3. Bootstrap Your Local Environment
Run the following commands within the project folder:

- **Install Project Dependencies**: With `algokit project bootstrap all`, ensure all dependencies are ready.

### Development Workflow

#### Terminal
Directly manage and interact with your project using AlgoKit commands:

1. **Build Contracts**: `algokit project run build` builds react web app and links with smart contracts in workspace, if any.
2. Remaining set of command for linting, testing and deployment can be found in respective [package.json](./package.json) file and [.algokit.toml](./.algokit.toml) files.

#### VS Code
For a seamless experience with breakpoint debugging and other features:

1. **Open Project**: In VS Code, open the repository root.
2. **Install Extensions**: Follow prompts to install recommended extensions.
3. **Debugging**:
   - Use `F5` to start debugging.
   - **Windows Users**: Select the Python interpreter at `./.venv/Scripts/python.exe` via `Ctrl/Cmd + Shift + P` > `Python: Select Interpreter` before the first run.

#### Other IDEs
While primarily optimized for VS Code, Jetbrains WebStorm has base support for this project:

1. **Open Project**: In your JetBrains IDE, open the repository root.
2. **Automatic Setup**: The IDE should configure the Python interpreter and virtual environment.
3. **Debugging**: Use `Shift+F10` or `Ctrl+R` to start debugging. Note: Windows users may encounter issues with pre-launch tasks due to a known bug. See [JetBrains forums](https://youtrack.jetbrains.com/issue/IDEA-277486/Shell-script-configuration-cannot-run-as-before-launch-task) for workarounds.

## AlgoKit Workspaces and Project Management
This project supports both standalone and monorepo setups through AlgoKit workspaces. Leverage [`algokit project run`](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/project/run.md) commands for efficient monorepo project orchestration and management across multiple projects within a workspace.

> Please note, by default frontend is pre configured to run against Algorand LocalNet. If you want to run against TestNet or MainNet, comment out the current environment variable and uncomment the relevant one in [`.env`](.env) file that is created after running bootstrap command and based on [`.env.template`](.env.template).

# Algorand Wallet integrations

The template comes with [`use-wallet`](https://github.com/txnlab/use-wallet) integration, which provides a React hook for connecting to an Algorand wallet providers. The following wallet providers are included by default:
- LocalNet:
- - [KMD/Local Wallet](https://github.com/TxnLab/use-wallet#kmd-algorand-key-management-daemon) - Algorand's Key Management Daemon (KMD) is a service that manages Algorand private keys and signs transactions. Works best with AlgoKit LocalNet and allows you to easily test and interact with your dApps locally.
- TestNet and others:
- - [Pera Wallet](https://perawallet.app).
- - [Defly Wallet](https://defly.app).
- - [Exodus Wallet](https://www.exodus.com).
- - [Daffi Wallet](https://www.daffi.me).

Refer to official [`use-wallet`](https://github.com/txnlab/use-wallet) documentation for detailed guidelines on how to integrate with other wallet providers (such as WalletConnect v2). Too see implementation details on the use wallet hook and initialization of extra wallet providers refer to [`App.tsx`](./src/App.tsx).

## Wallet testing checklist

1. **Populate Algod + contract env vars** – set `VITE_ALGOD_*`, `VITE_STAKING_APP_ID`, `VITE_GOV_APP_ID`, `VITE_PRIZE_APP_ID`, `VITE_HEMP_ASA_ID`, `VITE_WEED_ASA_ID`, and `VITE_USDC_ASA_ID` in `.env.local` (or deployment env). When all IDs are present the dApp switches to on-chain mode automatically.
2. **Start a network endpoint** – for LocalNet run `algokit localnet start` (or the "Start AlgoKit LocalNet" VS Code task); for TestNet/MainNet ensure the public endpoint you configured is reachable.
3. **Regenerate clients** – `npm run generate:app-clients` to pull the latest ARC-56 specs and auto-patch bare call typing.
4. **Launch services** – `npm run dev:full` starts both frontend and backend; open `http://localhost:5173`.
5. **Connect an Algorand wallet** – the UI checks `window.algorand`/`window.myAlgoConnect`. Use Pera/Defly browser extensions on TestNet/MainNet or the AlgoKit LocalNet wallet in development.
6. **Fund the address** – be sure the wallet holds the configured ASA IDs and enough ALGOs to cover transaction fees before staking, voting, or claiming prizes.
7. **Inspect transaction toasts** – every on-chain action surfaces the tx id (first 8 chars). Use the Explorer for your target network to verify groups and state changes.

# Tools

This project makes use of React and Tailwind to provider a base project configuration to develop frontends for your Algorand dApps and interactions with smart contracts. The following tools are in use:

- [AlgoKit Utils](https://github.com/algorandfoundation/algokit-utils-ts) - Various TypeScript utilities to simplify interactions with Algorand and AlgoKit.
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [use-wallet](https://github.com/txnlab/use-wallet) - A React hook for connecting to an Algorand wallet providers.
- [npm](https://www.npmjs.com/): Node.js package manager
It has also been configured to have a productive dev experience out of the box in [VS Code](https://code.visualstudio.com/), see the [.vscode](./.vscode) folder.
# Integrating with smart contracts and application clients

Refer to the detailed guidance on [integrating with smart contracts and application clients](./src/contracts/README.md). In essence, for any smart contract codebase generated with AlgoKit or other tools that produce compile contracts into ARC34 compliant app specifications, you can use the `algokit generate` command to generate TypeScript or Python typed client. Once generated simply drag and drop the generated client into `./src/contracts` and import it into your React components as you see fit.
