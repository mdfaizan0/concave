"use client"

import React, { useState, useEffect, useRef } from "react"
import { Search, Loader2, Folder, File } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchResources } from "@/api/search.api"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

export function SearchInput() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState({ files: [], folders: [] })
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const containerRef = useRef(null)
    const inputRef = useRef(null)
    const router = useRouter()

    const flattenedResults = [
        ...results.folders.map(f => ({ ...f, type: "folder" })),
        ...results.files.map(f => ({ ...f, type: "file" })),
        { type: "view_all", id: "view_all" }
    ]

    // Assuming we don't have a useDebounce hook yet, implementing simple effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 0) {
                performSearch(query)
            } else {
                setResults({ files: [], folders: [] })
                setOpen(false)
            }
        }, 300)

        // Reset index on query change
        setSelectedIndex(-1)

        return () => clearTimeout(timer)
    }, [query])

    const handleKeyDown = (e) => {
        if (!open) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex(prev => (prev < flattenedResults.length - 1 ? prev + 1 : prev))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev))
        } else if (e.key === "Enter" && selectedIndex > -1) {
            e.preventDefault()
            const item = flattenedResults[selectedIndex]
            if (item) {
                if (item.type === "view_all") {
                    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
                    setOpen(false)
                } else {
                    handleSelect(item.type, item.id)
                }
            }
        } else if (e.key === "Escape") {
            setOpen(false)
            inputRef.current?.blur()
        }
    }

    const performSearch = async (searchTerm) => {
        setLoading(true)
        setOpen(true)
        try {
            const data = await searchResources(searchTerm)
            setResults(data)
        } catch (error) {
            console.error("Search failed", error)
        } finally {
            setLoading(false)
        }
    }

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (type, id) => {
        setOpen(false)
        setQuery("")
        if (type === "folder") {
            router.push(`/dashboard?folderId=${id}`)
        } else {
            // Navigate to folder containing the file?
            // For now, let's keep the current behavior of using the dropdown or View All.
            router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
            setOpen(false)
        }
    }

    return (
        <div className="relative w-full max-w-md" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search files and folders..."
                    className="w-full bg-background pl-9 md:w-[300px] lg:w-[400px]"
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (query) setOpen(true) }}
                    onKeyDown={handleKeyDown}
                />
                {loading && (
                    <div className="absolute right-2.5 top-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {open && (results.files.length > 0 || results.folders.length > 0) && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-popover p-2 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 z-50">
                    {results.folders.length > 0 && (
                        <div className="mb-2">
                            <h4 className="mb-1 px-2 text-xs font-semibold text-muted-foreground">Folders</h4>
                            {results.folders.slice(0, 5).map((folder, idx) => (
                                <div
                                    key={folder.id}
                                    className={cn(
                                        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                        selectedIndex === idx && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={() => handleSelect("folder", folder.id)}
                                >
                                    <Folder className="h-4 w-4 text-blue-500" />
                                    <span className="truncate">{folder.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {results.files.length > 0 && (
                        <div className="mb-2">
                            <h4 className="mb-1 px-2 text-xs font-semibold text-muted-foreground">Files</h4>
                            {results.files.slice(0, 5).map((file, idx) => {
                                const globalIndex = results.folders.length + idx
                                return (
                                    <div
                                        key={file.id}
                                        className={cn(
                                            "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                            selectedIndex === globalIndex && "bg-accent text-accent-foreground"
                                        )}
                                        onClick={() => {
                                            router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
                                            setOpen(false)
                                        }}
                                    >
                                        <File className="h-4 w-4 text-gray-500" />
                                        <span className="truncate">{file.name}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <div
                        className={cn(
                            "border-t pt-1 mt-1 px-2 py-1.5 text-xs text-center text-muted-foreground hover:text-primary cursor-pointer hover:underline",
                            selectedIndex === flattenedResults.length - 1 && "text-primary underline"
                        )}
                        onClick={() => {
                            router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
                            setOpen(false)
                        }}
                    >
                        View all results
                    </div>
                </div>
            )}
        </div>
    )
}
