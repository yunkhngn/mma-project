import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('admin_token', 'mock_admin_token');
    navigate('/');
  };

  return (
    <div className="w-full">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign in to Admin</h2>
        <p className="mt-2 text-sm text-slate-600">Enter mock credentials to access the panel</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="admin@mma.com"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              defaultValue="password"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
