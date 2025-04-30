import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Use Shadcn Card
import { prisma } from '@/lib/db'; // For fetching stats

/**
 * Admin Dashboard Page.
 * Accessible only to authenticated users (ADMIN/EDITOR) via the AdminLayout.
 * Displays welcome message and basic stats.
 */
export default async function AdminDashboardPage() {
    // Session is guaranteed by Layout, fetch again for user info display
    const session = await getServerSession(authOptions);

    // Redirect if session somehow missing (shouldn't happen due to layout)
    if (!session?.user) {
         logger.error("AdminDashboardPage: Accessed without session. Redirecting.");
         redirect('/login');
    }

    logger.info(`AdminDashboardPage: Rendering dashboard for user ${session.user.email}`);

    // --- Fetch Basic Stats (Example) ---
    let stats = { postCount: 0, pageCount: 0, categoryCount: 0, userCount: 0 };
    try {
         // Use Promise.all for concurrent fetching
         const [postCount, pageCount, categoryCount, userCount] = await Promise.all([
             prisma.post.count(), // Count all posts (published and drafts)
             prisma.page.count(), // Count all pages
             prisma.category.count(),
             prisma.user.count(),
         ]);
         stats = { postCount, pageCount, categoryCount, userCount };
         logger.info("AdminDashboardPage: Fetched stats:", stats);
    } catch (error) {
         logger.error("AdminDashboardPage: Failed to fetch dashboard stats:", error);
         // Continue rendering page even if stats fail
    }
    // --- End Fetch Stats ---


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">داشبورد</h1>

             {/* Welcome Card */}
            <Card>
                <CardHeader>
                    <CardTitle>خوش آمدید!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">
                        سلام، <span className="font-semibold">{session.user.name || session.user.email}</span>!
                    </p>
                    <p className="mt-2 text-muted-foreground">
                        به پنل مدیریت CMS خوش آمدید. از طریق منوی کناری می‌توانید بخش‌های مختلف سایت را مدیریت کنید.
                    </p>
                </CardContent>
            </Card>

            {/* Stats Cards (Example Grid) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">تعداد پست‌ها</CardTitle>
                          {/* Placeholder Icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                     </CardHeader>
                     <CardContent>
                         <div className="text-2xl font-bold">{stats.postCount}</div>
                         <p className="text-xs text-muted-foreground">کل پست‌های منتشر شده و پیش‌نویس</p>
                     </CardContent>
                 </Card>
                 <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">تعداد برگه‌ها</CardTitle>
                          {/* Placeholder Icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                     </CardHeader>
                     <CardContent>
                         <div className="text-2xl font-bold">{stats.pageCount}</div>
                         <p className="text-xs text-muted-foreground">کل برگه‌های منتشر شده و پیش‌نویس</p>
                     </CardContent>
                 </Card>
                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">تعداد دسته‌بندی‌ها</CardTitle>
                          {/* Placeholder Icon */}
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>
                     </CardHeader>
                     <CardContent>
                         <div className="text-2xl font-bold">{stats.categoryCount}</div>
                         <p className="text-xs text-muted-foreground">کل دسته‌بندی‌ها</p>
                     </CardContent>
                 </Card>
                 <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">تعداد کاربران</CardTitle>
                          {/* Placeholder Icon */}
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                     </CardHeader>
                     <CardContent>
                         <div className="text-2xl font-bold">{stats.userCount}</div>
                         <p className="text-xs text-muted-foreground">کل کاربران ثبت‌نام شده</p>
                     </CardContent>
                 </Card>
            </div>

            {/* Add more dashboard elements here: Quick Links, Recent Activity, etc. */}

        </div>
    );
}
