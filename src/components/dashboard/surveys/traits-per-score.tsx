"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Plus, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Sentiment = "positive" | "neutral" | "negative";
type Row = { label: string; sentiment: Sentiment };

const PREFIXES: Record<Sentiment, string[]> = {
  negative: ["Too ", "Not ", "Lacked ", "Overly ", "Poor ", "Cold ", "Slow "],
  neutral: ["Okay ", "Average ", "Just ", "Fine ", "Could be ", "Typical "],
  positive: ["Loved ", "Great ", "Very ", "Excellent ", "Perfect ", "Fresh "],
};

function defaultSentimentForScore(score: 1 | 2 | 3 | 4 | 5): Sentiment {
  if (score <= 2) return "negative";
  if (score === 3) return "neutral";
  return "positive";
}

function Section({
  score,
  initial = [{ label: "", sentiment: "neutral" as Sentiment }],
}: {
  score: 1 | 2 | 3 | 4 | 5;
  initial?: Row[];
  label?: string;
}) {
  const defaultSentiment = useMemo(
    () => defaultSentimentForScore(score),
    [score]
  );

  const [rows, setRows] = useState<Row[]>(
    initial?.length
      ? initial.map((r) => ({
          label: r.label ?? "",
          sentiment: (r.sentiment ?? defaultSentiment) as Sentiment,
        }))
      : [{ label: "", sentiment: defaultSentiment }]
  );

  const [quickSent, setQuickSent] = useState<Sentiment>(defaultSentiment);
  const [bulkDraft, setBulkDraft] = useState("");

  const addRow = (sent: Sentiment = defaultSentiment, prefill = "") => {
    setRows((prev) => {
      const next = [...prev, { label: prefill, sentiment: sent }];
      // focus the newly added input on next tick
      queueMicrotask(() => {
        const id = `trait-${score}-${next.length - 1}`;
        document.getElementById(id)?.focus();
      });
      return next;
    });
  };

  const add = () => addRow(defaultSentiment, "");
  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const update = (i: number, next: Partial<Row>) =>
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, ...next } : row))
    );

  const addPrefix = (prefix: string) => addRow(quickSent, prefix);

  const handleBulkAdd = () => {
    if (!bulkDraft.trim()) return;
    // Split by commas, semicolons, or newlines
    const parts = bulkDraft
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const items: Row[] = parts.map((raw) => {
      let sentiment: Sentiment = defaultSentiment;
      let text = raw;

      if (/^[!~+]/.test(raw)) {
        const sig = raw[0];
        text = raw.slice(1).trim();
        if (sig === "!") sentiment = "negative";
        else if (sig === "~") sentiment = "neutral";
        else if (sig === "+") sentiment = "positive";
      }
      return { label: text, sentiment };
    });

    if (items.length) {
      setRows((prev) => {
        const next = [...prev, ...items];
        queueMicrotask(() => {
          const id = `trait-${score}-${next.length - 1}`;
          document.getElementById(id)?.focus();
        });
        return next;
      });
      setBulkDraft("");
    }
  };

  const onBulkKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBulkAdd();
    }
  };

  return (
    <div className="space-y-3">
      {/* Quick sentiment selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Quick sentiment:</span>
        <div className="inline-flex overflow-hidden rounded-lg border">
          {(["negative", "neutral", "positive"] as Sentiment[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuickSent(s)}
              className={cn(
                "px-2.5 py-1 text-xs transition",
                quickSent === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              )}
              aria-pressed={quickSent === s}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Quick prefix chips */}
        <div className="flex flex-wrap gap-1.5">
          {PREFIXES[quickSent].map((p, i) => (
            <Button
              key={`${p}-${i}`}
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => addPrefix(p)}
              title={`Add "${p}"…`}
            >
              {p}
              <span className="opacity-60">…</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-6 text-xs text-muted-foreground">Trait</div>
        <div className="col-span-4 text-xs text-muted-foreground">
          Sentiment
        </div>
        <div className="col-span-2" />
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <Input
            id={`trait-${score}-${i}`}
            name={`traits_${score}[]`}
            value={row.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder={
              row.sentiment === "negative"
                ? "e.g. Too salty"
                : row.sentiment === "neutral"
                ? "e.g. Average portion"
                : "e.g. Loved the crust"
            }
            className="col-span-6"
          />
          <Select
            value={row.sentiment}
            onValueChange={(v: Sentiment) => update(i, { sentiment: v })}
          >
            <SelectTrigger className="col-span-4">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
            </SelectContent>
          </Select>
          {/* pair sentiment array with same index */}
          <input
            type="hidden"
            name={`sentiment_${score}[]`}
            value={row.sentiment}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(i)}
            className="col-span-2"
            aria-label="Remove trait"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => add()}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" /> Add trait
      </Button>
    </div>
  );
}

export default function TraitsPerScore() {
  return (
    <div className="space-y-4">
      <Label className="text-sm">Traits by rating</Label>
      <Accordion
        type="multiple"
        defaultValue={["1", "2", "3", "4", "5"]}
        className="w-full"
      >
        {[1, 2, 3, 4, 5].map((score) => (
          <AccordionItem key={score} value={String(score)}>
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Star
                  className={cn(
                    "h-4 w-4",
                    score <= 2
                      ? "text-red-500"
                      : score === 3
                      ? "text-yellow-500"
                      : "text-green-500"
                  )}
                />
                {score}★ traits
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-2">
              <Section score={score as 1 | 2 | 3 | 4 | 5} label={`${score}★`} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-xs text-muted-foreground">
        Each row will be saved with its rating bucket (1–5) and sentiment.
      </p>
    </div>
  );
}
