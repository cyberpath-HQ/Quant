import {
    useCallback,
    type FC
} from "react";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel
} from "../ui/field";
import { Switch } from "../ui/switch";
import {
    CVSS_ALTERNATIVE_DESCRIPTIONS_ID,
    CVSS_SHOW_CONTRIBUTIONS_ID
} from "@/lib/constants";

interface SettingsMenuProps {
    shouldUseAlternativeDescription: boolean
    setShouldUseAlternativeDescription: (value: boolean) => void
    shouldShowContributions: boolean
    setShouldShowContributions: (value: boolean) => void
}

export const SettingsMenu: FC<SettingsMenuProps> = ({
    shouldUseAlternativeDescription,
    setShouldUseAlternativeDescription,
    shouldShowContributions,
    setShouldShowContributions,
}) => {
    const handleAlternativeDescriptionsClick = useCallback(() => {
        const element = document.getElementById(CVSS_ALTERNATIVE_DESCRIPTIONS_ID);
        element?.click();
    }, []);

    const handleShowContributionsClick = useCallback(() => {
        const element = document.getElementById(CVSS_SHOW_CONTRIBUTIONS_ID);
        element?.click();
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={`outline`} size={`sm`}>
                    <Settings className="size-3.5" />
                    Settings
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-w-[90vw] lg:max-w-96" align="start" side="bottom">
                <DropdownMenuItem
                    className="cursor-pointer p-3"
                    onClick={() => setShouldUseAlternativeDescription(!shouldUseAlternativeDescription)}
                >
                    <Field orientation="horizontal" className="cursor-pointer">
                        <Switch
                            onCheckedChange={setShouldUseAlternativeDescription}
                            checked={shouldUseAlternativeDescription}
                            className="cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <FieldContent>
                            <FieldLabel
                                className="flex items-center gap-2 cursor-pointer">
                                Use Alternative Descriptions
                            </FieldLabel>
                            <FieldDescription>
                                Toggle to switch between official not-so-clear and alternative, more explanatory metric descriptions.
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer p-3"
                    onClick={() => setShouldShowContributions(!shouldShowContributions)}
                >
                    <Field orientation="horizontal">
                        <Switch
                            onCheckedChange={setShouldShowContributions}
                            checked={shouldShowContributions}
                            className="cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <FieldContent>
                            <FieldLabel
                                className="flex items-center gap-2 cursor-pointer">
                                Show Score Contributions
                            </FieldLabel>
                            <FieldDescription>
                                Display how much each metric option contributes to the overall vulnerability score.
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default SettingsMenu;
