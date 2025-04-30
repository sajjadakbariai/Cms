'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CategoryForAdminTable } from './page';
import Link from 'next/link';
// --- Shadcn Imports ---
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { DropdownMenu, ... } from "@/components/ui/dropdown-menu";
import { formatDate } from '@/lib/utils';

// --- Actions Cell using DropdownMenu ---
interface CategoryActionsCellProps {
    row: { original: CategoryForAdminTable };
    onEdit: (category: CategoryForAdminTable) => void;
    onDeleteTrigger: (category: CategoryForAdminTable) => void;
    isDeletingId: string | null; // Keep track if *any* delete is happening
}

const CategoryActionsCell = ({ row, onEdit, onDeleteTrigger, isDeletingId }: CategoryActionsCellProps) => {
    const category = row.original;
    const isCurrentDeleting = isDeletingId === category.id; // Is *this* row being deleted?

    return (
        <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="h-8 w-8 p-0" disabled={isCurrentDeleting}>
                    <span className="sr-only">باز کردن منو</span>
                     {isCurrentDeleting ? <Icons.spinner className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                 <DropdownMenuItem asChild><Link href={`/category/${category.slug}`} target="_blank">مشاهده</Link></DropdownMenuItem>
                 <DropdownMenuItem onClick={() => onEdit(category)}>ویرایش</DropdownMenuItem>
                 <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDeleteTrigger(category)} className="text-destructive focus:text-destructive">
                    حذف
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


// --- Column Definitions for Categories ---
export const getCategoryColumns = (
    onEdit: (category: CategoryForAdminTable) => void,
    onDeleteTrigger: (category: CategoryForAdminTable) => void,
    deletingId: string | null
): ColumnDef<CategoryForAdminTable>[] => [
    // Name Column
    { accessorKey: 'name', header: ({ column }) => <Button ...>نام</Button>, cell: ({ row }) => <span className="font-medium">{row.original.name}</span>, enableSorting: true, enableFiltering: true },
    // Slug Column
    { accessorKey: 'slug', header: ({ column }) => <Button ...>اسلاگ</Button>, cell: ({ row }) => <span className="font-mono text-xs">{row.original.slug}</span>, enableSorting: true, enableFiltering: true },
    // Post Count Column
    { accessorFn: row => row._count.posts, id: 'postCount', header: ({ column }) => <Button ...>پست‌ها</Button>, cell: ({ row }) => row.original._count.posts, enableSorting: true },
    // Created At Column
    { accessorKey: 'createdAt', header: ({ column }) => <Button ...>تاریخ ایجاد</Button>, cell: ({ row }) => formatDate(row.original.createdAt), enableSorting: true },
    // Actions Column
    { id: 'actions', header: () => <div className="text-left">عملیات</div>, cell: ({ row }) => <CategoryActionsCell row={row} onEdit={onEdit} onDeleteTrigger={onDeleteTrigger} isDeletingId={deletingId} /> },
];
