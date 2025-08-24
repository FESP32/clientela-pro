"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fmt } from "@/lib/utils";
import { SurveyListItem } from "@/types";
import {
  MoreHorizontal,
  MessageSquare,
  Eye,
  Trash2,
  Link2,
} from "lucide-react";
import { RespondLinkDialog } from "./respond-link-dialog";

export default function SurveysTable({
  surveys,
  deleteSurvey,
}: {
  surveys: SurveyListItem[];
  deleteSurvey: (id: string) => Promise<void>;
}) {
  const [linkDialog, setLinkDialog] = useState<{
    title: string;
    path: string;
  } | null>(null);

  return (
    <>
      {/* Conditionally render the dialog only when open */}
      {linkDialog && (
        <RespondLinkDialog
          open={true}
          onOpenChange={(open) => !open && setLinkDialog(null)}
          surveyTitle={linkDialog.title}
          respondPath={linkDialog.path}
          // If you ever see the page inert after close, toggle modal={false}
          // modal={false}
        />
      )}

      {/* Responsive table: scrolls on small screens; hides some columns at smaller breakpoints */}
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[380px] md:min-w-0">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[26%]">Title</TableHead>
              <TableHead className="w-[18%] hidden sm:table-cell">
                Product
              </TableHead>
              <TableHead className="w-[20%] hidden md:table-cell">
                Window
              </TableHead>
              <TableHead className="w-[10%] hidden lg:table-cell">
                Traits
              </TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[12%] hidden sm:table-cell">
                Anonymous
              </TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {surveys.map((s) => {
              const respondPath = `/services/surveys/${s.id}/respond`;
              return (
                <TableRow key={s.id}>
                  <TableCell className="align-top">
                    <div className="flex flex-col">
                      <Link
                        href={`/dashboard/surveys/${s.id}/responses`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {s.title}
                      </Link>
                      {/* On small screens, show condensed meta under title */}
                      <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                        <div className="line-clamp-1">
                          {s.product_name || "—"}
                        </div>
                        <div>
                          {fmt(s.starts_at)} — {fmt(s.ends_at)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {s.traits_count ?? 0}
                          </Badge>
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
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell align-top">
                    {s.product_name ?? "—"}
                  </TableCell>

                  <TableCell className="hidden md:table-cell align-top text-sm text-muted-foreground">
                    {fmt(s.starts_at)} — {fmt(s.ends_at)}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell align-top">
                    <Badge variant="secondary">{s.traits_count ?? 0}</Badge>
                  </TableCell>

                  <TableCell className="align-top">
                    {s.is_active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell align-top">
                    {s.is_anonymous ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>

                  <TableCell className="align-top text-right">
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

                        {/* Open controlled dialog via state (works on all sizes) */}
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onSelect={() => {
                            // let the menu close fully, then mount dialog
                            setTimeout(
                              () =>
                                setLinkDialog({
                                  title: s.title,
                                  path: respondPath,
                                }),
                              0
                            );
                          }}
                        >
                          <Link2 className="h-4 w-4" />
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
  );
}
