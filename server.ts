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

  // If API key is missing, respond with useful mock data to prevent application crashes
  if (!apiKey) {
    // Generate a simulated responsive parsing for testing
    let responseText = "";
    let widget: any = null;

    const lower = message.toLowerCase();
    
    // Check for payment intent (Pagar)
    if (lower.includes("paga") || lower.includes("saldar") || lower.includes("egreso") || lower.includes("enviar")) {
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
      
      let desc = "Servicios de soporte técnico";
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
      responseText = "Claro, puedo ayudarte de dos formas:\n1. **Para Cobrar / Facturar**: escribe algo como *\"Cobra 150000 COP a Carlos Gomez por desarrollo web\"*.\n2. **Para Pagar / Transferir**: escribe algo como *\"Págale 80000 COP a Sofía por transporte\"* o *\"Pagar factura inv-8021\"*.";
    }

    return res.json({
      replyText: responseText,
      widget
    });
  }

  try {
    const ai = getAI();
    
    // Construct rich system instructions to parse intent into structured response schema
    const prompt = `User message: "${message}"\n\nPlease analyze the statement. If the user expresses intent to bill, invoice, or request collection, trigger a widget with type "create_invoice". If they express intent to make a payment, transfer funds, or settle a bill, trigger "payment_invoice". If they don't specify any action or ask a general query, set widgetTrigger to null. Keep the textual response extremely clear, in Spanish, and focused on mobile compatibility.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `Eres LucasBot, un asistente financiero conversacional 100% on-chain en Celo, optimizado para MiniPay (pantallas de 360x640).
Ayudas a freelancers y comercios de Colombia a cobrar sus servicios o realizar pagos en COPm (Pesos Colombianos estables en Celo) de forma transparente.
Siempre debes responder con un JSON válido estructurado con los detalles si el usuario solicita cobrar, facturar, pagar o realizar egresos.

Esquema de respuesta JSON esperado:
{
  "replyText": "Texto explicativo breve en español, formateado con markdown, amigable y muy conciso.",
  "widgetTrigger": {
    "type": "create_invoice" | "payment_invoice" | null,
    "payload": {
       "client": "Nombre del cliente o destinatario extraído o string vacío",
       "amount": número entero con el valor exacto del cobro/pago en COPm o 0,
       "desc": "El concepto de la factura, pago o servicio"
    }
  }
}

Sé extremadamente prolijo y breve en tus respuestas de texto para que quepan en la pantalla del celular sin molestar. Si el usuario solo dice hola o pregunta cosas generales, responde de manera amigable y ajustada a tu propósito. set widgetTrigger to null.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description: "Brief Markdown-ready friendly conversational response in Spanish."
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
                    desc: { type: Type.STRING }
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
    console.error("Gemini compilation error:", error);
    res.status(500).json({ error: "Internal AI Processing failed", message: error.message });
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
