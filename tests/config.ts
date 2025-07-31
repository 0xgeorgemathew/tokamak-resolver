import {z} from 'zod'
import Sdk from '@1inch/cross-chain-sdk'
import * as process from 'node:process'

const bool = z
    .string()
    .transform((v) => v.toLowerCase() === 'true')
    .pipe(z.boolean())

const ConfigSchema = z.object({
    SRC_CHAIN_RPC: z.string().url(),
    DST_CHAIN_RPC: z.string().url(),
    SRC_CHAIN_CREATE_FORK: bool.default('false'),
    DST_CHAIN_CREATE_FORK: bool.default('false'),
    USER_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid private key format'),
    RESOLVER_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid private key format'),
    DEPLOYER_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid private key format')
})

const fromEnv = ConfigSchema.parse(process.env)

export const config = {
    chain: {
        source: {
            chainId: 11155111, // Sepolia
            url: fromEnv.SRC_CHAIN_RPC,
            createFork: fromEnv.SRC_CHAIN_CREATE_FORK,
            limitOrderProtocol: '0xc4C35f0511950a9E4E8674BB4ec74B61d55137C1',
            wrappedNative: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // feeToken on Sepolia
            escrowFactory: '0x9e2Fb5498f3c52b0c8EC2aA4E1B5D234C99b6B67',
            resolver: '0x3E8769f963e5E1671f4F1845aeB6Efd4343AEA16',
            tokens: {
                SwapToken: {
                    address: '0x085619Cef93E5A6Cff7683558418424748880663'
                }
            }
        },
        destination: {
            chainId: 10143, // Monad
            url: fromEnv.DST_CHAIN_RPC,
            createFork: fromEnv.DST_CHAIN_CREATE_FORK,
            limitOrderProtocol: '0xb5aA32B29CBf8aC76e804E230EF3200d17eF099f',
            wrappedNative: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701', // feeToken on Monad
            escrowFactory: '0xe02F5B45E3B29Dac9a1B6aFeA99FF1377Cdd673E',
            resolver: '0xc0013D26d4F9d25AfB9004f37cba09af68Eb1315',
            tokens: {
                SwapToken: {
                    address: '0x3A84567b87a039FFD5043949E0Ae119617746539'
                }
            }
        }
    },
    privateKeys: {
        user: fromEnv.USER_PRIVATE_KEY,
        resolver: fromEnv.RESOLVER_PRIVATE_KEY,
        deployer: fromEnv.DEPLOYER_PRIVATE_KEY
    }
} as const

export type ChainConfig = (typeof config.chain)['source' | 'destination']

// Add type declaration to ensure compatibility with existing code
declare module '@1inch/cross-chain-sdk' {
    namespace NetworkEnum {
        const SEPOLIA: 11155111
        const MONAD: 10143
    }
}
