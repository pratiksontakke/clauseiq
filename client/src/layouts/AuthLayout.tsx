import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-cloud-bg flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-rhythm">
        <div className="text-center mb-rhythm">
          <h1 className="text-2xl font-bold text-ink-text">ClauseIQ</h1>
          <p className="text-ink-medium mt-2">Contract Lifecycle Management</p>
        </div>
        
        {/* Auth pages will be rendered here */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout; 