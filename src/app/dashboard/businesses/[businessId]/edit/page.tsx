import BusinessCreate from "@/components/dashboard/businesses/business-create";
import { updateBusiness } from "@/actions";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {

  const { businessId } = await params;
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/dashboard/businesses/${businessId}/edit`);
  }

  // Load business (ensure ownership)
  const { data: business, error } = await supabase
    .from("business")
    .select(
      "id, owner_id, name, description, website_url, instagram_url, facebook_url, image_url, image_path, is_active"
    )
    .eq("id", businessId)
    .single();

  if (error || !business) notFound();
  if (business.owner_id !== user.id) {
    // alternatively check business_user role if you support admins:
    // const { data: member } = await supabase.from("business_user").select("role").eq("business_id", params.id).eq("user_id", user.id).maybeSingle();
    redirect("/dashboard/businesses?unauthorized=1");
  }

  return (
    <div className="p-4">
      <BusinessCreate
        action={updateBusiness}
        initialData={{
          id: business.id,
          name: business.name,
          description: business.description,
          website_url: business.website_url,
          instagram_url: business.instagram_url,
          facebook_url: business.facebook_url,
          image_url: business.image_url,
          is_active: business.is_active ?? false,
        }}
      />
    </div>
  );
}
