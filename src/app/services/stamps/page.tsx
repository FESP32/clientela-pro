// components/services/stamps/my-stamp-punches.tsx (server)
import { listMyStampPunchesGroupedInCode } from "@/actions";
import StampPunchesTable from "@/components/services/stamps/stamp-punch-table";

export default async function MyStampPunches() {
  const items = await listMyStampPunchesGroupedInCode();
  return (
    <div className="p-4">
      <StampPunchesTable items={items} />
    </div>
  );
}
