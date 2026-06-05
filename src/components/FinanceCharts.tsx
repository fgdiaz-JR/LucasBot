/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Invoice, InvoiceStatus } from "../types";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Percent } from "lucide-react";

interface FinanceChartsProps {
  invoices: Invoice[];
  isMobile?: boolean;
}

export function FinanceCharts({ invoices, isMobile = false }: FinanceChartsProps) {
  // Aggregate stats
  const paidIncomes = invoices
    .filter((i) => i.status === InvoiceStatus.PAGADO && (i.type === "ingreso" || !i.type))
    .reduce((acc, curr) => acc + curr.amountCOPm, 0);

  const pendingIncomes = invoices
    .filter((i) => i.status === InvoiceStatus.PENDIENTE && (i.type === "ingreso" || !i.type))
    .reduce((acc, curr) => acc + curr.amountCOPm, 0);

  const paidExpenses = invoices
    .filter((i) => i.status === InvoiceStatus.PAGADO && i.type === "egreso")
    .reduce((acc, curr) => acc + curr.amountCOPm, 0);

  const pendingExpenses = invoices
    .filter((i) => i.status === InvoiceStatus.PENDIENTE && i.type === "egreso")
    .reduce((acc, curr) => acc + curr.amountCOPm, 0);

  const totalIncomes = paidIncomes + pendingIncomes;
  const totalExpenses = paidExpenses + pendingExpenses;

  const netBalance = paidIncomes - paidExpenses;
  const expenseRatio = paidIncomes > 0 ? (paidExpenses / paidIncomes) * 100 : 0;

  // Let's mock a monthly bar breakdown for visual graphing: May and June
  const graphData = [
    {
      month: "Mayo",
      income: invoices
        .filter((i) => i.status === InvoiceStatus.PAGADO && (i.type === "ingreso" || !i.type) && i.issueDate.includes("-05-"))
        .reduce((acc, curr) => acc + curr.amountCOPm, 0),
      expense: invoices
        .filter((i) => i.status === InvoiceStatus.PAGADO && i.type === "egreso" && i.issueDate.includes("-05-"))
        .reduce((acc, curr) => acc + curr.amountCOPm, 0),
    },
    {
      month: "Junio (Actual)",
      income: invoices
        .filter((i) => i.status === InvoiceStatus.PAGADO && (i.type === "ingreso" || !i.type) && i.issueDate.includes("-06-"))
        .reduce((acc, curr) => acc + curr.amountCOPm, 0) + pendingIncomes, // add pending as estimated
      expense: invoices
        .filter((i) => i.status === InvoiceStatus.PAGADO && i.type === "egreso" && i.issueDate.includes("-06-"))
        .reduce((acc, curr) => acc + curr.amountCOPm, 0) + pendingExpenses,
    },
  ];

  // Max value for scaling chart columns safely
  const maxVal = Math.max(...graphData.flatMap((d) => [d.income, d.expense]), 200000);

  return (
    <div className={`space-y-4 ${isMobile ? "p-1" : ""}`}>
      {/* Dynamic Summary Cards comparing Ingresos vs Egresos */}
      <div className={`grid ${isMobile ? "grid-cols-1 gap-2.5" : "grid-cols-2 gap-4"}`}>
        
        {/* Income column card */}
        <div className="bg-emerald-950/10 border border-emerald-500/15 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider block">Ingresos Líquidos (Cobros Recibidos)</span>
            <div className="text-lg font-bold text-emerald-400 font-display">
              ${paidIncomes.toLocaleString("es-CO")} <span className="text-[9px] text-slate-500 font-normal">COPm</span>
            </div>
            {pendingIncomes > 0 && (
              <span className="text-[9px] text-emerald-500/70 font-mono block">
                +${pendingIncomes.toLocaleString("es-CO")} pendientes
              </span>
            )}
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ArrowUpRight size={18} />
          </div>
        </div>

        {/* Expenses column card */}
        <div className="bg-red-950/10 border border-red-500/15 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider block">Egresos Registrados (Gastos/Pagos)</span>
            <div className="text-lg font-bold text-red-400 font-display">
              ${paidExpenses.toLocaleString("es-CO")} <span className="text-[9px] text-slate-500 font-normal">COPm</span>
            </div>
            {pendingExpenses > 0 && (
              <span className="text-[9px] text-red-500/70 font-mono block">
                +${pendingExpenses.toLocaleString("es-CO")} pendientes
              </span>
            )}
          </div>
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <ArrowDownRight size={18} />
          </div>
        </div>
      </div>

      {/* Main Graph Card: Horizontal Comparison Progress bar and Vertical bar chart */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 space-y-4">
        
        {/* Ratio bar visualizer */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
            <span className="flex items-center gap-1"><Percent size={11} className="text-cyan-400" /> Relación Gasto-Ingreso</span>
            <span className="font-bold text-emerald-400">
              {expenseRatio.toFixed(1)}% {expenseRatio > 50 ? "⚠️ Alto" : "👍 Saludable"}
            </span>
          </div>
          
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${Math.min(100, 100 - expenseRatio)}%` }} 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700" 
              title="Porcentaje libre"
            />
            <div 
              style={{ width: `${Math.min(100, expenseRatio)}%` }} 
              className="h-full bg-red-500 transition-all duration-700" 
              title="Porcentaje gastado"
            />
          </div>

          <div className="flex justify-between text-[8px] font-mono text-slate-500">
            <span>Fondos Libres (~{(100 - expenseRatio).toFixed(0)}%)</span>
            <span>Gastos (~{expenseRatio.toFixed(0)}%)</span>
          </div>
        </div>

        {/* Vertical SVG Multi-bar column chart */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider block">Distribución Mensual (COPm)</span>
          
          <div className="h-32 flex items-end justify-around gap-4 pt-4 border-b border-white/5 pb-2">
            {graphData.map((data, index) => {
              const incPct = (data.income / maxVal) * 100;
              const expPct = (data.expense / maxVal) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full flex items-end justify-center gap-2.5 h-20 max-w-[120px]">
                    {/* Income Bar */}
                    <div className="flex flex-col items-center flex-1 min-w-[20px] max-w-[32px] relative group/bar">
                      <div className="absolute bottom-full mb-1 bg-[#0f172a] border border-white/10 text-white text-[8px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition duration-150 pointer-events-none z-50 shadow-xl whitespace-nowrap">
                        ${data.income.toLocaleString("es-CO")}
                      </div>
                      <div 
                        style={{ height: `${Math.max(8, incPct)}%` }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-500 shadow-md shadow-emerald-500/10 group-hover:brightness-110"
                      />
                    </div>

                    {/* Expense Bar */}
                    <div className="flex flex-col items-center flex-1 min-w-[20px] max-w-[32px] relative group/bar">
                      <div className="absolute bottom-full mb-1 bg-[#0f172a] border border-white/10 text-white text-[8px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition duration-150 pointer-events-none z-50 shadow-xl whitespace-nowrap">
                        ${data.expense.toLocaleString("es-CO")}
                      </div>
                      <div 
                        style={{ height: `${Math.max(8, expPct)}%` }}
                        className="w-full bg-gradient-to-t from-red-650 to-red-400 rounded-t-sm transition-all duration-500 shadow-md shadow-red-500/10 group-hover:brightness-110"
                      />
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-slate-400 mt-2 block">{data.month}</span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Ingresos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span> Egresos
            </span>
          </div>

        </div>

      </div>

      {/* Net Wallet Position Section */}
      <div className="bg-[#0b142c] border border-emerald-500/10 p-3 rounded-2xl flex items-center justify-between text-[11px] text-slate-350">
        <span className="flex items-center gap-1.5 font-sans">
          <Wallet size={13} className="text-emerald-400" />
          Balance Neto Estimado actual:
        </span>
        <strong className={`font-mono text-xs ${netBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {netBalance >= 0 ? "+" : ""}${netBalance.toLocaleString("es-CO")} COPm
        </strong>
      </div>
    </div>
  );
}
