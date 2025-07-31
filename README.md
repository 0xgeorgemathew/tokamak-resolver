# Tokamak Cross-Chain Atomic Swap Demo

A cross-chain atomic swap implementation demonstrating secure token swaps between Ethereum Sepolia and Monad testnets using the Tokamak protocol.

## Overview

This demo showcases cross-chain atomic swaps using:
- **Source Chain**: Ethereum Sepolia (Chain ID: 11155111)
- **Destination Chain**: Monad Testnet (Chain ID: 10143)
- **Protocol**: Hash-time-locked contracts (HTLCs) with Limit Order Protocol
- **Tokens**: SwapToken deployed on both networks

## Prerequisites

1. **Node.js**: Version 22 or higher
2. **Foundry**: For contract compilation  
3. **Testnet RPC Access**: Working RPC URLs for Sepolia and Monad testnets
4. **Testnet Accounts**: Private keys with sufficient balances (see setup instructions)
5. **Native Tokens**: Sepolia ETH and Monad native tokens for gas fees
6. **SwapTokens**: Demo tokens deployed on both networks for swapping

## Installation

Install dependencies:

```shell
pnpm install
```

Install [Foundry](https://book.getfoundry.sh/getting-started/installation):

```shell
curl -L https://foundry.paradigm.xyz | bash
```

Install contract dependencies:

```shell
forge install
```

## Configuration

### Environment Setup

1. Copy the environment example:
```shell
cp .env.example .env
```

2. **Update `.env` with your configuration:**

```env
# REQUIRED: Testnet RPC URLs
SRC_CHAIN_RPC=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
DST_CHAIN_RPC=https://testnet1.monad.xyz

# REQUIRED: Private Keys (TESTNET-ONLY!)
USER_PRIVATE_KEY=0x[YOUR_USER_PRIVATE_KEY]
RESOLVER_PRIVATE_KEY=0x[YOUR_RESOLVER_PRIVATE_KEY]  
DEPLOYER_PRIVATE_KEY=0x[YOUR_DEPLOYER_PRIVATE_KEY]

# Set to false for real testnet usage
SRC_CHAIN_CREATE_FORK=false
DST_CHAIN_CREATE_FORK=false
```

⚠️ **Security Warning**: Never use mainnet private keys. Generate new keys specifically for testnet usage.

### Account Setup

Before running the demo, ensure your accounts have sufficient balances:

#### 1. User Account (initiates swaps)
- **Address**: Derived from `USER_PRIVATE_KEY`
- **Sepolia ETH**: Minimum 0.01 ETH for gas fees
- **SwapTokens on Sepolia**: Minimum 100 tokens for demonstrations
- **Get Sepolia ETH**: [Sepolia Faucet](https://sepoliafaucet.com/) or [Alchemy Faucet](https://sepoliafaucet.com/)

#### 2. Resolver Account (executes swaps)  
- **Address**: Derived from `RESOLVER_PRIVATE_KEY`
- **Sepolia ETH**: Minimum 0.01 ETH for gas fees
- **Monad Native**: Minimum 0.01 tokens for gas fees
- **SwapTokens on Monad**: Minimum 200 tokens for demonstrations

#### 3. Getting SwapTokens

The demo uses custom ERC-20 tokens deployed on both networks:

- **Sepolia SwapToken**: `0x085619Cef93E5A6Cff7683558418424748880663`
- **Monad SwapToken**: `0x3A84567b87a039FFD5043949E0Ae119617746539`

Contact the deployer or use faucet functions to obtain test tokens.

### Deployed Contracts

The demo uses pre-deployed contracts on both testnets:

#### Ethereum Sepolia (11155111)
- **EscrowFactory**: `0x9e2Fb5498f3c52b0c8EC2aA4E1B5D234C99b6B67`
- **Resolver**: `0x3E8769f963e5E1671f4F1845aeB6Efd4343AEA16`
- **SwapToken**: `0x085619Cef93E5A6Cff7683558418424748880663`
- **Limit Order Protocol**: `0xc4C35f0511950a9E4E8674BB4ec74B61d55137C1`

#### Monad Testnet (10143)
- **EscrowFactory**: `0xe02F5B45E3B29Dac9a1B6aFeA99FF1377Cdd673E`
- **Resolver**: `0xc0013D26d4F9d25AfB9004f37cba09af68Eb1315`
- **SwapToken**: `0x3A84567b87a039FFD5043949E0Ae119617746539`
- **Limit Order Protocol**: `0xb5aA32B29CBf8aC76e804E230EF3200d17eF099f`

## Running the Demo

### Pre-flight Checks

Before running tests, the system will automatically validate:
- ✅ Network connectivity to both Sepolia and Monad
- ✅ Sufficient native token balances for gas fees  
- ⚠️ SwapToken balances (warnings if insufficient)

### Execute Cross-Chain Swap Demo

```shell
pnpm test
```

### Demo Scenarios

The demo showcases four cross-chain swap scenarios:

1. **Single Fill Swap** (100 SwapTokens)
   - Complete atomic swap from Sepolia to Monad
   - Demonstrates basic cross-chain functionality
   - ~2-3 minutes on real testnets

2. **Multiple Fill (100%)**
   - Demonstrates partial fill capability with Merkle proofs
   - Uses 11 secrets for maximum flexibility
   - Completes entire order through partial fills

3. **Multiple Fill (50%)**
   - Shows partial order completion
   - Only fills 50% of total order amount
   - Demonstrates precise amount control

4. **Cancellation Flow**
   - Shows how failed swaps can be cancelled
   - Demonstrates fund recovery mechanisms
   - Tests time-lock progression and safety measures

### Expected Output

Successful runs will show:
```
✅ Connected to Sepolia (block XXXXX) and Monad (block XXXXX)
✅ Sufficient balances - User: XXX ETH, Resolver: XXX native
🚀 Setup complete - ready for cross-chain swap demo!

[11155111] Filling order 0x...
[11155111] Order 0x... filled for 100000000000000000000 in tx 0x...
[10143] Depositing 99000000000000000000 for order 0x...
[10143] Created dst deposit for order 0x... in tx 0x...
⏳ Waiting 11 seconds for time-lock progression...
[10143] Withdrawing funds for user from 0x...
[11155111] Withdrawing funds for resolver from 0x...
```

## Test Accounts

The demo uses standard test accounts:

```
Deployer:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
User:      0x70997970C51812dc3A010C7d01b50e0d17dc79C8  
Resolver:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

## How It Works

### Atomic Swap Flow

1. **Setup**: User creates signed limit order with swap parameters
2. **Source Deposit**: Resolver deposits safety deposit and fills order on Sepolia
3. **Destination Deposit**: Resolver deploys matching escrow on Monad
4. **Secret Reveal**: Resolver withdraws from destination using secret
5. **Completion**: Secret enables resolver to withdraw from source chain

### Security Features

- **Time-locked withdrawals**: Progressive timelock periods prevent stuck funds
- **Safety deposits**: Resolver stakes native tokens as incentive alignment
- **Hash-locked secrets**: Cryptographic secrets ensure atomic execution
- **Public rescue periods**: Anyone can complete failed swaps for rewards

### Time-lock Progression

```
Deploy → Withdrawal → Public Withdrawal → Cancellation → Public Cancellation
   0s        10s            120s              121s             122s
```

## Troubleshooting

### Common Issues

#### 1. Network Connectivity
- **Error**: `Network connectivity check failed`
- **Solution**: Verify RPC URLs are correct and accessible
- **Check**: Test RPC endpoints directly with `curl` or browser

#### 2. Insufficient Balances  
- **Error**: `Insufficient [network] balance for [account]`
- **Solution**: Fund accounts with native tokens and SwapTokens
- **Minimum**: 0.01 ETH for gas, 100+ SwapTokens for demonstrations

#### 3. Private Key Issues
- **Error**: `Invalid private key format`
- **Solution**: Ensure keys are in correct hex format (0x + 64 chars)
- **Generate**: Use tools like `cast wallet new` or ethers.js

#### 4. Time-lock Violations
- **Real Testnets**: Time-locks use actual wall-clock time
- **Expectation**: Allow 11+ seconds between deployment and withdrawal
- **Solution**: Be patient with real network timing

#### 5. Transaction Failures
- **Network Issues**: Automatic retry with exponential backoff
- **Gas Issues**: Transactions use conservative gas limits
- **Nonce Issues**: Provider caching handles nonce management

### Getting Testnet Tokens

#### Native Tokens
- **Sepolia ETH**: 
  - [Sepolia Faucet](https://sepoliafaucet.com/)
  - [Alchemy Faucet](https://sepoliafaucet.com/)
  - [Infura Faucet](https://www.infura.io/faucet/sepolia)
- **Monad Native**: Contact Monad team or use official faucets

#### SwapTokens
- **Sepolia**: `0x085619Cef93E5A6Cff7683558418424748880663`
- **Monad**: `0x3A84567b87a039FFD5043949E0Ae119617746539`
- **Source**: Contact deployer or check for faucet functions

### Performance Expectations

#### Real Testnet Timing
- **Network confirmation**: 2-15 seconds per transaction
- **Cross-chain coordination**: 30-60 seconds total
- **Full swap demo**: 3-5 minutes including time-locks
- **Test timeout**: 5 minutes maximum per scenario

## Architecture

The protocol uses a factory pattern with minimal proxy contracts:

- **BaseEscrowFactory**: Abstract factory for escrow deployment
- **EscrowSrc/EscrowDst**: Minimal proxy escrows for each swap
- **ResolverExample**: Reference implementation for cross-chain coordination
- **Deterministic Addresses**: Escrow addresses computed from swap parameters

## Security Considerations

- **Use testnet-only private keys** - never use mainnet keys
- **Verify contract addresses** before interacting
- **Monitor time-lock periods** to prevent fund lockup
- **Validate swap parameters** match between chains

## Support

For issues or questions:
- Check the troubleshooting section above
- Review test logs for specific error messages
- Ensure all prerequisites are properly installed
