/**
 * CVSS v4.0 Calculator Component
 *
 * Interactive calculator for CVSS v4.0 vulnerability scoring.
 * Implements the full CVSS v4.0 specification with Base, Threat,
 * Environmental, and Supplemental metrics.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Copy, Download, Share2, Info } from "lucide-react";
import { toast, Toaster } from "sonner";
import { calculateCVSSv4Score, generateVector } from "@/lib/cvss/v4";
import { cvss40Metrics, getSeverityRating } from "@/lib/cvss/metrics-data";
import { exportToPDF } from "@/lib/pdf-export";
import { addToHistory } from "./ScoreHistory";
import type { CVSSv4Metrics } from "@/lib/cvss/types";

interface CVSS40CalculatorProps {
  initialMetrics?: Partial<CVSSv4Metrics>;
}

export function CVSS40Calculator({ initialMetrics }: CVSS40CalculatorProps = {}) {
  const defaultMetrics: CVSSv4Metrics = {
    // Base Metrics (required)
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
    // Threat Metrics (optional)
    E: "X",
    // Environmental Metrics (optional)
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
    // Supplemental Metrics (informational)
    S: "X",
    AU: "X",
    R: "X",
    V: "X",
    RE: "X",
    U: "X",
  };

  // Load from localStorage if available
  const [metrics, setMetrics] = useState<CVSSv4Metrics>(() => {
    if (initialMetrics && Object.keys(initialMetrics).length > 0) {
      return { ...defaultMetrics, ...initialMetrics };
    }
    try {
      const stored = localStorage.getItem("cvss-v4.0-metrics");
      if (stored) {
        return { ...defaultMetrics, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Failed to load stored metrics:", error);
    }
    return defaultMetrics;
  });

  const [score, setScore] = useState<number>(0);
  const [vectorString, setVectorString] = useState<string>("");
  const [activeMetricGroup, setActiveMetricGroup] = useState("base");

  // Save to localStorage whenever metrics change
  useEffect(() => {
    localStorage.setItem("cvss-v4.0-metrics", JSON.stringify(metrics));
  }, [metrics]);

  // Recalculate score whenever metrics change
  useEffect(() => {
    const result = calculateCVSSv4Score(metrics);
    setScore(result.score);
    setVectorString(result.vector);

    // Add to history if score is calculated
    if (result.score > 0) {
      addToHistory({
        version: "4.0",
        score: result.score,
        severity: getSeverityRating(result.score, "4.0").label,
        vectorString: result.vector,
      });
    }
  }, [metrics]);

  const updateMetric = (key: keyof CVSSv4Metrics, value: string) => {
    setMetrics((prev: CVSSv4Metrics) => ({ ...prev, [key]: value }));
  };

  const copyVector = async () => {
    await navigator.clipboard.writeText(vectorString);
    toast.success("Vector string copied to clipboard!");
  };

  const shareScore = async () => {
    const url = `${window.location.origin}${window.location.pathname}?vector=${encodeURIComponent(vectorString)}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share URL copied to clipboard!");
  };

  const exportPDF = async () => {
    try {
      await exportToPDF({
        version: "4.0",
        score,
        severity: severity.label,
        vectorString,
        metrics: metrics as unknown as Record<string, string>,
      });
      toast.success("PDF report generated successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const exportJSON = () => {
    const data = {
      version: "4.0",
      vectorString,
      baseScore: score,
      metrics,
      severity: getSeverityRating(score, "4.0").label,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cvss-v4.0-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const severity = getSeverityRating(score, "4.0");

  return (
    <div className="space-y-8">
      <Toaster position="top-right" richColors />

      {/* Score Display - Prominent & Clean */}
      <Card className="border-2">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Score Section */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">CVSS v4.0 Score</p>
                <div className="flex items-baseline gap-4">
                  <div className="text-7xl font-extrabold tracking-tight">{score.toFixed(1)}</div>
                  <Badge className={`${severity.bgColor} ${severity.color} text-base px-4 py-2 font-semibold`}>
                    {severity.label}
                  </Badge>
                </div>
              </div>

              {/* Vector String */}
              <div className="space-y-2 max-w-2xl">
                <p className="text-sm font-medium text-muted-foreground">Vector String</p>
                <div className="rounded-lg bg-muted/50 p-4 font-mono text-sm break-all border">{vectorString}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex lg:flex-col gap-3">
              <Button variant="outline" className="flex-1 lg:w-40" onClick={copyVector}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Vector
              </Button>
              <Button variant="outline" className="flex-1 lg:w-40" onClick={shareScore}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="flex-1 lg:w-40" onClick={exportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Configuration */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configure Metrics</h2>
          <p className="text-muted-foreground mt-1">Select the appropriate values for each metric category</p>
        </div>

        <Accordion type="multiple" defaultValue={["base"]} className="space-y-4">
          {cvss40Metrics.map((group, groupIndex) => (
            <AccordionItem
              key={group.name}
              value={group.name.toLowerCase().replace(/\s+/g, "-")}
              className="border-none"
            >
              <Card className="overflow-hidden">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{group.name}</h3>
                        {groupIndex === 0 && (
                          <Badge variant="default" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {groupIndex > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Optional
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-6 pb-6 pt-2">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {group.metrics.map((metric) => (
                        <div key={metric.key} className="space-y-3">
                          <div className="flex items-start gap-2">
                            <label className="text-sm font-semibold leading-none pt-2 flex-1">{metric.label}</label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="mt-1.5">
                                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm" side="top">
                                  <p className="text-sm">{metric.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="space-y-2">
                            <Select
                              value={metrics[metric.key as keyof CVSSv4Metrics] as string}
                              onValueChange={(value) => updateMetric(metric.key as keyof CVSSv4Metrics, value)}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue>
                                  {
                                    metric.options.find(
                                      (opt) => opt.value === metrics[metric.key as keyof CVSSv4Metrics]
                                    )?.label
                                  }
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {metric.options.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="py-3">
                                    <div className="flex flex-col gap-1">
                                      <span className="font-medium">{option.label}</span>
                                      {option.description && (
                                        <span className="text-xs text-muted-foreground leading-tight">
                                          {option.description}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {metrics[metric.key as keyof CVSSv4Metrics] && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {
                                  metric.options.find((opt) => opt.value === metrics[metric.key as keyof CVSSv4Metrics])
                                    ?.description
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
