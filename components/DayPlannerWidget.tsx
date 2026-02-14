"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { nanoid } from "nanoid";
import { useBoardStore } from "@/store/boardStore";
import type { DayPlannerWidget as DayPlannerWidgetType, DayPlannerTask, DayPlannerSubTask } from "@/types";
import { DragWrapper } from "./DragWrapper";
import { ResizeHandle } from "./ResizeHandle";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** 30-minute interval time options (24h "HH:mm") */
const TIME_OPTIONS_30: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS_30.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function formatTimeForDisplay(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  if (h === 0) return `12:${m} AM`;
  if (h === 12) return `12:${m} PM`;
  if (h < 12) return `${h}:${m} AM`;
  return `${h - 12}:${m} PM`;
}

function toDateKey(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDayHeader(key: string): { dayName: string; dateLabel: string } {
  const d = parseDateKey(key);
  return {
    dayName: DAY_NAMES[d.getDay()],
    dateLabel: `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`,
  };
}

function getDatesFromStart(startDate: string, numDays: number): string[] {
  const out: string[] = [];
  const start = parseDateKey(startDate);
  for (let i = 0; i < numDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(toDateKey(d));
  }
  return out;
}

interface DayPlannerWidgetProps {
  widget: DayPlannerWidgetType;
  standalone?: boolean;
  isSelected?: boolean;
}

export function DayPlannerWidget({ widget, standalone, isSelected }: DayPlannerWidgetProps) {
  const [addingForDate, setAddingForDate] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("9:00");
  const [newTaskDuration, setNewTaskDuration] = useState(60);
  const inputRef = useRef<HTMLInputElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const updateWidget = useBoardStore((s) => s.updateWidget);

  const dates = getDatesFromStart(widget.startDate, widget.numDays);
  const tasksByDate = widget.tasksByDate || {};

  useEffect(() => {
    if (addingForDate && inputRef.current) inputRef.current.focus();
  }, [addingForDate]);

  useEffect(() => {
    const el = horizontalScrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaX !== 0) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollLeft += e.deltaX;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const shiftStart = (delta: number) => {
    const d = parseDateKey(widget.startDate);
    d.setDate(d.getDate() + delta);
    updateWidget(widget.id, { startDate: toDateKey(d) });
  };

  const getTasks = (dateKey: string): DayPlannerTask[] => {
    return tasksByDate[dateKey] || [];
  };

  const setTasks = (dateKey: string, tasks: DayPlannerTask[]) => {
    updateWidget(widget.id, {
      tasksByDate: { ...tasksByDate, [dateKey]: tasks },
    });
  };

  const addTask = (dateKey: string) => {
    if (!newTaskText.trim()) return;
    const tasks = getTasks(dateKey);
    const task: DayPlannerTask = {
      id: nanoid(),
      text: newTaskText.trim(),
      done: false,
      scheduledTime: newTaskTime || undefined,
      duration: newTaskDuration || undefined,
      subTasks: [],
      tags: [],
    };
    setTasks(dateKey, [...tasks, task]);
    setNewTaskText("");
    setAddingForDate(null);
  };

  const toggleTask = (dateKey: string, taskId: string) => {
    const tasks = getTasks(dateKey).map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    setTasks(dateKey, tasks);
  };

  const updateTask = (dateKey: string, taskId: string, updates: Partial<DayPlannerTask>) => {
    const tasks = getTasks(dateKey).map((t) =>
      t.id === taskId ? { ...t, ...updates } : t
    );
    setTasks(dateKey, tasks);
  };

  const deleteTask = (dateKey: string, taskId: string) => {
    setTasks(dateKey, getTasks(dateKey).filter((t) => t.id !== taskId));
  };

  const addSubTask = (dateKey: string, taskId: string) => {
    const tasks = getTasks(dateKey).map((t) => {
      if (t.id !== taskId) return t;
      const subTasks = t.subTasks || [];
      return { ...t, subTasks: [...subTasks, { id: nanoid(), text: "", done: false }] };
    });
    setTasks(dateKey, tasks);
  };

  const updateSubTask = (dateKey: string, taskId: string, subId: string, text: string) => {
    const tasks = getTasks(dateKey).map((t) => {
      if (t.id !== taskId) return t;
      const subTasks = (t.subTasks || []).map((s) => (s.id === subId ? { ...s, text } : s));
      return { ...t, subTasks };
    });
    setTasks(dateKey, tasks);
  };

  const toggleSubTask = (dateKey: string, taskId: string, subId: string) => {
    const tasks = getTasks(dateKey).map((t) => {
      if (t.id !== taskId) return t;
      const subTasks = (t.subTasks || []).map((s) => (s.id === subId ? { ...s, done: !s.done } : s));
      return { ...t, subTasks };
    });
    setTasks(dateKey, tasks);
  };

  const removeSubTask = (dateKey: string, taskId: string, subId: string) => {
    const tasks = getTasks(dateKey).map((t) => {
      if (t.id !== taskId) return t;
      return { ...t, subTasks: (t.subTasks || []).filter((s) => s.id !== subId) };
    });
    setTasks(dateKey, tasks);
  };

  const formatDuration = (min: number) => {
    if (min < 60) return `${min}`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}:${String(m).padStart(2, "0")}` : `${h}:00`;
  };

  const inner = (
    <div
      className="w-full h-full rounded-xl shadow-md border border-black/10 dark:border-white/10
        bg-white dark:bg-[#1e2328] flex flex-col overflow-hidden relative group"
    >
      {/* Header: nav + days selector + title */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-black/5 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); shiftStart(-widget.numDays); }}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
            title="Previous"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); shiftStart(widget.numDays); }}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
            title="Next"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <select
            value={widget.numDays}
            onChange={(e) => updateWidget(widget.id, { numDays: Number(e.target.value) })}
            onClick={(e) => e.stopPropagation()}
            className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#0d1117] text-gray-700 dark:text-gray-300"
          >
            {[2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>{n} days</option>
            ))}
          </select>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Day planner</span>
      </div>

      {/* Day columns — horizontal trackpad scroll when pointer is over this area */}
      <div
        ref={horizontalScrollRef}
        className="flex-1 min-h-0 flex overflow-x-auto overflow-y-hidden overscroll-x-contain"
      >
        {dates.map((dateKey) => {
          const { dayName, dateLabel } = formatDayHeader(dateKey);
          const tasks = getTasks(dateKey);
          const doneCount = tasks.filter((t) => t.done).length;
          const isAdding = addingForDate === dateKey;

          return (
            <div
              key={dateKey}
              className="shrink-0 flex flex-col border-r border-black/5 dark:border-white/10 last:border-r-0"
              style={{ minWidth: Math.max(200, (widget.width - 24) / widget.numDays) }}
            >
              {/* Day header */}
              <div className="px-2 pt-2 pb-1 shrink-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{dayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{dateLabel}</p>
                {tasks.length > 0 && (
                  <div className="mt-1 h-0.5 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 dark:bg-blue-600 rounded transition-all"
                      style={{ width: `${(doneCount / tasks.length) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Add task */}
              <div className="px-2 pb-2 shrink-0">
                {!isAdding ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAddingForDate(dateKey); }}
                    className="flex items-center gap-1.5 w-full py-1.5 px-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600
                      text-xs text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add task
                  </button>
                ) : (
                  <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1 flex-wrap">
                      <input
                        ref={dateKey === addingForDate ? inputRef : undefined}
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addTask(dateKey);
                          if (e.key === "Escape") setAddingForDate(null);
                        }}
                        placeholder="Task name..."
                        className="flex-1 min-w-[80px] px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#0d1117] text-gray-800 dark:text-gray-200 outline-none"
                      />
                      <select
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                        className="w-[4.5rem] px-1 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#0d1117] text-gray-700 dark:text-gray-300"
                      >
                        {TIME_OPTIONS_30.map((t) => (
                          <option key={t} value={t}>{formatTimeForDisplay(t)}</option>
                        ))}
                      </select>
                      <select
                        value={newTaskDuration}
                        onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                        className="px-1 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#0d1117] text-gray-700 dark:text-gray-300"
                      >
                        <option value={0}>—</option>
                        <option value={15}>15m</option>
                        <option value={30}>30m</option>
                        <option value={60}>1h</option>
                        <option value={120}>2h</option>
                        <option value={240}>4h</option>
                      </select>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => addTask(dateKey)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAddingForDate(null); setNewTaskText(""); }}
                        className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Task list */}
              <div className="flex-1 min-h-0 overflow-y-auto px-2 space-y-2 pb-2">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    dateKey={dateKey}
                    onToggle={() => toggleTask(dateKey, task.id)}
                    onUpdate={(updates) => updateTask(dateKey, task.id, updates)}
                    onDelete={() => deleteTask(dateKey, task.id)}
                    onAddSubTask={() => addSubTask(dateKey, task.id)}
                    onUpdateSubTask={(subId, text) => updateSubTask(dateKey, task.id, subId, text)}
                    onToggleSubTask={(subId) => toggleSubTask(dateKey, task.id, subId)}
                    onRemoveSubTask={(subId) => removeSubTask(dateKey, task.id, subId)}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ResizeHandle widgetId={widget.id} width={widget.width} height={widget.height} minWidth={400} minHeight={280} />
    </div>
  );

  if (standalone) return inner;
  return <DragWrapper widget={widget} isSelected={isSelected}>{inner}</DragWrapper>;
}

function TaskCard({
  task,
  onToggle,
  onUpdate,
  onDelete,
  onAddSubTask,
  onUpdateSubTask,
  onToggleSubTask,
  onRemoveSubTask,
  formatDuration,
}: {
  task: DayPlannerTask;
  dateKey: string;
  onToggle: () => void;
  onUpdate: (u: Partial<DayPlannerTask>) => void;
  onDelete: () => void;
  onAddSubTask: () => void;
  onUpdateSubTask: (subId: string, text: string) => void;
  onToggleSubTask: (subId: string) => void;
  onRemoveSubTask: (subId: string) => void;
  formatDuration: (min: number) => string;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const subTasks = task.subTasks || [];

  const commitEdit = () => {
    if (editText.trim()) onUpdate({ text: editText.trim() });
    setEditing(false);
  };

  return (
    <div
      className="group rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-2 p-2">
        {task.scheduledTime && (
          <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
            {task.scheduledTime}
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mt-0.5
            hover:border-blue-400 transition-colors"
        >
          {task.done && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); }}
              autoFocus
              className="w-full text-xs bg-transparent outline-none border-b border-blue-500 text-gray-800 dark:text-gray-200"
            />
          ) : (
            <span
              className={`text-xs cursor-pointer ${task.done ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200"}`}
              onClick={() => setEditing(true)}
            >
              {task.text || "Untitled"}
            </span>
          )}
        </div>
        {task.duration != null && (
          <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
            {formatDuration(task.duration)}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="shrink-0 p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Sub-tasks */}
      {subTasks.length > 0 && (
        <div className="pl-6 pr-2 pb-2 space-y-1">
          {subTasks.map((sub) => (
            <div key={sub.id} className="flex items-center gap-2 group/sub">
              <button
                type="button"
                onClick={() => onToggleSubTask(sub.id)}
                className="shrink-0 w-3 h-3 rounded border border-gray-400 flex items-center justify-center"
              >
                {sub.done && <div className="w-1.5 h-1.5 bg-gray-600 rounded-sm" />}
              </button>
              <input
                value={sub.text}
                onChange={(e) => onUpdateSubTask(sub.id, e.target.value)}
                className="flex-1 min-w-0 text-[11px] bg-transparent border-none outline-none text-gray-600 dark:text-gray-400"
                placeholder="Sub-task..."
              />
              <button
                type="button"
                onClick={() => onRemoveSubTask(sub.id)}
                className="opacity-0 group-hover/sub:opacity-100 text-gray-400 hover:text-red-500 p-0.5"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Expand / Add sub-task */}
      <div className="px-2 pb-2 flex items-center gap-1">
        <button
          type="button"
          onClick={onAddSubTask}
          className="text-[10px] text-gray-400 hover:text-blue-500"
        >
          + Sub-task
        </button>
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {task.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
