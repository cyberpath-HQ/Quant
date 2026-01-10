import React, {
    useState,
    useEffect
} from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

const SCROLL_THRESHOLD = 200;

const BackToTopButton: React.FC = () => {
    const [
        is_visible,
        setIsVisible,
    ] = useState(false);

    useEffect(() => {
        const toggleVisibility = (): void => {
            if (window.pageYOffset > SCROLL_THRESHOLD) {
                setIsVisible(true);
            }
            else {
                setIsVisible(false);
            }
        };

        window.addEventListener(`scroll`, toggleVisibility);

        return (): void => window.removeEventListener(`scroll`, toggleVisibility);
    }, []);

    const scrollToTop = (): void => {
        window.scrollTo({
            top: 0,
            behavior: `smooth`,
        });
    };

    if (!is_visible) {
        return null;
    }

    return (
        <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl
                transition-all duration-300 bg-primary hover:bg-primary/90"
            aria-label="Back to top"
        >
            <ChevronUp className="h-4 w-4" />
        </Button>
    );
};

export default BackToTopButton;

