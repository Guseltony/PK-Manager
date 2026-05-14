import DreamDetailView from "../../../../features/dreams/DreamDetailView";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default async function DreamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <DreamDetailView id={resolvedParams.id} />;
}
