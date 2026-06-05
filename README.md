# LucasBot

**LucasBot** is an advanced 100% on-chain conversational financial assistant and billing gateway running on the **Celo Network**, tailored specifically for hispanophone markets (starting with Colombia).

---

## 1. ¿De qué se trata el proyecto y qué problema busca resolver?

En mercados emergentes como Colombia, los freelancers, trabajadores independientes, prestadores de servicios y microempresas sufren de problemas críticos en su administración financiera diaria:
* **Alta fricción e informalidad:** Lidiar con transferencias interbancarias, preparar planillas de cobro engorrosas de forma manual o manejar el flujo de efectivo genera un caos contable.
* **Pérdida de tiempo y gestión ineficiente:** El rastreo manual de facturas vencidas y el envío constante de recordatorios de cobro drena energía y tiempo productivo.
* **Altas comisiones y trabas Web2:** Las pasarelas de pago tradicionales imponen comisiones que merman los ingresos de transacciones modestas y exigen engorrosos procesos de registro financiero.
* **Complejidad de la Web3 clásica:** Las billeteras de criptomonedas estándar resultan intimidantes debido a la gestión técnica de frases de recuperación, tarifas volátiles de gas y conversiones complejas de tokens.

### La Solución: LucasBot
**LucasBot** actúa como el puente definitivo de abstracción financiera. Diseñado bajo la premisa de la simplicidad conversacional, introduce un **Agente de Inteligencia Artificial (conversacional)** integrado con pagos estables en **COPm** (pesos colombianos representados en la red on-chain de Celo).

El usuario (independiente o comerciante) solo tiene que enviarle una instrucción redactada en lenguaje sencillo de voz o texto al asistente (ej: *"Cobra 120,000 COP a Carlos por logos profesionales"*). El motor cognitivo automático de LucasBot interpreta la intención, extrae los datos clave (`cliente`, `monto` y `concepto`), genera una orden estructurada inmutable en la blockchain y permite saldar de manera instantánea on-chain y con comisiones de red despreciables utilizando la propia moneda local.

---

## 2. Canal de Distribución e Infraestructura Principal

El proyecto maximiza el impacto mediante un soporte técnico híbrido, aprovechando los canales clave del ecosistema ágil de Celo:

### A. MiniPay Mini App (Canal de Interfaz Principal)
La aplicación web está diseñada y optimizada minuciosamente bajo los estándares móviles de **MiniPay** (perfil de pantalla responsiva de `360x640`). 
* **Experiencia Ultra Ligera (UX):** Pensada para dispositivos móviles estándar operando bajo redes celulares de conectividad limitada (Opera Mini y afines).
* **Abstracción Total:** Los usuarios finales no requieren manejar llaves públicas desnudas de formato hexadecimal ni lidiar con tecnicismos extremos criptográficos.
* **Un Solo Toque:** Las solicitudes de transferencia se inician, autorizan y liquidan de manera segura bajo firmas firmes del protocolo de gas Celo.

### B. AI Agents & Orquestación Conversacional (Canal de Orquestación Lógica)
El corazón administrativo de la app es el agente cognitivo de IA conectado mediante rutas de API seguras respaldadas por Gemini en el backend de Node.js/Express. 
* Este agente descifra comandos orales de voz transmitidos desde el micrófono del celular de manera nativa e instrucciones conversacionales por texto estándar.
* Genera de forma asíncrona componentes visuales inteligentes (widgets dinámicos reactivos interactivos) que facilitan al usuario confirmar las transacciones de cobro (*"Emisión de Cobro"*) o desembolsar saldos directamente (*"Enviar Pago"*).

### C. Abstracción del Pago de Gas (Fee Currency)
Aprovechando la infraestructura avanzada nativa de Celo, LucasBot está diseñado para que el usuario no deba adquirir tokens volátiles de red (como CELO nativo) para el pago de las transacciones (gas fee). Las microcomisiones de red asociadas con la creación y liquidación de facturas se abonan de forma transparente con la misma stablecoin transaccionada, reduciendo la fricción a cero.

---

## 3. Características y Capacidades Core de la Aplicación

1. **Inteligencia de Lenguaje Natural:** Chat persistente guiado por Gemini para procesar expresiones habladas (Micrófono) o escritas.
2. **Dashboard de Visualización Financiera:** Gráficos e indicadores visuales diseñados a medida para comparar ingresos y egresos rápidamente.
3. **Módulo de Comprobantes de Recibo:** Recibos on-chain con firmas de hash criptográficos inmutables simulados de manera realista y listos para consultar.
4. **Formularios Manuales Auxiliares:** Botones de acción rápida para registrar flujos de caja alternativos de facturación.
5. **Comprobación Auditiva Integrada:** Respuestas del asistente mediante síntesis de voz (Text-to-Speech) y efectos de sonido reactivos (Chimes).

---

## 4. Instalación y Ejecución en Entorno Local

Para instalar y depurar la aplicación de manera local:

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```

3. **Compilar para Producción:**
   ```bash
   npm run build
   ```
