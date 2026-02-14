"use client";

import { useOthers, useSelf } from "@/liveblocks.config";

export function PresenceAvatars() {
  const others = useOthers();
  const self = useSelf();

  if (!self) return null;

  const MAX_SHOWN = 5;

  return (
    <div className="flex items-center -space-x-2">
      {/* Self */}
      <div
        className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-[10px] font-bold shadow-sm relative z-10"
        style={{ backgroundColor: self.info?.color ?? "#2563EB" }}
        title={`${self.info?.name ?? "You"} (you)`}
      >
        {(self.info?.name ?? "?").charAt(0).toUpperCase()}
      </div>

      {/* Others */}
      {others.slice(0, MAX_SHOWN).map(({ connectionId, info }) => (
        <div
          key={connectionId}
          className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
          style={{ backgroundColor: info?.color ?? "#666" }}
          title={info?.name ?? "Anonymous"}
        >
          {(info?.name ?? "?").charAt(0).toUpperCase()}
        </div>
      ))}

      {/* Overflow */}
      {others.length > MAX_SHOWN && (
        <div className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-gray-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
          +{others.length - MAX_SHOWN}
        </div>
      )}
    </div>
  );
}
