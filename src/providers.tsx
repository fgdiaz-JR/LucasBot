/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useCeloWallet } from "./useCeloWallet";
import { Invoice, InvoiceStatus, ChatMessage } from "./types";

interface FacturaContextType {
  wallet: ReturnType<typeof useCeloWallet>;
  activeTab: "chat" | "dashboard" | "settings";
  setActiveTab: (tab: "chat" | "dashboard" | "settings") => void;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addMessage: (sender: "user" | "bot", text: string, widget?: ChatMessage["widget"]) => void;
  createInvoiceFromAI: (client: string, amountCOPm: number, description: string) => Invoice;
  payInvoiceSimulated: (id: string, actionType?: "pay" | "lock" | "release") => Promise<boolean>;
  isProcessingAction: boolean;
  setIsProcessingAction: (v: boolean) => void;
}

const FacturaContext = createContext<FacturaContextType | undefined>(undefined);

export function FacturaProvider({ children }: { children: ReactNode }) {
  const wallet = useCeloWallet();
  const [activeTab, setActiveTab] = useState<"chat" | "dashboard" | "settings">("chat");
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Default Invoices lists
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "inv-8021",
      clientName: "Estudio Diseño Pixel",
      amountCOPm: 450000,
      amountUSD: 112.5,
      description: "Desarrollo de landing page responsive y UI assets Celo",
      issueDate: "2026-05-20",
      dueDate: "2026-06-25",
      status: InvoiceStatus.PENDIENTE,
      creatorAddress: "0x7cD2...C3a1",
      type: "ingreso"
    },
    {
      id: "inv-gar-01",
      clientName: "Pedro Ruiz (Solidity Dev)",
      amountCOPm: 800000,
      amountUSD: 200.0,
      description: "Contrato Inteligente de Garantías Escrow Celo (Retenido - Esperando entrega de código)",
      issueDate: "2026-06-01",
      dueDate: "2026-06-15",
      status: InvoiceStatus.RETENIDO,
      creatorAddress: "0x7cD2...C3a1",
      txHash: "0xa1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890",
      type: "egreso"
    },
    {
      id: "inv-gar-02",
      clientName: "Ana Gómez (Diseñadora UX)",
      amountCOPm: 350000,
      amountUSD: 87.5,
      description: "Diseño de wireframes móviles LucasBot (Retenido - Esperando aprobación de cliente)",
      issueDate: "2026-06-03",
      dueDate: "2026-06-18",
      status: InvoiceStatus.RETENIDO,
      creatorAddress: "0x7cD2...C3a1",
      txHash: "0xb1c2d3e4f5a67890b1c2d3e4f5a67890b1c2d3e4f5a67890b1c2d3e4f5a67890",
      type: "egreso"
    },
    {
      id: "inv-7512",
      clientName: "Restaurante El Portal",
      amountCOPm: 180000,
      amountUSD: 45,
      description: "Mantenimiento mensual de sistema POS on-chain",
      issueDate: "2026-05-10",
      dueDate: "2026-06-10",
      status: InvoiceStatus.PAGADO,
      txHash: "0x6f91d8ceab83c189b88cefbb0c0e5a9ee075e8d9b1c7dc41c2c3116bc37ef89a",
      creatorAddress: "0x7cD2...C3a1",
      type: "ingreso"
    },
    {
      id: "inv-6110",
      clientName: "Sofia Marin (Soporte)",
      amountCOPm: 600000,
      amountUSD: 150.0,
      description: "Consultoría técnica e integración Wallet de Celo",
      issueDate: "2026-04-15",
      dueDate: "2026-05-15",
      status: InvoiceStatus.VENCIDO,
      creatorAddress: "0x3e1d...9f12",
      type: "ingreso"
    },
    {
      id: "inv-3021",
      clientName: "Celo Validators Colombia",
      amountCOPm: 120000,
      amountUSD: 30.0,
      description: "Pago de nodo RPC mensual",
      issueDate: "2026-05-18",
      dueDate: "2026-06-18",
      status: InvoiceStatus.PAGADO,
      txHash: "0x4e61b8ceab83c189b88cefbb0c0e5a9ee075e8d9b1c7dc41c2c3116bc37ef123",
      creatorAddress: "0x7cD2...C3a1",
      type: "egreso"
    },
    {
      id: "inv-2190",
      clientName: "Claro Colombia (Internet)",
      amountCOPm: 155000,
      amountUSD: 38.75,
      description: "Servicio de Internet Oficina",
      issueDate: "2026-05-02",
      dueDate: "2026-05-17",
      status: InvoiceStatus.PAGADO,
      txHash: "0x8fa3f8ceab83c189b88cefbb0c0e5a9ee075e8d9b1c7dc41c2c3116bc37ef456",
      creatorAddress: "0x7cD2...C3a1",
      type: "egreso"
    }
  ]);

  // Default conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "bot",
      text: "¡Hola! Soy **LucasBot**, tu asistente financiero conversacional en la red de Celo. 🚀\n\nPuedo ayudarte a crear enlaces de cobro, rastrear facturas pendientes y verificar tus reportes en COPm directamente.\n\n*Prueba enviando un mensaje como:* \"Quiero cobrar 120000 COPm a Carlos Gomez por logos de diseño.\"",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const addMessage = useCallback((sender: "user" | "bot", text: string, widget?: ChatMessage["widget"]) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      widget
    };
    setMessages(prev => [...prev, newMsg]);
  }, []);

  const createInvoiceFromAI = useCallback((client: string, amountCOPm: number, description: string): Invoice => {
    const newId = `inv-${Math.floor(Math.random() * 9000) + 1000}`;
    const today = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + 15);
    const dueDateStr = due.toISOString().split('T')[0];

    const newInv: Invoice = {
      id: newId,
      clientName: client || "Cliente General",
      amountCOPm: amountCOPm || 50000,
      amountUSD: Number(((amountCOPm || 50000) / 4000).toFixed(2)),
      description: description || "Honorarios profesionales prestados",
      issueDate: today,
      dueDate: dueDateStr,
      status: InvoiceStatus.PENDIENTE,
      creatorAddress: "0x7cD2...C3a1",
      type: "ingreso"
    };

    setInvoices(prev => [newInv, ...prev]);
    return newInv;
  }, []);

  const payInvoiceSimulated = useCallback(async (id: string, actionType: "pay" | "lock" | "release" = "pay"): Promise<boolean> => {
    // Return promise, simulate blockchain delay
    setIsProcessingAction(true);
    await new Promise(resolve => setTimeout(resolve, 1800));

    let success = false;
    setInvoices(prev => {
      return prev.map(inv => {
        if (inv.id === id) {
          if (actionType === "lock" && inv.status === InvoiceStatus.PENDIENTE) {
            success = true;
            // Deduct balance from wallet representing depositing funds into Celo Smart Contract
            wallet.deductBalance(inv.amountCOPm);
            wallet.useGas(0.005); // CELO gas fee for deployment/lock
            return {
              ...inv,
              status: InvoiceStatus.RETENIDO,
              txHash: "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("")
            };
          }
          if (actionType === "release" && inv.status === InvoiceStatus.RETENIDO) {
            success = true;
            // Funds are sent from trust contract to receiver, so we do NOT deduct payee's balance again!
            wallet.useGas(0.003); // CELO gas fee for release authorization
            return {
              ...inv,
              status: InvoiceStatus.PAGADO,
              txHash: "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("")
            };
          }
          if (actionType === "pay" && inv.status === InvoiceStatus.PENDIENTE) {
            success = true;
            wallet.deductBalance(inv.amountCOPm);
            wallet.useGas(0.005);
            return {
              ...inv,
              status: InvoiceStatus.PAGADO,
              txHash: "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("")
            };
          }
        }
        return inv;
      });
    });

    setIsProcessingAction(false);
    return success;
  }, [wallet]);

  return (
    <FacturaContext.Provider
      value={{
        wallet,
        activeTab,
        setActiveTab,
        invoices,
        setInvoices,
        messages,
        setMessages,
        addMessage,
        createInvoiceFromAI,
        payInvoiceSimulated,
        isProcessingAction,
        setIsProcessingAction
      }}
    >
      {children}
    </FacturaContext.Provider>
  );
}

export function useFactura() {
  const context = useContext(FacturaContext);
  if (!context) {
    throw new Error("useFactura must be used within a FacturaProvider");
  }
  return context;
}
