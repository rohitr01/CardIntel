import { notFound } from "next/navigation";
import { getMasterIssuerById } from "@/services/issuer-service";
import { IssuerDetailView } from "@/components/admin/issuer-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Issuer Entity & Relationships — CardIntel Admin",
  description: "Detailed legal entity hierarchy, regulatory status, and card inventory.",
};

export default async function AdminIssuerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const issuer = await getMasterIssuerById(id);

  if (!issuer) {
    notFound();
  }

  return <IssuerDetailView issuer={issuer} />;
}
