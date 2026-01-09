import {
    useCallback,
    type FC
} from "react";
import {
    Copy,
    EllipsisVertical,
    History,
    Share2,
    CodeXml
} from "lucide-react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import {
    CVSS_EXPORT_OPTIONS_LABEL,
    CVSS_COPY_VECTOR_LABEL,
    CVSS_SHARE_LINK_LABEL,
    CVSS_EMBEDDABLE_CODE_LABEL,
    CVSS_PERSISTENCE_LABEL,
    CVSS_SAVE_TO_HISTORY_LABEL
} from "@/lib/constants";

interface ExportMenuProps {
    onCopyVector: () => void
    onShareScore: () => void
    onShareCode: () => void
    onSaveClick: () => void
}

export const ExportMenu: FC<ExportMenuProps> = ({
    onCopyVector,
    onShareScore,
    onShareCode,
    onSaveClick,
}) => {
    const handleSaveClick = useCallback(() => {
        onSaveClick();
    }, [onSaveClick]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={`outline`} size={`sm`}>
                    <EllipsisVertical className="size-3.5" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className="text-xs">
                    {CVSS_EXPORT_OPTIONS_LABEL}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCopyVector}>
                    <Copy className="size-3.5 mr-2" />
                    {CVSS_COPY_VECTOR_LABEL}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShareScore}>
                    <Share2 className="size-3.5 mr-2" />
                    {CVSS_SHARE_LINK_LABEL}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShareCode}>
                    <CodeXml className="size-3.5 mr-2" />
                    {CVSS_EMBEDDABLE_CODE_LABEL}
                </DropdownMenuItem>
                <DropdownMenuLabel className="text-xs">
                    {CVSS_PERSISTENCE_LABEL}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSaveClick}>
                    <History className="size-3.5 mr-2" />
                    {CVSS_SAVE_TO_HISTORY_LABEL}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ExportMenu;
