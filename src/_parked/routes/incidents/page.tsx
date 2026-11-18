import type { Metadata } from "next";
import { Suspense } from "react";
import { IncidentList } from "@/components/incidents/incident-list";

export const metadata: Metadata = { title: "Alerts & incidents" };

export default function IncidentsPage() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-surface-muted" aria-label="Loading" />}>
      <IncidentList />
    </Suspense>
  );
}
