"use client"

import { FeaturedCarousel } from "@/components/featured-carousel"
import { DocumentTabs } from "@/components/document-tabs"
import { LatestDocumentsGrid } from "@/components/dashboard/latest-documents-grid"
import { LatestDocumentsList } from "@/components/dashboard/latest-documents-list"

export default function HomePage() {
    return (
        <div className="space-y-8">
            <FeaturedCarousel />

            <LatestDocumentsGrid />

            <LatestDocumentsList />

            <div className="mt-8">
                <DocumentTabs
                    title="DOH Issuances"
                    filter={(c) => c.name.startsWith("DOH") || c.code.startsWith("doh")}
                />
            </div>

            <div className="mt-8">
                <DocumentTabs
                    title="Hospital Issuances"
                    filter={(c) => c.name.startsWith("Hospital") || c.name.startsWith("HFO")}
                />
            </div>
        </div>
    )
}
