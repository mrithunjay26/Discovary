import { notFound } from "next/navigation";
import { CASES, getCase } from "@/lib/data";
import CaseDetail from "./case-detail";

export function generateStaticParams() {
  return CASES.map((c) => ({ id: String(c.id) }));
}

export default async function Page({ params }: PageProps<"/cases/[id]">) {
  const { id } = await params;
  if (!getCase(Number(id))) notFound();
  return <CaseDetail id={Number(id)} />;
}
