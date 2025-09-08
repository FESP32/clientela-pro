// app/services/gifts/loading.tsx
import ListExplorerTableLoading from "@/components/common/list-explorer-table-loading";

export default function Loading() {
  return (
    <ListExplorerTableLoading
      rows={6}
      cols={5}
      withBadges={false}
    />
  );
}
