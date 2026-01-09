'use client';

import React from 'react';

const BlockedAccount = ({ message = 'Your account is blocked. If this is a mistake, please contact support.' }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <img src="/logo.png" alt="GreenCommunity" className="h-16 w-16" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Account Locked</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Contact support: <a href="mailto:support@greencommunity.example" className="underline">support@greencommunity.example</a>
        </div>
      </div>
    </div>
  );
};

export default BlockedAccount;


