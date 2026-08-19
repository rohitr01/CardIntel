"use client";

import React from "react";
import { formatMoney, money } from "@/lib/utils/money";

interface CategoryInputProps {
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  value: number | string;
  onChange: (val: number) => void;
  presetValues?: number[];
  placeholder?: string;
}

export function CategoryInput({
  label,
  description,
  icon: Icon,
  value,
  onChange,
  presetValues = [1000, 3000, 5000, 10000],
  placeholder = "0",
}: CategoryInputProps) {
  const numValue = Number(value || 0);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              {label}
            </label>
            {description && (
              <span className="text-[10px] text-slate-400 block leading-tight">
                {description}
              </span>
            )}
          </div>
        </div>

        {/* Input box */}
        <div className="relative w-28 sm:w-32">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            ₹
          </span>
          <input
            type="number"
            min="0"
            step="500"
            value={value === 0 || value === "0" ? "" : value}
            placeholder={placeholder}
            onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-6 pr-2 text-right text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Quick preset chips */}
      <div className="flex flex-wrap items-center gap-1 pt-1.5">
        {presetValues.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => onChange(p)}
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
              numValue === p
                ? "bg-emerald-600 text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            +{p >= 1000 ? `${p / 1000}k` : p}
          </button>
        ))}
        {numValue > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-auto text-[10px] text-slate-400 hover:text-rose-500 font-medium"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
