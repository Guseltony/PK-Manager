"use client";
import DreamDashboard from "../../../features/dreams/DreamDashboard";
import DreamDetailView from "../../../features/dreams/DreamDetailView";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DreamsPageContent() {
  const searchParams = useSearchParams();
  const selectedDreamId = searchParams.get("dream");

  if (selectedDreamId) {
    return <DreamDetailView id={selectedDreamId} />;
  }

  return <DreamDashboard />;
}

export default function DreamsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-base">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    }>
      <DreamsPageContent />
    </Suspense>
  );
}
