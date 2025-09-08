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
  Trash2,
  QrCode,
} from "lucide-react";

import type { SurveyWithProduct } from "@/types/surveys";
import { RespondLinkDialog } from "./respond-link-dialog";
import { fmt } from "@/lib/utils";

import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { Card, CardContent } from "@/components/ui/card";

export default function MerchantSurveysTable({
  surveys,
  deleteSurvey,
}: {
  surveys: SurveyWithProduct[];
  deleteSurvey: (id: string) => Promise<void>; // used via form bind
}) {
  const [linkDialog, setLinkDialog] = useState<{
    title: string;
    path: string;
  } | null>(null);

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
      headClassName: "min-w-[260px]",
      cell: (s) => (
        <div className="font-medium">
          {s.title}
          <div className="text-xs text-muted-foreground line-clamp-1">
            {s.description ?? "—"}
          </div>
        </div>
      ),
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
      cell: (s) =>
        s.is_active ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        ),
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
      cell: (s) => {
        const respondPath = `/services/surveys/${s.id}/respond`;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/surveys/${s.id}/responses`}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View responses
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href={respondPath} className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Respond
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={() =>
                    setTimeout(
                      () =>
                        setLinkDialog({ title: s.title, path: respondPath }),
                      0
                    )
                  }
                >
                  <QrCode className="h-4 w-4" />
                  Show respond URL
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <form action={deleteSurvey.bind(null, s.id)}>
                  <DropdownMenuItem asChild>
                    <button
                      type="submit"
                      className="w-full text-left flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Dialog (mounted only when needed) */}
      {linkDialog && (
        <RespondLinkDialog
          open
          onOpenChange={(open) => !open && setLinkDialog(null)}
          surveyTitle={linkDialog.title}
          respondPath={linkDialog.path}
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
                    {s.is_active ? (
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

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open actions"
                      className="shrink-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/surveys/${s.id}/responses`}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View responses
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href={respondPath}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Respond
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onSelect={() =>
                        setTimeout(
                          () =>
                            setLinkDialog({
                              title: s.title,
                              path: respondPath,
                            }),
                          0
                        )
                      }
                    >
                      <QrCode className="h-4 w-4" />
                      Show respond URL
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <form action={deleteSurvey.bind(null, s.id)}>
                      <DropdownMenuItem asChild>
                        <button
                          type="submit"
                          className="w-full text-left flex items-center gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </DropdownMenuItem>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
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
