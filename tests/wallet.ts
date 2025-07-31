import {AbiCoder, Contract, JsonRpcProvider, Signer, TransactionRequest, Wallet as PKWallet} from 'ethers'
import Sdk from '@1inch/cross-chain-sdk'
import ERC20 from '../dist/contracts/IERC20.sol/IERC20.json'

const coder = AbiCoder.defaultAbiCoder()

export class Wallet {
    public provider: JsonRpcProvider

    public signer: Signer

    constructor(privateKeyOrSigner: string | Signer, provider: JsonRpcProvider) {
        this.provider = provider
        this.signer =
            typeof privateKeyOrSigner === 'string'
                ? new PKWallet(privateKeyOrSigner, this.provider)
                : privateKeyOrSigner
    }

    public static async fromAddress(address: string, provider: JsonRpcProvider, privateKey?: string): Promise<Wallet> {
        if (privateKey) {
            // Use the provided private key for real testnet
            return new Wallet(privateKey, provider)
        }
        
        // For local testing with anvil/hardhat
        try {
            await provider.send('anvil_impersonateAccount', [address.toString()])
            const signer = await provider.getSigner(address.toString())
            return new Wallet(signer, provider)
        } catch (error) {
            throw new Error(`Cannot impersonate account ${address}. For testnet usage, provide the private key.`)
        }
    }

    async tokenBalance(token: string): Promise<bigint> {
        const tokenContract = new Contract(token.toString(), ERC20.abi, this.provider)

        return tokenContract.balanceOf(await this.getAddress())
    }

    async topUpFromDonor(token: string, donor: string, amount: bigint, donorPrivateKey?: string): Promise<void> {
        const donorWallet = await Wallet.fromAddress(donor, this.provider, donorPrivateKey)
        await donorWallet.transferToken(token, await this.getAddress(), amount)
    }

    // Helper method to check if user has sufficient balance
    async checkSufficientBalance(token: string, requiredAmount: bigint): Promise<boolean> {
        const balance = await this.tokenBalance(token)
        return balance >= requiredAmount
    }

    // Helper method to check native token balance
    async getNativeBalance(): Promise<bigint> {
        return this.provider.getBalance(await this.getAddress())
    }

    public async getAddress(): Promise<string> {
        return this.signer.getAddress()
    }

    public async unlimitedApprove(tokenAddress: string, spender: string): Promise<void> {
        const currentApprove = await this.getAllowance(tokenAddress, spender)

        // for usdt like tokens
        if (currentApprove !== 0n) {
            await this.approveToken(tokenAddress, spender, 0n)
        }

        await this.approveToken(tokenAddress, spender, (1n << 256n) - 1n)
    }

    public async getAllowance(token: string, spender: string): Promise<bigint> {
        const contract = new Contract(token.toString(), ERC20.abi, this.provider)

        return contract.allowance(await this.getAddress(), spender.toString())
    }

    public async transfer(dest: string, amount: bigint): Promise<void> {
        await this.signer.sendTransaction({
            to: dest,
            value: amount
        })
    }

    public async transferToken(token: string, dest: string, amount: bigint): Promise<void> {
        const tx = await this.signer.sendTransaction({
            to: token.toString(),
            data: '0xa9059cbb' + coder.encode(['address', 'uint256'], [dest.toString(), amount]).slice(2)
        })

        await tx.wait()
    }

    public async approveToken(token: string, spender: string, amount: bigint): Promise<void> {
        const tx = await this.signer.sendTransaction({
            to: token.toString(),
            data: '0x095ea7b3' + coder.encode(['address', 'uint256'], [spender.toString(), amount]).slice(2)
        })

        await tx.wait()
    }

    public async signOrder(srcChainId: number, order: Sdk.CrossChainOrder): Promise<string> {
        const typedData = order.getTypedData(srcChainId)

        return this.signer.signTypedData(
            typedData.domain,
            {Order: typedData.types[typedData.primaryType]},
            typedData.message
        )
    }

    async send(param: TransactionRequest, retries = 3): Promise<{txHash: string; blockTimestamp: bigint; blockHash: string}> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const res = await this.signer.sendTransaction({
                    ...param, 
                    gasLimit: param.gasLimit || 1_000_000, // Reduced default gas limit for real networks
                    from: this.getAddress()
                })
                const receipt = await res.wait(1)

                if (receipt && receipt.status) {
                    return {
                        txHash: receipt.hash,
                        blockTimestamp: BigInt((await res.getBlock())!.timestamp),
                        blockHash: res.blockHash as string
                    }
                }

                throw new Error((await receipt?.getResult()) || 'Transaction failed')
            } catch (error: any) {
                console.warn(`Transaction attempt ${attempt}/${retries} failed:`, error.message)
                
                if (attempt === retries) {
                    throw error
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            }
        }
        
        throw new Error('All transaction attempts failed')
    }
}
