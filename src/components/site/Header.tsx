/**
 * Public Website Header Component
 *
 * Server Component fetching the dynamic course navigation menu from MongoDB
 * (active categories and subcategories up to 2 levels) and passing it to
 * the client-side interactive HeaderClient component.
 *
 * Location: src/components/site/Header.tsx
 * Type: Server Component
 */

import { getHeaderMenu } from "@/server/queries/menu";
import { HeaderClient } from "@/components/site/HeaderClient";

export async function Header() {
  const menu = await getHeaderMenu();

  return <HeaderClient menu={menu} />;
}
