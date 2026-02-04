import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportButtonProps<T> {
    data: T[];
    filename: string;
    columns: {
        key: keyof T | ((item: T) => string | number | null | undefined);
        header: string;
    }[];
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    label?: string;
}

function escapeCSVValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function ExportButton<T>({
    data,
    filename,
    columns,
    className,
    variant = 'outline',
    size = 'sm',
    label = 'Export CSV',
}: ExportButtonProps<T>) {
    const handleExport = () => {
        if (data.length === 0) return;

        // Create header row
        const headers = columns.map((col) => col.header);

        // Create data rows
        const rows = data.map((item) =>
            columns.map((col) => {
                const value =
                    typeof col.key === 'function'
                        ? col.key(item)
                        : item[col.key];
                return escapeCSVValue(value as string | number | null | undefined);
            })
        );

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleExport}
            disabled={data.length === 0}
            className={cn('gap-2', className)}
        >
            <Download className="h-4 w-4" />
            {size !== 'icon' && label}
        </Button>
    );
}

// Utility function for programmatic export
export function exportToCSV<T>(
    data: T[],
    filename: string,
    columns: {
        key: keyof T | ((item: T) => string | number | null | undefined);
        header: string;
    }[]
) {
    if (data.length === 0) return;

    const headers = columns.map((col) => col.header);
    const rows = data.map((item) =>
        columns.map((col) => {
            const value =
                typeof col.key === 'function' ? col.key(item) : item[col.key];
            return escapeCSVValue(value as string | number | null | undefined);
        })
    );

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
