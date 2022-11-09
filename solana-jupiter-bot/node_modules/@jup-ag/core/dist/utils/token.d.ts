import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Instruction } from './instruction';
import { Owner } from './Owner';
export declare function createAndCloseWSOLAccount({ connection, amount, owner: { publicKey }, }: {
    connection: Connection;
    owner: Owner;
    amount: number;
}): Promise<Instruction & {
    address: PublicKey;
}>;
export declare function findOrCreateAssociatedAccountByMint({ connection, payer, owner: { publicKey }, mintAddress, unwrapSOL, }: {
    connection: Connection;
    payer: PublicKey;
    owner: Owner;
    mintAddress: PublicKey | string;
    unwrapSOL: boolean;
}): Promise<Instruction & {
    address: PublicKey;
}>;
export declare function createAssociatedTokenAccountInstruction(payer: PublicKey, associatedToken: PublicKey, owner: PublicKey, mint: PublicKey, programId?: PublicKey, associatedTokenProgramId?: PublicKey): TransactionInstruction;
