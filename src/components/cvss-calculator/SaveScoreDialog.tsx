import type { FC } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel
} from "../ui/field";
import { Input } from "../ui/input";
import {
    CVSS_SAVE_DIALOG_TITLE,
    CVSS_SAVE_DIALOG_DESC,
    CVSS_HISTORY_NAME_LABEL,
    CVSS_HISTORY_NAME_PLACEHOLDER,
    CVSS_HISTORY_NAME_HELPER,
    CVSS_CANCEL_BUTTON,
    CVSS_SAVE_BUTTON,
    CVSS_ENTER_KEY
} from "@/lib/constants";

interface SaveScoreDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    historyName: string
    onNameChange: (value: string) => void
    onSave: () => void
}

export const SaveScoreDialog: FC<SaveScoreDialogProps> = ({
    open,
    onOpenChange,
    historyName,
    onNameChange,
    onSave,
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === CVSS_ENTER_KEY) {
            onSave();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {CVSS_SAVE_DIALOG_TITLE}
                    </DialogTitle>
                    <DialogDescription>
                        {CVSS_SAVE_DIALOG_DESC}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Field orientation="horizontal">
                        <FieldContent>
                            <FieldLabel htmlFor="show-contributions">
                                {CVSS_HISTORY_NAME_LABEL}
                            </FieldLabel>
                            <Input
                                id="name"
                                value={historyName}
                                onChange={(e) => onNameChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={CVSS_HISTORY_NAME_PLACEHOLDER}
                            />
                            <FieldDescription>
                                {CVSS_HISTORY_NAME_HELPER}
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {CVSS_CANCEL_BUTTON}
                    </Button>
                    <Button
                        id="save-to-history"
                        onClick={onSave}
                    >
                        {CVSS_SAVE_BUTTON}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SaveScoreDialog;
