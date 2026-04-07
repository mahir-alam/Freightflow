export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-blue-600">
            FreightFlow
          </p>
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          Logistics Brokerage Platform
        </div>
      </div>
    </header>
  );
}