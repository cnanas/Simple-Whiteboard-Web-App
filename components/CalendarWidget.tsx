"use client";

import { useBoardStore } from "@/store/boardStore";
import type { CalendarWidget as CalendarWidgetType } from "@/types";
import { DragWrapper } from "./DragWrapper";

interface CalendarWidgetProps {
  widget: CalendarWidgetType;
  standalone?: boolean;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarWidget({ widget, standalone }: CalendarWidgetProps) {
  const updateWidget = useBoardStore((s) => s.updateWidget);

  const today = new Date();
  const isCurrentMonth =
    widget.month === today.getMonth() && widget.year === today.getFullYear();

  const daysInMonth = getDaysInMonth(widget.month, widget.year);
  const firstDay = getFirstDayOfMonth(widget.month, widget.year);

  const prevMonth = () => {
    let m = widget.month - 1;
    let y = widget.year;
    if (m < 0) { m = 11; y--; }
    updateWidget(widget.id, { month: m, year: y });
  };

  const nextMonth = () => {
    let m = widget.month + 1;
    let y = widget.year;
    if (m > 11) { m = 0; y++; }
    updateWidget(widget.id, { month: m, year: y });
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const inner = (
    <div
        className="w-full h-full rounded-xl shadow-md border border-black/10 dark:border-white/10
          bg-white dark:bg-[#1e2328] transition-shadow duration-150 hover:shadow-lg
          flex flex-col overflow-hidden p-3"
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={(e) => { e.stopPropagation(); prevMonth(); }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700
              text-gray-500 dark:text-gray-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {MONTHS[widget.month]} {widget.year}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); nextMonth(); }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700
              text-gray-500 dark:text-gray-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DAYS.map((d, i) => (
            <div
              key={i}
              className="text-[10px] font-medium text-gray-400 dark:text-gray-500 text-center"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5 flex-1">
          {cells.map((day, i) => {
            const isToday = isCurrentMonth && day === today.getDate();
            return (
              <div
                key={i}
                className={`flex items-center justify-center text-xs rounded-md
                  ${day ? "text-gray-700 dark:text-gray-300" : ""}
                  ${isToday
                    ? "bg-blue-500 text-white font-semibold"
                    : day
                    ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                    : ""
                  }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
  );

  if (standalone) return inner;
  return <DragWrapper widget={widget}>{inner}</DragWrapper>;
}
