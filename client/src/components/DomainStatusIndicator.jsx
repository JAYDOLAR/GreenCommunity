import { useState, useEffect } from 'react';
import { apiFallbackManager } from '@/lib/apiFallback';

export default function DomainStatusIndicator() {
  const [currentDomain, setCurrentDomain] = useState('');
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setCurrentDomain(apiFallbackManager.getCurrentBaseUrl());
      setIsFallbackActive(apiFallbackManager.isFallbackActive());
    };

    updateStatus();
    
    // Update status every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Only show in development or if admin
  if (process.env.NODE_ENV === 'production' && !localStorage.getItem('show_domain_debug')) {
    return null;
  }

  const isCustomDomain = currentDomain.includes('green-community.app');
  const isAzureDomain = currentDomain.includes('azurewebsites.net');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg text-xs font-mono text-white shadow-lg ${
        isCustomDomain ? 'bg-green-600' : 
        isAzureDomain ? 'bg-orange-600' : 
        'bg-blue-600'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isCustomDomain ? 'bg-green-300' : 
            isAzureDomain ? 'bg-orange-300' : 
            'bg-blue-300'
          }`}></div>
          <span>
            {isCustomDomain ? 'Custom Domain' :
             isAzureDomain ? 'Azure Fallback' :
             'Local Dev'}
          </span>
        </div>
        {isFallbackActive && (
          <div className="text-orange-200 text-xs mt-1">
            Fallback Active
          </div>
        )}
        <div className="text-xs opacity-75 mt-1">
          {currentDomain}
        </div>
      </div>
    </div>
  );
}

// Debug helper - call this in browser console to show domain debug info
window.showDomainDebug = () => {
  localStorage.setItem('show_domain_debug', 'true');
  window.location.reload();
};

window.hideDomainDebug = () => {
  localStorage.removeItem('show_domain_debug');
  window.location.reload();
};