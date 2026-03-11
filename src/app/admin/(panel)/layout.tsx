import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  /* Verify admin via security-definer function (bypasses RLS) */
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=unauthorized");

  /* Fetch admin profile — use is_admin() policy or fallback */
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("email, display_name, role")
    .eq("id", user.id)
    .single();

  const profile = adminUser ?? {
    email: user.email ?? "admin",
    display_name: user.email?.split("@")[0] ?? "Admin",
    role: "admin",
  };

  return (
    <div className="admin-shell">
      <AdminSidebar user={profile} />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
