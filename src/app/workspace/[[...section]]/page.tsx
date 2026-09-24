import { notFound } from "next/navigation";
import { Workspace } from "@/features/workspace/Workspace";
import { type Section, sections } from "@/lib/models/domain";
export default async function Page({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const parts = (await params).section ?? [];
  const section = parts[0] ?? "factory";
  if (
    !sections.includes(section as Section) ||
    parts.length > 2 ||
    (parts[1] && section !== "runs")
  )
    notFound();
  return <Workspace section={section as Section} runId={parts[1]} />;
}
