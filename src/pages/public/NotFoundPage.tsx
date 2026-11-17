import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  useEffect(() => {
    document.title = 'Page not found | SEEAKK';
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center text-slate-900">
      <p className="text-sm font-bold text-emerald-600">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700">
        Go to SEEAKK home
      </Link>
    </div>
  );
};

export default NotFoundPage;
