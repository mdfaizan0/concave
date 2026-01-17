"use client"

import React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Command, CornerDownLeft, Search, ArrowUp, ArrowDown } from "lucide-react"

export function KeyboardShortcutsDialog({ open, onOpenChange }) {
    const shortcuts = [
        {
            category: "General",
            items: [
                { description: "Search", keys: ["Ctrl", "K"] },
                { description: "Help", keys: ["?"] },
            ]
        },
        {
            category: "Navigation",
            items: [
                { description: "Move Focus", keys: ["Tab"] },
                { description: "Select Item", keys: ["Enter"] },
            ]
        }
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>
                        Navigate Concave efficiently with your keyboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {shortcuts.map((section) => (
                        <div key={section.category} className="space-y-3">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {section.category}
                            </h4>
                            <div className="space-y-2">
                                {section.items.map((item) => (
                                    <div key={item.description} className="flex items-center justify-between text-sm">
                                        <span className="text-foreground/80">{item.description}</span>
                                        <div className="flex items-center gap-1">
                                            {item.keys.map((key) => (
                                                <kbd
                                                    key={key}
                                                    className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
                                                >
                                                    {key}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
