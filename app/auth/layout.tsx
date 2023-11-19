export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center h-screen">
      <div className="max-w-[480px] mx-auto">{children}</div>
    </div>
  );
}
