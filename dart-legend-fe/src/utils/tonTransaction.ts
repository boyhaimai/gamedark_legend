import { Address } from "@ton/core";

interface TransactionStatus {
  found: boolean;
  success?: boolean;
  data?: any;
}

/**
 * Poll transaction status from TON blockchain
 * @param hash - Transaction hash (base64)
 * @param address - Address to check transactions for
 * @param maxAttempts - Maximum number of polling attempts (default: 30)
 * @param intervalMs - Interval between attempts in milliseconds (default: 2000)
 */
export async function pollTransactionStatus(
  hash: string,
  address: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<TransactionStatus> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      // Parse address to get proper format
      const addr = Address.parse(address);
      const friendlyAddress = addr.toString({ bounceable: true, testOnly: false });

      // Call TON Center API to get transactions
      const response = await fetch(
        `https://toncenter.com/api/v2/getTransactions?address=${friendlyAddress}&limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.ok || !data.result) {
        throw new Error("Invalid response from TON Center");
      }

      // Search for transaction with matching hash
      const transactions = data.result;
      const foundTx = transactions.find((tx: any) => {
        // Compare transaction hash (TON Center returns hash in different formats)
        const txHash = tx.transaction_id?.hash;
        return txHash === hash || tx.hash === hash;
      });

      if (foundTx) {
        return {
          found: true,
          success: true, // If transaction is found, it means it was successful
          data: foundTx,
        };
      }

      // Transaction not found yet, wait and retry
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error(`Polling attempt ${attempts + 1} failed:`, error);
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
  }

  // Max attempts reached without finding transaction
  return {
    found: false,
  };
}

/**
 * Wait for transaction to be indexed on blockchain
 * @param hash - Transaction hash (base64)
 * @param address - Address to check transactions for
 * @returns Promise that resolves when transaction is found or rejects on timeout
 */
export async function waitForTransaction(
  hash: string,
  address: string
): Promise<void> {
  const result = await pollTransactionStatus(hash, address, 30, 2000);
  
  if (!result.found) {
    throw new Error("Transaction not found after polling timeout");
  }
  
  if (!result.success) {
    throw new Error("Transaction failed");
  }
}

/**
 * Poll Jetton transaction status from TON API v2
 * @param hash - Transaction hash (base64)
 * @param maxAttempts - Maximum number of polling attempts (default: 30)
 * @param intervalMs - Interval between attempts in milliseconds (default: 2000)
 */
export async function waitForJettonTransaction(
  hash: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<void> {
  let attempts = 0;

  // Convert base64 hash to hex
  const hashHex = Buffer.from(hash, 'base64').toString('hex');

  while (attempts < maxAttempts) {
    try {
      // Call TON API v2 to get transaction by hash
      const response = await fetch(
        `https://tonapi.io/v2/blockchain/transactions/${hashHex}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          return; // Transaction found and successful
        } else {
          throw new Error("Transaction failed on blockchain");
        }
      } else if (response.status !== 404) {
        // If error is not 404 (not found), log it but continue polling
        console.warn(`Polling error: ${response.status}`);
      }

      // Transaction not found yet or API error, wait and retry
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error(`Polling attempt ${attempts + 1} failed:`, error);
      
      // If it's a transaction failure error, stop polling and throw
      if (error instanceof Error && error.message === "Transaction failed on blockchain") {
        throw error;
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
  }

  throw new Error("Transaction not found after polling timeout");
}
