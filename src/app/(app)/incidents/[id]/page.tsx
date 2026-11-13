import { IncidentDetailView } from "@/components/incidents/incident-detail";

export default async function IncidentPage({ params }: PageProps<"/incidents/[id]">) {
  const { id } = await params;
  return <IncidentDetailView id={id} />;
}
