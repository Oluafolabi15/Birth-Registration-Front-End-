export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-midnight)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wider">Decentralize Digital birth Registration</h1>
          <p className="text-[var(--color-periwinkle)] mt-2">Blockchain Verified Identity</p>
        </div>
        {children}
      </div>
    </div>
  );
}
