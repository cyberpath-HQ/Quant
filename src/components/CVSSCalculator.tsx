/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
/**
 * Main CVSS Calculator Component
 *
 * Tabbed interface for all CVSS version calculators
 */

import {
    useEffect, useState,
    type FC
} from "react";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { CVSSGenericCalculator } from "./CVSSGenericCalculator";
import {
    vectorParser, type CVSSv2Metrics, type CVSSv3Metrics, type CVSSv4Metrics
} from "@/lib/cvss";

export const CVSSCalculator: FC = () => {
    const [
        activeTab,
        setActiveTab,
    ] = useState(`v4.0`);
    const [
        parsedVector,
        setParsedVector,
    ] = useState<ReturnType<typeof vectorParser.getVectorFromURL> | null>(null);
    const [
        restoreVectorString,
        setRestoreVectorString,
    ] = useState<string | null>(null);

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
            setRestoreVectorString(null);

            // Switch to the appropriate tab
            setActiveTab(`v${parsed.version}`);
        }
    }, []);

    // Load activeTab from URL on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const version = urlParams.get(`version`);
        if (version && [
            `v4.0`,
            `v3.1`,
            `v3.0`,
            `v2.0`,
        ].includes(version)) {
            setActiveTab(version);
        }
    }, []);

    // Listen for restore events from CVSSScoreManager component
    useEffect(() => {
        const handleRestore = (event: CustomEvent): void => {
            const {
                vectorString,
            } = event.detail;

            // Parse the vector string to get the correct format
            const parsed = vectorParser.parseVector(vectorString);
            if (parsed) {
                setParsedVector(parsed);
                setRestoreVectorString(vectorString);
                setActiveTab(`v${parsed.version}`);
            }
        };

        window.addEventListener(`cvss-restore-vector`, handleRestore as EventListener);

        return (): void => {
            window.removeEventListener(`cvss-restore-vector`, handleRestore as EventListener);
        };
    }, []);

    // Handle side effects when settings change
    useEffect(() => {
        // Save settings to local storage
        localStorage.setItem(
            `cvss_calculator_settings`,
            JSON.stringify({
                should_use_alternative_description,
                should_show_contributions,
            })
        );
    }, [
        should_use_alternative_description,
        should_show_contributions,
    ]);

    // Update URL when version changes
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set(`version`, activeTab);
        const newSearch = urlParams.toString();
        if (window.location.search !== `?${newSearch}`) {
            window.history.replaceState(null, ``, `?${newSearch}`);
        }
    }, [activeTab]);

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
                <h1 className="text-5xl font-extrabold tracking-tight dark:text-foreground">
                    CVSS Calculator
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl">
                    Calculate vulnerability severity scores using the Common Vulnerability Scoring System.
                    Select a version below to begin your assessment.
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
                    <CVSSGenericCalculator
                        key={restoreVectorString ?? `v4.0`}
                        version="4.0"
                        initialMetrics={
                            parsedVector?.version === `4.0`
                                ? (parsedVector.metrics as Partial<CVSSv4Metrics>)
                                : undefined
                        }
                        shouldUseAlternativeDescription={should_use_alternative_description}
                        setShouldUseAlternativeDescription={setShouldUseAlternativeDescription}
                        shouldShowContributions={should_show_contributions}
                        setShouldShowContributions={setShouldShowContributions}
                    />
                </TabsContent>

                <TabsContent value="v3.1" className="mt-6">
                    <CVSSGenericCalculator
                        key={restoreVectorString ?? `v3.1`}
                        version="3.1"
                        initialMetrics={
                            parsedVector?.version === `3.1`
                                ? (parsedVector.metrics as Partial<CVSSv3Metrics>)
                                : undefined
                        }
                        shouldUseAlternativeDescription={should_use_alternative_description}
                        setShouldUseAlternativeDescription={setShouldUseAlternativeDescription}
                        shouldShowContributions={should_show_contributions}
                        setShouldShowContributions={setShouldShowContributions}
                    />
                </TabsContent>

                <TabsContent value="v3.0" className="mt-6">
                    <CVSSGenericCalculator
                        key={restoreVectorString ?? `v3.0`}
                        version="3.0"
                        initialMetrics={
                            parsedVector?.version === `3.0`
                                ? (parsedVector.metrics as Partial<CVSSv3Metrics>)
                                : undefined
                        }
                        shouldUseAlternativeDescription={should_use_alternative_description}
                        setShouldUseAlternativeDescription={setShouldUseAlternativeDescription}
                        shouldShowContributions={should_show_contributions}
                        setShouldShowContributions={setShouldShowContributions}
                    />
                </TabsContent>

                <TabsContent value="v2.0" className="mt-6">
                    <CVSSGenericCalculator
                        key={restoreVectorString ?? `v2.0`}
                        version="2.0"
                        initialMetrics={
                            parsedVector?.version === `2.0`
                                ? (parsedVector.metrics as Partial<CVSSv2Metrics>)
                                : undefined
                        }
                        shouldUseAlternativeDescription={should_use_alternative_description}
                        setShouldUseAlternativeDescription={setShouldUseAlternativeDescription}
                        shouldShowContributions={should_show_contributions}
                        setShouldShowContributions={setShouldShowContributions}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};
