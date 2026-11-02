/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { formatUZS } from '../../utils/formatters';

interface FinancialMonthData {
  month: string;
  income: number;
  expense: number;
}

export const FinancialTrendChart: React.FC<{ data: FinancialMonthData[] }> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-sm text-neutral-400">
        Ma'lumotlar mavjud emas
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1000000);
  const chartHeight = 180;
  const chartWidth = 560;
  const paddingX = 40;
  const stepX = (chartWidth - paddingX * 2) / Math.max(1, data.length - 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
            <span>Kirim (Tushum)</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
            <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
            <span>Chiqim (Xarajat)</span>
          </div>
        </div>
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="text-xs font-mono text-neutral-800 dark:text-neutral-200">
            <span className="font-semibold">{data[hoveredIdx].month}:</span>{' '}
            <span className="text-emerald-500">+{formatUZS(data[hoveredIdx].income)}</span>{' '}
            <span className="text-neutral-400">/</span>{' '}
            <span className="text-rose-500">-{formatUZS(data[hoveredIdx].expense)}</span>
          </div>
        )}
      </div>

      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
          className="w-full h-56 overflow-visible select-none"
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = chartHeight - pct * (chartHeight - 20) + 10;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="3 3"
                />
              </g>
            );
          })}

          {/* Bars / Points */}
          {data.map((item, idx) => {
            const x = paddingX + idx * stepX;
            const incHeight = (item.income / maxVal) * (chartHeight - 30);
            const expHeight = (item.expense / maxVal) * (chartHeight - 30);
            const isHovered = hoveredIdx === idx;

            const barWidth = Math.min(22, stepX * 0.35);

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-opacity"
                opacity={hoveredIdx === null || isHovered ? 1 : 0.65}
              >
                {/* Income Bar */}
                <rect
                  x={x - barWidth - 1}
                  y={chartHeight - incHeight}
                  width={barWidth}
                  height={Math.max(2, incHeight)}
                  rx={3}
                  className="fill-emerald-500 hover:fill-emerald-400 transition-colors"
                />
                {/* Expense Bar */}
                <rect
                  x={x + 1}
                  y={chartHeight - expHeight}
                  width={barWidth}
                  height={Math.max(2, expHeight)}
                  rx={3}
                  className="fill-rose-500 hover:fill-rose-400 transition-colors"
                />

                {/* X axis label */}
                <text
                  x={x}
                  y={chartHeight + 22}
                  textAnchor="middle"
                  className="text-[11px] font-mono fill-neutral-500 dark:fill-neutral-400"
                >
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface CategoryBreakdown {
  category: string;
  amount: number;
  color: string;
}

export const ExpenseCategoryDonut: React.FC<{ data: CategoryBreakdown[] }> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-sm text-neutral-400">
        Xarajat ma'lumotlari mavjud emas
      </div>
    );
  }

  // Calculate SVG stroke dashes for circle donut
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
          {data.map((item, idx) => {
            const percentage = item.amount / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle * circumference;
            accumulatedAngle += percentage;
            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={idx}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={isHovered ? 26 : 22}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          {hoveredIdx !== null && data[hoveredIdx] ? (
            <>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 line-clamp-1">
                {data[hoveredIdx].category}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                {((data[hoveredIdx].amount / total) * 100).toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Jami</span>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                {formatUZS(total)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2">
        {data.slice(0, 6).map((item, idx) => {
          const pct = ((item.amount / total) * 100).toFixed(1);
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                hoveredIdx === idx ? 'bg-neutral-100 dark:bg-neutral-800' : ''
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-neutral-700 dark:text-neutral-300 font-medium">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono tabular-nums shrink-0 ml-2">
                <span className="text-neutral-500 dark:text-neutral-400">{pct}%</span>
                <span className="text-neutral-900 dark:text-neutral-200 font-semibold">
                  {formatUZS(item.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
