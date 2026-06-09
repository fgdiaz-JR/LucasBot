/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { FacturaProvider, useFactura } from "./providers";
import { InvoiceStatus, Invoice, ChatMessage } from "./types";
import { FinanceCharts } from "./components/FinanceCharts";
import { PaymentQRCode } from "./components/PaymentQRCode";
import {
  Bot,
  User,
  Send,
  Coins,
  Wallet,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  Settings,
  HelpCircle,
  PhoneCall,
  Check,
  FileText,
  Clock,
  LogOut,
  Calendar,
  X,
  CreditCard,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Plus,
  Fingerprint,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

function MainAppContent() {
  const {
    wallet,
    activeTab,
    setActiveTab,
    invoices,
    setInvoices,
    messages,
    addMessage,
    payInvoiceSimulated,
    isProcessingAction,
    setIsProcessingAction
  } = useFactura();

  const [inputText, setInputText] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [filter, setFilter] = useState<"All" | InvoiceStatus>("All");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false); // Fallback solid background flag for low-cost devices
  const [isDeviceView, setIsDeviceView] = useState(true); // Toggle to simulate phone card on wider viewport

  // Dynamic automatic responsive screen sizing state
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Audio / Speech / Recording states
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Manual transaction forms states
  const [showManualCreate, setShowManualCreate] = useState(false);
  const [showManualPay, setShowManualPay] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // BIP-712 Cryptographic signature request state
  const [signatureRequest, setSignatureRequest] = useState<{
    id?: string;
    type: "create" | "pay" | "lock_escrow" | "release_escrow";
    client: string;
    amount: number;
    desc: string;
    msgId?: string;
    directPay?: boolean;
    onSuccess: (txHash: string) => void;
  } | null>(null);

  // Solidity Smart Contract Events state
  const [blockchainEvents, setBlockchainEvents] = useState<Array<{
    id: string;
    blockNumber: number;
    timestamp: string;
    eventName: "InvoiceCreated" | "InvoicePaid" | "FeePaid";
    txHash: string;
    args: { [key: string]: any };
  }>>([
    {
      id: "evt-01",
      blockNumber: 18451203,
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventName: "InvoicePaid",
      txHash: "0x6f91d8ceab83c189b88cefbb0c0e5a9ee075e8d9b1c7dc41c2c3116bc37ef89a",
      args: { id: "inv-7512", payer: "Restaurante El Portal", amount: "180,000 COPm", fee: "0.00 COPm (Gasless)" }
    },
    {
      id: "evt-02",
      blockNumber: 18451199,
      timestamp: new Date(Date.now() - 3700000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventName: "InvoiceCreated",
      txHash: "0x6f91d8ceab83c189b88cefbb0c0e5a9ee075e8d9b1c7dc41c2c3116bc37ef89a",
      args: { id: "inv-7512", recipient: "0x7cD2...C3a1", amount: "180,000 COPm" }
    },
    {
      id: "evt-03",
      blockNumber: 18450140,
      timestamp: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventName: "InvoicePaid",
      txHash: "0x4e61b8ceab83c189b88cefbb0c0e5a9ee075e8d9b1c7dc41c2c3116bc37ef123",
      args: { id: "inv-3021", payer: "0x7cD2...C3a1", amount: "120,000 COPm", fee: "0.005 CELO" }
    },
    {
      id: "evt-04",
      blockNumber: 18449552,
      timestamp: new Date(Date.now() - 10800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventName: "InvoicePaid",
      txHash: "0x8fa3f8ceab83c189b88cefbb0c0e5a9ee075e8d9b1c7dc41c2c3116bc37ef456",
      args: { id: "inv-2190", payer: "0x7cD2...C3a1", amount: "155,000 COPm", fee: "0.0001 cUSD" }
    },
  ]);
  const [manualClient, setManualClient] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualDesc, setManualDesc] = useState("");

  // Accordion open/close states for chat feedback widgets
  const [openWidgets, setOpenWidgets] = useState<{ [key: string]: boolean }>({});

  const toggleWidgetAccordion = (id?: string) => {
    if (!id) return;
    setOpenWidgets((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Responsive layout sync hook
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setIsMobileScreen(isMobile);
      setIsDeviceView(isMobile); // default automatically to phone view representation
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Web Audio Synth Chimes
  const playChime = (type: "success" | "error" | "click") => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === "success") {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.005, start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playTone(523.25, ctx.currentTime, 0.12); // C5
        playTone(659.25, ctx.currentTime + 0.08, 0.12); // E5
        playTone(783.99, ctx.currentTime + 0.16, 0.22); // G5
      } else if (type === "error") {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.08, start);
          gain.gain.exponentialRampToValueAtTime(0.005, start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playTone(150, ctx.currentTime, 0.12);
        playTone(150, ctx.currentTime + 0.15, 0.15);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {
      console.warn("Audio Context could not start:", e);
    }
  };

  // Text-To-Speech
  const speakText = (text: string) => {
    if (!isAudioEnabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\*\*/g, "").replace(/\*/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "es-CO";
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Text to speech error:", e);
    }
  };

  // Speech Recognition Speech-to-Text Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "es-CO";
      rec.interimResults = false;

      rec.onstart = () => {
        setIsRecording(true);
        playChime("click");
      };
      rec.onend = () => {
        setIsRecording(false);
      };
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInputText(text);
        playChime("click");
      };
      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsRecording(false);
        playChime("error");
      };
      recognitionRef.current = rec;
    }
  }, [isAudioEnabled]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta reconocimiento de voz nativo. Activa el micrófono en Chrome o Safari.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Chat Submission Handler (communicates server-side to proxy Gemini API)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isBotTyping) return;

    const userQuery = inputText;
    setInputText("");
    addMessage("user", userQuery);
    setIsBotTyping(true);
    playChime("click");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuery }),
      });

      if (!response.ok) {
        throw new Error("Server communication error");
      }

      const data = await response.json();
      setIsBotTyping(false);

      // Handle server structured parsing widgets
      let chatWidget = undefined;
      if (data.widget) {
        chatWidget = {
          type: data.widget.type,
          payload: data.widget.payload,
        };
      }

      addMessage("bot", data.replyText, chatWidget);
      // Automatically read bot response
      speakText(data.replyText);
    } catch (err) {
      console.error("AI Error:", err);
      setIsBotTyping(false);
      playChime("error");
      
      const errMsg = "Disculpa, he tenido una fluctuación de red con el nodo Celo RPC. ¿Podrías repetir tu última orden?";
      addMessage("bot", errMsg, undefined);
      speakText(errMsg);
    }
  };

  // AI Invoice Generation Action (Cobrar)
  const handleConfirmInvoiceCreation = (payload: any, msgId: string) => {
    setSignatureRequest({
      type: "create",
      client: payload.client || "Cliente General",
      amount: payload.amount || 150000,
      desc: payload.desc || "Honorarios profesionales prestados",
      msgId,
      onSuccess: (txHash) => {
        const newId = `inv-${Math.floor(Math.random() * 9000) + 1000}`;
        const today = new Date().toISOString().split("T")[0];
        const due = new Date();
        due.setDate(due.getDate() + 15);
        const dueDateStr = due.toISOString().split("T")[0];

        const newInv: Invoice = {
          id: newId,
          clientName: payload.client || "Cliente General",
          amountCOPm: payload.amount || 150000,
          amountUSD: Number(((payload.amount || 150000) / 4000).toFixed(2)),
          description: payload.desc || "Honorarios profesionales prestados",
          issueDate: today,
          dueDate: dueDateStr,
          status: InvoiceStatus.PENDIENTE,
          creatorAddress: wallet.address || "0x7cD2...C3a1",
          type: "ingreso"
        };

        setInvoices((prev) => [newInv, ...prev]);

        // Add Solidity Event Log
        const newBlock = 18451203 + blockchainEvents.length + 1;
        setBlockchainEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            blockNumber: newBlock,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            eventName: "InvoiceCreated",
            txHash,
            args: { id: newId, recipient: wallet.address || "0x7cD2...C3a1", amount: `${newInv.amountCOPm.toLocaleString()} COPm` }
          },
          ...prev
        ]);

        playChime("success");
        speakText(`Factura de cobro ${newId} emitida con éxito`);

        // Push bot confirmation of success in chat
        addMessage(
          "bot",
          `¡Excelente! He emitido la factura **${newId}** on-chain con éxito. Compartido enlace de cobro de un solo toque para tu cliente:\n\n*Concepto*: ${newInv.description}\n*Monto*: **$${newInv.amountCOPm.toLocaleString("es-CO")} COPm**`,
          {
            type: "receipt",
            payload: {
              id: newId,
              client: newInv.clientName,
              amount: newInv.amountCOPm,
              desc: newInv.description,
              txHash,
            },
          }
        );

        // Close options of this widget after emitting
        setOpenWidgets((prev) => ({ ...prev, [msgId]: false }));
      }
    });
  };

  // Payment Settlement logic with Zero Gas and Balance triggers
  const handlePayment = async (inv: any, msgId: string) => {
    // Check Gas status (celoBalance)
    if (wallet.celoBalance <= 0 && wallet.feeCurrency === "CELO") {
      playChime("error");
      speakText("Error: No tienes saldo de gas CELO");
      window.open("https://link.minipay.xyz/add_cash", "_blank");
      return;
    }

    const payloadId = inv.id || inv.payload?.id;
    const exists = invoices.some(i => i.id === payloadId);
    const payAmount = inv.amountCOPm || inv.payload?.amount || 50000;
    const clientName = inv.clientName || inv.payload?.client || "Destinatario";
    const paymentDesc = inv.description || inv.payload?.desc || "Pago directo realizado";

    setSignatureRequest({
      id: payloadId,
      type: "pay",
      client: clientName,
      amount: payAmount,
      desc: paymentDesc,
      msgId,
      directPay: !exists,
      onSuccess: async (txHash) => {
        setIsProcessingAction(true);
        wallet.deductBalance(payAmount);
        
        let gasSpent = 0.005;
        let feeString = `${gasSpent} CELO`;
        if (wallet.feeCurrency === "COPm") {
          gasSpent = 0;
          feeString = "0.00 COPm (Gasless)";
        } else if (wallet.feeCurrency === "cUSD") {
          gasSpent = 0.0001;
          feeString = "0.0001 cUSD (~0.4 COPm)";
        }
        
        wallet.useGas(gasSpent);

        if (exists) {
          setInvoices(prev => prev.map(item => {
            if (item.id === payloadId) {
              return {
                ...item,
                status: InvoiceStatus.PAGADO,
                txHash
              };
            }
            return item;
          }));
        } else {
          const today = new Date().toISOString().split("T")[0];
          const newExpense: Invoice = {
            id: payloadId || `inv-${Math.floor(Math.random() * 9000) + 1000}`,
            clientName,
            amountCOPm: payAmount,
            amountUSD: Number((payAmount / 4000).toFixed(2)),
            description: paymentDesc,
            issueDate: today,
            dueDate: today,
            status: InvoiceStatus.PAGADO,
            creatorAddress: wallet.address || "0x7cD2...C3a1",
            txHash,
            type: "egreso"
          };
          setInvoices(prev => [newExpense, ...prev]);
        }

        // Add solidity contract event
        const newBlock = 18451203 + blockchainEvents.length + 1;
        setBlockchainEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            blockNumber: newBlock,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            eventName: "InvoicePaid",
            txHash,
            args: { id: payloadId || "gasto", payer: wallet.address || "0x7cD2...C3a1", amount: `${payAmount.toLocaleString()} COPm`, fee: feeString }
          },
          ...prev
        ]);

        setIsProcessingAction(false);
        playChime("success");
        speakText("Pago liquidado con éxito en la blockchain celo");

        addMessage(
          "bot",
          `¡Pago liquidado de forma segura! ✅ El monto de **$${payAmount.toLocaleString("es-CO")} COPm** ha sido saldada on-chain. Los fondos han sido transferidos al destinatario proveído.`,
          {
            type: "receipt",
            payload: {
              id: payloadId || "gasto",
              client: clientName,
              amount: payAmount,
              txHash,
            },
          }
        );
        setOpenWidgets((prev) => ({ ...prev, [msgId]: false }));
      }
    });
  };

  // Helper inside ledger for direct signing of row payouts
  const handleTablePay = (item: Invoice) => {
    setSignatureRequest({
      id: item.id,
      type: "pay",
      client: item.clientName,
      amount: item.amountCOPm,
      desc: item.description,
      onSuccess: async (txHash) => {
        setIsProcessingAction(true);
        wallet.deductBalance(item.amountCOPm);
        
        let gasSpent = 0.005;
        let feeString = `${gasSpent} CELO`;
        if (wallet.feeCurrency === "COPm") {
          gasSpent = 0;
          feeString = "0.00 COPm (Gasless)";
        } else if (wallet.feeCurrency === "cUSD") {
          gasSpent = 0.0001;
          feeString = "0.0001 cUSD (~0.4 COPm)";
        }
        
        wallet.useGas(gasSpent);

        setInvoices(prev => prev.map(inv => {
          if (inv.id === item.id) {
            return {
              ...inv,
              status: InvoiceStatus.PAGADO,
              txHash
            };
          }
          return inv;
        }));

        // Add solidity contract event
        const newBlock = 18451203 + blockchainEvents.length + 1;
        setBlockchainEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            blockNumber: newBlock,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            eventName: "InvoicePaid",
            txHash,
            args: { id: item.id, payer: wallet.address || "0x7cD2...C3a1", amount: `${item.amountCOPm.toLocaleString()} COPm`, fee: feeString }
          },
          ...prev
        ]);

        setIsProcessingAction(false);
        playChime("success");
        speakText("Pago liquidado con éxito en la blockchain celo");
      }
    });
  };

  const handleLockEscrow = (item: Invoice) => {
    // Check Gas status (celoBalance)
    if (wallet.celoBalance <= 0 && wallet.feeCurrency === "CELO") {
      playChime("error");
      speakText("Error: No tienes saldo de gas CELO");
      window.open("https://link.minipay.xyz/add_cash", "_blank");
      return;
    }

    setSignatureRequest({
      id: item.id,
      type: "lock_escrow",
      client: item.clientName,
      amount: item.amountCOPm,
      desc: item.description,
      onSuccess: async (txHash) => {
        setIsProcessingAction(true);
        
        let gasSpent = 0.005;
        let feeString = `${gasSpent} CELO`;
        if (wallet.feeCurrency === "COPm") {
          gasSpent = 0;
          feeString = "0.00 COPm (Gasless)";
        } else if (wallet.feeCurrency === "cUSD") {
          gasSpent = 0.0001;
          feeString = "0.0001 cUSD (~0.4 COPm)";
        }

        await payInvoiceSimulated(item.id, "lock");

        // Add solidity contract event for escrow creation/lock
        const newBlock = 18451203 + blockchainEvents.length + 1;
        setBlockchainEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            blockNumber: newBlock,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            eventName: "InvoiceCreated",
            txHash,
            args: { id: item.id, depositor: wallet.address || "0x7cD2...C3a1", amount: `${item.amountCOPm.toLocaleString()} COPm`, status: "Locked in Escrow Contract", fee: feeString }
          },
          ...prev
        ]);

        setIsProcessingAction(false);
        playChime("success");
        speakText("Excelente. El pago ha sido retenido de forma segura en garantía Celo");
      }
    });
  };

  const handleReleaseEscrow = (item: Invoice) => {
    // Check Gas status (celoBalance)
    if (wallet.celoBalance <= 0 && wallet.feeCurrency === "CELO") {
      playChime("error");
      speakText("Error: No tienes saldo de gas CELO");
      window.open("https://link.minipay.xyz/add_cash", "_blank");
      return;
    }

    setSignatureRequest({
      id: item.id,
      type: "release_escrow",
      client: item.clientName,
      amount: item.amountCOPm,
      desc: item.description,
      onSuccess: async (txHash) => {
        setIsProcessingAction(true);
        
        let gasSpent = 0.003;
        let feeString = `${gasSpent} CELO`;
        if (wallet.feeCurrency === "COPm") {
          gasSpent = 0;
          feeString = "0.00 COPm (Gasless)";
        } else if (wallet.feeCurrency === "cUSD") {
          gasSpent = 0.0001;
          feeString = "0.0001 cUSD (~0.4 COPm)";
        }

        await payInvoiceSimulated(item.id, "release");

        // Add solidity contract event for escrow locked release
        const newBlock = 18451203 + blockchainEvents.length + 1;
        setBlockchainEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            blockNumber: newBlock,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            eventName: "InvoicePaid",
            txHash,
            args: { id: item.id, releasedTo: item.clientName, amount: `${item.amountCOPm.toLocaleString()} COPm`, status: "Distributed / Released", fee: feeString }
          },
          ...prev
        ]);

        setIsProcessingAction(false);
        playChime("success");
        speakText("Garantía liberada exitosamente. Los fondos se han transferido al destinatario.");
      }
    });
  };

  // Financial analytics derived dynamically for Bento grid and charts
  const dynamicStats = () => {
    const totalCount = invoices.length;
    const paidIncomes = invoices.filter((i) => i.status === InvoiceStatus.PAGADO && (i.type === "ingreso" || !i.type));
    const paidExpenses = invoices.filter((i) => i.status === InvoiceStatus.PAGADO && i.type === "egreso");
    const pendingIncomes = invoices.filter((i) => i.status === InvoiceStatus.PENDIENTE && (i.type === "ingreso" || !i.type));
    const pendingExpenses = invoices.filter((i) => i.status === InvoiceStatus.PENDIENTE && i.type === "egreso");

    const totalPaidCOPm = paidIncomes.reduce((acc, curr) => acc + curr.amountCOPm, 0);
    const totalPendingCOPm = pendingIncomes.reduce((acc, curr) => acc + curr.amountCOPm, 0);
    const totalPaidExpensesCOPm = paidExpenses.reduce((acc, curr) => acc + curr.amountCOPm, 0);
    const totalPendingExpensesCOPm = pendingExpenses.reduce((acc, curr) => acc + curr.amountCOPm, 0);

    // Standard bank transfer or standard card processing fee saved. (e.g. standard bank commission in Colombia of ~3.5%)
    const commissionsSavedCOPm = Math.round(totalPaidCOPm * 0.035);

    const totalPaidUSD = Number((totalPaidCOPm / 4000).toFixed(2));

    return {
      totalPaidCOPm,
      totalPendingCOPm,
      totalPaidExpensesCOPm,
      totalPendingExpensesCOPm,
      commissionsSavedCOPm,
      totalPaidUSD,
      totalCount,
      paidCount: paidIncomes.length,
      pendingCount: pendingIncomes.length,
    };
  };

  const handleManualCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(manualAmount, 10);
    if (!manualClient.trim() || isNaN(amountVal) || amountVal <= 0) return;

    setSignatureRequest({
      type: "create",
      client: manualClient,
      amount: amountVal,
      desc: manualDesc || "Concepto General",
      onSuccess: (txHash) => {
        const newId = `inv-${Math.floor(Math.random() * 9000) + 1000}`;
        const today = new Date().toISOString().split("T")[0];
        const due = new Date();
        due.setDate(due.getDate() + 15);

        const newInv: Invoice = {
          id: newId,
          clientName: manualClient,
          amountCOPm: amountVal,
          amountUSD: Number((amountVal / 4000).toFixed(2)),
          description: manualDesc || "Concepto General",
          issueDate: today,
          dueDate: due.toISOString().split("T")[0],
          status: InvoiceStatus.PENDIENTE,
          creatorAddress: wallet.address || "0x7cD2...C3a1",
          type: "ingreso"
        };

        setInvoices((prev) => [newInv, ...prev]);

        // Add Solidity Event Log
        const newBlock = 18451203 + blockchainEvents.length + 1;
        setBlockchainEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            blockNumber: newBlock,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            eventName: "InvoiceCreated",
            txHash,
            args: { id: newId, recipient: wallet.address || "0x7cD2...C3a1", amount: `${amountVal.toLocaleString()} COPm` }
          },
          ...prev
        ]);

        playChime("success");
        speakText(`Cobro manual ${newId} generado`);

        setManualClient("");
        setManualAmount("");
        setManualDesc("");
        setShowManualCreate(false);
      }
    });
  };

  const handleManualPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(manualAmount, 10);
    if (!manualClient.trim() || isNaN(amountVal) || amountVal <= 0) return;

    if (wallet.celoBalance <= 0 && wallet.feeCurrency === "CELO") {
      playChime("error");
      speakText("Error: No tienes saldo de gas CELO");
      window.open("https://link.minipay.xyz/add_cash", "_blank");
      return;
    }

    setSignatureRequest({
      type: "pay",
      client: manualClient,
      amount: amountVal,
      desc: manualDesc || "Pago Directo",
      directPay: true,
      onSuccess: async (txHash) => {
        setIsProcessingAction(true);
        const newId = `inv-${Math.floor(Math.random() * 9000) + 1000}`;
        const today = new Date().toISOString().split("T")[0];

        const newInv: Invoice = {
          id: newId,
          clientName: manualClient,
          amountCOPm: amountVal,
          amountUSD: Number((amountVal / 4000).toFixed(2)),
          description: manualDesc || "Pago Directo",
          issueDate: today,
          dueDate: today,
          status: InvoiceStatus.PAGADO,
          creatorAddress: wallet.address || "0x7cD2...C3a1",
          txHash,
          type: "egreso"
        };

        wallet.deductBalance(amountVal);
        
        let gasSpent = 0.005;
        let feeString = `${gasSpent} CELO`;
        if (wallet.feeCurrency === "COPm") {
          gasSpent = 0;
          feeString = "0.00 COPm (Gasless)";
        } else if (wallet.feeCurrency === "cUSD") {
          gasSpent = 0.0001;
          feeString = "0.0001 cUSD (~0.4 COPm)";
        }
        
        wallet.useGas(gasSpent);
        setInvoices((prev) => [newInv, ...prev]);

        // Add solidity contract event
        const newBlock = 18451203 + blockchainEvents.length + 1;
        setBlockchainEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            blockNumber: newBlock,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            eventName: "InvoicePaid",
            txHash,
            args: { id: newId, payer: wallet.address || "0x7cD2...C3a1", amount: `${amountVal.toLocaleString()} COPm`, fee: feeString }
          },
          ...prev
        ]);

        setIsProcessingAction(false);
        playChime("success");
        speakText("Pago directo procesado con éxito on chain");

        setManualClient("");
        setManualAmount("");
        setManualDesc("");
        setShowManualPay(false);
      }
    });
  };

  const renderSolidityEventLedger = () => {
    return (
      <div className="bg-[#080d1e] border border-white/5 p-5 rounded-[28px] space-y-3.5 relative overflow-hidden">
        {/* Decorative glowing network status indicator */}
        <div className="absolute top-0 right-0 bg-[#10b981]/15 border-b border-l border-emerald-500/20 px-3 py-1 rounded-bl-xl text-[8px] font-mono font-bold text-emerald-400 animate-pulse flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></span>
          CELO RPC LIVE
        </div>

        <div className="space-y-0.5">
          <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">Blockchain Event Ledger</h4>
          <p className="text-[9px] text-slate-500 font-sans">Logs de ejecución de contratos inteligentes Celo en tiempo real</p>
        </div>

        <div className="space-y-2.5 max-h-[195px] overflow-y-auto pr-1">
          {blockchainEvents.map((evt) => (
            <div key={evt.id} className="bg-slate-950/60 border border-white/5 p-2.5 rounded-xl space-y-1.5 transition hover:bg-slate-950/90 font-mono text-[9px]">
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                  {evt.eventName}
                </span>
                <span className="text-slate-500">B#{evt.blockNumber} • {evt.timestamp}</span>
              </div>
              
              <div className="text-[8px] text-slate-350 bg-[#040713] p-1.5 rounded space-y-0.5 leading-relaxed font-mono">
                {Object.entries(evt.args).map(([key, val]) => (
                  <div key={key} className="flex justify-between truncate">
                    <span className="text-slate-500 font-semibold">{key}:</span>
                    <span className="text-slate-350 truncate max-w-[200px]" title={String(val)}>{String(val)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-[8px] text-slate-500 pt-1 border-t border-white/5 font-mono">
                <span>Tx Hash:</span>
                <span className="text-slate-450 truncate w-[160px] cursor-pointer hover:text-[#10b981]" title={evt.txHash}>
                  {evt.txHash.slice(0, 10)}...{evt.txHash.slice(-8)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const stats = dynamicStats();

  return (
    <div className={`h-screen w-screen transition-all duration-500 overflow-hidden flex items-center justify-center p-0 font-sans relative ${performanceMode ? "bg-[#020617]" : "bg-[#020617] text-slate-100"}`}>
      {/* Ambient Glows from the Immersive UI design mockup */}
      {!performanceMode && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none z-0"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/8 blur-[130px] rounded-full pointer-events-none z-0"></div>
        </>
      )}

      {/* Main Container: dynamically scales between MiniPay Frame and Full Widescreen Dashboard */}
      <div 
        className={`w-full h-full relative flex ${
          isDeviceView 
            ? "w-full h-full flex-col bg-[#0b1329] overflow-hidden z-10" 
            : "w-full h-full bg-[#020617]/40 backdrop-blur-xl flex-row overflow-hidden z-10"
        }`}
      >
        
        {/* ==================== SCREEN 1: SIMULATED MOBILE (MINIPAY) ==================== */}
        {isDeviceView ? (
          <div className="flex-1 flex flex-col h-full bg-[#030712] relative overflow-hidden">
            {/* Ambient sub-lights inside the phone screen */}
            <div className="absolute top-0 left-0 w-full h-full bg-[#020617]/80 z-0"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-emerald-500/5 blur-[90px] rounded-full pointer-events-none"></div>

            {/* Header: Hide when input focused to rescue responsive 360x640 space */}
            <header className={`transition-all duration-300 z-40 relative ${isInputFocused && activeTab === "chat" ? "h-0 opacity-0 pointer-events-none py-0 overflow-hidden" : "h-auto py-3.5 px-4 bg-[#0a0f1d]/90 border-b border-white/5 backdrop-blur-lg"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Bot className="text-slate-950" size={17} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h1 className="font-display font-semibold text-sm tracking-tight text-white leading-none">LucasBot</h1>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono px-1 rounded-full px-1.5 py-0.2">MiniPay</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Celo Mainnet (COPm)</p>
                  </div>
                </div>

                {/* Wallet Balance Tag inside Mobile header */}
                <div className="flex items-center gap-1">
                  {wallet.isConnected ? (
                    <button
                      onClick={() => {
                        playChime("click");
                        if (confirm("¿Deseas desconectar tu billetera?")) {
                          wallet.disconnectWallet();
                        }
                      }}
                      className="flex items-center gap-2 bg-white/5 hover:bg-red-500/10 border border-white/10 rounded-xl px-2.5 py-1 text-right transition cursor-pointer select-none"
                    >
                      <div className="text-[9px] leading-tight font-mono">
                        <div className="text-emerald-400 font-bold">{wallet.address?.substring(0, 5)}...{wallet.address?.substring(wallet.address.length - 3)}</div>
                        <div className="text-slate-400 text-[8px]" style={{ fontSize: "7px" }}>{wallet.celoBalance > 0 ? `${wallet.celoBalance} CELO` : "Gas 0"}</div>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playChime("click");
                        setShowConnectModal(true);
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[10px] transition duration-200 cursor-pointer flex items-center gap-1 shadow shadow-emerald-500/10"
                    >
                      <Wallet size={10} />
                      Conectar
                    </button>
                  )}
                </div>
              </div>

              {/* Gas Alert bar & balances */}
              {wallet.isConnected && (
                <div className="flex items-center justify-between mt-2.5 bg-black/40 border border-white/5 rounded-lg py-1 px-2 text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    Saldo: <strong className="text-emerald-400">${wallet.cUSDBalance.toLocaleString("es-CO")} COPm</strong>
                  </span>
                  <div className="flex items-center gap-1.5 scale-90">
                    <button
                      onClick={() => wallet.setBalances(wallet.cUSDBalance, 0)}
                      className={`px-1 py-0.5 rounded cursor-pointer ${wallet.celoBalance === 0 ? "bg-red-500/20 text-red-300 font-bold" : "bg-white/5 text-slate-400"}`}
                      title="Simular gas 0 para ver error"
                    >
                      Sin Gas
                    </button>
                    <button
                      onClick={() => wallet.setBalances(wallet.cUSDBalance, 0.15)}
                      className={`px-1 py-0.5 rounded cursor-pointer ${wallet.celoBalance > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-slate-400"}`}
                      title="Dar Gas"
                    >
                      Con Gas
                    </button>
                  </div>
                </div>
              )}
            </header>

            {/* Dynamic tabs content block for Mobile view */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 relative z-10">
              
              {/* CHAT TAB */}
              {activeTab === "chat" && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 min-h-0">
                    {messages.map((msg, index) => {
                      const isBot = msg.sender === "bot";
                      const isWidgetOpen = openWidgets[msg.id] !== false;

                      return (
                        <div key={msg.id || index} className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-1.5 max-w-full`}>
                          {isBot && (
                            <div className="w-6 h-6 rounded-lg bg-[#0d1527] border border-white/5 flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="text-emerald-400" size={12} />
                            </div>
                          )}

                          <div className="max-w-[85%] flex flex-col space-y-1.5">
                            {msg.text && (
                              <div className={`p-3 rounded-2xl text-[11px] leading-relaxed ${isBot ? "bg-white/5 border border-white/10 rounded-tl-sm text-slate-200" : "bg-gradient-to-br from-emerald-600/90 to-cyan-700/90 text-white rounded-tr-sm shadow-md"}`}>
                                <p className="whitespace-pre-line text-slate-200">
                                  {msg.text.split("\n\n").map((chunk, itemIdx) => {
                                    const parsed = chunk.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                        .replace(/\*(.*?)\*/g, '<em>$1</em>');
                                    return <span key={itemIdx} className="block mb-1.5" dangerouslySetInnerHTML={{ __html: parsed }} />;
                                  })}
                                </p>
                                <span className={`block text-[7px] mt-1 text-right ${isBot ? "text-slate-500" : "text-white/60"}`}>
                                  {msg.timestamp}
                                </span>
                              </div>
                            )}

                            {/* Widgets inside Mobile flow */}
                            {msg.widget && (
                              <div className="relative border border-[#10b981]/25 shadow-xl rounded-2xl overflow-hidden bg-[#0a0f1d] z-10">
                                <div 
                                  onClick={() => toggleWidgetAccordion(msg.id)}
                                  className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5 cursor-pointer hover:bg-white/10"
                                >
                                  <div className="flex items-center gap-1.5 text-[10px] text-white font-medium">
                                    <span className={`w-1.5 h-1.5 rounded-full ${msg.widget.type === "receipt" ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`}></span>
                                    {msg.widget.type === "create_invoice" && "Aprobar Factura LucasBot"}
                                    {msg.widget.type === "payment_invoice" && "Pagar Factura Celo"}
                                    {msg.widget.type === "receipt" && "Recibo On-Chain Confirmado"}
                                  </div>
                                  <span className="text-slate-400 scale-90">
                                    {isWidgetOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                  </span>
                                </div>

                                {isWidgetOpen ? (
                                  <div className="p-3 text-[10px] space-y-2">
                                    {msg.widget.type === "create_invoice" && (
                                      <div>
                                        <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-white/5 font-mono text-[9px]">
                                          <div className="flex justify-between">
                                            <span className="text-slate-550">Cliente:</span>
                                            <span className="text-white hover:underline">{msg.widget.payload.client}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-550">Servicio:</span>
                                            <span className="text-slate-200 truncate max-w-[120px]">{msg.widget.payload.desc}</span>
                                          </div>
                                          <div className="h-px bg-white/5 my-1" />
                                          <div className="flex justify-between text-xs font-sans">
                                            <span className="text-slate-400">Total:</span>
                                            <span className="text-emerald-400 font-bold">${msg.widget.payload.amount?.toLocaleString("es-CO")} COPm</span>
                                          </div>
                                        </div>
                                        <div className="mt-2.5 flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => toggleWidgetAccordion(msg.id)}
                                            className="flex-1 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-[9px] text-slate-300 font-bold cursor-pointer"
                                          >
                                            Rechazar
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleConfirmInvoiceCreation(msg.widget?.payload, msg.id)}
                                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[9px] flex items-center justify-center gap-1 shadow-md cursor-pointer"
                                          >
                                            <Check size={10} strokeWidth={3} />
                                            Confirmar
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {msg.widget.type === "payment_invoice" && (
                                      <div>
                                        <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-[#10b981]/20 font-mono text-[9px]">
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Destinatario:</span>
                                            <span className="text-slate-200">{msg.widget.payload.client || "Destinatario"}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Monto COPm:</span>
                                            <span className="text-emerald-400 font-bold text-xs">${msg.widget.payload.amount?.toLocaleString("es-CO")}</span>
                                          </div>
                                        </div>

                                        <div className="mt-2.5">
                                          {wallet.celoBalance <= 0 ? (
                                            <div className="space-y-1.5">
                                              <div className="p-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded text-[8px] leading-tight">
                                                No tienes gas (CELO). Deposite fondos en MiniPay para seguir.
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => handlePayment(msg.widget, msg.id)}
                                                className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-lg text-[9px] flex items-center justify-center gap-1 cursor-pointer"
                                              >
                                                Cargar saldo para continuar
                                              </button>
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => handlePayment(msg.widget, msg.id)}
                                              disabled={isProcessingAction}
                                              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-bold rounded-lg text-[9px] flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-emerald-500/20"
                                            >
                                              {isProcessingAction ? <RefreshCw className="animate-spin" size={10} /> : <Wallet size={10} />}
                                              {msg.widget.payload.isEscrow ? "Retener Fondos en Escrow 🔒" : "Saldar en Un Toque ⚡"}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {msg.widget.type === "receipt" && (
                                      <div>
                                        <div className="bg-emerald-950/15 border border-emerald-500/20 p-2 rounded-xl space-y-1 font-mono text-[9px] text-slate-300">
                                          <div className="text-emerald-400 font-bold text-[8px] flex items-center gap-0.5 mb-1 bg-emerald-500/10 w-fit px-1 rounded-full uppercase">
                                            <CheckCircle size={8} /> CONFIRMADO
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Factura ID:</span>
                                            <span className="text-slate-100">{msg.widget.payload.id || "inv-11"}</span>
                                          </div>
                                          <div className="flex justify-between border-t border-white/5 pt-1">
                                            <span>Monto:</span>
                                            <span className="text-emerald-300 font-bold">${msg.widget.payload.amount?.toLocaleString("es-CO")}</span>
                                          </div>
                                          <div className="text-[8px] text-slate-500 truncate pt-1 leading-tight select-all">
                                            Tx: {msg.widget.payload.txHash}
                                          </div>
                                        </div>
                                        <a
                                          href={`https://celoscan.io/tx/${msg.widget.payload.txHash}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="mt-2 text-center text-[8px] text-cyan-400 flex items-center justify-center gap-1 hover:underline"
                                        >
                                          <>
                                            <div className="bg-[#030612]/70 border border-white/5 rounded-2xl p-2.5 my-2.5 flex flex-col items-center">
                                              <PaymentQRCode
                                                id={msg.widget.payload.id || "inv-11"}
                                                amount={msg.widget.payload.amount || 100000}
                                                client={msg.widget.payload.client || "Cliente"}
                                                description={msg.widget.payload.desc || "LucasBot Cobro"}
                                              />
                                            </div>
                                            <span className="flex items-center justify-center gap-1">Ver Explorer en Celoscan <ExternalLink size={8} /></span>
                                          </>
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="px-3 py-1 bg-black/20 text-slate-500 text-[8px] flex justify-between items-center">
                                    <span>Transacción de cobro minimizada...</span>
                                    <span className="text-emerald-400 hover:underline cursor-pointer">Desplegar</span>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        </div>
                      );
                    })}

                    {isBotTyping && (
                      <div className="flex justify-start items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <Bot className="text-emerald-400 animate-pulse" size={12} />
                        </div>
                        <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-[10px] text-slate-400">
                          LucasBot interpretando...
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat input block with Audio Recording and Text-To-Speech triggers */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-black/40 border-t border-white/5 relative z-20">
                    {/* Floating suggestions */}
                    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setInputText("Cobra 120000 COP a Carlos por logos profesionales")}
                        className="shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-350 rounded-full px-2.5 py-1 text-[9px] cursor-pointer"
                      >
                        ⚡ Cobrar $120k a Carlos
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputText("Págale 80000 COP a Sofia por soporte")}
                        className="shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-350 rounded-full px-2.5 py-1 text-[9px] cursor-pointer"
                      >
                        💸 Pagar $80k a Sofia
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
                      {/* Audio mute/unmute control */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !isAudioEnabled;
                          setIsAudioEnabled(nextVal);
                          if (nextVal) {
                            setTimeout(() => playChime("success"), 100);
                          }
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${isAudioEnabled ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 bg-white/5"}`}
                        title={isAudioEnabled ? "Desactivar audio de voz" : "Activar audio asistente"}
                      >
                        {isAudioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                      </button>

                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setTimeout(() => setIsInputFocused(false), 250)}
                        placeholder="Escribe o pulsa micro para hablar..."
                        className="flex-1 bg-transparent px-2 py-1.5 text-[11px] focus:outline-none text-white placeholder-slate-500 border-0"
                      />

                      {/* Microphone speech recorder trigger */}
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${isRecording ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:text-white bg-white/5"}`}
                        title="Grabar comando de voz"
                      >
                        {isRecording ? <MicOff size={11} /> : <Mic size={11} />}
                      </button>

                      <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${inputText.trim() ? "bg-emerald-500 text-slate-950 cursor-pointer" : "bg-white/5 text-slate-500"}`}
                      >
                        <Send size={10} strokeWidth={2.5} />
                      </button>
                    </div>
                    {isRecording && (
                      <div className="text-[8px] text-center text-red-400 font-mono mt-1 animate-pulse">
                        🔴 Escuchando tu voz... Habla ahora
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* DASHBOARD LEDGER TAB */}
              {activeTab === "dashboard" && (
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  
                  {/* Financial Graph comparisons for Mobile */}
                  <div className="space-y-1">
                    <h3 className="font-display font-semibold text-xs text-slate-250">Estadísticas Financieras</h3>
                    <FinanceCharts invoices={invoices} isMobile={true} />
                  </div>

                  {/* Manual Creation & Outbound Payment Quick forms */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Acciones Rápidas (Celo Direct)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setShowManualCreate(!showManualCreate);
                          setShowManualPay(false);
                          playChime("click");
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-[10px] font-sans font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${showManualCreate ? "bg-emerald-500 text-slate-950 border-emerald-400" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/15"}`}
                      >
                        <ArrowUpRight size={12} />
                        + Emitir Cobro
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowManualPay(!showManualPay);
                          setShowManualCreate(false);
                          playChime("click");
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-[10px] font-sans font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${showManualPay ? "bg-red-500 text-white border-red-400" : "bg-red-500/10 text-red-300 border-red-500/25 hover:bg-red-500/15"}`}
                      >
                        <ArrowDownRight size={12} />
                        - Enviar Pago
                      </button>
                    </div>

                    {/* Manual Billing form */}
                    {showManualCreate && (
                      <form onSubmit={handleManualCreateSubmit} className="bg-slate-900/60 border border-emerald-500/30 p-3 rounded-2xl space-y-2.5">
                        <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">📥 Crear Plantilla de Cobro</div>
                        <div className="space-y-1.5">
                          <input 
                            type="text" 
                            required
                            placeholder="Nombre del cliente" 
                            value={manualClient}
                            onChange={(e) => setManualClient(e.target.value)}
                            className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                          />
                          <input 
                            type="number" 
                            required
                            placeholder="Cantidad en COPm (Ej: 145000)" 
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Concepto o descripción" 
                            value={manualDesc}
                            onChange={(e) => setManualDesc(e.target.value)}
                            className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button" 
                            onClick={() => setShowManualCreate(false)}
                            className="px-2.5 py-1 hover:bg-white/5 text-[9px] text-slate-400 rounded-lg"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            className="px-3.5 py-1 bg-emerald-500 text-slate-950 text-[9px] font-bold rounded-lg cursor-pointer"
                          >
                            Generar Cobro
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Manual Outbound Expense form */}
                    {showManualPay && (
                      <form onSubmit={handleManualPaySubmit} className="bg-slate-900/60 border border-red-500/30 p-3 rounded-2xl space-y-2.5">
                        <div className="text-[9px] font-mono text-red-400 font-bold uppercase">📤 Enviar Pago Directo (On-Chain)</div>
                        <div className="space-y-1.5">
                          <input 
                            type="text" 
                            required
                            placeholder="Nombre del destinatario" 
                            value={manualClient}
                            onChange={(e) => setManualClient(e.target.value)}
                            className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                          />
                          <input 
                            type="number" 
                            required
                            placeholder="Cantidad en COPm (Ej: 90000)" 
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Concepto o descripción" 
                            value={manualDesc}
                            onChange={(e) => setManualDesc(e.target.value)}
                            className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                          />
                        </div>
                        {wallet.celoBalance <= 0 ? (
                          <div className="text-[8px] text-red-400 font-mono bg-red-500/5 p-1 rounded">
                            ⚠️ Se requiere saldo de gas CELO para saldar esta orden.
                          </div>
                        ) : null}
                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button" 
                            onClick={() => setShowManualPay(false)}
                            className="px-2.5 py-1 hover:bg-white/5 text-[9px] text-slate-400 rounded-lg"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            disabled={isProcessingAction || wallet.celoBalance <= 0}
                            className="px-3.5 py-1 bg-red-500 text-white text-[9px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            {isProcessingAction ? <RefreshCw size={8} className="animate-spin" /> : null}
                            Confirmar Pago
                          </button>
                        </div>
                      </form>
                    )}

                  </div>

                  {/* Ledger history list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-medium text-[11px] text-white">Transacciones Recientes</h3>
                      <div className="flex gap-1">
                        {(["All", InvoiceStatus.PENDIENTE, InvoiceStatus.RETENIDO, InvoiceStatus.PAGADO] as const).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setFilter(opt)}
                            className={`text-[8px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition ${filter === opt ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-slate-500"}`}
                          >
                            {opt === "All" ? "Todos" : opt === InvoiceStatus.PENDIENTE ? "Pendientes" : opt === InvoiceStatus.RETENIDO ? "Garantía (🔒)" : "Cobradas"}
                          </button>
                        ))}
                      </div>
                    </div>
 
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                      {invoices
                        .filter((item) => filter === "All" || item.status === filter)
                        .map((item) => {
                          const isExpense = item.type === "egreso";
                          return (
                            <div 
                              key={item.id}
                              className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-[10px]"
                            >
                              <div className="min-w-0 pr-2 flex items-center gap-2">
                                {/* Visual direction vector indicator icon */}
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isExpense ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                                  {isExpense ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] text-slate-500 font-mono">{item.id}</span>
                                    <h4 className="text-slate-200 font-medium truncate">{item.clientName}</h4>
                                  </div>
                                  <p className="text-[9px] text-slate-400 truncate">{item.description}</p>
                                </div>
                              </div>
                              
                              <div className="text-right shrink-0">
                                <span className={`font-bold font-mono ${isExpense ? "text-red-400" : "text-emerald-400"}`}>
                                  {isExpense ? "-" : "+"}${item.amountCOPm.toLocaleString("es-CO")}
                                </span>
                                <div className="mt-1">
                                  {item.status === InvoiceStatus.PAGADO ? (
                                    <span className="text-[7px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded font-bold">Cobrado</span>
                                  ) : item.status === InvoiceStatus.RETENIDO ? (
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-[7.5px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase font-mono">Retenido 🔒</span>
                                      <button
                                        onClick={() => handleReleaseEscrow(item)}
                                        disabled={isProcessingAction}
                                        className="text-[7.5px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/25 px-1.5 py-0.5 border border-emerald-500/20 rounded cursor-pointer transition font-mono font-bold"
                                      >
                                        Liberar
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1 justify-end">
                                      <button
                                        onClick={() => handlePayment(item, "manual")}
                                        disabled={isProcessingAction}
                                        className="text-[7px] text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 px-1 py-0.5 border border-amber-500/20 rounded cursor-pointer transition font-mono font-bold"
                                        title="Pagar Directo"
                                      >
                                        Pagar
                                      </button>
                                      <button
                                        onClick={() => handleLockEscrow(item)}
                                        disabled={isProcessingAction}
                                        className="text-[7px] text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 px-1 py-0.5 border border-cyan-500/20 rounded cursor-pointer transition font-mono font-bold"
                                        title="Retener en Escrow de Celo"
                                      >
                                        Escrow
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  
                  {/* Real-time Solidity Smart Contract Events Panel */}
                  <div className="mt-4">
                    {renderSolidityEventLedger()}
                  </div>
                </div>
              )}

              {/* SETTINGS SUPPORT TAB */}
              {activeTab === "settings" && (
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  {/* Security On-chain assurance */}
                  <div className="bg-gradient-to-br from-emerald-900/10 to-transparent border border-emerald-500/20 rounded-2xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-display text-xs">
                      <ShieldCheck size={14} />
                      <h4>Garantía On-Chain Celo</h4>
                    </div>
                    <p className="text-[9px] text-slate-350 leading-relaxed">
                      "Tus fondos están protegidos en la de blockchain de Celo. LucasBot no tiene acceso a tus llaves y tú autorizas cada movimiento."
                    </p>
                  </div>

                  {/* Sandbox actions */}
                  <div className="bg-[#12192e] border border-white/5 rounded-2xl p-3 space-y-2">
                    <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider block">Billetera Sandbox</span>
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                      <button
                        onClick={() => wallet.setBalances(wallet.cUSDBalance + 200000, wallet.celoBalance)}
                        className="py-1 px-1.5 bg-[#0a0f1d] hover:bg-white/5 rounded text-slate-300 border border-white/5 cursor-pointer"
                      >
                        + $200k COPm
                      </button>
                      <button
                        onClick={() => wallet.setBalances(wallet.cUSDBalance, 0)}
                        className="py-1 px-1.5 bg-[#0a0f1d] hover:bg-white/5 rounded text-slate-300 border border-white/5 cursor-pointer"
                      >
                        Simular Gas 0
                      </button>
                    </div>
                  </div>

                  {/* Legal store links */}
                  <div className="text-[8px] text-slate-500 space-y-1 pt-2 border-t border-white/5 font-mono">
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[7px]">COMPLIANCE OBLIGATORIO MINIPAY:</p>
                    <div className="flex gap-3">
                      <a href="https://minipay.xyz/terms" target="_blank" rel="noopener" className="underline hover:text-slate-300">Terms of Service</a>
                      <a href="https://minipay.xyz/privacy" target="_blank" rel="noopener" className="underline hover:text-slate-300">Privacy Policy</a>
                    </div>
                  </div>
                </div>
              )}

            </main>

            {/* Mobile Tab nav */}
            <footer className="grid grid-cols-3 border-t border-white/5 py-2.5 bg-[#0c1224] z-40 text-center relative shrink-0">
              <button
                type="button"
                onClick={() => { setActiveTab("chat"); setIsInputFocused(false); }}
                className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === "chat" ? "text-emerald-400 font-bold" : "text-slate-500"}`}
              >
                <Bot size={15} />
                <span className="text-[8px]">Asistente AI</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("dashboard"); setIsInputFocused(false); }}
                className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === "dashboard" ? "text-emerald-400 font-bold" : "text-slate-500"}`}
              >
                <FileText size={15} />
                <span className="text-[8px]">Bento Ledger</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("settings"); setIsInputFocused(false); }}
                className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === "settings" ? "text-emerald-400 font-bold" : "text-slate-500"}`}
              >
                <Settings size={15} />
                <span className="text-[8px]">Ajustes</span>
              </button>
            </footer>

          </div>
        ) : (
          
          /* ==================== SCREEN 2: STANDALONE WIDESCREEN IMMERSIVE UI ==================== */
          <>
            {/* Sidebar Navigation */}
            <nav className="w-20 border-r border-white/10 flex flex-col items-center py-8 gap-10 bg-black/15 backdrop-blur-xl z-20 shrink-0 select-none">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all hover:scale-105">
                <Bot className="text-[#020617]" size={24} strokeWidth={2.5} />
              </div>
              
              <div className="flex flex-col gap-8">
                <button 
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`p-3 rounded-xl transition-all hover:scale-105 cursor-pointer ${activeTab === "chat" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold" : "text-slate-400 hover:bg-white/5"}`}
                  title="AI Chat"
                >
                  <Bot size={22} />
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className={`p-3 rounded-xl transition-all hover:scale-105 cursor-pointer ${activeTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold" : "text-slate-400 hover:bg-white/5"}`}
                  title="Historial Ledger"
                >
                  <FileText size={22} />
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className={`p-3 rounded-xl transition-all hover:scale-105 cursor-pointer ${activeTab === "settings" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold" : "text-slate-400 hover:bg-white/5"}`}
                  title="Configuración"
                >
                  <Settings size={22} />
                </button>
              </div>

              <div className="mt-auto flex flex-col gap-6 items-center">
                <div className="w-10 h-10 rounded-full border border-emerald-500/30 p-0.5 bg-slate-900 flex items-center justify-center font-mono text-[10px] text-emerald-400 font-bold">
                  GD
                </div>
              </div>
            </nav>

            {/* Main content Workspace view styled like the widescreen template */}
            <main className="flex-1 flex flex-col p-6 gap-6 relative z-10 overflow-hidden min-w-0">
              
              {/* Header with detailed balances and status flags */}
              <header className="flex items-center justify-between shrink-0">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-white font-display">
                    LucasBot
                    <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 uppercase tracking-widest leading-none">
                      Celo Mainnet
                    </span>
                  </h1>
                  <p className="text-slate-450 text-xs">Gestión financiera inteligente para freelancers y comercios en Colombia</p>
                </div>

                {/* Status Indicator Bar */}
                <div className="flex items-center gap-4">
                  {wallet.isConnected ? (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 relative group">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                      <div className="text-left">
                        <div className="text-[8px] text-slate-500 uppercase font-mono tracking-wider flex justify-between items-center gap-2">
                          <span>Dirección Wallet</span>
                          <span className="text-emerald-400 font-bold bg-emerald-400/10 px-1 py-[1px] rounded text-[7px]" style={{ fontSize: "7px" }}>Conectado</span>
                        </div>
                        <div className="text-[11px] font-mono font-bold text-slate-200">
                          {wallet.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}` : "0x7cD2...C3a1"}
                        </div>
                      </div>
                      
                      <div className="border-l border-white/10 pl-3">
                        <div className="text-[8px] text-slate-500 uppercase font-mono tracking-wider">Saldo Celo</div>
                        <div className="text-[11px] font-bold text-emerald-400 font-mono">
                          ${wallet.cUSDBalance.toLocaleString("es-CO")} COPm
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          playChime("click");
                          wallet.disconnectWallet();
                        }}
                        className="ml-2 text-[9px] text-red-400 hover:text-red-300 border border-red-500/15 hover:bg-red-500/10 bg-red-500/5 px-2 py-1 rounded-lg transition duration-200 cursor-pointer hidden group-hover:block"
                        title="Desconectar Billetera"
                      >
                        Desconectar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          playChime("click");
                          setShowConnectModal(true);
                        }}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-2xl text-xs transition duration-200 cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/15"
                      >
                        <Wallet size={13} />
                        Conectar MetaMask / Valora
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* 12-Column Responsive Workspace Content Layout */}
              <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden min-h-0">
                
                {/* GRID PATH 1: CHAT TAB EXPANDED */}
                {activeTab === "chat" && (
                  <>
                    {/* Left Column: Chat thread container */}
                    <section className="col-span-12 lg:col-span-7 flex flex-col bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[32px] overflow-hidden min-h-0">
                      <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto min-h-0">
                        {messages.map((msg, index) => {
                          const isBot = msg.sender === "bot";
                          const isWidgetOpen = openWidgets[msg.id] !== false;

                          return (
                            <div key={msg.id || index} className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-3.5 max-w-full`}>
                              {isBot && (
                                <div className="w-8 h-8 rounded-xl bg-slate-930 border border-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                  <Bot className="text-emerald-405" size={16} />
                                </div>
                              )}

                              <div className="max-w-[80%] flex flex-col space-y-2">
                                {msg.text && (
                                  <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-lg ${isBot ? "bg-white/5 border border-white/10 rounded-tl-sm text-slate-200" : "bg-gradient-to-br from-emerald-600/90 to-cyan-700/90 text-white rounded-tr-sm"}`}>
                                    <p className="whitespace-pre-line text-slate-200 leading-normal font-sans">
                                      {msg.text.split("\n\n").map((chunk, itemIdx) => {
                                        const parsed = chunk.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                            .replace(/\*(.*?)\*/g, '<em>$1</em>');
                                        return <span key={itemIdx} className="block mb-1.5" dangerouslySetInnerHTML={{ __html: parsed }} />;
                                      })}
                                    </p>
                                    <span className={`block text-[7px] mt-1.5 text-right ${isBot ? "text-slate-500" : "text-white/60"}`}>
                                      {msg.timestamp}
                                    </span>
                                  </div>
                                )}

                                {/* Interactive widgets in wider layout */}
                                {msg.widget && (
                                  <div className="relative border border-[#10b981]/25 bg-slate-950/85 shadow-2xl rounded-2xl overflow-hidden min-w-[270px]">
                                    <div 
                                      onClick={() => toggleWidgetAccordion(msg.id)}
                                      className="flex items-center justify-between px-3.5 py-2.5 bg-white/5 border-b border-white/5 cursor-pointer hover:bg-white/10"
                                    >
                                      <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                                        <span className={`w-2 h-2 rounded-full ${msg.widget.type === "receipt" ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`}></span>
                                        {msg.widget.type === "create_invoice" && "Verificar Cobro LucasBot"}
                                        {msg.widget.type === "payment_invoice" && "Pagar Factura Pendiente"}
                                        {msg.widget.type === "receipt" && "Recibo On-Chain Confirmado"}
                                      </div>
                                      <button className="text-slate-400">
                                        {isWidgetOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                      </button>
                                    </div>

                                    {isWidgetOpen && (
                                      <div className="p-4 text-xs space-y-3">
                                        {msg.widget.type === "create_invoice" && (
                                          <div>
                                            <div className="space-y-1.5 bg-[#020617]/40 p-3 rounded-xl border border-white/5 font-mono text-[11px] text-slate-350">
                                              <div className="flex justify-between">
                                                <span>Cliente:</span>
                                                <span className="text-white hover:underline">{msg.widget.payload.client}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span>Servicio / Item:</span>
                                                <span className="text-slate-200">{msg.widget.payload.desc}</span>
                                              </div>
                                              <div className="h-px bg-white/10 my-1.5" />
                                              <div className="flex justify-between text-xs font-sans">
                                                <span>Cobro COPm:</span>
                                                <span className="text-emerald-400 font-bold">${msg.widget.payload.amount?.toLocaleString("es-CO")} COPm</span>
                                              </div>
                                            </div>
                                            <div className="mt-3.5 flex gap-2.5">
                                              <button
                                                onClick={() => toggleWidgetAccordion(msg.id)}
                                                className="flex-1 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-xs text-slate-300 font-bold cursor-pointer"
                                              >
                                                Rechazar
                                              </button>
                                              <button
                                                onClick={() => handleConfirmInvoiceCreation(msg.widget?.payload, msg.id)}
                                                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                                              >
                                                <Check size={12} strokeWidth={3} />
                                                Emitir Cobro
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {msg.widget.type === "payment_invoice" && (
                                          <div>
                                            <div className="space-y-1.5 bg-[#020617]/40 p-3 rounded-xl border border-[#10b981]/25 font-mono text-[11px]">
                                              <div className="flex justify-between text-slate-400">
                                                <span>Destinatario:</span>
                                                <span className="text-slate-200">{msg.widget.payload.client || "Destinatario"}</span>
                                              </div>
                                              {msg.widget.payload.desc && (
                                                <div className="flex justify-between text-slate-400">
                                                  <span>Concepto:</span>
                                                  <span className="text-slate-250 truncate max-w-[150px]">{msg.widget.payload.desc}</span>
                                                </div>
                                              )}
                                              <div className="flex justify-between text-slate-400 font-bold">
                                                <span>Monto COPm:</span>
                                                <span className="text-emerald-400 font-bold text-sm">${msg.widget.payload.amount?.toLocaleString("es-CO")}</span>
                                              </div>
                                              <div className="flex justify-between text-slate-400 text-[10.5px]">
                                                <span>Modalidad:</span>
                                                <span className={msg.widget.payload.isEscrow ? "text-amber-400 font-bold" : "text-cyan-400 font-bold"}>
                                                  {msg.widget.payload.isEscrow ? "Garantía Escrow 🔒" : "Pago Directo ⚡"}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="mt-3">
                                              {wallet.celoBalance <= 0 ? (
                                                <div className="space-y-1.5">
                                                  <div className="p-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-[10px] leading-relaxed">
                                                    Salgo de gas insuficiente. Por favor deposita en tu billetera.
                                                  </div>
                                                  <button
                                                    onClick={() => handlePayment(msg.widget, msg.id)}
                                                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                                  >
                                                    Cargar Saldo para Continuar
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  onClick={() => handlePayment(msg.widget, msg.id)}
                                                  disabled={isProcessingAction}
                                                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                                                >
                                                  {isProcessingAction ? <RefreshCw className="animate-spin" size={12} /> : <Wallet size={12} />}
                                                  {msg.widget.payload.isEscrow ? "Retener Fondos en Escrow 🔒" : "Saldar en Un Toque ⚡"}
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {msg.widget.type === "receipt" && (
                                          <div>
                                            <div className="bg-emerald-950/15 border border-emerald-500/20 p-3 rounded-xl space-y-1.5 font-mono text-[11px] text-slate-300">
                                              <div className="text-emerald-400 font-bold text-[9px] flex items-center gap-1 mb-1.5 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                <CheckCircle size={10} /> Confirmado en Celo
                                              </div>
                                              <div className="flex justify-between">
                                                <span>Factura ID:</span>
                                                <span className="text-slate-100">{msg.widget.payload.id || "inv-11"}</span>
                                              </div>
                                              <div className="flex justify-between text-xs border-t border-white/5 pt-1.5">
                                                <span>Monto:</span>
                                                <span className="text-emerald-300 font-bold">${msg.widget.payload.amount?.toLocaleString("es-CO")}</span>
                                              </div>
                                              <div className="text-[10px] text-slate-500 break-all select-all pt-1 leading-normal">
                                                Tx Hash: {msg.widget.payload.txHash}
                                              </div>
                                            </div>
                                            <a
                                              href={`https://celoscan.io/tx/${msg.widget.payload.txHash}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="mt-3.5 text-center text-[10px] text-cyan-400 flex items-center justify-center gap-1 hover:underline"
                                            >
                                              <>
                                                <div className="bg-[#030612]/70 border border-white/5 rounded-2xl p-3 my-3 flex flex-col items-center">
                                                  <PaymentQRCode
                                                    id={msg.widget.payload.id || "inv-11"}
                                                    amount={msg.widget.payload.amount || 100000}
                                                    client={msg.widget.payload.client || "Cliente"}
                                                    description={msg.widget.payload.desc || "LucasBot Cobro"}
                                                  />
                                                </div>
                                                <span className="flex items-center justify-center gap-1.5">Ver Explorer en Celoscan <ExternalLink size={10} /></span>
                                              </>
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {isBotTyping && (
                          <div className="flex justify-start items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                              <Bot className="text-emerald-400 animate-pulse" size={16} />
                            </div>
                            <div className="bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs text-slate-400">
                              LucasBot interpretando el cobro en Celo...
                            </div>
                          </div>
                        )}
                        <div ref={chatBottomRef} />
                      </div>

                      {/* Chat Input section inside widescreen flow with voice recorders */}
                      <form onSubmit={handleSendMessage} className="p-4 bg-black/30 border-t border-white/5 relative z-20">
                        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
                          <button
                            type="button"
                            onClick={() => setInputText("Cobra 120000 COP a Carlos por logos profesionales")}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-full px-3 py-1.5 text-xs cursor-pointer select-none"
                          >
                            ⚡ Cobrar $120k a Carlos
                          </button>
                          <button
                            type="button"
                            onClick={() => setInputText("Paga 90000 COP a Sofia por servicios")}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-full px-3 py-1.5 text-xs cursor-pointer select-none"
                          >
                            💸 Enviar $90k a Sofia
                          </button>
                        </div>

                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5">
                          {/* Audio speaker reading toggle */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = !isAudioEnabled;
                              setIsAudioEnabled(nextVal);
                              if (nextVal) {
                                setTimeout(() => playChime("success"), 100);
                              }
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isAudioEnabled ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-slate-500 bg-white/5"}`}
                            title={isAudioEnabled ? "Mutear voz artificial" : "Desmutear asistente"}
                          >
                            {isAudioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                          </button>

                          <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Escribe en lenguaje natural o clica el micro de voz... (Ej: Cobra 120k COP a Carlos Gómez)"
                            className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none text-white placeholder-slate-500 border-0"
                          />

                          {/* Recording microphone toggle */}
                          <button
                            type="button"
                            onClick={toggleRecording}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isRecording ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:text-white bg-white/5"}`}
                            title="Grabar audio de voz"
                          >
                            {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                          </button>

                          <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 ${inputText.trim() ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer shadow-lg shadow-emerald-500/10" : "bg-white/5 text-slate-500"}`}
                          >
                            <span>Enviar</span>
                            <Send size={12} />
                          </button>
                        </div>
                        {isRecording && (
                          <div className="text-[10px] text-center text-red-400 font-mono mt-1.5 animate-pulse">
                            🔴 Micrófono Activo: Escuchando comando de voz...
                          </div>
                        )}
                      </form>
                    </section>

                    {/* Right Column: Premium Bento Stats Grid with Embedded Charts (widescreen) */}
                    <section className="col-span-12 lg:col-span-5 flex flex-col gap-6 overflow-y-auto min-h-0 pr-1">
                      {/* Embedded Live Finance Charts at the top of the details panel */}
                      <div className="bg-slate-900/40 border border-white/5 p-4 rounded-[28px] space-y-1">
                        <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-mono px-1">Estadísticas Comparativas</h4>
                        <FinanceCharts invoices={invoices} isMobile={false} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Bento Card 1: Monthly earnings */}
                        <div className="col-span-2 bg-[#10b981]/10 border border-[#10b981]/20 p-5 rounded-[28px] flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-widest font-mono">Ingresos Mensuales Cobrados</span>
                            <div className="text-3xl font-bold font-display text-white mt-1.5 flex items-baseline gap-1.5">
                              ${stats.totalPaidCOPm.toLocaleString("es-CO")}
                              <span className="text-xs text-emerald-450 font-mono">COPm</span>
                            </div>
                          </div>
                          
                          {/* Minimalist sparkline bar visualizer from standard design */}
                          <div className="flex items-end gap-1.5 h-10 mt-5">
                            <div className="w-full bg-emerald-500/20 h-4 rounded-sm" />
                            <div className="w-full bg-emerald-500/30 h-8 rounded-sm" />
                            <div className="w-full bg-emerald-500/40 h-6 rounded-sm" />
                            <div className="w-full bg-emerald-500/50 h-10 rounded-sm" />
                            <div className="w-full bg-emerald-500 h-10 rounded-sm animate-pulse" />
                          </div>
                        </div>

                        {/* Bento Card 2: Commissions saved */}
                        <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl">
                          <span className="text-[9px] text-slate-450 font-bold uppercase block tracking-wider font-mono">Fees Ahorrados</span>
                          <div className="text-xl font-bold font-display text-amber-400 mt-1">${stats.commissionsSavedCOPm.toLocaleString("es-CO")}</div>
                          <p className="text-[9px] text-slate-500 mt-1.5 leading-snug">Vs pasarelas y bancos tradicionales.</p>
                        </div>

                        {/* Bento Card 3: Success rate */}
                        <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl">
                          <span className="text-[9px] text-slate-450 font-bold uppercase block tracking-wider font-mono">Tasa de Liquidación</span>
                          <div className="text-xl font-bold font-display text-emerald-400 mt-1">98.4%</div>
                          <p className="text-[9px] text-slate-500 mt-1.5 leading-snug">Pagos on-chain encriptados.</p>
                        </div>

                        {/* Bento Card 4: Trust on-chain guarantee */}
                        <div className="col-span-2 bg-[#12192f] border border-white/5 p-5 rounded-3xl flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-[#10b981]/10 flex items-center justify-center shrink-0 text-emerald-400">
                            <ShieldCheck size={22} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-200">Seguridad On-Chain Garantizada</h4>
                            <p className="text-[10px] text-slate-450 mt-0.5 leading-snug">LucasBot no custodia fondos, ni las llaves de tu billetera MiniPay.</p>
                          </div>
                        </div>
                      </div>

                      {/* Live Recent Invoices segment */}
                      <div className="bg-slate-900/40 border border-white/5 p-5 rounded-[28px] flex-1 flex flex-col min-h-[190px]">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest font-mono">Actividad Reciente On-Chain</h4>
                          <span onClick={() => setActiveTab("dashboard")} className="text-[10px] text-emerald-400 underline cursor-pointer hover:text-emerald-350">Ver Todo</span>
                        </div>
                        
                        <div className="space-y-2 overflow-y-auto pr-0.5 flex-1 max-h-[170px]">
                          {invoices.slice(0, 3).map((item) => {
                            const initials = item.clientName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "CL";
                            const isExpense = item.type === "egreso";
                            return (
                              <div key={item.id} className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                {/* Vector direction indicator badge */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${isExpense ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                                  {isExpense ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-slate-200 truncate">{item.clientName}</div>
                                  <div className="text-[9px] text-slate-500">{item.description}</div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className={`text-[11px] font-bold font-mono ${isExpense ? "text-red-400" : "text-emerald-400"}`}>
                                    {isExpense ? "-" : "+"}${item.amountCOPm.toLocaleString("es-CO")}
                                  </div>
                                  <div className={`text-[9px] font-bold ${item.status === InvoiceStatus.PAGADO ? "text-emerald-400" : item.status === InvoiceStatus.PENDIENTE ? "text-amber-500 animate-pulse" : "text-red-400"}`}>
                                    {item.status}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {/* GRID PATH 2: DASHBOARD LEDGER EXPANDED */}
                {activeTab === "dashboard" && (
                  <div className="col-span-12 grid grid-cols-12 gap-6 overflow-hidden min-h-0">
                    <section className="col-span-12 lg:col-span-5 flex flex-col gap-5 overflow-y-auto pr-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 bg-[#10b981]/15 border border-[#10b981]/20 p-5 rounded-[28px]">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">Monto Total Cobrado</span>
                          <div className="text-3xl font-bold text-white font-display mt-1">${stats.totalPaidCOPm.toLocaleString("es-CO")} COPm</div>
                          <div className="text-[10px] text-slate-450 mt-1">Saldos correspondientes a pasarela Celo.</div>
                        </div>

                        <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl">
                          <span className="text-[9px] text-slate-450 uppercase block font-mono">Pendientes de Cobro</span>
                          <div className="text-xl font-bold text-orange-400 mt-1">${stats.totalPendingCOPm.toLocaleString("es-CO")} COPm</div>
                        </div>

                        <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl">
                          <span className="text-[9px] text-slate-450 uppercase block font-mono">Transacciones Totales</span>
                          <div className="text-xl font-bold text-cyan-400 mt-1">{stats.totalCount} emitidos</div>
                        </div>
                      </div>

                      {/* Embedded Live Finance Charts natively for widescreen ledger view */}
                      <div className="bg-slate-900/40 border border-white/5 p-5 rounded-[28px] space-y-1">
                        <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-mono">Visualización de Flujos</h4>
                        <FinanceCharts invoices={invoices} isMobile={false} />
                      </div>

                      {/* Manual Quick Actions on Widescreen */}
                      <div className="bg-slate-900/40 border border-white/5 p-5 rounded-[28px] space-y-3">
                        <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Acciones Rápidas (Celo Direct)</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setShowManualCreate(!showManualCreate);
                              setShowManualPay(false);
                              playChime("click");
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${showManualCreate ? "bg-emerald-500 text-slate-950 border-emerald-400" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/15"}`}
                          >
                            <ArrowUpRight size={14} />
                            + Emitir Cobro
                          </button>
                          <button
                            onClick={() => {
                              setShowManualPay(!showManualPay);
                              setShowManualCreate(false);
                              playChime("click");
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${showManualPay ? "bg-red-500 text-white border-red-400" : "bg-red-500/10 text-red-300 border-red-500/25 hover:bg-red-500/15"}`}
                          >
                            <ArrowDownRight size={14} />
                            - Enviar Pago
                          </button>
                        </div>

                        {/* Dropdown forms */}
                        {showManualCreate && (
                          <form onSubmit={handleManualCreateSubmit} className="bg-[#020617]/50 border border-emerald-500/30 p-4 rounded-xl space-y-3">
                            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">📥 Crear Plantilla de Cobro</div>
                            <div className="space-y-2">
                              <input 
                                type="text" required placeholder="Nombre del cliente" value={manualClient}
                                onChange={(e) => setManualClient(e.target.value)}
                                className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              />
                              <input 
                                type="number" required placeholder="Monto COPm (ej: 145000)" value={manualAmount}
                                onChange={(e) => setManualAmount(e.target.value)}
                                className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              />
                              <input 
                                type="text" placeholder="Concepto" value={manualDesc}
                                onChange={(e) => setManualDesc(e.target.value)}
                                className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button type="button" onClick={() => setShowManualCreate(false)} className="px-2.5 py-1 hover:bg-white/5 text-[10px] text-slate-400 rounded-lg">Cancelar</button>
                              <button type="submit" className="px-3.5 py-1 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-lg cursor-pointer">Generar Cobro</button>
                            </div>
                          </form>
                        )}

                        {showManualPay && (
                          <form onSubmit={handleManualPaySubmit} className="bg-[#020617]/50 border border-red-500/30 p-4 rounded-xl space-y-3">
                            <div className="text-[10px] font-mono text-red-400 font-bold uppercase">📤 Enviar Pago Directo (On-Chain)</div>
                            <div className="space-y-2">
                              <input 
                                type="text" required placeholder="Destinatario" value={manualClient}
                                onChange={(e) => setManualClient(e.target.value)}
                                className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              />
                              <input 
                                type="number" required placeholder="Monto COPm (ej: 90000)" value={manualAmount}
                                onChange={(e) => setManualAmount(e.target.value)}
                                className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              />
                              <input 
                                type="text" placeholder="Concepto" value={manualDesc}
                                onChange={(e) => setManualDesc(e.target.value)}
                                className="w-full bg-[#070b16] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button type="button" onClick={() => setShowManualPay(false)} className="px-2.5 py-1 hover:bg-white/5 text-[10px] text-slate-400 rounded-lg">Cancelar</button>
                              <button type="submit" disabled={isProcessingAction} className="px-3.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1">
                                {isProcessingAction ? <RefreshCw size={10} className="animate-spin" /> : null}
                                Confirmar Pago
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                      <div className="bg-gradient-to-tr from-emerald-950/15 via-black/30 to-transparent border border-emerald-500/20 p-5 rounded-3xl space-y-2 inline-flex flex-col">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                          <ShieldCheck size={16} />
                          <span>No Custodial Wallet</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          LucasBot no almacena llaves ni tiene acceso a tu capital. Las transacciones se firman 100% on-chain de forma descentralizada.
                        </p>
                      </div>

                      {/* Real-time Solidity Smart Contract Events Panel */}
                      {renderSolidityEventLedger()}
                    </section>

                    <section className="col-span-12 lg:col-span-7 flex flex-col bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[32px] p-5 overflow-hidden min-h-0">
                      <div className="flex justify-between items-center mb-4 shrink-0">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Historial Completo de Cobros</h2>
                        <div className="flex gap-2">
                          {(["All", InvoiceStatus.PENDIENTE, InvoiceStatus.RETENIDO, InvoiceStatus.PAGADO, InvoiceStatus.VENCIDO] as const).map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setFilter(opt)}
                              className={`text-[10px] font-mono px-2.5 py-1 rounded-sm cursor-pointer transition ${filter === opt ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-white/5 text-slate-500"}`}
                            >
                              {opt === "All" ? "Todos" : opt === InvoiceStatus.PENDIENTE ? "Pendientes" : opt === InvoiceStatus.RETENIDO ? "En Fideicomiso (🔒)" : opt === InvoiceStatus.PAGADO ? "Completados" : "Vencidos"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px]">
                        {invoices
                          .filter((item) => filter === "All" || item.status === filter)
                          .map((item) => {
                            const isExpense = item.type === "egreso";
                            return (
                              <div 
                                key={item.id} 
                                className="p-4 bg-white/5 border border-white/5 rounded-[20px] flex items-center justify-between gap-4 text-xs transition hover:bg-white/10"
                              >
                                <div className="flex items-center gap-3">
                                  {/* Visual direction row badge */}
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isExpense ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                                    {isExpense ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-slate-500 text-[10px]">{item.id}</span>
                                      <h3 className="font-semibold text-white text-sm">{item.clientName}</h3>
                                    </div>
                                    <p className="text-slate-400 text-[11px] mt-0.5">{item.description}</p>
                                    <div className="text-[10px] text-slate-550 flex items-center gap-1 font-mono mt-1.5">
                                      <Calendar size={11} />
                                      <span>Emitido: {item.issueDate} • Vencimiento: {item.dueDate}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <div className={`font-bold text-sm font-mono ${isExpense ? "text-red-400" : "text-emerald-400"}`}>
                                    {isExpense ? "-" : "+"}${item.amountCOPm.toLocaleString("es-CO")} <span className="text-[9px] font-mono text-slate-500">COPm</span>
                                  </div>
                                  <div className="mt-1.5 flex justify-end gap-1.5">
                                    {item.status === InvoiceStatus.PAGADO ? (
                                      <span className="text-[10px] text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-bold">
                                        {item.status}
                                      </span>
                                    ) : item.status === InvoiceStatus.RETENIDO ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                                          Retenido 🔒
                                        </span>
                                        <button
                                          onClick={() => handleReleaseEscrow(item)}
                                          disabled={isProcessingAction}
                                          className="py-1 px-3 text-[10px] text-emerald-400 hover:text-emerald-350 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded cursor-pointer font-bold transition flex items-center gap-1"
                                        >
                                          {isProcessingAction ? <RefreshCw className="animate-spin text-emerald-500" size={10} /> : "Liberar Garantía ⚡"}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex gap-1.5">
                                        <button
                                          onClick={() => handleTablePay(item)}
                                          disabled={isProcessingAction}
                                          className="py-1 px-3 text-[10px] text-amber-450 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded cursor-pointer font-bold select-none transition flex items-center gap-1"
                                        >
                                          {isProcessingAction ? <RefreshCw className="animate-spin text-amber-500" size={10} /> : "Pagar DIRECTO"}
                                        </button>
                                        <button
                                          onClick={() => handleLockEscrow(item)}
                                          disabled={isProcessingAction}
                                          className="py-1 px-3 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded cursor-pointer font-bold transition"
                                        >
                                          Retener ESCROW
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        {invoices.filter((item) => filter === "All" || item.status === filter).length === 0 && (
                          <div className="text-center py-10 text-xs text-slate-500">No se encontraron cobros en esta categoría.</div>
                        )}
                      </div>
                    </section>
                  </div>
                )}

                {/* GRID PATH 3: SETTINGS SUPPORT EXPANDED */}
                {activeTab === "settings" && (
                  <div className="col-span-12 grid grid-cols-12 gap-6 overflow-hidden min-h-0">
                    <section className="col-span-12 lg:col-span-6 flex flex-col gap-6">
                      <div className="bg-gradient-to-tr from-emerald-900/15 via-[#020617]/30 to-transparent border border-emerald-500/20 rounded-3xl p-5 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-400 font-display font-bold text-sm">
                          <ShieldCheck size={20} />
                          <h3>Protección y Custodia de Llaves</h3>
                        </div>
                        <p className="text-[12px] text-slate-300 leading-relaxed">
                          "Tus fondos están protegidos directamente en la blockchain de Celo. <strong>LucasBot</strong> no tiene acceso a tus llaves privadas y tú siempre tienes el control absoluto para autorizar cada cobro o pago desde tu billetera."
                        </p>
                        <div className="flex gap-2">
                          <span className="bg-slate-900 px-3 py-1 rounded text-[10px] font-mono text-slate-450">🔒 No custodia</span>
                          <span className="bg-slate-900 px-3 py-1 rounded text-[10px] font-mono text-slate-450">⚡ Tarifas Reducidas</span>
                        </div>
                      </div>
                      
                      {/* Mock triggers sandbox block */}
                      <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4.5 space-y-3">
                        <span className="text-[10px] text-slate-450 uppercase font-mono tracking-widest block">Sandbox Testing Toolkit</span>
                        <div className="grid grid-cols-3 gap-2.5 font-mono text-[10px]">
                          <button
                            onClick={() => wallet.setBalances(wallet.cUSDBalance + 500000, wallet.celoBalance)}
                            className="py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-slate-300 cursor-pointer"
                          >
                            + $500k COPm
                          </button>
                          <button
                            onClick={() => wallet.setBalances(wallet.cUSDBalance, 0)}
                            className="py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-slate-300 cursor-pointer"
                          >
                            Simular Gas 0
                          </button>
                          <button
                            onClick={() => wallet.setBalances(wallet.cUSDBalance, 0.15)}
                            className="py-1.5 px-2 bg-[#10b981]/15 hover:bg-[#10b981]/25 rounded text-emerald-300 border border-emerald-500/20 cursor-pointer"
                          >
                            Restaurar Gas
                          </button>
                        </div>
                      </div>
                    </section>
                    
                    <section className="col-span-12 lg:col-span-6 bg-slate-900/40 border border-white/5 rounded-[32px] p-6 space-y-6 overflow-y-auto">
                      <div className="space-y-4">
                        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block border-b border-white/5 pb-2">Configuración y Rendimiento</span>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-200 font-medium block">Modo Rendimiento Sólido</span>
                            <span className="text-slate-500 text-[10px] block mt-0.5">Perfecto para celulares antiguos con Opera Mini.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPerformanceMode(!performanceMode)}
                            className={`w-11 h-6 rounded-full p-0.5 transition duration-250 cursor-pointer flex items-center ${performanceMode ? "bg-emerald-500 justify-end" : "bg-slate-800 justify-start"}`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full transition shadow-md" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3.5">
                        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">Asistencia y Soporte</span>
                        <div className="flex gap-2.5">
                          <a
                            href="https://t.me/LucasBot_Celo_Support_demo"
                            className="flex-1 py-2 px-3 border border-white/10 hover:bg-white/5 rounded-xl text-slate-200 flex justify-center items-center gap-2 text-xs"
                          >
                            <HelpCircle size={15} className="text-cyan-400" />
                            Canal Telegram
                          </a>
                          <a
                            href="https://wa.me/5730"
                            className="flex-1 py-2 px-3 border border-white/10 hover:bg-white/5 rounded-xl text-slate-200 flex justify-center items-center gap-2 text-xs"
                          >
                            <PhoneCall size={14} className="text-emerald-400" />
                            Soporte WhatsApp
                          </a>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 space-y-1 pt-4 border-t border-white/5 font-mono">
                        <span className="font-bold text-slate-400">Enlaces Requeridos de MiniPay:</span>
                        <div className="flex gap-4">
                          <a href="https://minipay.xyz/terms" target="_blank" rel="noopener" className="underline hover:text-slate-350">Terms of Service</a>
                          <a href="https://minipay.xyz/privacy" target="_blank" rel="noopener" className="underline hover:text-slate-350">Privacy Policy</a>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

              </div>
            </main>
          </>
        )}

      </div>

      {/* SYSTEM-WIDE OVERLAY: SOLIDITY CRYPTOGRAPHIC MULTI-TOKEN FIELD AUTHORIZATION MODAL (EIP-712) */}
      {signatureRequest && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="max-w-md w-full bg-[#0b1329] border-2 border-emerald-500/25 rounded-[28px] shadow-2xl p-6 relative overflow-hidden flex flex-col space-y-4">
            
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="text-emerald-400" size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">Firma de Solicitud</h3>
                  <p className="text-[10px] text-slate-400">EIP-712 Secure Message</p>
                </div>
              </div>
              <div className="bg-emerald-500/10 px-2.5 py-1 rounded-full text-[9px] text-[#10b981] font-mono font-bold uppercase border border-emerald-500/15">
                MiniPay Injector
              </div>
            </div>

            {/* Contract payload metadata */}
            <div className="bg-[#060b18] border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Origen Aplicación</span>
                <span className="text-slate-200 font-medium font-mono">LucasBot v2.1</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Dirección Delegada</span>
                <span className="text-slate-200 font-mono select-all text-[9.5px]">
                  {wallet.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}` : "0x7cD2...C3a1"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Función Smart Contract</span>
                <span className="text-amber-400 font-mono font-medium">
                  {signatureRequest.type === "create" && "emitInvoice(bytes32,uint256)"}
                  {signatureRequest.type === "pay" && "settleInvoice(bytes32,uint256)"}
                  {signatureRequest.type === "lock_escrow" && "lockEscrowFunds(bytes32,uint256)"}
                  {signatureRequest.type === "release_escrow" && "releaseEscrowFunds(bytes32)"}
                </span>
              </div>

              <div className="border-t border-white/5 pt-3 space-y-1.5">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">Detalles del Mensaje</span>
                <div className="bg-[#090e1f] p-2.5 rounded-lg border border-white/5 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Concepto:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[200px]">{signatureRequest.desc}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">
                      {signatureRequest.type === "create" && "Cliente:"}
                      {signatureRequest.type === "pay" && "Beneficiario:"}
                      {signatureRequest.type === "lock_escrow" && "Proveedor (Garantía):"}
                      {signatureRequest.type === "release_escrow" && "Destinatario (Liberado):"}
                    </span>
                    <span className="text-slate-250 font-medium truncate max-w-[200px]">{signatureRequest.client}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-white/5">
                    <span className="text-slate-400 font-semibold">
                      {signatureRequest.type === "release_escrow" ? "Monto a Liberar:" : "Monto de Depósito:"}
                    </span>
                    <span className="text-[#10b981] font-bold font-mono">
                      ${signatureRequest.amount.toLocaleString("es-CO")} COPm
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Currency Interactive selector (Abstracción de Gas de Celo) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Moneda para Tarifas (Gas)</span>
                <span className="text-[9px] font-mono font-bold text-amber-500">Celo Native Fee</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {(["COPm", "cUSD", "CELO"] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => {
                      playChime("click");
                      wallet.changeFeeCurrency(curr);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center transition cursor-pointer select-none ${
                      wallet.feeCurrency === curr
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-slate-900/50 border-white/5 hover:bg-slate-850 text-slate-400"
                    }`}
                  >
                    <span className="text-[11px] font-mono">{curr}</span>
                    <span className="text-[8px] opacity-75 font-mono">
                      {curr === "COPm" ? "Gasless" : curr === "cUSD" ? "Min." : "Normal"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-[9px] font-mono text-slate-400 bg-[#060b18] px-2.5 py-1.5 rounded-lg flex justify-between">
                <span>Costo Gas Estimado:</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {wallet.feeCurrency === "COPm" && "0.00 COPm (Free Gas!)"}
                  {wallet.feeCurrency === "cUSD" && "0.0001 cUSD (~0.4 COPm)"}
                  {wallet.feeCurrency === "CELO" && "0.005 CELO (~3.2 COPm)"}
                </span>
              </div>
            </div>

            {/* Cryptographic Hash simulation detail */}
            <div className="bg-[#050914] border border-white/5 p-2 rounded-lg text-[8.5 border-white/5">
              <span className="text-[8px] font-mono text-slate-500 block uppercase">EIP-712 Typed Signature Hash</span>
              <span className="text-[8.5px] font-mono text-slate-350 select-all truncate block">
                0x6f91d8ceab83f3e9a7e914c3e5aef123d41cbfb9b1c7dc41c2c3116bc37ef{signatureRequest.amount}ee0741
              </span>
            </div>

            {/* Biometric Interactive Action Button to confirm */}
            <div className="pt-2 flex flex-col space-y-2">
              <button
                type="button"
                onClick={async () => {
                  playChime("success");
                  const simulatedHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
                  signatureRequest.onSuccess(simulatedHash);
                  setSignatureRequest(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-900 rounded-2xl font-bold text-xs select-none cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                <Fingerprint size={16} />
                <span>Autorizar Firma (Huella o PIN)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playChime("click");
                  setSignatureRequest(null);
                }}
                className="w-full py-2 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-slate-200 rounded-xl font-bold text-[11px] transition cursor-pointer"
              >
                Rechazar Firma
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* WALLET CONNECTION SELECTION DIALOG */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="max-w-md w-full bg-[#0b1329] border border-white/10 rounded-[28px] shadow-2xl p-6 relative overflow-hidden flex flex-col space-y-4">
            
            {/* Design header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#10b981]/10 rounded-xl flex items-center justify-center border border-emerald-500/25">
                  <Wallet className="text-emerald-400" size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">Conectar Billetera</h3>
                  <p className="text-[10px] text-slate-400">Selecciona tu método de conexión</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playChime("click");
                  setShowConnectModal(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Custom info note about sandbox iframe restriction so user is aware! */}
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-3 flex gap-2.5 items-start text-[10px] text-amber-300 leading-normal">
              <Info size={13} className="mt-0.5 shrink-0 text-amber-400" />
              <div>
                <span className="font-bold block text-amber-400">¿Por qué no abre mi billetera?</span> 
                Este entorno de desarrollo se ejecuta dentro de un <strong className="text-amber-200">iframe seguro</strong>. Muchos navegadores bloquean las ventanas emergentes de extensiones (como MetaMask o Valora) en esta vista por seguridad.
                <span className="block mt-1.5 text-slate-300">Si al dar clic no ocurre nada, usa la <strong className="text-emerald-400 font-semibold font-mono">"Billetera de Pruebas"</strong>. Te conectará al instante con saldo virtual completo para probar el asistente.</span>
              </div>
            </div>

            {/* If wallet is connecting, show loading state */}
            {wallet.isConnecting ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500/10 border-t-emerald-400 animate-spin"></div>
                  <Wallet size={16} className="text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-200">Esperando respuesta de extensión...</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    Si MetaMask o tu wallet no responden dentro de la vista previa, puedes omitir la espera presionando el botón de abajo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    playChime("success");
                    await wallet.connectWallet("Simulated");
                    setShowConnectModal(false);
                  }}
                  className="mt-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-xl transition cursor-pointer"
                >
                  Usar Billetera de Pruebas Ahora ⚡
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                
                {/* 1. Simulated Developer Wallet (Recommended inside preview container) */}
                <button
                  type="button"
                  onClick={async () => {
                    playChime("success");
                    await wallet.connectWallet("Simulated");
                    setShowConnectModal(false);
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-[#10b981]/5 border border-emerald-500/30 hover:border-emerald-400 hover:bg-[#10b981]/10 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-300">Billetera de Pruebas (Simuladora)</span>
                      <span className="text-[7px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-1 py-0.5 rounded font-bold uppercase font-mono tracking-wider">Altamente Recomendada</span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 leading-normal">Evita limitaciones del iframe. Conéctate con saldo ficticio de muestra en COPm y GAS de Celo sin salir del navegador.</p>
                  </div>
                  <CheckCircle size={16} className="text-emerald-400 opacity-60 group-hover:opacity-100 shrink-0" />
                </button>

                {/* 2. MetaMask (Real Web3) */}
                <button
                  type="button"
                  onClick={async () => {
                    playChime("click");
                    wallet.connectWallet("MetaMask");
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/20 hover:bg-slate-900/80 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white block">Metamask / Brave Browser Wallet</span>
                    <p className="text-[9.5px] text-slate-400 leading-normal">Solicita conexión web3 a tu extensión nativa (útil si abres la app en pestaña independiente).</p>
                  </div>
                  <Coins size={16} className="text-amber-500 opacity-60 group-hover:opacity-100 shrink-0" />
                </button>

                {/* 3. Valora Wallet */}
                <button
                  type="button"
                  onClick={async () => {
                    playChime("click");
                    wallet.connectWallet("Valora");
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/20 hover:bg-slate-900/80 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white block">Esquema Valora (Móvil / Link Celo)</span>
                    <p className="text-[9.5px] text-slate-400 leading-normal">Modela la conexión a la billetera oficial de la red Celo mediante deep linking de prueba.</p>
                  </div>
                  <Smartphone size={16} className="text-cyan-400 opacity-60 group-hover:opacity-100 shrink-0" />
                </button>

              </div>
            )}

            {/* Help guidelines bottom banner */}
            <div className="text-[8.5px] text-slate-500 font-mono text-center pt-2 border-t border-white/5 uppercase tracking-wider">
              LucasBot v2.1 • Celo Web3 Protocol
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <FacturaProvider>
      <MainAppContent />
    </FacturaProvider>
  );
}
