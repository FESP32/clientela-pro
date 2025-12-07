// components/dashboard/surveys/merchant-surveys-table.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  MessageSquare,
  Eye,
  QrCode,
  ToggleLeft,
  ToggleRight,
  ListCheck,
} from "lucide-react";

import type { SurveyWithProduct } from "@/types/surveys";
import { fmt } from "@/lib/utils";

import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/common/status-badge";
import { finishSurvey, toggleSurveyActive } from "@/actions";
import { ConfirmDeleteMenuItem } from "@/components/common/confirm-delete-menu-item";
import QRLinkDialog from "@/components/common/qr-link-dialog";

function MobileQRButton({
  title,
  respondPath,
  onShowLink,
  className,
}: {
  title: string;
  respondPath: string;
  onShowLink: (title: string, path: string) => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      aria-label={`Show QR for ${title}`}
      aria-haspopup="dialog"
      onClick={() => onShowLink(title, respondPath)}
      variant="secondary"
      className={`md:hidden h-11 px-4 rounded-full shadow-sm active:scale-[0.98] ${
        className ?? ""
      }`}
    >
      <QrCode className="h-5 w-5 mr-2" />
      Show QR
    </Button>
  );
}

type SurveyActionsMenuProps = {
  survey: SurveyWithProduct;
  deleteSurvey: (formData: FormData) => Promise<void>;
  onShowLink: (title: string, path: string) => void;
  align?: "start" | "end";
  buttonClassName?: string;
};

function SurveyActionsMenu({
  survey,
  deleteSurvey,
  onShowLink,
  align = "end",
  buttonClassName,
}: SurveyActionsMenuProps) {
  const respondPath = `/services/surveys/${survey.id}/respond`;
  const isActive = survey.status === "active";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open actions for ${survey.title}`}
          className={buttonClassName}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* View responses (primary) */}
        <DropdownMenuItem
          asChild
          className="text-primary data-[highlighted]:bg-primary/10"
        >
          <Link
            href={`/dashboard/surveys/${survey.id}/responses`}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View responses
          </Link>
        </DropdownMenuItem>

        {/* Respond (emerald) */}
        <DropdownMenuItem
          asChild
          className="text-emerald-600 data-[highlighted]:bg-emerald-50 dark:data-[highlighted]:bg-emerald-950/30"
        >
          <Link href={respondPath} className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Respond
          </Link>
        </DropdownMenuItem>

        {/* Show respond URL (amber) */}
        <DropdownMenuItem
          className="flex items-center gap-2 text-amber-600 data-[highlighted]:bg-amber-50 dark:data-[highlighted]:bg-amber-950/30"
          onSelect={() =>
            setTimeout(() => onShowLink(survey.title, respondPath), 0)
          }
        >
          <QrCode className="h-4 w-4" />
          Show respond URL
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Finish (violet) */}
        <form action={finishSurvey.bind(null, survey.id)}>
          <DropdownMenuItem
            asChild
            className="text-violet-600 data-[highlighted]:bg-violet-50 dark:data-[highlighted]:bg-violet-950/30"
          >
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2"
            >
              <ListCheck className="h-4 w-4" />
              Finish
            </button>
          </DropdownMenuItem>
        </form>

        {/* Toggle Active/Inactive (green when activating, zinc when deactivating) */}
        <form action={toggleSurveyActive.bind(null, survey.id)}>
          <DropdownMenuItem
            asChild
            className={
              isActive
                ? "text-zinc-700 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-900"
                : "text-green-600 data-[highlighted]:bg-green-50 dark:data-[highlighted]:bg-green-950/30"
            }
          >
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2"
            >
              {isActive ? (
                <ToggleLeft className="h-4 w-4" />
              ) : (
                <ToggleRight className="h-4 w-4" />
              )}
              {isActive ? "Set inactive" : "Set active"}
            </button>
          </DropdownMenuItem>
        </form>
        <ConfirmDeleteMenuItem
          action={deleteSurvey}
          hiddenFields={{ surveyId: survey.id }}
          label="Delete"
          title="Delete Survey"
          description="This action cannot be undone. This will permanently delete the survey and it's responses"
          resourceLabel={survey.title}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function MerchantSurveysTable({
  surveys,
  deleteSurvey,
}: {
  surveys: SurveyWithProduct[];
  deleteSurvey: (formData: FormData) => Promise<void>;
}) {
  const [dlg, setDlg] = useState<{ title: string; path: string } | null>(null);

  const emptyState = (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="mb-2 text-sm text-muted-foreground">No surveys yet.</p>
      </CardContent>
    </Card>
  );

  const columns: Column<SurveyWithProduct>[] = [
    {
      key: "title",
      header: "Title",
      headClassName: "max-w-[160px]",
      cell: (s) => <div className="font-medium">{s.title}</div>,
    },
    {
      key: "product",
      header: "Product",
      headClassName: "min-w-[200px]",
      cell: (s) => <span>{s.product?.name ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      headClassName: "w-[120px]",
      cell: (s) => <StatusBadge status={s.status} endsAt={s.ends_at} />,
    },
    {
      key: "anon",
      header: "Anonymous",
      headClassName: "w-[120px]",
      cell: (s) =>
        s.is_anonymous ? (
          <Badge variant="secondary">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        ),
    },
    {
      key: "window",
      header: "Window",
      headClassName: "min-w-[220px]",
      cell: (s) => (
        <span className="text-sm text-muted-foreground">
          {fmt(s.starts_at)} — {fmt(s.ends_at)}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      headClassName: "w-[200px]",
      cell: (s) => fmt(s.created_at),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[80px] text-right",
      cell: (s) => (
        <div className="text-right">
          <SurveyActionsMenu
            survey={s}
            deleteSurvey={deleteSurvey}
            onShowLink={(title, path) => setDlg({ title, path })}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      {dlg && (
        <QRLinkDialog
          open
          onOpenChange={(open) => !open && setDlg(null)}
          title={dlg.title}
          path={dlg.path}
        />
      )}

      <ResponsiveListTable<SurveyWithProduct>
        items={surveys}
        getRowKey={(s) => s.id}
        emptyState={emptyState}
        /* Mobile cards */
        renderMobileCard={(s) => {
          const respondPath = `/services/surveys/${s.id}/respond`;
          return (
            <div key={s.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{s.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {s.description ?? "—"}
                  </div>

                  <div className="mt-2 text-xs">
                    <span className="text-muted-foreground">Product: </span>
                    {s.product?.name ?? "—"}
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    {fmt(s.starts_at)} — {fmt(s.ends_at)}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {s.status === "active" ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                    {s.is_anonymous ? (
                      <Badge variant="secondary">Anon</Badge>
                    ) : (
                      <Badge variant="outline">Named</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Created {fmt(s.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions (mobile: big QR + kebab) */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <MobileQRButton
                    title={s.title}
                    respondPath={respondPath}
                    onShowLink={(title, path) => setDlg({ title, path })}
                  />
                  <SurveyActionsMenu
                    survey={s}
                    deleteSurvey={deleteSurvey}
                    onShowLink={(title, path) => setDlg({ title, path })}
                    align="end"
                    buttonClassName="shrink-0"
                  />
                </div>
              </div>
            </div>
          );
        }}
        /* Desktop columns */
        columns={columns}
      />
    </>
  );
}
