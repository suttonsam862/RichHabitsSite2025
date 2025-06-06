import { useState, useEffect } from 'react';

const AppStatus = () => {
  const [status, setStatus] = useState('Loading...');
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    // Test React rendering
    setStatus('React is working');

    // Test API connectivity
    fetch('/health')
      .then(res => res.json())
      .then(() => setApiStatus('API connected'))
      .catch(() => setApiStatus('API connection failed'));
  }, []);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <h3 className="text-green-800 font-semibold mb-2">Application Status</h3>
      <div className="space-y-1 text-sm">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Frontend: {status}
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          Backend: {apiStatus}
        </div>
      </div>
    </div>
  );
};

export default AppStatus;