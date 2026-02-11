"use client"

import { MustReadWidget } from "./dashboard/must-read-widget"
import { PinnedDocumentsWidget } from "./dashboard/pinned-documents-widget"
import { EventsWidget } from "./dashboard/events-widget"
import { TrainingsWidget } from "./dashboard/trainings-widget"
import { RecentDocumentsWidget } from "./dashboard/recent-documents-widget"

export function GlobalRightSidebar() {
    return (
        <aside className="hidden w-72 shrink-0 flex-col gap-6 overflow-y-auto border-l border-border bg-card p-4 lg:flex">
            {/* Search Bar Placeholder could go here */}

            <div className="space-y-6">
                <MustReadWidget />
                <PinnedDocumentsWidget />
                <EventsWidget />
                <TrainingsWidget />
                <RecentDocumentsWidget />
            </div>
        </aside>
    )
}
