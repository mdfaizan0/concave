"use client"

import React from "react"
import { ChevronRight, Home } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"

export function Breadcrumbs({ path, onNavigate }) {
    if (!path || path.length === 0) return null;

    const MAX_ITEMS = 4;
    const isCollapsed = path.length > MAX_ITEMS;

    const displayItems = isCollapsed
        ? [path[0], ...path.slice(-3)]
        : path;

    return (
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                {displayItems.map((item, index) => {
                    const isLast = index === displayItems.length - 1;
                    const showEllipsis = isCollapsed && index === 1;

                    return (
                        <React.Fragment key={item.id || `breadcrumb-${index}`}>
                            {showEllipsis && (
                                <>
                                    <BreadcrumbItem>
                                        <BreadcrumbEllipsis className="h-4 w-4" />
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                </>
                            )}

                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="font-semibold text-foreground">
                                        {item.name === "My Drive" ? (
                                            <div className="flex items-center gap-2">
                                                <Home className="h-4 w-4" />
                                                <span>{item.name}</span>
                                            </div>
                                        ) : (
                                            item.name
                                        )}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onNavigate(item.id);
                                        }}
                                        className="hover:text-primary transition-colors flex items-center gap-2"
                                    >
                                        {item.name === "My Drive" && <Home className="h-4 w-4" />}
                                        {item.name}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
