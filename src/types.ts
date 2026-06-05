/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum InvoiceStatus {
  PAGADO = "Pagado",
  PENDIENTE = "Pendiente",
  VENCIDO = "Vencido",
  RETENIDO = "Retenido"
}

export interface Invoice {
  id: string;
  clientName: string;
  amountCOPm: number; // Amount in Colombian Pesos stablecoin (COPm) commonly used in Colombian Celo usecases
  amountUSD: number;  // Equivalent in USD / cUSD
  description: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  txHash?: string;
  creatorAddress?: string;
  type?: "ingreso" | "egreso";
}

export type WidgetType = "create_invoice" | "payment_invoice" | "receipt";

export interface WidgetPayload {
  id?: string;
  client?: string;
  amount?: number;
  desc?: string;
  txHash?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  widget?: {
    type: WidgetType;
    payload: WidgetPayload;
  };
}
