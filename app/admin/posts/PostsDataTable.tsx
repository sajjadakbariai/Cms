'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { PostForAdminTable } from './page';
import { Category, Post, SEO } from '@prisma/client'; // Import full types for form
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/DataTable'; // Import the reusable DataTable
import { getPostColumns, StatusHeader } from './columns'; // Import column definitions and StatusHeader
import { toast } from "sonner";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter, SheetClose
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import PostForm from '@/components/admin/PostForm'; // Import the unified form
import { AlertDialog, ... } from "@/components/ui/alert-dialog";
import { Icons } from '@/components/icons';
import { ColumnDef } from '@tanstack/react-table'; // Import ColumnDef type

// Type for full post data for editing
type FullPostData = Post & { seo: SEO | null; author: { id: string, name: string | null } | null; category: { id: string, name: string } | null };

interface PostsDataTableProps {
    initialPosts: PostForAdminTable[];
    categories: Pick<Category, 'id' | 'name'>[];
}

export default function PostsDataTable({ initialPosts, categories }: PostsDataTableProps) {
    const [posts, setPosts] = useState(initialPosts);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPostData, setEditingPostData] = useState<FullPostData | null>(null); // Use full type
    const [isFetchingEditData, setIsFetchingEditData] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [postToDelete, setPostToDelete] = useState<PostForAdminTable | null>(null);
    const router = useRouter();

    // --- Fetch Full Post Data for Editing ---
    const fetchPostForEdit = useCallback(async (postId: string) => {
        setIsFetchingEditData(true);
        const toastId = toast.loading("در حال بارگذاری اطلاعات پست...");
        try {
             // Fetch full post data including content and full SEO object
            const response = await fetch(`/api/posts/${postId}`); // Assuming GET /api/posts/[id] returns full data for authorized users
             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to fetch post data.');
             }
             const data: FullPostData = await response.json();
             setEditingPostData(data);
             setIsSheetOpen(true);
             toast.dismiss(toastId);
        } catch (error: any) {
             logger.error(`Error fetching post ${postId} for edit:`, error);
             toast.error(`خطا در بارگذاری اطلاعات: ${error.message}`, { id: toastId });
             setEditingPostData(null);
             setIsSheetOpen(false);
        } finally {
            setIsFetchingEditData(false);
        }
    }, []); // No external dependencies needed here

    // --- Handlers to Open Sheet/Dialog ---
    const handleAddNew = () => { setEditingPostData(null); setIsSheetOpen(true); };
    const handleEdit = useCallback((post: PostForAdminTable) => { fetchPostForEdit(post.id); }, [fetchPostForEdit]);
    const handleDeleteTrigger = useCallback((post: PostForAdminTable) => { setPostToDelete(post); setShowDeleteDialog(true); }, []);

    // --- Delete Logic ---
    const confirmDelete = useCallback(async () => { /* ... (Keep existing confirmDelete logic using toast) ... */ }, [postToDelete, router]);

    // --- Form Success/Cancel Handlers ---
    const handleFormSuccess = useCallback(() => { setIsSheetOpen(false); setEditingPostData(null); router.refresh(); /* Toast is shown in form/delete handler */ }, [router]);
    const handleFormCancel = useCallback(() => { setIsSheetOpen(false); setEditingPostData(null); }, []);

    // --- Define Columns ---
    const columns = useMemo<ColumnDef<PostForAdminTable>[]>(() => [ // Explicit type for columns
        // Define columns directly here or adapt getPostColumns
        // Example using getPostColumns structure:
         { id: "select", header: ({ table }) => <Checkbox ... />, cell: ({ row }) => <Checkbox ... />, enableSorting: false, enableHiding: false, size: 40 },
         { accessorKey: 'title', header: ({ column }) => <Button ...>عنوان</Button>, cell: ({ row }) => <span className="font-medium">{row.original.title}</span>, enableSorting: true, enableFiltering: true },
         {
             accessorKey: 'published',
             header: StatusHeader, // Use the specific header component for filtering
             cell: ({ row }) => <StatusBadge published={row.original.published} />,
             enableSorting: true,
             filterFn: 'equalsString', // Use the built-in function after casting to string or use custom statusFilterFn
             enableColumnFilter: true,
         },
         { accessorFn: row => row.author?.name, id: 'authorName', header: ({ column }) => <Button ...>نویسنده</Button>, cell: ({ row }) => row.original.author?.name || '-', enableSorting: true, enableFiltering: true },
         { accessorFn: row => row.category?.name, id: 'categoryName', header: ({ column }) => <Button ...>دسته‌بندی</Button>, cell: ({ row }) => row.original.category?.name || '-', enableSorting: true, enableFiltering: true },
         { accessorKey: 'publishedAt', header: ({ column }) => <Button ...>تاریخ انتشار</Button>, cell: ({ row }) => formatDate(row.original.publishedAt), enableSorting: true },
         { accessorKey: 'updatedAt', header: ({ column }) => <Button ...>آخرین ویرایش</Button>, cell: ({ row }) => formatDate(row.original.updatedAt), enableSorting: true },
         { id: 'actions', cell: ({ row }) => <PostActionsCell row={row} onEdit={handleEdit} onDeleteTrigger={handleDeleteTrigger} isDeleting={isDeletingId === row.original.id} /> },

     ], [handleEdit, handleDeleteTrigger, isDeletingId]); // Dependencies


    return (
        <>
            {/* Add New Button */}
            <div className="flex justify-end mb-4"> {/* Moved button to top right */}
                <Button onClick={handleAddNew} disabled={isFetchingEditData}>
                    <Icons.plus className="ml-2 h-4 w-4" /> افزودن پست جدید
                    {isFetchingEditData && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={posts}
                showPagination={true}
                showGlobalFilter={true} // Enable global filter
                showColumnVisibility={true} // Enable column visibility toggle
            />

            {/* Sheet for Add/Edit Form */}
            <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) handleFormCancel(); setIsSheetOpen(open); }}>
                <SheetContent className="sm:max-w-4xl w-full overflow-y-auto p-0"> {/* Wider sheet, no padding */}
                     {/* Header inside ScrollArea maybe */}
                     <SheetHeader className="p-6 border-b">
                         <SheetTitle>{editingPostData ? 'ویرایش پست' : 'افزودن پست جدید'}</SheetTitle>
                         <SheetDescription>{/* ... */}</SheetDescription>
                     </SheetHeader>
                      {/* Form needs padding */}
                     <div className="p-6">
                          {isSheetOpen && !isFetchingEditData && (
                              <PostForm
                                  // Pass full initial data for editing
                                  initialData={editingPostData}
                                  categories={categories} // Pass categories from server component
                                  onSuccess={handleFormSuccess}
                                  onCancel={handleFormCancel} // Pass cancel handler
                              />
                          )}
                           {isFetchingEditData && <div className="flex justify-center items-center p-8"><Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground"/></div>}
                     </div>
                     {/* Footer is now part of PostForm */}
                 </SheetContent>
            </Sheet>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                 {/* ... AlertDialog structure remains the same ... */}
             </AlertDialog>
        </>
    );
}
