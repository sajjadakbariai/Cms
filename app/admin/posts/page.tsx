import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import PostsDataTable from './PostsDataTable'; // Client component for the table
import { Post, User, Category, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Needed for Add button if placed here
import { Icons } from '@/components/icons'; // If using icons on this page

// Define type for data passed to client component (includes relations)
export type PostForAdminTable = Pick<Post, 'id' | 'title' | 'slug' | 'published' | 'createdAt' | 'updatedAt' | 'publishedAt'> & {
    author: Pick<User, 'id' | 'name'> | null;
    category: Pick<Category, 'id' | 'name'> | null;
};


/**
 * Server Component for the Admin Posts Management page.
 * Accessible only to ADMIN or EDITOR users. Fetches all posts.
 */
export default async function AdminPostsPage() {
    logger.info("AdminPostsPage: Rendering page...");

    // --- Authorization Check ---
    const session = await getServerSession(authOptions);
    // Redirect check happens in layout, but keep a basic check here too
    if (!session?.user || ![Role.ADMIN, Role.EDITOR].includes(session.user.role)) {
        logger.warn(`AdminPostsPage: Unauthorized access attempt by ${session?.user?.email}. Redirecting.`);
        redirect('/admin/dashboard');
    }
    logger.info(`AdminPostsPage: Accessed by ${session.user.role} ${session.user.email}`);
    // --- End Check ---

    let posts: PostForAdminTable[] = [];
    let categories: Pick<Category, 'id' | 'name'>[] = []; // Fetch categories for the form

    try {
        // Fetch all posts and categories concurrently
        [posts, categories] = await Promise.all([
            prisma.post.findMany({
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    published: true,
                    createdAt: true,
                    updatedAt: true,
                    publishedAt: true,
                    author: { select: { id: true, name: true } },
                    category: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'desc' },
            }),
             prisma.category.findMany({
                select: { id: true, name: true },
                orderBy: { name: 'asc' },
            })
        ]);
        logger.info(`AdminPostsPage: Fetched ${posts.length} posts and ${categories.length} categories.`);

    } catch (error) {
        logger.error("AdminPostsPage: Failed to fetch data:", error);
        return <div className="text-destructive p-4">خطا در بارگذاری اطلاعات پست‌ها یا دسته‌بندی‌ها.</div>;
    }

    return (
        <div className="space-y-6">
             {/* Header is now part of the DataTable component */}
             {/* Render the client component table, passing categories */}
            <Card>
                 <CardHeader>
                     <CardTitle>مدیریت پست‌ها</CardTitle>
                     <CardDescription>تمام پست‌های سایت را در اینجا مشاهده، ویرایش، حذف یا پست جدیدی اضافه کنید.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     {/* The DataTable component now includes the "Add New" button */}
                     <PostsDataTable initialPosts={posts} categories={categories} />
                 </CardContent>
            </Card>
        </div>
    );
}
