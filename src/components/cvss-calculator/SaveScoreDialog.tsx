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
    CVSS_HISTORY_NAME_PLACEHOLDER,
    CVSS_ENTER_KEY
} from "@/lib/constants";

interface SaveScoreDialogProps {
    open:         boolean
    onOpenChange: (open: boolean) => void
    historyName:  string
    onNameChange: (value: string) => void
    onSave:       () => void
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
                    <DialogTitle className="text-balance text-left">
                        Save Score to Score Manager
                    </DialogTitle>
                    <DialogDescription className="text-balance text-left">
                        Enter a name for this CVSS score to save it in your Score Manager.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Field orientation="horizontal">
                        <FieldContent>
                            <FieldLabel htmlFor="show-contributions">
                                Score Name
                            </FieldLabel>
                            <Input
                                id="name"
                                value={historyName}
                                onChange={(e) => onNameChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={CVSS_HISTORY_NAME_PLACEHOLDER}
                            />
                            <FieldDescription>
                                A descriptive name to help you identify this score in your Score Manager.
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        id="save-to-history"
                        onClick={onSave}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SaveScoreDialog;
