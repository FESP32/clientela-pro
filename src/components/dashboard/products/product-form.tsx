"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SubmitButton from "../../common/submit-button";
import {
  Package2,
  Info,
  Code2,
  ListTree,
  Plus,
  Trash2,
  Wand2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MonoIcon from "../../common/mono-icon";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ProductFormProps = {
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
  defaultValues?: {
    name?: string;
    metadata?: string;
  };
};

type KV = { key: string; value: string };

const PRESETS: { label: string; key: string; example?: string }[] = [
  { label: "SKU", key: "sku", example: "APPLE-PIE-001" },
  { label: "Category", key: "category", example: "Dessert" },
  { label: "Price", key: "price", example: "9.99" },
  { label: "Currency", key: "currency", example: "USD" },
  { label: "Tags (comma-separated)", key: "tags", example: "sweet,classic" },
  { label: "In stock (true/false)", key: "in_stock", example: "true" },
  { label: "Color", key: "color", example: "Golden" },
  { label: "Size", key: "size", example: "Large" },
];

function parseInitialKV(jsonStr?: string): KV[] {
  if (!jsonStr) return [];
  try {
    const obj = JSON.parse(jsonStr);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      return Object.entries(obj).map(([k, v]) => ({
        key: String(k),
        value:
          typeof v === "string"
            ? v
            : v === null
            ? "null"
            : Array.isArray(v) || typeof v === "object"
            ? JSON.stringify(v)
            : String(v),
      }));
    }
  } catch {
    // fall back to empty
  }
  return [];
}

function inferValueType(raw: string): unknown {
  const t = raw.trim();
  if (!t.length) return "";
  if (t === "true") return true;
  if (t === "false") return false;
  if (t === "null") return null;
  // Try JSON object/array/quoted string
  if (
    (t.startsWith("{") && t.endsWith("}")) ||
    (t.startsWith("[") && t.endsWith("]")) ||
    (t.startsWith('"') && t.endsWith('"'))
  ) {
    try {
      return JSON.parse(t);
    } catch {
      // fall through to number/string
    }
  }
  // Try number
  if (!Number.isNaN(Number(t))) return Number(t);
  return t; // plain string
}

function isValidKeyName(key: string) {
  // friendly constraint: letters, numbers, underscore, hyphen; start with letter
  return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(key);
}

export default function ProductForm({
  onSubmit,
  defaultValues,
}: ProductFormProps) {

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [rows, setRows] = useState<KV[]>(() =>
    parseInitialKV(defaultValues?.metadata)
  );
  const [advanced, setAdvanced] = useState(false);
  const [jsonDraft, setJsonDraft] = useState<string>(
    () => defaultValues?.metadata ?? ""
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Derived: duplicates & invalid keys
  const dupKeys = useMemo(() => {
    const seen = new Set<string>();
    const dups = new Set<string>();
    for (const r of rows) {
      const k = r.key.trim();
      if (!k) continue;
      if (seen.has(k)) dups.add(k);
      seen.add(k);
    }
    return dups;
  }, [rows]);

  // JSON value that will be submitted
  const metadataString = useMemo(() => {
    if (advanced) {
      // In advanced mode, only include when JSON is valid
      try {
        if (!jsonDraft.trim()) return "";
        JSON.parse(jsonDraft);
        return jsonDraft;
      } catch {
        return "";
      }
    }
    // KV mode
    const obj: Record<string, unknown> = {};
    for (const { key, value } of rows) {
      const k = key.trim();
      if (!k || dupKeys.has(k) || !isValidKeyName(k)) continue;
      obj[k] = inferValueType(value);
    }
    const str = JSON.stringify(obj);
    return str === "{}" ? "" : str;
  }, [advanced, jsonDraft, rows, dupKeys]);

  // Validate advanced JSON on edit
  useEffect(() => {
    if (!advanced) {
      setJsonError(null);
      return;
    }
    if (!jsonDraft.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(jsonDraft);
      setJsonError(null);
    } catch (e) {
      setJsonError(
        "Invalid JSON. Please fix errors or switch back to Simple mode."
      );
    }
  }, [advanced, jsonDraft]);

  const addRow = (preset?: { key: string; example?: string }) => {
    setRows((prev) => [
      ...prev,
      { key: preset?.key ?? "", value: preset?.example ?? "" },
    ]);
  };

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/products");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form action={handleSubmit} className="mx-auto max-w-6xl">
      {/* Header */}
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MonoIcon>
              <Package2 className="size-4" aria-hidden="true" />
            </MonoIcon>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Create Products
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Info className="h-4 w-4" aria-hidden="true" />
              Create the stock you have available.
            </span>
            <span className="inline-flex items-center gap-1">
              <ListTree className="h-4 w-4" aria-hidden="true" />
              Add friendly metadata (no JSON required).
            </span>
          </p>
        </div>

        {/* Mode switch */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={advanced ? "outline" : "default"}
            size="sm"
            onClick={() => setAdvanced(false)}
            aria-pressed={!advanced}
          >
            <ListTree className="h-4 w-4 mr-1.5" />
            Simple
          </Button>
          <Button
            type="button"
            variant={advanced ? "default" : "outline"}
            size="sm"
            onClick={() => setAdvanced(true)}
            aria-pressed={advanced}
          >
            <Code2 className="h-4 w-4 mr-1.5" />
            Advanced (JSON)
          </Button>
        </div>
      </header>

      {/* Body */}
      <section className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Give your product a clear, memorable name."
            required
            defaultValue={defaultValues?.name}
          />
        </div>

        {/* Metadata editor */}
        {!advanced ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Metadata (optional)</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addRow()}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add field
                </Button>
                <div className="flex flex-wrap gap-1">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.key}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => addRow({ key: p.key, example: p.example })}
                      className="text-muted-foreground"
                      title={`Add ${p.label}`}
                    >
                      <Wand2 className="h-4 w-4 mr-1" />
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* KV rows */}
            <div className="space-y-2">
              {rows.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No metadata yet. Use <strong>Add field</strong> or a preset
                  above.
                </p>
              )}

              {rows.map((row, idx) => {
                const isDup = row.key && dupKeys.has(row.key);
                const isBad = row.key && !isValidKeyName(row.key);
                return (
                  <div
                    key={idx}
                    className={cn(
                      "grid grid-cols-1 sm:grid-cols-[240px_1fr_auto] gap-2 items-center"
                    )}
                  >
                    <Input
                      aria-label={`Key ${idx + 1}`}
                      placeholder="key (e.g. sku)"
                      value={row.key}
                      onChange={(e) =>
                        setRows((prev) => {
                          const copy = [...prev];
                          copy[idx] = { ...copy[idx], key: e.target.value };
                          return copy;
                        })
                      }
                      className={cn(
                        isDup || isBad
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      )}
                    />
                    <Input
                      aria-label={`Value ${idx + 1}`}
                      placeholder="value (e.g. APPLE-PIE-001)"
                      value={row.value}
                      onChange={(e) =>
                        setRows((prev) => {
                          const copy = [...prev];
                          copy[idx] = { ...copy[idx], value: e.target.value };
                          return copy;
                        })
                      }
                    />
                    <div className="flex items-center justify-end gap-2">
                      {isDup ? (
                        <span className="inline-flex items-center text-xs text-destructive">
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          Duplicate
                        </span>
                      ) : isBad ? (
                        <span className="inline-flex items-center text-xs text-destructive">
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          Invalid key
                        </span>
                      ) : row.key ? (
                        <span className="inline-flex items-center text-xs text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          OK
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          &nbsp;
                        </span>
                      )}

                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove row ${idx + 1}`}
                        onClick={() => removeRow(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtle tip */}
            <p className="text-xs text-muted-foreground">
              Keys support letters, numbers, <code>_</code> and <code>-</code>,
              and must start with a letter. Values are auto-typed:{" "}
              <code>true</code>/<code>false</code>, numbers, <code>null</code>,
              JSON objects/arrays, or strings.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="metadata-json">Metadata (JSON)</Label>
            <Textarea
              id="metadata-json"
              value={jsonDraft}
              onChange={(e) => setJsonDraft(e.target.value)}
              rows={8}
              placeholder={`{\n  "sku": "APPLE-PIE-001",\n  "category": "Dessert",\n  "price": 9.99,\n  "tags": ["sweet","classic"],\n  "in_stock": true\n}`}
              aria-invalid={!!jsonError}
            />
            {jsonError ? (
              <p className="text-xs text-destructive inline-flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {jsonError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Paste or edit JSON freely. We’ll submit it as-is when valid.
              </p>
            )}
          </div>
        )}

        {/* Hidden field submitted to server */}
        <input type="hidden" name="metadata" value={metadataString} />
      </section>

      {/* Footer */}
      <div className="mt-4 flex gap-2">
        <SubmitButton />
        <Button asChild variant="outline">
          <Link href="/dashboard/products">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
