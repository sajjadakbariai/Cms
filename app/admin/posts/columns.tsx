'use client';

import { ColumnDef } from '@tanstack/react-table';
import { PostForAdminTable } from './page'; // Import type
import Link from 'next/link';
import { Role } from '@prisma/client';
// --- Shadcn Imports ---
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, cn } from '@/lib/utils'; // Assuming formatDate moved to utils

// --- Status Badge Component ---
const StatusBadge = ({ published }: { published: boolean }) => (
    <Badge variant={published ? "default" : "secondary"} className={cn(published ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600", "text-white")}>
        {published ? "منتشر شده" : "پیش‌نویس"}
    </Badge>
);

// --- Actions Cell using DropdownMenu ---
interface PostActionsCellProps {
    row: { original: PostForAdminTable };
    onEdit: (post: PostForAdminTable) => void; // Function to open edit sheet
    onDeleteTrigger: (post: PostForAdminTable) => void; // Function to open delete dialog
    // Pass isDeleting if needed for visual feedback on the trigger button itself
    // isDeleting: boolean;
}

const PostActionsCell = ({ row, onEdit, onDeleteTrigger }: PostActionsCellProps) => {
    const post = row.original;

    return (
        <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">باز کردن منو</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                 <DropdownMenuItem asChild>
                    <Link href={`/blog/${post.slug}`} target="_blank">مشاهده پست</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(post)}>
                    ویرایش
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => onDeleteTrigger(post)}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive" // Destructive styling
                >
                    حذف پست
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


// --- Column Definitions for Posts using Shadcn ---
// Exported function now takes handlers as arguments
export const getPostColumns = (
    onEdit: (post: PostForAdminTable) => void,
    onDeleteTrigger: (post: PostForAdminTable) => void,
    isDeletingId: string | null // Keep this to potentially disable trigger if needed elsewhere
): ColumnDef<PostForAdminTable>[] => [
    // Row Selection Checkbox (Optional)
    {
        id: "select",
        header: ({ table }) => ( <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" /> ),
        cell: ({ row }) => ( <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" onClick={(e) => e.stopPropagation()} /> ), // Prevent row click
        enableSorting: false, enableHiding: false, size: 40, // Fixed small size
    },
    // Title Column
    {
        accessorKey: 'title',
        header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}> عنوان <ArrowUpDown className="ml-2 h-4 w-4" /> </Button> ),
        cell: ({ row }) => <span className="font-medium">{row.getValue('title')}</span>,
        enableSorting: true, enableFiltering: true,
    },
    // Status Column
    {
        accessorKey: 'published',
        header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}> وضعیت <ArrowUpDown className="ml-2 h-4 w-4" /> </Button> ),
        cell: ({ row }) => <StatusBadge published={row.getValue('published')} />,
        enableSorting: true,
        // Add filterFn for status filtering (see previous example) if desired
         filterFn: (row, id, value) => value === 'all' ? true : String(row.getValue(id)) === value,
         enableColumnFilter: true,
    },
    // Author Column
    {
        accessorFn: row => row.author?.name,
        id: 'authorName',
        header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}> نویسنده <ArrowUpDown className="ml-2 h-4 w-4" /> </Button> ),
        cell: ({ row }) => row.original.author?.name || '-',
        enableSorting: true, enableFiltering: true,
    },
    // Category Column
    {
        accessorFn: row => row.category?.name,
        id: 'categoryName',
         header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}> دسته‌بندی <ArrowUpDown className="ml-2 h-4 w-4" /> </Button> ),
        cell: ({ row }) => row.original.category?.name || '-',
        enableSorting: true, enableFiltering: true,
    },
    // PublishedAt Column
    {
        accessorKey: 'publishedAt',
        header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}> تاریخ انتشار <ArrowUpDown className="ml-2 h-4 w-4" /> </Button> ),
        cell: ({ row }) => formatDate(row.getValue('publishedAt')),
        enableSorting: true,
    },
     // UpdatedAt Column
     {
        accessorKey: 'updatedAt',
        header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}> آخرین ویرایش <ArrowUpDown className="ml-2 h-4 w-4" /> </Button> ),
        cell: ({ row }) => formatDate(row.getValue('updatedAt')),
        enableSorting: true,
    },
    // Actions Column
    {
        id: 'actions',
        header: () => <div className="text-left">عملیات</div>, // Keep left aligned
        cell: ({ row }) => <PostActionsCell row={row} onEdit={onEdit} onDeleteTrigger={onDeleteTrigger} isDeleting={isDeletingId === row.original.id} />, // Pass handlers
        enableSorting: false, enableHiding: false,
    },
];

// We also need the StatusHeader filter component if enabling status filtering
export const StatusHeader = ({ column }: { column: Column<PostForAdminTable, unknown> }) => {
    const currentFilter = (column.getFilterValue() ?? 'all') as string;
    return ( /* ... Select filter JSX from previous example ... */ );
};
