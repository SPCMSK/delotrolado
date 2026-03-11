export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0a0a0a",
        overflow: "auto",
        fontFamily: "var(--font-main), system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
