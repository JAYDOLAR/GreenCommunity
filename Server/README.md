# Server

## Blockchain Integration
Environment variables required:
```
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
MARKETPLACE_CONTRACT_ADDRESS=0xYourMarketplaceAddress
CERTIFICATE_CONTRACT_ADDRESS=0xYourCertificateAddress
MARKETPLACE_SIGNER_KEY=0xAdminDeployerPrivateKey (DO NOT COMMIT)
```

## Services Added
- `services/blockchain.service.js` provides helper functions to interact with the on-chain marketplace & certificate NFT.
- `services/localIpfs.service.js` provides helper functions to add JSON / files to a locally running IPFS daemon.

## Local IPFS (Development)
The server can store project documents on a local IPFS node you run yourself.

### 1. Install IPFS (go-ipfs) on Windows
1. Download latest release: https://dist.ipfs.tech/#go-ipfs
2. Extract the archive.
3. (Optional) Add the extracted folder containing `ipfs.exe` to your PATH.

### 2. Initialize & Run Daemon
```
ipfs init
ipfs daemon
```
You should see it listening on: 127.0.0.1:5001 (API) and 8080 (Gateway) by default.

### 3. (Optional) Enable CORS for local development (if you access API from browser)
```
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
ipfs daemon
```

### 4. Environment Variable (optional override)
Create / update `.env` in `Server/`:
```
IPFS_API_URL=http://127.0.0.1:5001/api/v0
```
If omitted, this is the default.

### 5. Verify From Project
With the daemon running:
```
pnpm run ipfs:check (or npm run ipfs:check / yarn ipfs:check)
```
You can also hit the admin route (requires admin auth):
`GET /api/admin/ipfs/health` -> returns version/id.

### 6. Document Upload Flow
Front-end (admin add project page) sends files to `/api/admin/projects/upload-doc`.
The server streams file bytes to the local IPFS node and returns `{ cid, uri }`.
Persist CIDs with your project as needed.

### 7. Retrieving Files
Use a public gateway or your local one:
`http://127.0.0.1:8080/ipfs/<cid>`
or any public gateway: `https://ipfs.io/ipfs/<cid>`.

### Troubleshooting
| Symptom | Fix |
|---------|-----|
| `IPFS client not available` | Ensure daemon running & port 5001 reachable. |
| ECONNREFUSED | Port blocked or different API URL; set `IPFS_API_URL`. |
| CORS errors in browser tools | Apply CORS config above and restart daemon. |

### Security Note
Local dev node is NOT for production. For production use a pinning service (Pinata, web3.storage) or run a production-grade cluster.

## Flows
1. Admin verifies project off-chain -> call registerProjectOnChain -> persist returned projectId & blockchain fields in `Project` document.
2. User connects wallet (front-end) -> buys credits with crypto (calls contract directly) or pays fiat -> server calls `grantFiatPurchase` then updates soldCredits in DB.
3. Retirement -> user or auto-retire issues NFT certificate.

## TODO
- Secure endpoint auth for admin-only blockchain write actions.
- Front-end wallet connect and purchase UI.
- Background sync of soldCredits via periodic `projects(projectId)` calls or event listener.
