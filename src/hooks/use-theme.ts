import { set } from "astro:schema";
import {
    useCallback,
    useEffect, useState
} from "react";

export interface UseThemeResult {
    theme:    `light` | `dark`
    setTheme: (theme: `light` | `dark`) => void
}

export function useTheme(): UseThemeResult {
    const [
        theme,
        setTheme,
    ] = useState<`light` | `dark`>(() => {
        if (typeof window === `undefined`) {
            return `light`;
        }

        const savedTheme = localStorage.getItem(`theme`);
        if (
            savedTheme === `light` ||
            savedTheme === `dark`
        ) {
            return savedTheme;
        }

        return `light`;
    });

    // Listen for system theme changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains(`dark`);
            setTheme(isDark ? `dark` : `light`);
        });
        observer.observe(document.documentElement, {
            attributes:      true,
            attributeFilter: [ `class` ],
        });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (theme: `light` | `dark`) => {
            if (theme === `light`) {
                root.classList.remove(`dark`);
            }
            else if (theme === `dark`) {
                root.classList.add(`dark`);
            }
        };

        applyTheme(theme);
    }, [ theme ]);

    const updateTheme = useCallback((newTheme: `light` | `dark`) => {
        setTheme(newTheme);
        localStorage.setItem(`theme`, newTheme);
    }, []);

    return {
        theme,
        setTheme: updateTheme,
    };
}
