"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { fetchStarred, starResource, unstarResource } from "@/api/stars.api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

const StarredContext = createContext()

export function StarredProvider({ children }) {
    const { user } = useAuth()
    const [starredSet, setStarredSet] = useState(new Set())
    const [loading, setLoading] = useState(false)

    const refreshStars = useCallback(async () => {
        if (!user) {
            setStarredSet(new Set())
            return
        }
        // Don't set global loading here to avoid flickering on every refresh
        try {
            const items = await fetchStarred()
            // items is Array of { resource_type, resource_id, ... }
            const newSet = new Set(items.map(item => `${item.resource_type}_${item.resource_id}`))
            setStarredSet(newSet)
        } catch (error) {
            console.error("Failed to fetch starred items", error)
        }
    }, [user])

    useEffect(() => {
        refreshStars()
    }, [refreshStars])

    const isStarred = (type, id) => {
        return starredSet.has(`${type}_${id}`)
    }

    const toggleStar = async (type, id) => {
        const key = `${type}_${id}`
        const currentlyStarred = starredSet.has(key)

        // Optimistic update
        const newSet = new Set(starredSet)
        if (currentlyStarred) {
            newSet.delete(key)
        } else {
            newSet.add(key)
        }
        setStarredSet(newSet)

        try {
            if (currentlyStarred) {
                await unstarResource(type, id)
                toast.success("Unstarred")
            } else {
                await starResource(type, id)
                toast.success("Starred")
            }
        } catch (error) {
            // Revert on failure
            refreshStars()
            throw error
        }
    }

    return (
        <StarredContext.Provider value={{ isStarred, toggleStar, refreshStars }}>
            {children}
        </StarredContext.Provider>
    )
}

export function useStarred() {
    return useContext(StarredContext)
}
