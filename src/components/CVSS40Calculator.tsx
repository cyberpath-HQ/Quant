/**
 * CVSS v4.0 Calculator Component
 *
 * Interactive calculator for CVSS v4.0 vulnerability scoring.
 * Features: Side-by-side layout, tabbed metrics, state persistence, real-time updates
 */

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download, Share2, Info } from "lucide-react";
import { toast, Toaster } from "sonner";
import { calculateCVSSv4Score } from "@/lib/cvss/v4";
import { cvss40Metrics, getSeverityRating } from "@/lib/cvss/metrics-data";
import { exportToPDF } from "@/lib/pdf-export";
import { addToHistory } from "./ScoreHistory";
import type { CVSSv4Metrics } from "@/lib/cvss/types";
import { dash } from "radash";

interface CVSS40CalculatorProps {
  initialMetrics?: Partial<CVSSv4Metrics>;
}

export function CVSS40Calculator({ initialMetrics }: CVSS40CalculatorProps = {}) {
  const defaultMetrics: CVSSv4Metrics = {
    AV: "N",
    AC: "L",
    AT: "N",
    PR: "N",
    UI: "N",
    VC: "H",
    VI: "H",
    VA: "H",
    SC: "H",
    SI: "H",
    SA: "H",
    E: "X",
    CR: "X",
    IR: "X",
    AR: "X",
    MAV: "X",
    MAC: "X",
    MAT: "X",
    MPR: "X",
    MUI: "X",
    MVC: "X",
    MVI: "X",
    MVA: "X",
    MSC: "X",
    MSI: "X",
    MSA: "X",
    S: "X",
    AU: "X",
    R: "X",
    V: "X",
    RE: "X",
    U: "X",
  };

  const [metrics, setMetrics] = useState<CVSSv4Metrics>(() => {
    if (initialMetrics && Object.keys(initialMetrics).length > 0) {
      return { ...defaultMetrics, ...initialMetrics };
    }
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cvss-v4.0-metrics");
        if (stored) return { ...defaultMetrics, ...JSON.parse(stored) };
      } catch (e) {
        console.error("Failed to load stored metrics:", e);
      }
    }
    return defaultMetrics;
  });

  const [score, setScore] = useState<number>(0);
  const [vectorString, setVectorString] = useState<string>("");
  const [activeGroup, setActiveGroup] = useState("base");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cvss-v4.0-metrics", JSON.stringify(metrics));
    }
    const result = calculateCVSSv4Score(metrics);
    setScore(result.score);
    setVectorString(result.vector);

    if (result.score > 0) {
      const entry = {
        version: "v4.0",
        score: result.score,
        severity: getSeverityRating(result.score, "4.0").label,
        vectorString: result.vector,
      };
      addToHistory(entry);
    }
  }, [metrics]);

  const updateMetric = (key: keyof CVSSv4Metrics, value: string) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  const copyVector = () => {
    navigator.clipboard.writeText(vectorString);
    toast.success("Vector string copied");
  };

  const shareScore = () => {
    const url = `${window.location.origin}?vector=${encodeURIComponent(vectorString)}`;
    navigator.clipboard.writeText(url);
    toast.success("Shareable link copied");
  };

  const exportPDF = () => {
    exportToPDF({
      version: "4.0",
      score,
      severity: getSeverityRating(score, "4.0").label,
      vectorString,
      metrics: metrics as unknown as Record<string, string>,
    });
  };

  const severity = getSeverityRating(score, "4.0");

  return (
    <div className="grid lg:grid-cols-[1fr,380px] gap-8">
      <Toaster position="top-right" richColors />

      {/* Left: Metrics */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configure Metrics</h2>
          <p className="text-sm text-muted-foreground mt-1">Score updates in real-time</p>
        </div>

        <Tabs value={activeGroup} onValueChange={setActiveGroup}>
          <TabsList className="w-full grid grid-cols-4 h-10">
            {
              cvss40Metrics.map((group) => (
                <TabsTrigger key={group.name} value={dash(group.name)} className="text-xs">
                  {group.name.replace("Metrics", "")}
                </TabsTrigger>
              ))
            }
          </TabsList>

          {cvss40Metrics.map((group, idx) => (
            <TabsContent key={group.name} value={dash(group.name)} className="mt-6 space-y-4">
              <div className="text-sm text-muted-foreground">{group.description}</div>

              <div className="grid gap-5 sm:grid-cols-2">
                {group.metrics.map((metric) => (
                  <div key={metric.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">{metric.label}</label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button>
                              <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm" side="top">
                            <p className="text-xs">{metric.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <Select
                      value={metrics[metric.key as keyof CVSSv4Metrics] as string}
                      onValueChange={(value) => updateMetric(metric.key as keyof CVSSv4Metrics, value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue>
                          {
                            metric.options.find((opt) => opt.value === metrics[metric.key as keyof CVSSv4Metrics])
                              ?.label
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {metric.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              {option.description && (
                                <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Right: Sticky Score */}
      <div className="lg:sticky lg:top-6 h-fit">
        <Card className="border-2 border-sky-500/30 shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CVSS v4.0</p>
              <div className="flex items-baseline gap-3">
                <div className="text-6xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">{score.toFixed(1)}</div>
                <Badge className={`${severity.bgColor} ${severity.color} text-sm px-3 py-1.5 font-semibold`}>
                  {severity.label}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vector</p>
              <div className="rounded-lg bg-white dark:bg-slate-900 p-3 font-mono text-[10px] leading-relaxed break-all border border-sky-200 dark:border-sky-800 text-foreground">
                {vectorString}
              </div>
            </div>

            <div className="grid gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={copyVector} className="justify-start h-9 text-sm">
                <Copy className="h-3.5 w-3.5 mr-2" />
                Copy Vector
              </Button>
              <Button variant="outline" size="sm" onClick={shareScore} className="justify-start h-9 text-sm">
                <Share2 className="h-3.5 w-3.5 mr-2" />
                Share Link
              </Button>
              <Button variant="outline" size="sm" onClick={exportPDF} className="justify-start h-9 text-sm">
                <Download className="h-3.5 w-3.5 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
