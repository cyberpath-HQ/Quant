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

interface ExportMenuProps {
    onCopyVector: () => void
    onShareScore: () => void
    onShareCode:  () => void
    onSaveClick:  () => void
}

export const ExportMenu: FC<ExportMenuProps> = ({
    onCopyVector,
    onShareScore,
    onShareCode,
    onSaveClick,
}) => {
    const handleSaveClick = useCallback(() => {
        onSaveClick();
    }, [ onSaveClick ]);

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
                    Export options
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCopyVector}>
                    <Copy className="size-3.5 mr-2" />
                    Copy Vector
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShareScore}>
                    <Share2 className="size-3.5 mr-2" />
                    Share Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShareCode}>
                    <CodeXml className="size-3.5 mr-2" />
                    Embeddable Code
                </DropdownMenuItem>
                <DropdownMenuLabel className="text-xs">
                    Persistence
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSaveClick}>
                    <History className="size-3.5 mr-2" />
                    Save to Score Manager
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ExportMenu;
