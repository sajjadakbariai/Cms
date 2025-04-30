'use client';

import React, { useState, useMemo, useCallback } from 'react';
// --- Type Imports ---
import { CategoryForAdminTable } from './page';
import { Category, SEO } from '@prisma/client'; // For full data type
// --- Util Imports ---
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
// --- Shadcn UI Imports ---
import { DataTable } from '@/components/ui/DataTable';
import { getCategoryColumns } from './columns';
import { Button } from '@/components/ui/button';
import { AlertDialog, ... } from "@/components/ui/alert-dialog";
import { Sheet, ... } from "@/components/ui/sheet";
import { Icons } from '@/components/icons';
import CategoryForm from '@/components/admin/CategoryForm'; // Use the CategoryForm

// Type for full category data needed for edit form
type FullCategoryData = Category & { seo: SEO | null };

interface CategoriesDataTableProps {
    initialCategories: CategoryForAdminTable[];
}


export default function CategoriesDataTable({ initialCategories }: CategoriesDataTableProps) {
    const [categories, setCategories] = useState(initialCategories);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingCategoryData, setEditingCategoryData] = useState<FullCategoryData | null>(null);
    const [isFetchingEditData, setIsFetchingEditData] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryForAdminTable | null>(null);
    const router = useRouter();

    // --- Fetch Full Category Data for Editing ---
    const fetchCategoryForEdit = useCallback(async (categoryId: string) => {
        setIsFetchingEditData(true);
        const toastId = toast.loading("در حال بارگذاری اطلاعات...");
        try {
            const response = await fetch(`/api/categories/${categoryId}`); // Use category API
            if (!response.ok) throw new Error('Failed to fetch category data.');
            const data: FullCategoryData = await response.json();
            setEditingCategoryData(data);
            setIsSheetOpen(true);
            toast.dismiss(toastId);
        } catch (error: any) {
             toast.error(`خطا: ${error.message}`, { id: toastId });
             // ... error handling ...
        } finally { setIsFetchingEditData(false); }
    }, []); // No dependency needed


    // --- Handlers to Open Sheet/Dialog ---
     const handleAddNew = () => { setEditingCategoryData(null); setIsSheetOpen(true); };
     const handleEdit = useCallback((cat: CategoryForAdminTable) => { fetchCategoryForEdit(cat.id); }, [fetchCategoryForEdit]);
     const handleDeleteTrigger = useCallback((cat: CategoryForAdminTable) => { setCategoryToDelete(cat); setShowDeleteDialog(true); }, []);

    // --- Delete Logic ---
    const confirmDelete = useCallback(async () => { /* ... (Keep existing confirmDelete logic using toast) ... */ }, [categoryToDelete, router]);

    // --- Form Success/Cancel ---
    const handleFormSuccess = useCallback(() => { setIsSheetOpen(false); setEditingCategoryData(null); router.refresh(); /* Toast handled in form/delete */ }, [router]);
    const handleFormCancel = useCallback(() => { setIsSheetOpen(false); setEditingCategoryData(null); }, []);

    // --- Columns ---
    const columns = useMemo(() => getCategoryColumns(handleEdit, handleDeleteTrigger, isDeletingId), [handleEdit, handleDeleteTrigger, isDeletingId]);


    return (
        <>
            {/* Add New Button */}
            <div className="flex justify-end mb-4">
                <Button onClick={handleAddNew} disabled={isFetchingEditData}>
                    <Icons.plus className="ml-2 h-4 w-4" /> افزودن دسته‌بندی
                    {isFetchingEditData && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                </Button>
            </div>

            <DataTable columns={columns} data={categories} showPagination={true} showColumnFilters={true} showGlobalFilter={true} />

             {/* Sheet for Add/Edit Form */}
             <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) handleFormCancel(); setIsSheetOpen(open); }}>
                 <SheetContent className="sm:max-w-lg w-full overflow-y-auto p-0">
                     <SheetHeader className="p-6 pb-4 border-b">
                         <SheetTitle>{editingCategoryData ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی'}</SheetTitle>
                     </SheetHeader>
                     <div className="p-6">
                          {isSheetOpen && !isFetchingEditData && (
                              <CategoryForm
                                  initialData={editingCategoryData}
                                  onSuccess={handleFormSuccess}
                                  onCancel={handleFormCancel} // Pass cancel handler
                              />
                          )}
                           {isFetchingEditData && <div className="..."><Icons.spinner ... /></div>}
                     </div>
                     {/* Footer is part of CategoryForm */}
                 </SheetContent>
             </Sheet>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                 <AlertDialogContent>
                     <AlertDialogHeader>
                         <AlertDialogTitle>تأیید حذف</AlertDialogTitle>
                          <AlertDialogDescription>
                              آیا از حذف دسته‌بندی "{categoryToDelete?.name}" مطمئن هستید؟
                          </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                         <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>انصراف</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmDelete} disabled={isDeletingId === categoryToDelete?.id} className="...">
                             {isDeletingId === categoryToDelete?.id && <Icons.spinner ... />} حذف
                         </AlertDialogAction>
                     </AlertDialogFooter>
                 </AlertDialogContent>
             </AlertDialog>
        </>
    );
}
