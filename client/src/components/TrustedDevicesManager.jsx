'use client';

import { useState, useEffect } from 'react';
import { Trash2, Smartphone, Monitor, Tablet, AlertCircle, Check, X } from 'lucide-react';
import { authAPI } from '../lib/api';

const TrustedDevicesManager = () => {
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch trusted devices on component mount
  useEffect(() => {
    fetchTrustedDevices();
  }, []);

  const fetchTrustedDevices = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getTrustedDevices();
      setTrustedDevices(data.trustedDevices || []);
    } catch (error) {
      setError('Failed to load trusted devices');
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (deviceId) => {
    try {
      await authAPI.removeTrustedDevice(deviceId);
      setTrustedDevices(prev => prev.filter(device => device.deviceId !== deviceId));
      setSuccess('Device removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to remove device');
      setTimeout(() => setError(''), 3000);
    }
  };

  const clearAllDevices = async () => {
    if (!window.confirm('Are you sure you want to remove all trusted devices? You will need to verify 2FA on all devices again.')) {
      return;
    }

    try {
      await authAPI.clearAllTrustedDevices();
      setTrustedDevices([]);
      setSuccess('All trusted devices cleared successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to clear all devices');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getDeviceIcon = (deviceName) => {
    const name = deviceName?.toLowerCase() || '';
    if (name.includes('iphone') || name.includes('android')) return <Smartphone className="w-5 h-5" />;
    if (name.includes('ipad') || name.includes('tablet')) return <Tablet className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Show relative time for recent dates
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    
    // Show full date for older entries
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  const getDaysRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Return more accurate remaining time
    if (diffDays <= 0) return 0;
    if (diffDays === 1) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (diffHours <= 24) return diffHours <= 1 ? '< 1 hour' : `${diffHours} hours`;
    }
    
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Trusted Devices</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Trusted Devices</h3>
        <p className="text-sm text-gray-600 mt-1">
          Devices where you don&apos;t need to enter 2FA codes
        </p>
      </div>

      <div className="p-6">
        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-700">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Devices List */}
        {trustedDevices.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-900 mb-1">No trusted devices</h4>
            <p className="text-sm text-gray-500">
              Enable &quot;Remember this device&quot; during 2FA verification to add devices here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trustedDevices.map((device) => {
              const daysRemaining = getDaysRemaining(device.expiresAt);
              const isExpiringSoon = typeof daysRemaining === 'number' ? daysRemaining <= 7 : false;
              const isExpired = typeof daysRemaining === 'number' ? daysRemaining <= 0 : false;
              
              return (
                <div key={device.deviceId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">
                      {getDeviceIcon(device.deviceName)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{device.deviceName}</h4>
                      <p className="text-sm text-gray-500">
                        Added {formatDate(device.createdAt)}
                      </p>
                      <p className={`text-xs ${
                        isExpired ? 'text-red-600' : 
                        isExpiringSoon ? 'text-orange-600' : 
                        'text-gray-500'
                      }`}>
                        {isExpired 
                          ? 'Expired'
                          : typeof daysRemaining === 'string'
                          ? `Expires in ${daysRemaining}`
                          : `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDevice(device.deviceId)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* Clear All Button */}
            {trustedDevices.length > 1 && (
              <div className="pt-4 border-t">
                <button
                  onClick={clearAllDevices}
                  className="w-full px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                >
                  Clear All Trusted Devices
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrustedDevicesManager;
