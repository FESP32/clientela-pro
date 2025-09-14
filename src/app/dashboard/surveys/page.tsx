// app/dashboard/surveys/page.tsx
import { deleteSurvey, listSurveys } from "@/actions";
import MerchantListSection from "@/components/common/merchant-list-section";
import MonoIcon from "@/components/common/mono-icon";
import SurveysExplorer from "@/components/dashboard/surveys/surveys-explorer";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await listSurveys();

  return (
    <MerchantListSection
      title={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MonoIcon>
              <ClipboardList
                className="size-4"
                aria-hidden="true"
              />
            </MonoIcon>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Surveys
            </h1>
          </div>
        </div>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          Collect feedback, then explore responses with clean, focused tools.
        </div>
      }
      headerClassName="mb-4"
      contentClassName="space-y-4"
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <SurveysExplorer surveys={data} deleteSurvey={deleteSurvey} />
    </MerchantListSection>
  );
}
