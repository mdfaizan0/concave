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
    const containerRef = useRef(null)
    const router = useRouter()

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

        return () => clearTimeout(timer)
    }, [query])

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
            // For files, we might want to just let the user see it in its folder or open a preview
            // But currently our file routing is a bit different. 
            // Phase 8 specs said "Search results view". 
            // For quick access, let's just go to the file location if possible or...
            // Actually, simply navigating to a "search results" page might be cleaner if we want a full view.
            // But the prompt asked for "Global search results view". 
            // If I am making a dropdown, that's "Top bar" style.

            // Let's implement navigation to folder for now for files? 
            // Or better, let's make this a "Quick Search" dropdown.
            // Requirement 1 says: "Global search results view"
            // "Add a search input... Render results using existing FileList / FolderList components"
            // This suggests a PAGE or a big overlay. 
            // Let's try redirecting to `/dashboard/search?q=...` if Enter is pressed?
            // But for now, let's stick to this dropdown for quick access, and maybe a "See all" 
            // wait, strict rule: "Render results using existing FileList / FolderList components"
            // A dropdown might be too small for `FileList`.

            // Re-evaluating: Maybe the Search Input should just redirect to `/dashboard/search` on submit?
            // Or maybe it shows a full-width overlay?
            // "Add a search input (Topbar or dedicated area)... Render results using existing..."
            // I'll stick with a dropdown for *suggestions* but maybe full search on Enter.
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
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (query) setOpen(true) }}
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
                            {results.folders.slice(0, 5).map(folder => (
                                <div
                                    key={folder.id}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
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
                            {results.files.slice(0, 5).map(file => (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                    onClick={() => {
                                        // If file has a folder, go there? Or just preview?
                                        // For now, let's just close. 
                                        // We need a proper plan for file selection. 
                                        // Maybe we should just use the proper Search Page.
                                        router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
                                        setOpen(false)
                                    }}
                                >
                                    <File className="h-4 w-4 text-gray-500" />
                                    <span className="truncate">{file.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div
                        className="border-t pt-1 mt-1 px-2 py-1.5 text-xs text-center text-muted-foreground hover:text-primary cursor-pointer hover:underline"
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
