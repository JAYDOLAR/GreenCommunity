"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Bell,
  Settings as SettingsIcon,
  Download,
  Camera,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Shield,
  Trash2,
  Save,
  Upload,
  Loader2,
  QrCode,
  Trophy,
  Leaf,
  Recycle,
} from "lucide-react";
import { usePreferences, useTranslation } from "@/context/PreferencesContext";
import { authAPI } from "@/lib/api";
import { footprintLogAPI } from "@/lib/footprintlogApi";
import { challengesAPI } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import useCurrency from "@/hooks/useCurrency";
import toast from "react-hot-toast";

import ProtectedLayout from "@/components/ProtectedLayout";
import AuthGuard from "@/components/AuthGuard";
import ChatBot from "@/components/ChatBot";
import Layout from "@/components/Layout";
import TrustedDevicesManager from "@/components/TrustedDevicesManager";

const Settings = () => {
  const { t } = useTranslation(["preferences", "common"]);
  const { user, updateUser, refreshUser, isLoading: userLoading } = useUser();
  const { currencyRates, loading: currencyLoading } = useCurrency();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tabDirection, setTabDirection] = useState("right");

  // Tab navigation
  const tabs = ["profile", "notifications", "preferences", "data"];

  const navigateTab = (direction) => {
    const currentIndex = tabs.indexOf(activeTab);
    let newIndex;

    if (direction === "next") {
      newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      setTabDirection("right");
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      setTabDirection("left");
    }

    setActiveTab(tabs[newIndex]);
  };

  // Handle tab change with direction detection
  const handleTabChange = (newTab) => {
    const currentIndex = tabs.indexOf(activeTab);
    const newIndex = tabs.indexOf(newTab);
    setTabDirection(newIndex > currentIndex ? "right" : "left");
    setActiveTab(newTab);
  };

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    joinDate: "",
  });

  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    challengeReminders: true,
    weeklyReports: true,
    communityActivity: false,
    marketingEmails: false,
    mobilePush: true,
    socialActivity: true,
  });

  const { preferences, setPreferences, syncPreferencesFromServer } = usePreferences();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // Load user settings on component mount - direct approach
  useEffect(() => {
    const initializeSettings = async () => {
      // Always try to load settings directly
      await loadUserSettings();
    };

    initializeSettings();
  }, []);

  // Keyboard navigation for tabs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateTab("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateTab("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  const loadUserSettings = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getUserSettings();
      const userData = response.user;

      // Check if user is authenticated via Google
      setIsGoogleAuth(userData.isGoogleAuth || false);

      // Update profile data - use userInfo from backend response
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.userInfo?.phone || userData.profile?.phone || "",
        location: userData.userInfo?.location
          ? [
              userData.userInfo.location.city,
              userData.userInfo.location.state,
              userData.userInfo.location.country,
            ]
              .filter((part) => part && part.trim())
              .join(", ")
          : userData.profile?.location
          ? [
              userData.profile.location.city,
              userData.profile.location.state,
              userData.profile.location.country,
            ]
              .filter((part) => part && part.trim())
              .join(", ")
          : "",
        bio: userData.userInfo?.bio || userData.profile?.bio || "",
        joinDate: userData.createdAt || "",
        // preferredUnits removed from UI
      });

      // Update notifications - use userInfo notifications or fallback to profile
      if (userData.userInfo?.notifications) {
        setNotifications(userData.userInfo.notifications);
      } else if (userData.profile?.notificationPreferences) {
        setNotifications(userData.profile.notificationPreferences);
      }

      // Update app preferences - sync from server to context AND localStorage
      const serverPrefs = userData.userInfo?.preferences || userData.profile?.appPreferences;
      if (serverPrefs && Object.keys(serverPrefs).length > 0) {
        syncPreferencesFromServer(serverPrefs);
      }
      
      // Also update localStorage with fresh user data for preferences sync
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (setting) => {
    setNotifications((prev) => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handlePreferenceChange = (setting, value) => {
    setPreferences((prev) => ({ ...prev, [setting]: value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const saveProfileSettings = async () => {
    try {
      setIsSaving(true);

      // Parse location string into components
      const parseLocation = (locationString) => {
        if (!locationString || !locationString.trim()) {
          return { city: "", state: "", country: "", raw: "" };
        }

        const parts = locationString.split(",").map((part) => part.trim());
        let city = "",
          state = "",
          country = "";

        if (parts.length === 1) {
          city = parts[0];
        } else if (parts.length === 2) {
          city = parts[0];
          country = parts[1];
        } else if (parts.length >= 3) {
          city = parts[0];
          state = parts[1];
          country = parts[2];
        }

        return { city, state, country, raw: locationString };
      };

      const locationData = parseLocation(profileData.location);

      const response = await authAPI.updateProfile({
        name: profileData.name,
        email: isGoogleAuth ? undefined : profileData.email, // Don't send email for Google users
        phone: profileData.phone,
        bio: profileData.bio,
        // preferredUnits removed
        location: profileData.location,
      });

      // Update user context with fresh data from server
      updateUser(response.user);
      toast.success("Profile updated successfully!");

      // Refresh user data to ensure we have the latest information including formatted location
      await refreshUser();
    } catch (error) {
      console.error("Error updating profile:", error);

      // Handle specific Google auth email error
      if (error.response?.data?.code === "GOOGLE_EMAIL_READONLY") {
        toast.error(
          "Email cannot be changed for Google-authenticated accounts"
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setIsSaving(true);
      await authAPI.updateNotificationPreferences(notifications);
      toast.success("Notification preferences updated!");
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("Failed to update notification preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const saveAppPreferences = async () => {
    try {
      setIsSaving(true);
      await authAPI.updateAppPreferences(preferences);
      toast.success("App preferences updated!");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update app preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordMessage("All fields are required.");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await authAPI.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      });

      setPasswordMessage("Password changed successfully!");
      setPasswordForm({ current: "", new: "", confirm: "" });
      setShowChangePassword(false);
      toast.success("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordMessage(
        error.response?.data?.message || "Failed to change password"
      );
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const response = await authAPI.uploadAvatar(file);
      updateUser(response.user); // Update user context with new avatar URL
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const results = await Promise.allSettled([
        authAPI.getUserSettings(),
        footprintLogAPI.getUserLogs(),
        challengesAPI.me(),
        authAPI.getTrustedDevices(),
        challengesAPI.groups(),
        challengesAPI.events(),
      ]);

      const [settingsRes, logsRes, challengesRes, devicesRes, groupsRes, eventsRes] = results;

      const exportPayload = {
        generatedAt: new Date().toISOString(),
        profile: settingsRes.status === 'fulfilled' ? settingsRes.value?.user || settingsRes.value : null,
        settings: settingsRes.status === 'fulfilled' ? {
          notifications: settingsRes.value?.user?.userInfo?.notifications || settingsRes.value?.user?.profile?.notificationPreferences || null,
          preferences: settingsRes.value?.user?.userInfo?.preferences || settingsRes.value?.user?.profile?.appPreferences || null,
        } : null,
        carbonFootprint: logsRes.status === 'fulfilled' ? logsRes.value : [],
        challenges: challengesRes.status === 'fulfilled' ? challengesRes.value : null,
        trustedDevices: devicesRes.status === 'fulfilled' ? devicesRes.value : [],
        community: {
          groups: groupsRes.status === 'fulfilled' ? groupsRes.value : [],
          events: eventsRes.status === 'fulfilled' ? eventsRes.value : [],
        },
        purchases: [],
        payments: [],
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'my-data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      toast.success('Downloaded JSON data');
    } catch (error) {
      toast.error(error?.message || 'Failed to export data. Please try again.');
    }
  };

  const handle2FASetup = async () => {
    try {
      const { qrCodeUrl } = await authAPI.generate2FASecret();
      setQrCodeUrl(qrCodeUrl);
      setShow2FADialog(true);
    } catch (error) {
      toast.error("Failed to generate 2FA secret");
    }
  };

  const handle2FAVerify = async () => {
    try {
      const response = await authAPI.verify2FAToken(twoFactorCode);
      toast.success(response.message || "2FA enabled successfully!");

      // Manually update the user context after successful verification
      if (user) {
        const updatedUser = { ...user, twoFactorEnabled: true };
        updateUser(updatedUser);
      }

      setShow2FADialog(false);
    } catch (error) {
      toast.error("Invalid 2FA token");
    }
  };

  const handle2FADisable = async () => {
    try {
      const response = await authAPI.disable2FA();
      toast.success(response.message || "2FA disabled successfully");

      // Manually update the user context after successful disable
      if (user) {
        const updatedUser = { ...user, twoFactorEnabled: false };
        updateUser(updatedUser);
      }
    } catch (error) {
      toast.error("Failed to disable 2FA");
    }
  };

  const deleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
      )
    ) {
      try {
        const response = await authAPI.deleteUserAccount();
        toast.success("Your account has been permanently deleted.");
        // Redirect to home page after successful deletion
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } catch (error) {
        toast.error("Failed to delete account. Please try again.");
      }
    }
  };

  if (userLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      {/* Header Section with Avatar and Quick Actions */}
      <div className="relative">
        <Card className="overflow-hidden border shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20"></div>
          <CardContent className="relative pt-16 md:pt-20 pb-6 px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
              {/* Avatar Section */}
              <div className="relative group z-10 flex-shrink-0">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background shadow-xl ring-2 ring-primary/20">
                  <AvatarImage
                    src={user?.userInfo?.avatar?.url || null}
                    alt="Profile"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl md:text-3xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload-header"
                  disabled={isSaving}
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-7 w-7 md:h-8 md:w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() =>
                    document.getElementById("avatar-upload-header")?.click()
                  }
                  disabled={isSaving}
                >
                  <Camera className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left space-y-2 md:space-y-3 z-10 min-w-0">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                  {user?.name || "User"}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm md:text-base truncate">{user?.email}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm pt-1">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5 px-2.5 py-1"
                  >
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      Joined{" "}
                      {profileData.joinDate
                        ? new Date(profileData.joinDate).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )
                        : "N/A"}
                    </span>
                  </Badge>
                  {user?.twoFactorEnabled && (
                    <Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                      <Shield className="h-3 w-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">2FA Enabled</span>
                    </Badge>
                  )}
                  {isGoogleAuth && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1.5 px-2.5 py-1"
                    >
                      <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="whitespace-nowrap">Google Account</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2 w-full md:w-auto z-10 flex-shrink-0">
                <Button
                  variant="destructive"
                  className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all px-6 text-white"
                  onClick={async () => {
                    try {
                      await authAPI.logout();
                      toast.success("Logged out successfully");
                      window.location.href = "/login";
                    } catch (error) {
                      toast.error("Failed to logout");
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Log out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="card-eco hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Eco Points</p>
                <p className="text-xl md:text-2xl font-bold text-primary">1,850</p>
              </div>
              <Trophy className="h-8 w-8 md:h-10 md:w-10 text-yellow-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-eco hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Challenges</p>
                <p className="text-xl md:text-2xl font-bold text-primary">12</p>
              </div>
              <Leaf className="h-8 w-8 md:h-10 md:w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-eco hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">CO₂ Offset</p>
                <p className="text-xl md:text-2xl font-bold text-success">24.5t</p>
              </div>
              <Recycle className="h-8 w-8 md:h-10 md:w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-eco hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Rank</p>
                <p className="text-xl md:text-2xl font-bold text-primary">#23</p>
              </div>
              <Shield className="h-8 w-8 md:h-10 md:w-10 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <div className="relative">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-accent/20 rounded-xl h-auto">
            <TabsTrigger
              value="profile"
              className="rounded-lg px-3 py-2.5 text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300 ease-in-out"
            >
              <User className="h-4 w-4 mr-2 inline-block sm:hidden" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-lg px-3 py-2.5 text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300 ease-in-out"
            >
              <Bell className="h-4 w-4 mr-2 inline-block sm:hidden" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="rounded-lg px-3 py-2.5 text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300 ease-in-out"
            >
              <SettingsIcon className="h-4 w-4 mr-2 inline-block sm:hidden" />
              {t("preferences:preferences")}
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="rounded-lg px-3 py-2.5 text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300 ease-in-out"
            >
              <Shield className="h-4 w-4 mr-2 inline-block sm:hidden" />
              Data & Privacy
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          key={`profile-${activeTab === "profile" ? Date.now() : "hidden"}`}
          value="profile"
          className={`space-y-6 ${
            activeTab === "profile"
              ? tabDirection === "right"
                ? "animate-slide-in-right"
                : "animate-slide-in-left"
              : "hidden"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="card-gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <User className="h-4 w-4 md:h-5 md:w-5" />
                    {t("Profile Information")}
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">{t("Update Personal Info")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t("Full Name")}</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          handleProfileUpdate("name", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t("Email Address")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          handleProfileUpdate("email", e.target.value)
                        }
                        disabled={isGoogleAuth}
                        className={`mt-1 ${
                          isGoogleAuth ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      />
                      {isGoogleAuth && (
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email cannot be changed for Google-authenticated
                          accounts
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">{t("Phone Number")}</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          handleProfileUpdate("phone", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">
                        {t("preferences:location")}
                      </Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) =>
                          handleProfileUpdate("location", e.target.value)
                        }
                        className="mt-1"
                        placeholder="City, State, Country"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">{t("preferences:bio")}</Label>
                    <Input
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        handleProfileUpdate("bio", e.target.value)
                      }
                      className="mt-1"
                      placeholder={t("Tell About Yourself")}
                    />
                  </div>
                  {/* Preferred units selection removed; carbonUnits managed in App Preferences */}
                  <Button
                    className="btn-hero"
                    onClick={saveProfileSettings}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? "Saving..." : t("common:save")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        {/* Notifications Tab */}
        <TabsContent
          key={`notifications-${
            activeTab === "notifications" ? Date.now() : "hidden"
          }`}
          value="notifications"
          className={`space-y-6 ${
            activeTab === "notifications"
              ? tabDirection === "right"
                ? "animate-slide-in-right"
                : "animate-slide-in-left"
              : "hidden"
          }`}
        >
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                {t("Notification Preferences")}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {t("Choose How to be Notified")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm md:text-base text-foreground">
                  {t("Email Notifications")}
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      key: "emailUpdates",
                      label: t("Platform Updates"),
                      description: t("Important Updates"),
                    },
                    {
                      key: "challengeReminders",
                      label: t("Challenge Reminders"),
                      description: t("Challenge Reminders Description"),
                    },
                    {
                      key: "weeklyReports",
                      label: t("Weekly Progress Reports"),
                      description: t("Weekly Progress Reports Description"),
                    },
                    {
                      key: "communityActivity",
                      label: t("Community Activity"),
                      description: t("Community Activity Description"),
                    },
                    {
                      key: "marketingEmails",
                      label: t("Marketing Emails"),
                      description: t("Marketing Emails Description"),
                    },
                  ].map(({ key, label, description }) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border/50 rounded-lg hover:border-border transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-sm md:text-base text-foreground">
                          {label}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {description}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end">
                        <span className="text-xs md:text-sm text-muted-foreground sm:hidden">
                          {notifications[key] ? "Enabled" : "Disabled"}
                        </span>
                        <Switch
                          checked={notifications[key]}
                          onCheckedChange={() => handleNotificationToggle(key)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              {/* Push Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm md:text-base text-foreground">
                  {t("push_notifications")}
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      key: "mobilePush",
                      label: t("Mobile Push Notifications"),
                      description: t("Receive Notifications on Mobile"),
                    },
                    {
                      key: "socialActivity",
                      label: t("Social Activity"),
                      description: t("When Someone Likes or Comments"),
                    },
                  ].map(({ key, label, description }) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border/50 rounded-lg hover:border-border transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-sm md:text-base text-foreground">
                          {label}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {description}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end">
                        <span className="text-xs md:text-sm text-muted-foreground sm:hidden">
                          {notifications[key] ? "Enabled" : "Disabled"}
                        </span>
                        <Switch
                          checked={notifications[key]}
                          onCheckedChange={() => handleNotificationToggle(key)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="btn-hero"
                onClick={saveNotificationSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? "Saving..." : t("common:save")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Preferences Tab */}
        <TabsContent
          key={`preferences-${
            activeTab === "preferences" ? Date.now() : "hidden"
          }`}
          value="preferences"
          className={`space-y-6 ${
            activeTab === "preferences"
              ? tabDirection === "right"
                ? "animate-slide-in-right"
                : "animate-slide-in-left"
              : "hidden"
          }`}
        >
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <SettingsIcon className="h-4 w-4 md:h-5 md:w-5" />
                {t("App Preferences")}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {t("customize_ecoaction_experience")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{t("preferences:theme")}</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) =>
                      handlePreferenceChange("theme", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        {t("preferences:light")}
                      </SelectItem>
                      <SelectItem value="dark">
                        {t("preferences:dark")}
                      </SelectItem>
                      <SelectItem value="system">
                        {t("preferences:system")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("preferences:language")}</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      handlePreferenceChange("language", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                      <SelectItem value="gu">ગુજરાતી</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("preferences:currency")}</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) =>
                      handlePreferenceChange("currency", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyLoading ? (
                        <SelectItem value={preferences.currency || "usd"} disabled>
                          Loading currencies...
                        </SelectItem>
                      ) : currencyRates.length > 0 ? (
                        currencyRates.map((curr) => (
                          <SelectItem 
                            key={curr.currency} 
                            value={curr.currency.toLowerCase()}
                          >
                            {curr.currency} ({curr.symbol}) - {curr.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="usd">USD ($) - US Dollar</SelectItem>
                          <SelectItem value="eur">EUR (€) - Euro</SelectItem>
                          <SelectItem value="inr">INR (₹) - Indian Rupee</SelectItem>
                          <SelectItem value="gbp">GBP (£) - British Pound</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* General units preference removed; only Carbon Emission Units remains */}
                <div>
                  <Label>Carbon Emission Units</Label>
                  <Select
                    value={preferences.carbonUnits || "kg"}
                    onValueChange={(value) =>
                      handlePreferenceChange("carbonUnits", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg CO₂</SelectItem>
                      <SelectItem value="tons">tons CO₂</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm md:text-base text-foreground">
                  {t("Privacy Settings")}
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm md:text-base">{t("Profile Visibility")}</Label>
                    <Select
                      value={preferences.privacy}
                      onValueChange={(value) =>
                        handlePreferenceChange("privacy", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          {t("preferences:public")}
                        </SelectItem>
                        <SelectItem value="friends">
                          {t("preferences:friends_only")}
                        </SelectItem>
                        <SelectItem value="private">
                          {t("preferences:private")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm md:text-base text-foreground">
                        {t("Data Sharing for Research")}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        {t("Help Improve Environmental Research")}
                      </div>
                    </div>
                    <Switch
                      checked={preferences.dataSharing}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange("dataSharing", checked)
                      }
                    />
                  </div>
                </div>
              </div>
              <Button className="btn-hero" onClick={saveAppPreferences}>
                <Save className="h-4 w-4 mr-2" />
                {t("preferences:save_preferences")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Data & Privacy Tab */}
        <TabsContent
          key={`data-${activeTab === "data" ? Date.now() : "hidden"}`}
          value="data"
          className={`space-y-6 ${
            activeTab === "data"
              ? tabDirection === "right"
                ? "animate-slide-in-right"
                : "animate-slide-in-left"
              : "hidden"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Download className="h-4 w-4 md:h-5 md:w-5" />
                  {t("Data Export")}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">{t("Download all Data")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t("Export Includes Profile Info")}
                </p>
                <div>
                  <Button
                    onClick={() => exportData('json')}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download My Data
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="card-gradient border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg text-destructive">
                  <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                  {t("Delete Account")}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {t("Permanently Delete Account")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t("This Action cannot be undone")}
                </p>
                <Button
                  onClick={deleteAccount}
                  variant="destructive"
                  className="w-full text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("Delete Account")}
                </Button>
              </CardContent>
            </Card>
          </div>
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Shield className="h-4 w-4 md:h-5 md:w-5" />
                {t("Privacy Security")}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">{t("Manage Account Security")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <Button
                  variant="outline"
                  className={`justify-start h-auto py-3 ${
                    isGoogleAuth ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  onClick={() =>
                    !isGoogleAuth && setShowChangePassword((v) => !v)
                  }
                  disabled={isGoogleAuth}
                >
                  <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-left">{t("Change Password")}</span>
                </Button>
                {user?.twoFactorEnabled ? (
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={handle2FADisable}
                  >
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-left">{t("Disable 2FA")}</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={handle2FASetup}
                  >
                    <QrCode className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-left">{t("Enable 2FA")}</span>
                  </Button>
                )}
              </div>
              {showChangePassword && (
                <form
                  className="mt-4 p-4 space-y-4 border border-border rounded-lg bg-accent/5"
                  onSubmit={submitPasswordChange}
                >
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      name="current"
                      type="password"
                      value={passwordForm.current}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      name="new"
                      type="password"
                      value={passwordForm.new}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input
                      id="confirm"
                      name="confirm"
                      type="password"
                      value={passwordForm.confirm}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="btn-hero w-full sm:w-auto" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                  {passwordMessage && (
                    <div className={`text-sm mt-2 p-3 rounded-lg ${
                      passwordMessage.includes('success') 
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20' 
                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      {passwordMessage}
                    </div>
                  )}
                </form>
              )}

              {/* Trusted Devices Management - Only show if 2FA is enabled */}
              {user?.twoFactorEnabled && (
                <div className="mt-6">
                  <TrustedDevicesManager />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {show2FADialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border p-6 md:p-8 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">
              Enable Two-Factor Authentication
            </h2>
            <p className="mb-4 text-xs md:text-sm text-muted-foreground">
              Scan the QR code with your authenticator app and enter the code
              below to verify.
            </p>
            <img
              src={qrCodeUrl || "/vercel.svg"}
              alt="2FA QR Code"
              className="mx-auto mb-4 rounded-lg border border-border"
            />
            <Input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="Enter 2FA code"
              className="mb-4 text-sm md:text-base"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Button variant="outline" onClick={() => setShow2FADialog(false)} className="text-sm md:text-base">
                Cancel
              </Button>
              <Button onClick={handle2FAVerify} className="text-sm md:text-base">Verify</Button>
            </div>
          </div>
        </div>
      )}
      <ChatBot />
    </div>
  );
};

export default function SettingsPage() {
  return (
    <AuthGuard intent="settings">
      <Layout>
        <Settings />
      </Layout>
    </AuthGuard>
  );
}
