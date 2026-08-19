import { getClaimsQueue } from "@/services/admin-service";
import { ClaimsView } from "./claims-view";

export const metadata = {
  title: "Claim Verification Queue — CardIntel Admin",
  description: "Review and approve extracted claims with source provenance citations.",
};

export default async function ClaimsPage() {
  const initialClaims = await getClaimsQueue();
  return <ClaimsView initialClaims={initialClaims} />;
}
