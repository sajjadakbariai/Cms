import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import AuthStatus from '@/components/AuthStatus'; // Reusable Auth Status component
import { Role } from "@prisma/client"; // Import Role enum for checks
import { cn } from '@/lib/utils'; // For conditional classes if needed

// Define allowed roles for accessing the admin panel
const ALLOWED_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];

/**
 * Protected Layout for the Admin Panel.
 * - Checks for user session and allowed roles on the server.
 * - Redirects to login if not authenticated or not authorized.
 * - Provides basic sidebar navigation structure for admin pages.
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    logger.info("AdminLayout: Verifying access...");
    const session = await getServerSession(authOptions);
    const pathname = headers().get('x-pathname') || '/admin/dashboard'; // Get current path for callback

    // 1. Check if user is logged in
    if (!session?.user) {
        logger.warn("AdminLayout: No active session. Redirecting to login.");
        const callbackUrl = encodeURIComponent(pathname);
        redirect(`/login?callbackUrl=${callbackUrl}`);
    }

    // 2. Check if user has an allowed role
    const userRole = session.user.role; // Role should be on session object
    if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
        logger.warn(`AdminLayout: User ${session.user.email} (Role: ${userRole}) forbidden access. Redirecting to home.`);
        redirect('/'); // Redirect unauthorized roles to homepage
    }

    // Optional: Fetch user from DB for extra validation (role hasn't changed, user still exists)
    // try { ... prisma.user.findUnique ... } catch { ... redirect ... }

    logger.info(`AdminLayout: Access granted for ${session.user.email} (Role: ${userRole}). Rendering layout.`);

    // Base class names for links (can be customized further)
    const baseLinkClass = "block py-2 px-3 rounded text-sm";
    const hoverClass = "hover:bg-gray-700 hover:text-white";
    // Add active link styling later using usePathname in a client component if needed

    return (
        <div className="flex min-h-screen bg-muted/40"> {/* Use themed background */}
            {/* --- Sidebar Navigation --- */}
            <aside className="w-60 bg-gray-900 text-gray-200 p-4 flex flex-col fixed h-full shadow-lg">
                <div className="mb-6">
                     {/* Link to public site or admin dashboard */}
                     <Link href="/admin/dashboard" className="text-xl font-bold text-white hover:text-gray-300">
                         پنل مدیریت CMS
                     </Link>
                </div>

                <nav className="flex-grow space-y-1">
                     {/* Common links */}
                     <Link href="/admin/dashboard" className={cn(baseLinkClass, hoverClass)}>داشبورد</Link>
                     <Link href="/admin/posts" className={cn(baseLinkClass, hoverClass)}>مدیریت پست‌ها</Link>
                     <Link href="/admin/categories" className={cn(baseLinkClass, hoverClass)}>مدیریت دسته‌بندی‌ها</Link>
                     <Link href="/admin/pages" className={cn(baseLinkClass, hoverClass)}>مدیریت برگه‌ها</Link>

                    {/* Admin-only links */}
                    {userRole === Role.ADMIN && (
                        <>
                            <hr className="my-3 border-gray-700" />
                            <Link href="/admin/menus" className={cn(baseLinkClass, hoverClass)}>مدیریت منوها</Link>
                            <Link href="/admin/users" className={cn(baseLinkClass, hoverClass)}>مدیریت کاربران</Link>
                            <Link href="/admin/settings" className={cn(baseLinkClass, hoverClass)}>تنظیمات سایت</Link>
                        </>
                    )}
                </nav>

                {/* User/Auth Status Section */}
                <div className="mt-auto border-t border-gray-700 pt-4">
                    {/* Wrap AuthStatus for consistent padding/alignment */}
                     <div className="px-2">
                        <AuthStatus />
                     </div>
                </div>
            </aside>

            {/* --- Main Content Area --- */}
            {/* Use padding matching sidebar width */}
            <main className="flex-1 p-6 md:p-8 pr-[264px]"> {/* Adjust padding-right (pr) based on exact sidebar width + desired gap */}
                {children}
            </main>
        </div>
    );
}
