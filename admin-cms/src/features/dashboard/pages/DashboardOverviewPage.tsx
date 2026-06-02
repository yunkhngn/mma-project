export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Welcome to MMA Admin Panel</h2>
        <p className="mt-1 text-sm text-slate-500">Select an item from the sidebar to manage features.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="text-sm font-medium text-slate-500 truncate">Total Bookings</div>
            <div className="mt-1 text-3xl font-semibold text-slate-900">0</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="text-sm font-medium text-slate-500 truncate">Active Drivers</div>
            <div className="mt-1 text-3xl font-semibold text-slate-900">0</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="text-sm font-medium text-slate-500 truncate">Total Users</div>
            <div className="mt-1 text-3xl font-semibold text-slate-900">0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
