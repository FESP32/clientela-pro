"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export default function SurveysTable({
  items,
  deleteSurvey,
}: {
  items: SurveyWithProduct[];
  deleteSurvey: (id: string) => Promise<void>;
}) {
  const [linkDialog, setLinkDialog] = useState<{
    title: string;
    path: string;
  } | null>(null);

  return (
    <Card className="w-full">
      {/* Dialog (mounted only when needed) */}
      {linkDialog && (
        <RespondLinkDialog
          open={true}
          onOpenChange={(open) => !open && setLinkDialog(null)}
          surveyTitle={linkDialog.title}
          respondPath={linkDialog.path}
        />
      )}

      <CardHeader>
        <CardTitle>Surveys</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No surveys found.</p>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="space-y-3 md:hidden">
              {items.map((s) => {
                const respondPath = `/services/surveys/${s.id}/respond`;
                return (
                  <div
                    key={s.id}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{s.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {s.description ?? "—"}
                        </div>

                        <div className="mt-2 text-xs">
                          <span className="text-muted-foreground">
                            Product:{" "}
                          </span>
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

                      {/* Actions dropdown */}
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

                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/surveys/${s.id}/responses`}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View responses
                            </Link>
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
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[260px]">Title</TableHead>
                    <TableHead className="min-w-[200px]">Product</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">Anonymous</TableHead>
                    <TableHead className="min-w-[220px]">Window</TableHead>
                    <TableHead className="w-[200px]">Created</TableHead>
                    <TableHead className="w-[80px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.map((s) => {
                    const respondPath = `/services/surveys/${s.id}/respond`;

                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          {s.title}
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {s.description ?? "—"}
                          </div>
                        </TableCell>

                        <TableCell>{s.product?.name ?? "—"}</TableCell>

                        <TableCell>
                          {s.is_active ? (
                            <Badge>Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          {s.is_anonymous ? (
                            <Badge variant="secondary">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {fmt(s.starts_at)} — {fmt(s.ends_at)}
                        </TableCell>

                        <TableCell>{fmt(s.created_at)}</TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Open actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

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

                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/surveys/${s.id}/responses`}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View responses
                                </Link>
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
