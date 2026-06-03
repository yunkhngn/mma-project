import { useEffect, useState } from 'react';
import { reportService, userService } from '@/services';
import type { RevenueReport } from '@/types';
import { DollarSign, Ticket, Users, TrendingUp } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReport() {
      try {
        const [reportData, usersData] = await Promise.all([
          reportService.getRevenue(),
          userService.getAll(),
        ]);
        setReport(reportData);
        setUserCount(usersData.length);
      } catch (err: any) {
        setError(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) return <div className="text-center py-10 text-slate-600">Loading metrics...</div>;
  if (error) return <div className="text-red-500 bg-red-50 border border-red-200 p-4 rounded-md">{error}</div>;

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Revenue */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 p-6 flex items-center">
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 mr-4">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Total Revenue</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report?.totalRevenue || 0)}
            </div>
          </div>
        </div>

        {/* Card 2: Tickets Sold */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 p-6 flex items-center">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600 mr-4">
            <Ticket className="h-8 w-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Tickets Sold</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {report?.totalTicketsSold || 0}
            </div>
          </div>
        </div>

        {/* Card 3: Total Users */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 p-6 flex items-center">
          <div className="p-3 bg-purple-50 rounded-full text-purple-600 mr-4">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Total Users</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {userCount}
            </div>
          </div>
        </div>
      </div>

      {/* Route Performance Table */}
      <div className="bg-white shadow-sm rounded-lg border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-teal-500" />
            Route Revenue Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Route ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Origin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Tickets Sold</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {report?.breakdownByRoute.map((item) => (
                <tr key={item.routeId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-950 font-medium">#{item.routeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.origin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">{item.ticketsSold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-950 text-right font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue)}
                  </td>
                </tr>
              ))}
              {!report?.breakdownByRoute.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">No route performance data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
