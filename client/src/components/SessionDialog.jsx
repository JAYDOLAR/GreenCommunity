'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, LogOut } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useTranslation } from '@/context/PreferencesContext';

const SessionDialog = () => {
  const { sessionConflict, showSessionDialog, handleSessionConflict, setShowSessionDialog } = useUser();
  const { t } = useTranslation();

  if (!showSessionDialog || !sessionConflict.type) return null;

  const getIcon = () => {
    switch (sessionConflict.type) {
      case 'different_account':
        return <Users className="h-12 w-12 text-orange-500" />;
      case 'multiple_tabs':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      case 'session_expired':
      case 'session_invalid':
        return <LogOut className="h-12 w-12 text-red-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getTitle = () => {
    switch (sessionConflict.type) {
      case 'different_account':
        return t('auth:different_account_title');
      case 'multiple_tabs':
        return t('auth:multiple_tabs_title');
      case 'session_expired':
        return t('auth:session_expired_title');
      case 'session_invalid':
        return t('auth:session_invalid_title');
      default:
        return t('auth:session_error_title');
    }
  };

  const showActions = sessionConflict.type === 'different_account' || sessionConflict.type === 'multiple_tabs';

  return (
    <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {getIcon()}
            <DialogTitle className="text-center text-lg font-semibold">
              {getTitle()}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              {sessionConflict.message}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        {showActions ? (
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handleSessionConflict('cancel')}
              className="flex-1"
            >
              {t('common:cancel')}
            </Button>
            <Button
              onClick={() => handleSessionConflict('force_login')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {sessionConflict.type === 'different_account' 
                ? t('auth:switch_account') 
                : t('auth:close_other_tabs')
              }
            </Button>
          </div>
        ) : (
          <div className="pt-4">
            <Button
              onClick={() => {
                setShowSessionDialog(false);
                // Redirect to login if needed
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              className="w-full"
            >
              {t('auth:login_again')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SessionDialog;