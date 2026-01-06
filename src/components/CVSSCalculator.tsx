/**
 * Main CVSS Calculator Component
 *
 * Tabbed interface for all CVSS version calculators
 */

import {
    use,
    useEffect, useState
} from "react";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { CVSS40Calculator } from "./CVSS40Calculator";
import { CVSS3Calculator } from "./CVSS3Calculator";
import { CVSS2Calculator } from "./CVSS2Calculator";
import { vectorParser } from "@/lib/cvss";

export function CVSSCalculator() {
    const [
        activeTab,
        setActiveTab,
    ] = useState(`v4.0`);
    const [
        parsedVector,
        setParsedVector,
    ] = useState<ReturnType<typeof vectorParser.getVectorFromURL> | null>(null);

    const [
        should_use_alternative_description,
        setShouldUseAlternativeDescription,
    ] = useState(() => {
        if (typeof window === `undefined`) {
            return false;
        }

        // Load from local storage
        const savedSettings = localStorage.getItem(`cvss_calculator_settings`);
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            return settings.should_use_alternative_description ?? false;
        }
        return false;
    });

    const [
        should_show_contributions,
        setShouldShowContributions,
    ] = useState(() => {
        if (typeof window === `undefined`) {
            return false;
        }

        // Load from local storage
        const savedSettings = localStorage.getItem(`cvss_calculator_settings`);
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            return settings.should_show_contributions ?? false;
        }
        return false;
    });

    // Check for vector in URL on mount
    useEffect(() => {
        const parsed = vectorParser.getVectorFromURL();
        if (parsed) {
            setParsedVector(parsed);

            // Switch to the appropriate tab
            setActiveTab(`v${ parsed.version }`);
        }
    }, []);

    // Handle side effects when settings change
    useEffect(() => {
        // Save settings to local storage
        localStorage.setItem(`cvss_calculator_settings`, JSON.stringify({
            should_use_alternative_description,
            should_show_contributions,
        }));
    }, [
        should_use_alternative_description,
        should_show_contributions,
    ]);

    // Load settings from local storage on mount
    useEffect(() => {
        // Load settings from local storage
        const savedSettings = localStorage.getItem(`cvss_calculator_settings`);
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setShouldUseAlternativeDescription(settings.should_use_alternative_description);
            setShouldShowContributions(settings.should_show_contributions);
        }
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="mb-10 space-y-3">
                <h1 className="text-5xl font-extrabold tracking-tight">CVSS Calculator</h1>
                <p className="text-lg text-muted-foreground max-w-3xl">
                    Calculate vulnerability severity scores using the Common Vulnerability Scoring System. Select a version below
                    to begin your assessment.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-lg grid-cols-4 h-12">
                    <TabsTrigger value="v4.0" className="text-base font-semibold">
                        v4.0
                    </TabsTrigger>
                    <TabsTrigger value="v3.1" className="text-base font-semibold">
                        v3.1
                    </TabsTrigger>
                    <TabsTrigger value="v3.0" className="text-base font-semibold">
                        v3.0
                    </TabsTrigger>
                    <TabsTrigger value="v2.0" className="text-base font-semibold">
                        v2.0
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="v4.0" className="mt-8">
                    <CVSS40Calculator
                        initialMetrics={parsedVector?.version === `4.0` ? parsedVector.metrics : undefined}
                        shouldUseAlternativeDescription={should_use_alternative_description}
                        setShouldUseAlternativeDescription={setShouldUseAlternativeDescription}
                        shouldShowContributions={should_show_contributions}
                        setShouldShowContributions={setShouldShowContributions}
                    />
                </TabsContent>

                <TabsContent value="v3.1" className="mt-6">
                    <CVSS3Calculator
                        version="3.1"
                        initialMetrics={parsedVector?.version === `3.1` ? parsedVector.metrics : undefined}
                        shouldUseAlternativeDescription={should_use_alternative_description}
                        setShouldUseAlternativeDescription={setShouldUseAlternativeDescription}
                    />
                </TabsContent>

                <TabsContent value="v3.0" className="mt-6">
                    <CVSS3Calculator
                        version="3.0"
                        initialMetrics={parsedVector?.version === `3.0` ? parsedVector.metrics : undefined}
                        shouldUseAlternativeDescription={should_use_alternative_description}
                        setShouldUseAlternativeDescription={setShouldUseAlternativeDescription}
                    />
                </TabsContent>

                <TabsContent value="v2.0" className="mt-6">
                    <CVSS2Calculator
                        initialMetrics={parsedVector?.version === `2.0` ? parsedVector.metrics : undefined}
                        shouldUseAlternativeDescription={should_use_alternative_description}
                        setShouldUseAlternativeDescription={setShouldUseAlternativeDescription}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
