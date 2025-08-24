"use client";

import { useState } from "react";
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

function Section({
  score,
  initial = [{ label: "", sentiment: "neutral" as Sentiment }],
}: {
  score: 1 | 2 | 3 | 4 | 5;
  label: string;
  initial?: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(initial);

  const add = () => setRows((r) => [...r, { label: "", sentiment: "neutral" }]);
  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const update = (i: number, next: Partial<Row>) =>
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, ...next } : row))
    );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-6 text-xs text-muted-foreground">Trait</div>
        <div className="col-span-4 text-xs text-muted-foreground">
          Sentiment
        </div>
        <div className="col-span-2" />
      </div>

      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          {/* NOTE: use [] so FormData.getAll(...) returns an array */}
          <Input
            name={`traits_${score}[]`}
            value={row.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="e.g. too sweet"
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
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={add} className="mt-2">
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
