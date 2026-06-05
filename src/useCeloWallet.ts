/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isMiniPay: boolean;
  cUSDBalance: number; // Balance of cUSD/COPm
  celoBalance: number;  // Balance of CELO (for gas)
  isConnecting: boolean;
  netName: "Celo Mainnet" | "Celo Alfajores" | "Offline";
  feeCurrency: "COPm" | "cUSD" | "CELO";
}

export function useCeloWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isMiniPay: false,
    cUSDBalance: 152000, // 152,000 COPm default starting balance for demo
    celoBalance: 0.15, // CELO balance (1 CELO = normal gas fee of 0.001 Celo)
    isConnecting: false,
    netName: "Celo Mainnet",
    feeCurrency: "COPm"
  });

  // Check for MiniPay / Custom Ethereum Injectors
  useEffect(() => {
    const checkProvider = async () => {
      const anyWin = window as any;
      if (anyWin.ethereum) {
        try {
          // See if we already have authorized accounts
          const accounts = await anyWin.ethereum.request({ method: "eth_accounts" });
          const isMiniPay = !!anyWin.ethereum.isMiniPay;
          if (accounts && accounts.length > 0) {
            setWallet(prev => ({
              ...prev,
              isMiniPay,
              isConnected: true,
              address: accounts[0]
            }));
            return;
          }
        } catch (err) {
          console.error("Error checking authorized accounts:", err);
        }

        // If MiniPay, it auto-connects
        if (anyWin.ethereum.isMiniPay) {
          setWallet(prev => ({
            ...prev,
            isMiniPay: true,
            isConnected: true,
            address: "0x7cD2C3C914C3a2E9d28A1Bb3109a1CDeB09dfa1c"
          }));
        }
      }
    };
    
    checkProvider();

    // Set up listeners for real events if window.ethereum exists
    const anyWin = window as any;
    if (anyWin.ethereum) {
      const handleAccounts = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setWallet(prev => ({
            ...prev,
            isConnected: true,
            address: accounts[0]
          }));
        } else {
          setWallet(prev => ({
            ...prev,
            isConnected: false,
            address: null
          }));
        }
      };

      anyWin.ethereum.on?.("accountsChanged", handleAccounts);
      return () => {
        anyWin.ethereum.removeListener?.("accountsChanged", handleAccounts);
      };
    }
  }, []);

  const connectWallet = useCallback(async (walletType: "MetaMask" | "Valora" | "Standard" = "Standard") => {
    setWallet(prev => ({ ...prev, isConnecting: true }));
    const anyWin = window as any;
    
    // If standard browser injector is available, request real accounts
    if (anyWin.ethereum) {
      try {
        const accounts = await anyWin.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          setWallet(prev => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            address: accounts[0],
            isMiniPay: !!anyWin.ethereum.isMiniPay
          }));
          return;
        }
      } catch (err: any) {
        console.warn("Wallet connection rejected or failed, executing simulated fallback.", err);
      }
    }

    // Simulating sandbox fallback
    await new Promise(resolve => setTimeout(resolve, 800));
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
    const isVal = walletType === "Valora";
    setWallet(prev => ({
      ...prev,
      isConnected: true,
      isConnecting: false,
      address: isVal 
        ? `0xValo${randomSuffix}E9d28A1Bb3109a1CDeB09dfa1c` 
        : `0xMeta${randomSuffix}4a2E9d28A1Bb3109a1CDeB09`
    }));
  }, []);

  const disconnectWallet = useCallback(() => {
    // MiniPay cannot be easily disconnected as it's built-in, but we reset standard wallet
    setWallet(prev => ({
      ...prev,
      isConnected: prev.isMiniPay ? true : false,
      address: prev.isMiniPay ? "0x7cD2...C3a1" : null
    }));
  }, []);

  const setBalances = useCallback((cUSD: number, celo: number) => {
    setWallet(prev => ({ ...prev, cUSDBalance: cUSD, celoBalance: celo }));
  }, []);

  // Simulating gas depletion to trigger the requirement
  const useGas = useCallback((amount: number) => {
    setWallet(prev => {
      const nextCelo = Math.max(0, prev.celoBalance - amount);
      return {
        ...prev,
        celoBalance: Number(nextCelo.toFixed(4))
      };
    });
  }, []);

  // Topup gas (e.g. from Celo link or mock topup)
  const topupGas = useCallback(() => {
    setWallet(prev => ({ ...prev, celoBalance: 0.15 }));
  }, []);

  // Spend cUSD for invoice liquidations
  const deductBalance = useCallback((amountProduct: number) => {
    setWallet(prev => ({
      ...prev,
      cUSDBalance: Math.max(0, prev.cUSDBalance - amountProduct)
    }));
  }, []);

  const changeFeeCurrency = useCallback((currency: "COPm" | "cUSD" | "CELO") => {
    setWallet(prev => ({ ...prev, feeCurrency: currency }));
  }, []);

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    setBalances,
    useGas,
    topupGas,
    deductBalance,
    changeFeeCurrency
  };
}
