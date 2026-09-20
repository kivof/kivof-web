"use client";
import type { Overview } from "@/lib/models/domain";
import { FactoryWorkbench } from "./FactoryWorkbench";
export function OverviewPanel({ overview }: { overview: Overview }) {
  return <FactoryWorkbench overview={overview} />;
}
