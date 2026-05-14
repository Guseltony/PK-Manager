import DreamDetailView from "../../../../features/dreams/DreamDetailView";

// This is required for 'output: export' with dynamic routes
export async function generateStaticParams() {
  // We return at least one path (or an empty array if we handle it client-side)
  // For static export to work without knowing all IDs, we return an empty array
  // and accept that these pages will be handled by the SPA router or fail if not pre-rendered.
  return [];
}

// We can't use 'use client' directly on a page that exports generateStaticParams
// in some Next.js versions, so we keep it as a server component that renders a client component.
export default function DreamPage({ params }: { params: { id: string } }) {
  return <DreamDetailView id={params.id} />;
}
