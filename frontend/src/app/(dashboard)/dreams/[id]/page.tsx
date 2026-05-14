import DreamDetailView from "../../../../features/dreams/DreamDetailView";

// This is required for 'output: export' with dynamic routes
export async function generateStaticParams() {
  return [];
}

// In Next.js 15, params is a Promise
export default async function DreamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <DreamDetailView id={resolvedParams.id} />;
}
