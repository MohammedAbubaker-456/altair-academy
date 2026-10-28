/**
 * Admin Navigation Items Single Source of Truth
 *
 * Defines the canonical navigation structure for the administrative dashboard.
 * Pure constant module with zero server-only imports, safe for both Server and Client Components.
 *
 * Location: src/components/admin/nav-items.ts
 * Type: Shared Constants Module
 */

import {
  LayoutDashboard,
  GraduationCap,
  FolderTree,
  Users,
  Newspaper,
  HelpCircle,
  Briefcase,
  PhoneCall,
  FileText,
  Settings,
  MessageSquare,
  FileUser,
  MailCheck,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  title?: string;
  items: AdminNavItem[];
}

/**
 * Root overview navigation item
 */
export const overviewNavItem: AdminNavItem = {
  href: "/admin",
  label: "Overview",
  icon: LayoutDashboard,
};

/**
 * Inbox (Leads, Applications & Subscribers) items
 */
export const inboxNavItems: AdminNavItem[] = [
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/applications", label: "Applications", icon: FileUser },
  { href: "/admin/subscribers", label: "Subscribers", icon: MailCheck },
];

/**
 * Main Content Management items
 */
export const contentNavItems: AdminNavItem[] = [
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/calendar", label: "Training calendar", icon: CalendarDays },
  { href: "/admin/team", label: "Team & Instructors", icon: Users },
  { href: "/admin/news", label: "News & Insights", icon: Newspaper },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
];

/**
 * Site Settings & Policy Management items
 */
export const siteSettingsNavItems: AdminNavItem[] = [
  { href: "/admin/contact", label: "Contact Details", icon: PhoneCall },
  { href: "/admin/legal", label: "Legal Pages", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

/**
 * Complete list of all admin navigation items for auditing and routing checks
 */
export const allAdminNavItems: AdminNavItem[] = [
  overviewNavItem,
  ...inboxNavItems,
  ...contentNavItems,
  ...siteSettingsNavItems,
];
