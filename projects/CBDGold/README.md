## Development

 Run dev server:

### Testing
### Environment & Security Configuration

Backend `.env` keys:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
ENABLE_SECURITY_HEADERS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_API_KEY=change_me_to_strong_random
HF_TOKEN=your_hf_token
HF_MODEL=your_model_name
HF_RATE_LIMIT_MAX=15
HF_TIMEOUT_MS=15000
```

Frontend `.env.local` keys:
```
VITE_API_URL=http://localhost:3001
VITE_TX_SIM_FAIL_RATE=0.1
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


Vitest is configured for unit testing.

Run the full test suite:

```bash
npm test
```

Watch mode during development:

```bash
npm run test:watch
```

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
5. Add environment variables as needed; at minimum set `VITE_API_URL` to the deployed backend URL (for example, `https://cbdgold-backend.onrender.com`).
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

### 3. Infrastructure as Code (Optional)

A starter `render.yaml` at `projects/CBDGold/render.yaml` defines both services so you can enable **Blueprint Deploys** in Render. Toggle the "Use Blueprint" option during service creation, and Render will keep the infrastructure in sync with the file.
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

# Tools

This project makes use of React and Tailwind to provider a base project configuration to develop frontends for your Algorand dApps and interactions with smart contracts. The following tools are in use:

- [AlgoKit Utils](https://github.com/algorandfoundation/algokit-utils-ts) - Various TypeScript utilities to simplify interactions with Algorand and AlgoKit.
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [use-wallet](https://github.com/txnlab/use-wallet) - A React hook for connecting to an Algorand wallet providers.
- [npm](https://www.npmjs.com/): Node.js package manager
It has also been configured to have a productive dev experience out of the box in [VS Code](https://code.visualstudio.com/), see the [.vscode](./.vscode) folder.
# Integrating with smart contracts and application clients

Refer to the detailed guidance on [integrating with smart contracts and application clients](./src/contracts/README.md). In essence, for any smart contract codebase generated with AlgoKit or other tools that produce compile contracts into ARC34 compliant app specifications, you can use the `algokit generate` command to generate TypeScript or Python typed client. Once generated simply drag and drop the generated client into `./src/contracts` and import it into your React components as you see fit.
