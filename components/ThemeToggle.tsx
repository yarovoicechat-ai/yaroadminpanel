"use client"

import * as React from "react"
import { Palette } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/Button"

const THEMES = [
    { id: "midnight", label: "Midnight", mode: "dark" },
    { id: "aurora", label: "Aurora", mode: "dark" },
    { id: "sunset", label: "Sunset", mode: "dark" },
    { id: "light", label: "Light", mode: "light" },
] as const

export function ThemeToggle() {
    const { setTheme } = useTheme()
    const [palette, setPalette] = React.useState("midnight")

    React.useEffect(() => {
        const saved = localStorage.getItem("admin_palette") || "midnight"
        const selected = THEMES.find((item) => item.id === saved) || THEMES[0]
        setPalette(selected.id)
        setTheme(selected.mode)
        document.documentElement.dataset.palette = selected.id
    }, [setTheme])

    const cycleTheme = () => {
        const currentIndex = THEMES.findIndex((item) => item.id === palette)
        const selected = THEMES[(currentIndex + 1) % THEMES.length]
        setPalette(selected.id)
        setTheme(selected.mode)
        document.documentElement.dataset.palette = selected.id
        localStorage.setItem("admin_palette", selected.id)
    }

    const current = THEMES.find((item) => item.id === palette) || THEMES[0]

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={cycleTheme}
            title={`Theme: ${current.label}. Click to change.`}
            className="h-9 gap-2 border-primary/25 bg-primary/5 px-3 text-primary hover:bg-primary/15"
        >
            <Palette className="h-4 w-4" />
            <span className="hidden xl:inline">{current.label}</span>
            <span className="sr-only">Change admin theme</span>
        </Button>
    )
}
