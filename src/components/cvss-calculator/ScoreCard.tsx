import {
    type FC,
    useMemo
} from "react";
import {
    Card,
    CardContent
} from "../ui/card";
import { Badge } from "../ui/badge";
import logoWhite from "@/assets/logo-white.svg";
import logoBlack from "@/assets/logo.svg";
import {
    CVSS_IMAGE_LOADING,
    CVSS_LOGO_ALT,
    DEFAULT_FRACTION_DIGITS
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SeverityInfo {
    label:   string
    color:   string
    bgColor: string
}

interface ScoreCardProps {
    version:      string
    score:        number
    vectorString: string
    severity:     SeverityInfo
    exportMenu:   React.ReactNode
}

export const ScoreCard: FC<ScoreCardProps> = ({
    version,
    score,
    vectorString,
    severity,
    exportMenu,
}) => {
    const scoreDisplay = useMemo(() => score.toFixed(DEFAULT_FRACTION_DIGITS), [ score ]);

    return (
        <Card className="border-2 border-sky-500/30 shadow-lg">
            <CardContent className="px-6 space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            CVSS v{version}
                        </p>
                        {exportMenu}
                    </div>
                    <div className="flex items-end gap-3">
                        <div className={cn(`text-6xl font-bold tabular-nums`, severity.color)}>
                            {scoreDisplay}
                        </div>
                        <Badge className={cn(`text-sm px-3 font-semibold rounded`, severity.color, severity.bgColor)}>
                            {severity.label}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Vector
                    </p>
                    <div className={`rounded-lg bg-white dark:bg-slate-900 p-3 font-mono text-[10px]
    leading-relaxed break-all border border-sky-200 dark:border-sky-800
    text-foreground`}>
                        {vectorString}
                    </div>
                </div>

                <div className={`mt-8 px-12`}>
                    {/* Light theme image */}
                    <picture className="block dark:hidden" data-light-theme>
                        <img
                            src={logoBlack.src}
                            loading={CVSS_IMAGE_LOADING}
                            alt={CVSS_LOGO_ALT}
                            className="w-full h-auto"
                        />
                    </picture>

                    {/* Dark theme image */}
                    <picture className="hidden dark:block" data-dark-theme>
                        <img
                            src={logoWhite.src}
                            loading={CVSS_IMAGE_LOADING}
                            alt={CVSS_LOGO_ALT}
                            className="w-full h-auto"
                        />
                    </picture>
                </div>
            </CardContent>
        </Card>
    );
};

export default ScoreCard;
