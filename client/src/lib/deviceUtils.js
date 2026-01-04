// Device detection utility for better user experience
export const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {
      deviceName: 'Unknown Device',
      deviceType: 'unknown',
      os: 'unknown',
      browser: 'unknown'
    };
  }

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  let deviceName = 'Unknown Device';
  let deviceType = 'desktop';
  let os = 'unknown';
  let browser = 'unknown';

  // Detect OS
  if (/iPhone/.test(userAgent)) {
    os = 'iOS';
    deviceType = 'mobile';
    deviceName = 'iPhone';
  } else if (/iPad/.test(userAgent)) {
    os = 'iPadOS';
    deviceType = 'tablet';
    deviceName = 'iPad';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
    deviceType = /Mobile/.test(userAgent) ? 'mobile' : 'tablet';
    deviceName = deviceType === 'mobile' ? 'Android Phone' : 'Android Tablet';
  } else if (/Windows/.test(userAgent)) {
    os = 'Windows';
    deviceName = 'Windows PC';
  } else if (/Macintosh/.test(userAgent)) {
    os = 'macOS';
    deviceName = 'Mac';
  } else if (/Linux/.test(userAgent)) {
    os = 'Linux';
    deviceName = 'Linux PC';
  }

  // Detect browser
  if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Firefox/.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    browser = 'Safari';
  } else if (/Edge/.test(userAgent)) {
    browser = 'Edge';
  } else if (/Opera/.test(userAgent)) {
    browser = 'Opera';
  }

  // Create more descriptive device name
  if (deviceType === 'desktop') {
    deviceName = `${deviceName} (${browser})`;
  }

  return {
    deviceName,
    deviceType,
    os,
    browser,
    userAgent,
    timestamp: new Date().toISOString()
  };
};

// Get current timezone info
export const getTimezoneInfo = () => {
  if (typeof window === 'undefined') {
    return {
      timezone: 'UTC',
      offset: 0
    };
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const offset = -now.getTimezoneOffset(); // minutes

  return {
    timezone,
    offset,
    offsetHours: Math.floor(offset / 60),
    offsetMinutes: offset % 60
  };
};

// Format time with user's timezone
export const formatTimeWithTimezone = (dateString) => {
  const date = new Date(dateString);
  const timezone = getTimezoneInfo().timezone;

  return date.toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const deviceUtils = {
  getDeviceInfo,
  getTimezoneInfo,
  formatTimeWithTimezone
};

export default deviceUtils;
