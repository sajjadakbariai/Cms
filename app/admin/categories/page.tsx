import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import CategoriesDataTable from './CategoriesDataTable'; // Client component
import { Category, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Type for data passed to client component
export type CategoryForAdminTable = Pick<Category, 'id' | 'name' | 'slug' | 'createdAt' | 'updatedAt'> & {
    _count: { posts: number };
};

/**
 * Server Component for Admin Categories page.
 */
export default async function AdminCategoriesPage() {
    logger.info("AdminCategoriesPage: Rendering page...");
    // --- Authorization Check ---
    const session = await getServerSession(authOptions);
    if (!session?.user || ![Role.ADMIN, Role.EDITOR].includes(session.user.role)) {
        redirect('/admin/dashboard');
    }
    logger.info(`AdminCategoriesPage: Accessed by ${session.user.role} ${session.user.email}`);
    // --- End Check ---

    let categories: CategoryForAdminTable[] = [];
    try {
        categories = await prisma.category.findMany({ /* ... select, orderBy ... */ });
        logger.info(`AdminCategoriesPage: Fetched ${categories.length} categories.`);
    } catch (error) { /* ... Error handling ... */ }

    return (
        <div className="space-y-6">
            <Card>
                 <CardHeader>
                     <CardTitle>مدیریت دسته‌بندی‌ها</CardTitle>
                     <CardDescription>دسته‌بندی‌های سایت را مدیریت کنید.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <CategoriesDataTable initialCategories={categories} />
                 </CardContent>
            </Card>
        </div>
    );
}
