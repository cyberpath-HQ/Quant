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
    shouldUseAlternativeDescription:    boolean
    setShouldUseAlternativeDescription: (value: boolean) => void
    shouldShowContributions:            boolean
    setShouldShowContributions:         (value: boolean) => void
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
            <DropdownMenuContent className="max-w-96">
                <DropdownMenuItem
                    className="cursor-pointer p-3"
                    onClick={handleAlternativeDescriptionsClick}
                >
                    <Field orientation="horizontal">
                        <Switch
                            onCheckedChange={setShouldUseAlternativeDescription}
                            checked={shouldUseAlternativeDescription}
                            id={CVSS_ALTERNATIVE_DESCRIPTIONS_ID}
                        />
                        <FieldContent>
                            <FieldLabel htmlFor={CVSS_ALTERNATIVE_DESCRIPTIONS_ID}>
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
                    onClick={handleShowContributionsClick}
                >
                    <Field orientation="horizontal">
                        <Switch
                            onCheckedChange={setShouldShowContributions}
                            checked={shouldShowContributions}
                            id={CVSS_SHOW_CONTRIBUTIONS_ID}
                        />
                        <FieldContent>
                            <FieldLabel htmlFor={CVSS_SHOW_CONTRIBUTIONS_ID}>
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
