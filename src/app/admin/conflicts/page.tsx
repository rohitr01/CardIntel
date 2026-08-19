import { getConflictsQueue } from "@/services/admin-service";
import { ConflictsView } from "./conflicts-view";

export const metadata = {
  title: "Conflict Resolution — CardIntel Admin",
  description: "Reconcile conflicting claims between MITC schedules and marketing pages.",
};

export default async function ConflictsPage() {
  const initialConflicts = await getConflictsQueue();
  return <ConflictsView initialConflicts={initialConflicts} />;
}
