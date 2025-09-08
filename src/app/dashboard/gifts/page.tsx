// app/dashboard/gifts/page.tsx
import Image from "next/image";
import { listGifts } from "@/actions";
import MerchantListSection from "@/components/common/merchant-list-section";
import GiftsExplorer from "@/components/dashboard/gifts/gifts-explorer";
import { Badge } from "@/components/ui/badge";
import { Gift, Image as ImageIcon, Package } from "lucide-react";
import { GiftRow } from "@/types";
import MonoIcon from "@/components/common/mono-icon";

export const dynamic = "force-dynamic";

export default async function GiftsPage() {
  const { gifts = [] } = await listGifts();
  const total = gifts.length;
  const withImages = gifts.filter((g: GiftRow) => Boolean(g.image_url)).length;
  const withoutImages = total - withImages;

  return (
    <MerchantListSection
      title={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MonoIcon>
              <Gift className="h-4 w-4" aria-hidden="true" />
            </MonoIcon>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Gifts
            </h1>
          </div>

          {/* Badges (Apple-like, but using shadcn Badge) */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Package className="h-3.5 w-3.5" />
              {total} total
            </Badge>
            <Badge className="gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              {withImages} with images
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 opacity-60" />
              {withoutImages} without images
            </Badge>
          </div>
        </div>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          Curate visually rich gifts; keep titles short and clean.
        </div>
      }
      headerClassName="mb-4"
      contentClassName="space-y-4"
    >
      {/* Hairline divider for subtle structure */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <GiftsExplorer gifts={gifts} />
    </MerchantListSection>
  );
}
