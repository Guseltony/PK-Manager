"use client";

import { useParams } from "next/navigation";
import DreamDetailView from "../../../../features/dreams/DreamDetailView";

export default function DreamPage() {
  const { id } = useParams();

  return <DreamDetailView id={id as string} />;
}
