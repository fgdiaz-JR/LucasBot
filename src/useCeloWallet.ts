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
    // In browser context
    const checkProvider = () => {
      const anyWin = window as any;
      const hasMiniPay = !!(anyWin.ethereum && anyWin.ethereum.isMiniPay);
      
      if (hasMiniPay) {
        setWallet(prev => ({
          ...prev,
          isMiniPay: true,
          // MiniPay auto-connects
          isConnected: true,
          address: "0x7cD2...C3a1" // Autodetected MiniPay public wallet
        }));
      }
    };
    
    // Run evaluation
    checkProvider();

    // Listen to mock interval to check if window.ethereum gets injected
    const interval = setInterval(checkProvider, 1000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = useCallback(async (walletType: "MetaMask" | "Valora" | "Standard" = "Standard") => {
    setWallet(prev => ({ ...prev, isConnecting: true }));
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 800));
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
    setWallet(prev => ({
      ...prev,
      isConnected: true,
      isConnecting: false,
      address: walletType === "Valora" 
        ? `0xValo...${randomSuffix}` 
        : `0xMeta...${randomSuffix}`
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
