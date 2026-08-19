import { getIssuersCoverageReport, getMasterIssuersList } from "@/services/issuer-service";
import { CoverageView } from "./coverage-view";

export const metadata = {
  title: "Issuer Universe & Research Coverage — CardIntel Admin",
  description: "Authoritative registry of Indian credit card issuers and entity relationships.",
};

export default async function CoveragePage() {
  const [report, issuers] = await Promise.all([
    getIssuersCoverageReport(),
    getMasterIssuersList(),
  ]);

  return <CoverageView initialReport={report} initialIssuers={issuers} />;
}
