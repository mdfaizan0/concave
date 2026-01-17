"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { searchResources } from "@/api/search.api"
import { FolderList } from "@/components/folders/FolderList"
import { FileList } from "@/components/files/FileList"
import { Loader2, Search } from "lucide-react"

export default function SearchPage() {
    const searchParams = useSearchParams()
    const q = searchParams.get("q")
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [results, setResults] = useState({ files: [], folders: [] })

    useEffect(() => {
        const fetchResults = async () => {
            if (!q) {
                setResults({ files: [], folders: [] })
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const data = await searchResources(q)
                setResults(data)
            } catch (error) {
                console.error("Search failed", error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [q])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const hasResults = results.files.length > 0 || results.folders.length > 0

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Search className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
                    <p className="text-sm text-muted-foreground">
                        {q ? `Results for "${q}"` : "Enter a search term"}
                    </p>
                </div>
            </div>

            {!hasResults && q && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>No results found for "{q}"</p>
                </div>
            )}

            {hasResults && (
                <div className="space-y-8">
                    {results.folders.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold tracking-tight">Folders</h3>
                            <FolderList
                                folders={results.folders}
                                onFolderClick={(folder) => router.push(`/dashboard?folderId=${folder.id}`)}
                                onRefresh={() => { }} // No refresh needed really unless search changes
                            />
                        </div>
                    )}

                    {results.files.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold tracking-tight">Files</h3>
                            <FileList
                                files={results.files}
                                onRefresh={() => { }} // Search results are static snapshots until re-search
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
