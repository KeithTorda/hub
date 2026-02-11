"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X, ExternalLink } from "lucide-react"

interface FilePreviewModalProps {
    isOpen: boolean
    onClose: () => void
    url: string | null
    title: string
    format?: string
}

export function FilePreviewModal({ isOpen, onClose, url, title, format }: FilePreviewModalProps) {
    if (!url) return null

    // Determine if file is previewable (PDF or Image)
    const isPdf = format === "pdf" || url.includes(".pdf")
    const isImage = format === "png" || format === "jpg" || format === "jpeg" || format === "gif" || url.match(/\.(jpeg|jpg|gif|png)$/i)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-lg font-bold truncate pr-8">{title}</DialogTitle>
                    {/* Close button is handled by DialogPrimitive but we can add custom actions if needed */}
                </DialogHeader>

                <div className="flex-1 bg-muted/30 overflow-hidden relative flex items-center justify-center p-4">
                    {isPdf ? (
                        <iframe
                            src={`${url}#view=FitH`}
                            className="w-full h-full rounded-lg border border-border bg-white"
                            title={title}
                        />
                    ) : isImage ? (
                        <img
                            src={url}
                            alt={title}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                        />
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Download className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">Preview not available</p>
                                <p className="text-muted-foreground">This file type cannot be previewed directly.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-card flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button asChild>
                        <a href={url} target="_blank" rel="noreferrer" download>
                            <Download className="mr-2 h-4 w-4" /> Download File
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
