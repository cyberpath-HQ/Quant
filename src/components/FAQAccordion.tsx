import type { FC } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";

const FAQAccordion: FC = () => (
    <Accordion type="single" collapsible className="w-full">
        <AccordionItem
            value="cvss-version"
            className="border-b hover:bg-accent transition-colors"
        >
            <AccordionTrigger className="px-6 py-4 font-semibold text-lg hover:no-underline">
                Which CVSS version should I use for new vulnerabilities?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground space-y-2">
                <p>
                    Always use <strong>CVSS v4.0</strong> for new vulnerability assessments. It's the latest
                    standard from FIRST.org and provides the most comprehensive evaluation framework.
                </p>
                <p>
                    Use v3.1 only if v4.0 is not yet supported by your organization or systems. Use v3.0 and v2.0
                    only for legacy systems or historical comparisons.
                </p>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem
            value="data-storage"
            className="border-b hover:bg-accent transition-colors"
        >
            <AccordionTrigger className="px-6 py-4 font-semibold text-lg hover:no-underline">
                Is my data stored on a server or sent anywhere?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground space-y-2">
                <p>
                    <strong>No.</strong> All calculations happen completely in your browser. Quant is 100%
                    client-side with zero server communication.
                </p>
                <p>
                    Your vulnerability assessments remain entirely private. Your browser's{` `}
                    <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
                        target="_blank"
                        rel="noopener"
                        className="underline hover:text-primary"
                    >
                        Local Storage
                    </a>
                    {` `}stores
                    scores locally, and nothing is ever sent to external servers.
                </p>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem
            value="accuracy"
            className="border-b hover:bg-accent transition-colors"
        >
            <AccordionTrigger className="px-6 py-4 font-semibold text-lg hover:no-underline">
                How accurate are the calculations compared to official sources?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground space-y-2">
                <p>
                    Quant implements the official CVSS specifications exactly as published by FIRST.org. All
                    scoring algorithms match the official standards.
                </p>
                <p>
                    The implementation has been tested against reference calculators to ensure accuracy. All
                    formulas, lookup tables, and calculations are verified against the official documentation.
                </p>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem
            value="metrics-difference"
            className="border-b hover:bg-accent transition-colors"
        >
            <AccordionTrigger className="px-6 py-4 font-semibold text-lg hover:no-underline">
                What's the difference between Base, Temporal, and Environmental metrics?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground space-y-2">
                <ul className="space-y-2">
                    <li>
                        <strong>Base Metrics (Required):</strong> Intrinsic characteristics that don't change over
                        time. Represents the inherent properties of the vulnerability.
                    </li>
                    <li>
                        <strong>Temporal/Threat Metrics (Optional):</strong> Characteristics that change over time
                        like exploit availability, fix status, or proof-of-concept maturity.
                    </li>
                    <li>
                        <strong>Environmental Metrics (Optional):</strong> Characteristics unique to your
                        environment such as deployed system count, required privileges, and security requirements.
                    </li>
                    <li>
                        <strong>Supplemental Metrics (v4.0 only):</strong> Additional context like Safety impact,
                        Automatable nature, and Recovery potential, doesn't affect the score but provides useful 
                        information.
                    </li>
                </ul>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem
            value="sharing"
            className="border-b hover:bg-accent transition-colors"
        >
            <AccordionTrigger className="px-6 py-4 font-semibold text-lg hover:no-underline">
                How do I share my assessment with others?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground space-y-2">
                <p>Quant provides multiple sharing options:</p>
                <ul className="space-y-2 list-disc list-inside">
                    <li>
                        <strong>Copy Vector:</strong> Click "Copy Vector" to copy the CVSS string for documentation
                        and tracking
                    </li>
                    <li>
                        <strong>Share Link:</strong> Click "Share Link" to generate a URL with your assessment
                        pre-configured
                    </li>
                    <li>
                        <strong>Embeddable Code:</strong> Click "Embed Code" to get HTML snippets for embedding
                        score cards on websites
                    </li>
                    <li>
                        <strong>Save to Manager:</strong> Click "Save to Score Manager" to store assessments for
                        later comparison and analysis
                    </li>
                </ul>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem
            value="score-management"
            className="border-b hover:bg-accent transition-colors"
        >
            <AccordionTrigger className="px-6 py-4 font-semibold text-lg hover:no-underline">
                Can I manage and track my calculated scores?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground space-y-2">
                <p>
                    <strong>Yes!</strong> Quant let you save the calculated score to your browser. The
                    Score Manager lets you:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                    <li>Sort and filter by score or severity</li>
                    <li>Edit names for easy identification</li>
                    <li>Compare multiple scores side-by-side (the scores must be from the same CVSS version)</li>
                    <li>Generate visualizations and charts</li>
                    <li>Delete unwanted entries or restore previous versions</li>
                    <li>Import and export history as JSON</li>
                </ul>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem
            value="offline"
            className="rounded-lg hover:bg-accent transition-colors"
        >
            <AccordionTrigger className="px-6 py-4 font-semibold text-lg hover:no-underline">
                Does Quant work offline?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground space-y-2">
                <p>
                    <strong>Yes!</strong> Quant works completely offline. All calculations happen in your browser
                    with no internet connection required.
                </p>
                <p>
                    Your assessment history is stored locally in your browser, so you can access previous scores
                    anytime without connectivity.
                </p>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
);

export default FAQAccordion;
