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
    CVSS_SETTINGS_BUTTON_LABEL,
    CVSS_ALTERNATIVE_DESCRIPTIONS_LABEL,
    CVSS_ALTERNATIVE_DESCRIPTIONS_DESC,
    CVSS_SHOW_CONTRIBUTIONS_LABEL,
    CVSS_SHOW_CONTRIBUTIONS_DESC
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
        const element = document.getElementById(`alternative-descriptions`);
        element?.click();
    }, []);

    const handleShowContributionsClick = useCallback(() => {
        const element = document.getElementById(`show-contributions`);
        element?.click();
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={`outline`} size={`sm`}>
                    <Settings className="size-3.5" />
                    {CVSS_SETTINGS_BUTTON_LABEL}
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
                            id="alternative-descriptions"
                        />
                        <FieldContent>
                            <FieldLabel htmlFor="alternative-descriptions">
                                {CVSS_ALTERNATIVE_DESCRIPTIONS_LABEL}
                            </FieldLabel>
                            <FieldDescription>
                                {CVSS_ALTERNATIVE_DESCRIPTIONS_DESC}
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
                            id="show-contributions"
                        />
                        <FieldContent>
                            <FieldLabel htmlFor="show-contributions">
                                {CVSS_SHOW_CONTRIBUTIONS_LABEL}
                            </FieldLabel>
                            <FieldDescription>
                                {CVSS_SHOW_CONTRIBUTIONS_DESC}
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default SettingsMenu;
