/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header according to guidelines
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Using mockup mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Full-Stack API endpoints
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Offline parsing helper for robust fallback/mockup modes when Gemini service is unconfigured or rate-limited
  const getMockResponse = (msg: string) => {
    let responseText = "";
    let widget: any = null;
    const lower = msg.toLowerCase();

    // Check for escrow / fideicomiso / lock intent
    if (lower.includes("reten") || lower.includes("escrow") || lower.includes("fideico") || lower.includes("garant") || lower.includes("bloqu")) {
      const amountMatch = lower.match(/(\d[\d\s\.]*)/);
      const amount = amountMatch ? parseInt(amountMatch[0].replace(/[\s\.]/g, ""), 10) : 100000;
      
      let client = "Proveedor";
      if (lower.includes("a ")) {
        const parts = lower.split("a ");
        if (parts.length > 1) {
          client = parts[1].split(" por")[0].trim();
        }
      }
      
      let desc = "Garantía de servicio por entregar";
      if (lower.includes("por ")) {
        const parts = lower.split("por ");
        if (parts.length > 1) {
          desc = parts[1].trim();
        }
      }

      client = client.charAt(0).toUpperCase() + client.slice(1);

      responseText = `Perfecto, entiendo que deseas crear una **Garantía Escrow (Fideicomiso)** en Celo por **$${amount.toLocaleString("es-CO")} COPm** para asegurar el trabajo de **${client}**. Los fondos quedarán retenidos de forma segura hasta que autorices la liberación al recibir el trabajo.\n\nPor favor, revisa y confirma la retención del saldo para desplegar el contrato:`;
      widget = {
        type: "payment_invoice",
        payload: { client, amount, desc, isEscrow: true }
      };
    }
    // Check for payment intent (Pagar)
    else if (lower.includes("paga") || lower.includes("saldar") || lower.includes("egreso") || lower.includes("enviar")) {
      const amountMatch = lower.match(/(\d[\d\s\.]*)/);
      const amount = amountMatch ? parseInt(amountMatch[0].replace(/[\s\.]/g, ""), 10) : 80000;
      
      let client = "Destinatario";
      if (lower.includes("a ")) {
        const parts = lower.split("a ");
        if (parts.length > 1) {
          client = parts[1].split(" por")[0].trim();
        }
      }
      
      let desc = "Pago de servicios / materiales";
      if (lower.includes("por ")) {
        const parts = lower.split("por ");
        if (parts.length > 1) {
          desc = parts[1].trim();
        }
      }

      // Format clean readable name
      client = client.charAt(0).toUpperCase() + client.slice(1);

      responseText = `Perfecto. He detectado tu intención de realizar un pago seguro on-chain por **$${amount.toLocaleString("es-CO")} COPm**. Aquí tienes la orden de pago para tu autorización instantánea:`;
      widget = {
        type: "payment_invoice",
        payload: { client, amount, desc }
      };
    } 
    // Check for billing intent (Cobrar)
    else if (lower.includes("cobra") || lower.includes("factura") || lower.includes("recibe") || lower.includes("ingreso")) {
      const amountMatch = lower.match(/(\d[\d\s\.]*)/);
      const amount = amountMatch ? parseInt(amountMatch[0].replace(/[\s\.]/g, ""), 10) : 150000;
      
      let client = "Cliente";
      if (lower.includes("a ")) {
        const parts = lower.split("a ");
        if (parts.length > 1) {
          client = parts[1].split(" por")[0].trim();
        }
      }
      
      let desc = "Servicios prestados";
      if (lower.includes("por ")) {
        const parts = lower.split("por ");
        if (parts.length > 1) {
          desc = parts[1].trim();
        }
      }

      // Format clean readable name
      client = client.charAt(0).toUpperCase() + client.slice(1);

      responseText = `¡Excelente! He preparado la plantilla de cobro por **$${amount.toLocaleString("es-CO")} COPm**. Revísala y ordénala pulsando "Emitir Cobro":`;
      widget = {
        type: "create_invoice",
        payload: { client, amount, desc }
      };
    } else {
      responseText = "¡Hola! Soy LucasBot, tu asistente conversacional on-chain en Celo, adaptado para MiniPay.\n\nTe puedo ayudar con estas acciones:\n\n1. **Para Retener Fondos en Escrow (Garantías de Trabajo)**: escribe algo como *\"Retén 200,000 COP para Pedro por desarrollo de backend\"* o *\"Crear garantía de 350,000 para Diseñadora UX\"*.\n2. **Para Cobrar / Generar Factura**: escribe *\"Cobra 120,000 COP a Carlos Gomez por tutoría\"*.\n3. **Para Pagos Directos**: escribe *\"Págale 80,000 COP a Sofía por transporte\"*.\n\nTambién puedes usar el **Panel de Transacciones** (segunda pestaña abajo) para auditar tus fondos fideicomitidos, pagar directamente o liberar transacciones retenidas.";
    }

    return {
      replyText: responseText,
      widget
    };
  };

  // If API key is missing, respond with useful mock data directly
  if (!apiKey) {
    const mockData = getMockResponse(message);
    return res.json(mockData);
  }

  try {
    const ai = getAI();
    
    // Construct rich system instructions to parse intent into structured response schema
    const prompt = `User message: "${message}"\n\nPlease analyze the statement. If the user expresses intent to buy, hire with escrow, lock funds, deploy trust/escrow, or retain payment, set type to "payment_invoice" with isEscrow: true. If general pay/transfer, set type to "payment_invoice" without isEscrow. If billing/invoicing, set type to "create_invoice".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `Eres LucasBot, un asistente financiero conversacional 100% on-chain en Celo, optimizado para MiniPay (pantallas de 360x640).
Ayudas a freelancers y comercios de Colombia a cobrar sus servicios, realizar pagos y custodiar fondos mediante contratos inteligentes de Escrow (Doble firma / Garantía retenida por trabajo entregado) en COPm (Pesos Colombianos estables en Celo) de forma transparente.
Siempre debes responder con un JSON válido que corresponda exactamente al esquema.

Esquema de respuesta JSON esperado:
{
  "replyText": "Texto explicativo amigable y muy conciso en español, formateado con markdown.",
  "widgetTrigger": {
    "type": "create_invoice" | "payment_invoice" | null,
    "payload": {
       "client": "Nombre del cliente/proveedor extraído",
       "amount": número entero en COPm,
       "desc": "Concepto del servicio",
       "isEscrow": boolean (true si el usuario quiere retener el pago, escrow, fideicomiso, garantía ó custodiar fondos hasta asegurar entrega; false si es pago directo)
    }
  }
}

Sé extremadamente breve para optimizar espacio móvil. Si el usuario saluda o pregunta cosas conceptuales, indícale cómo usar el asistente o el Escrow.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING
            },
            widgetTrigger: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Must be 'create_invoice' or 'payment_invoice' or null" },
                payload: {
                  type: Type.OBJECT,
                  properties: {
                    client: { type: Type.STRING },
                    amount: { type: Type.INTEGER },
                    desc: { type: Type.STRING },
                    isEscrow: { type: Type.BOOLEAN }
                  },
                  required: ["client", "amount", "desc"]
                }
              },
              required: ["type", "payload"]
            }
          },
          required: ["replyText"]
        }
      }
    });

    const bodyText = response.text || "{}";
    const data = JSON.parse(bodyText);

    res.json({
      replyText: data.replyText,
      widget: data.widgetTrigger && data.widgetTrigger.type ? data.widgetTrigger : null
    });

  } catch (error: any) {
    console.error("Gemini compilation/runtime error, falling back to mock handler:", error);
    // Dynamic robust fallback so application never fails when unconfigured on hosting services
    const fallback = getMockResponse(message);
    return res.json(fallback);
  }
});

// Configure Vite middleware in development or serve built files in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing successfully on backend at http://0.0.0.0:${PORT}`);
  });
}

start();
