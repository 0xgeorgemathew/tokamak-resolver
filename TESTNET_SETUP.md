# Real Testnet Setup Guide

This repository has been adapted for demonstrating cross-chain atomic swaps on **real testnets** between Ethereum Sepolia and Monad Testnet.

## Quick Start

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your RPC URLs and private keys
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   forge install
   ```

3. **Fund Test Accounts**
   - Get Sepolia ETH from [faucets](https://sepoliafaucet.com/)
   - Contact deployer for SwapTokens on both networks
   - Ensure minimum 0.01 ETH and 100+ SwapTokens per account

4. **Run Demo**
   ```bash
   pnpm test
   ```

## Key Changes Made

### ✅ Configuration Updates
- **Environment Variables**: All private keys now loaded from `.env`
- **Network Settings**: Removed fork-only logic, added real testnet support
- **Contract Addresses**: Updated with deployed contracts from `deployments.json`

### ✅ Wallet Infrastructure
- **Real Testnet Support**: Removed `anvil_impersonateAccount` dependencies
- **Error Handling**: Added retry logic and exponential backoff
- **Balance Checks**: Pre-flight validation for gas and token balances

### ✅ Test Infrastructure  
- **Network Connectivity**: Automatic validation of RPC endpoints
- **Time Management**: Real time-locks (no manipulation on testnets)
- **Enhanced Logging**: Comprehensive demo output with status indicators
- **Timeout Handling**: 5-minute timeouts for real network conditions

### ✅ Documentation
- **Setup Instructions**: Detailed account and token requirements
- **Troubleshooting**: Common issues and solutions for testnet usage
- **Security Warnings**: Emphasis on testnet-only private keys

## Deployed Contracts

All contracts are already deployed and verified:

| Contract | Sepolia | Monad |
|----------|---------|-------|
| EscrowFactory | `0x8Ed600C53e66D12f9386DacB1cE6459791A99440` | `0x0Ea6256F056fc80332b72283c37BE36ACb0Fa086` |
| Resolver | `0x610545e27A8D90124E918B71bfdBB78860AC63ba` | `0x289612539f33D368A5eb50C72D6A3ac52177BE93` |
| SwapToken | `0x085619Cef93E5A6Cff7683558418424748880663` | `0x3A84567b87a039FFD5043949E0Ae119617746539` |

## Demo Features

The testnet demo showcases:

1. **Single Fill Swaps** - Complete atomic swaps with full order fulfillment
2. **Multiple Fill Support** - Partial fills using Merkle proof validation  
3. **Cancellation Flow** - Time-locked fund recovery mechanisms
4. **Real Network Timing** - Actual time-lock progression on testnets

## Security Considerations

- ✅ Testnet-only private keys with validation
- ✅ Balance and connectivity pre-flight checks
- ✅ Comprehensive error handling and retries
- ✅ Time-lock safety mechanisms maintained
- ✅ No hardcoded secrets or mainnet addresses

Ready for live testnet demonstrations! 🚀