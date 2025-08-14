// app/(dashboard)/your-page/page.tsx
import { ToolCard } from "@/components/dashboard/tool-card";
import { toolsArray } from "@/defaults";

export default async function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {toolsArray.map((tool, idx) => (
          <ToolCard key={idx} tool={tool} />
        ))}
      </div>
    </div>
  );
}
