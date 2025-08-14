"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Smile, Frown, Meh, Laugh, Angry } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Trait } from "@/types";

const smileyIcons = [
  { icon: Angry, label: "Very Dissatisfied", value: 1 },
  { icon: Frown, label: "Dissatisfied", value: 2 },
  { icon: Meh, label: "Neutral", value: 3 },
  { icon: Smile, label: "Satisfied", value: 4 },
  { icon: Laugh, label: "Very Satisfied", value: 5 },
] as const;

const customerFeelings: Record<number, string> = {
  1: "I'm really disappointed with this experience.",
  2: "It wasn’t what I expected, and I’m a bit let down.",
  3: "It was okay — not bad, not amazing either.",
  4: "I liked it! It was pretty good overall.",
  5: "I loved it! Everything was just right.",
};

function getSmileyColor(value: number): string {
  if (value <= 2) return "text-red-500";
  if (value === 3) return "text-yellow-500";
  return "text-green-500";
}

export default function SmileySurvey({
  surveyTitle,
  traits,
  nameRating = "rating",
  nameTraits = "selected_traits",
  initialRating = null as number | null,
  maxChips = 12,
  disabled = false, // 👈 NEW
}: {
  surveyTitle: string;
  traits: Trait[];
  nameRating?: string;
  nameTraits?: string;
  initialRating?: number | null;
  maxChips?: number;
  disabled?: boolean; // 👈 NEW
}) {
  const [selected, setSelected] = useState<number | null>(initialRating);

  const visibleTraits = useMemo(() => {
    if (selected == null) return [];
    const target = selected;
    const list = (traits || []).filter((t) =>
      typeof t.score === "number" ? t.score === target : target === 3
    );
    const seen = new Set<string>();
    const uniq: Trait[] = [];
    for (const t of list) {
      const key = (t.label || "").trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      uniq.push(t);
      if (uniq.length >= maxChips) break;
    }
    return uniq;
  }, [traits, selected, maxChips]);

  const handleSelect = (value: number) => {
    if (disabled) return;
    setSelected(value);
  };

  return (
    <div
      className={cn(
        "w-full relative",
        disabled && "pointer-events-none select-none"
      )}
      aria-disabled={disabled}
      // inert prevents focus/interaction in most modern browsers; harmless elsewhere
    >
      {/* Hidden rating input for the form */}
      <input type="hidden" name={nameRating} value={selected ?? ""} />

      <div className="text-center">
        <h2 className="text-sm sm:text-base md:text-lg font-medium text-zinc-600 my-4">
          How would you rate {surveyTitle}?
        </h2>

        <div className="flex justify-center gap-2 sm:gap-4 md:gap-6">
          {smileyIcons.map(({ icon: Icon, label, value }) => (
            <motion.button
              key={value}
              type="button"
              onClick={() => handleSelect(value)}
              disabled={disabled}
              whileHover={disabled ? undefined : { scale: 1.1 }}
              whileTap={disabled ? undefined : { scale: 0.95 }}
              animate={
                disabled
                  ? { scale: 1, y: 0 }
                  : selected === value
                  ? { scale: [1, 1.2, 1], y: [0, -5, 0] }
                  : { scale: 1, y: 0 }
              }
              transition={{ duration: 0.4 }}
              className={cn(
                "flex flex-col items-center justify-evenly transition rounded-xl",
                "sm:w-20 sm:h-20 md:w-28 md:h-28 text-xs",
                !disabled && "hover:bg-zinc-100 cursor-pointer",
                selected === value && "bg-yellow-100",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-pressed={selected === value}
              aria-label={`Select rating ${value} - ${label}`}
            >
              <Icon
                className={cn(
                  "h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10",
                  selected === value && getSmileyColor(value)
                )}
              />
              <span className="text-[10px] sm:text-xs mt-1">{label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selected !== null && (
            <motion.p
              key={selected}
              className={cn(
                "text-xs sm:text-sm text-zinc-500 my-4",
                disabled && "opacity-60"
              )}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
            >
              {customerFeelings[selected]}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {selected !== null && visibleTraits.length > 0 && (
            <motion.div
              key={`traits-${selected}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              <div className="text-xs sm:text-sm text-zinc-600 mb-2">
                Pick any traits that apply:
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {visibleTraits.map((t, idx) => {
                  const inputId = `${nameTraits}-${idx}`;
                  return (
                    <label
                      key={`${t.label}-${idx}`}
                      htmlFor={inputId}
                      className={cn(
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <input
                        id={inputId}
                        className="peer sr-only"
                        type="checkbox"
                        name={nameTraits}
                        value={t.label}
                        disabled={disabled} // 👈 lock the chips
                        aria-disabled={disabled}
                        tabIndex={disabled ? -1 : 0}
                      />
                      <Badge
                        variant="secondary"
                        className={cn(
                          "cursor-pointer px-2 py-1 text-xs rounded-full min-w-[40px] min-h-[30px] flex items-center justify-center text-center whitespace-normal break-words max-w-xs",
                          "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
                          "peer-checked:bg-green-100 peer-checked:text-green-800 peer-checked:border-green-300",
                          disabled && "pointer-events-none"
                        )}
                      >
                        {t.label}
                        {t.sentiment && (
                          <span className="ml-2 text-[10px] opacity-70">
                            ({t.sentiment})
                          </span>
                        )}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
