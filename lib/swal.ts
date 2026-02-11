import Swal from "sweetalert2"

// Theme-aware SweetAlert defaults matching the KnowledgeHub dark theme
const swalDefaults = {
    background: "hsl(var(--card))",
    color: "hsl(var(--card-foreground))",
    confirmButtonColor: "hsl(var(--primary))",
    cancelButtonColor: "hsl(var(--muted))",
    customClass: {
        popup: "rounded-xl border border-[hsl(var(--border))]",
        confirmButton: "rounded-lg px-6 py-2 text-sm font-semibold",
        cancelButton: "rounded-lg px-6 py-2 text-sm font-semibold",
    },
}

export async function confirmDelete(itemName: string): Promise<boolean> {
    const result = await Swal.fire({
        ...swalDefaults,
        title: "Delete this item?",
        html: `<p style="color: hsl(var(--muted-foreground)); font-size: 14px;">You are about to delete <strong style="color: hsl(var(--card-foreground))">"${itemName}"</strong>. This action cannot be undone.</p>`,
        icon: "warning",
        iconColor: "hsl(var(--destructive))",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        reverseButtons: true,
    })
    return result.isConfirmed
}

export function showSuccess(title: string, text?: string) {
    Swal.fire({
        ...swalDefaults,
        title,
        text,
        icon: "success",
        iconColor: "hsl(var(--primary))",
        timer: 1500,
        showConfirmButton: false,
    })
}

export function showError(title: string, text?: string) {
    Swal.fire({
        ...swalDefaults,
        title,
        text,
        icon: "error",
        iconColor: "hsl(var(--destructive))",
    })
}

export async function confirmAction(title: string, text: string): Promise<boolean> {
    const result = await Swal.fire({
        ...swalDefaults,
        title,
        text,
        icon: "question",
        iconColor: "hsl(var(--primary))",
        showCancelButton: true,
        confirmButtonText: "Yes, proceed",
        cancelButtonText: "Cancel",
        reverseButtons: true,
    })
    return result.isConfirmed
}
