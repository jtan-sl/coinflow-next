import React, {useEffect, useState} from 'react';
import {Wallet} from '../lib/Wallet';
import {WalletMultiButton} from '@solana/wallet-adapter-react-ui';
import {CoinflowEnvs, CoinflowPurchase} from '@coinflowlabs/react';
import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {PublicKey, Transaction} from '@solana/web3.js';
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';

function App() {
  return (
    <Wallet>
      <div className="App">
        <WalletMultiButton />
        <div
          style={{
            height: '100vh',
          }}
        >
          <CoinflowContent />
        </div>
      </div>
    </Wallet>
  );
}

function CoinflowContent() {
  const {connection} = useConnection();
  const wallet = useWallet();
  const [transaction, setTransaction] = useState(undefined);


  const amount = 1;

  useEffect(() => {
    async function createTx() {
      if (!wallet.publicKey) return;

      const usdcMint = new PublicKey(
        '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
      );
      const decimals = 6;

      const senderAta = getAssociatedTokenAddressSync(
        usdcMint,
        wallet.publicKey,
        true
      );

      const receiver = new PublicKey(
        '4EWF49WwQ9uwrQaxxgvPT7XNPcJZ1EJhfrVu42DuFu8S'
      );
      const receiverAta = getAssociatedTokenAddressSync(
        usdcMint,
        receiver,
        true
      );

      const transferAmount = Number(amount) * Math.pow(10, decimals);
      const transferIx = createTransferCheckedInstruction(
        senderAta,
        usdcMint,
        receiverAta,
        wallet.publicKey,
        transferAmount,
        decimals
      );
      const tx = new Transaction();
      tx.add(transferIx);
      tx.feePayer = wallet.publicKey;
      const {blockhash} = await connection.getLatestBlockhash('finalized');
      tx.recentBlockhash = blockhash;
      setTransaction(tx);
    }

    createTx();
  }, [amount, wallet.publicKey]);

  return (
    <CoinflowPurchase
      wallet={wallet}
      merchantId={'hotline'}
      env={'sandbox'}
      connection={connection}
      onSuccess={() => {
        console.log('Purchase Success');
      }}
      blockchain={'solana'}
      webhookInfo={{item: 'sword'}}
      email={'user-email@email.com'}
      transaction={transaction}
      amount={amount}
    />
  );
}

export default App;