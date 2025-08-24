-- 1) Create a public images bucket (id is arbitrary text; keep it stable)
insert into storage.buckets (id, name, public)
values ('public-images', 'public-images', true)
on conflict (id) do nothing;

-- 2) Policies on storage.objects (RLS is enabled by default)

-- Public read for this bucket
create policy "Public read access for public-images"
on storage.objects
for select
to public
using (bucket_id = 'public-images');

-- Authenticated users can upload (owner will be set to their auth.uid())
create policy "Authenticated users can upload to public-images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'public-images' and owner = auth.uid());

-- Authenticated users can update their own files
create policy "Owners can update their own files in public-images"
on storage.objects
for update
to authenticated
using (bucket_id = 'public-images' and owner = auth.uid())
with check (bucket_id = 'public-images' and owner = auth.uid());

-- Authenticated users can delete their own files
create policy "Owners can delete their own files in public-images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'public-images' and owner = auth.uid());
