"use client";
import { useEffect, useState } from 'react';
import { challengesAPI } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Trophy,
  Target,
  Calendar,
  MapPin,
  Plus,
  Search,
  TrendingUp,
  Award,
  Leaf,
  Clock,
  CheckCircle,
  Star,
  MessageCircle,
  Share,
  Heart,
  Trash2,
  Bike,
  Zap,
  Recycle,
  Sun,
  TreePine,
  Globe,
  User
} from 'lucide-react';

// Icon mapping function to convert icon names from API to actual Lucide React components
const getIconComponent = (iconName, className = 'h-6 w-6') => {
  const iconMap = {
    Target: <Target className={className} />,
    Trash2: <Trash2 className={className} />,
    Leaf: <Leaf className={className} />,
    Bike: <Bike className={className} />,
    Zap: <Zap className={className} />,
    Recycle: <Recycle className={className} />,
    Sun: <Sun className={className} />,
    TreePine: <TreePine className={className} />,
    Globe: <Globe className={className} />,
    User: <User className={className} />,
    Trophy: <Trophy className={className} />
  };
  
  return iconName && iconMap[iconName] ? iconMap[iconName] : <Target className={className} />;
};
import ChatBot from '@/components/ChatBot';
import AuthGuard from '@/components/AuthGuard';
import Layout from '@/components/Layout';

const Community = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('challenges');
  const [serverChallenges, setServerChallenges] = useState([]);
  const [serverGroups, setServerGroups] = useState([]);
  const [serverEvents, setServerEvents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [impact, setImpact] = useState({ totalPoints: 0, history: [], rank: 0, badges: 0, currentStreak: 0 });
  const [loading, setLoading] = useState({ challenges: false, groups: false, events: false, leaderboard: false, impact: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading((s) => ({ ...s, challenges: true, groups: true, events: true, leaderboard: true, impact: true }));
        const [chData, grData, evData, lbData] = await Promise.all([
          challengesAPI.list().catch((e) => { throw e; }),
          challengesAPI.groups().catch(() => []), // Fail silently for groups
          challengesAPI.events().catch(() => []), // Fail silently for events
          challengesAPI.leaderboardExtended().catch(() => challengesAPI.leaderboard().catch((e) => { throw e; })) // Try extended first
        ]);
        if (Array.isArray(chData)) setServerChallenges(chData);
        if (Array.isArray(grData)) setServerGroups(grData);
        if (Array.isArray(evData)) setServerEvents(evData);
        if (Array.isArray(lbData)) setLeaderboard(lbData);
      } catch (e) {
        setError(e?.message || 'Failed to load challenges');
      } finally {
        setLoading((s) => ({ ...s, challenges: false, groups: false, events: false, leaderboard: false }));
      }
      try {
        const me = await challengesAPI.me();
        setImpact({ 
          totalPoints: me.totalPoints || 0, 
          history: me.history || [],
          rank: me.rank || 0,
          badges: me.badges || 0,
          badgesList: me.badgesList || [],
          currentStreak: me.currentStreak || 0,
          longestStreak: me.longestStreak || 0
        });
      } catch {
        // likely 401 when not logged in; keep defaults
      } finally {
        setLoading((s) => ({ ...s, impact: false }));
      }
    })();
  }, []);

  // Make sure we always have at least a few entries in the leaderboard, even if server data is not available
  const displayLeaderboard = leaderboard.length > 0
    ? leaderboard.map((u, idx) => {      
      return {
        rank: idx + 1,
        name: u.userId ? (
          // First check if userId is an object with name
          (typeof u.userId === 'object' && u.userId.name) ||
          // Then try email if name isn't available
          (typeof u.userId === 'object' && u.userId.email) ||
          // If userId is a string (ID only), use that
          (typeof u.userId === 'string' ? `User ${idx + 1}` : `User ${idx + 1}`)
        ) : `User ${idx + 1}`,
        points: u.totalPoints || 0,
        currentStreak: u.currentStreak || 0,
        badges: u.badges || 0,
        avatar: (u.userId && typeof u.userId === 'object' && u.userId.profile && u.userId.profile.avatar && u.userId.profile.avatar.url) ? (
          <Avatar className="h-6 w-6"><AvatarImage src={u.userId.profile.avatar.url} /><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
        ) : <User className="h-6 w-6" />
      };
    })
    : [];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  // Helper to check if a challenge is completed
  const isChallengeCompleted = (challenge) => {
    // Check multiple ways a challenge can be marked as completed
    return !!(
      challenge.completed || 
      challenge.completedAt || 
      challenge.userCompleted ||
      challenge.isCompleted ||
      (challenge.status && challenge.status === 'completed')
    );
  };

  return (
    <div className="p-3 sm:p-6 space-y-3 sm:space-y-6 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      <Toaster position="top-center" toastOptions={{ duration: 2200 }} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gradient">Community Hub</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Connect, compete, and create positive environmental impact together</p>
        </div>
        {/* Community Stats Summary */}
        <div className="flex gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{serverChallenges.length} Challenges</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded-lg">
            <Users className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">{serverGroups.length} Groups</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 rounded-lg">
            <Calendar className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">{serverEvents.length} Events</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search challenges, groups, events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-sm"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-3 sm:space-y-6">
          {loading.challenges && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading challenges...</span>
            </div>
          )}
          {!loading.challenges && serverChallenges.length === 0 && (
            <div className="bg-muted/50 border border-dashed rounded-lg p-8 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No Challenges Available</h3>
              <p className="text-sm text-muted-foreground">
                There are no active challenges at the moment. Check back soon for new sustainability challenges!
              </p>
            </div>
          )}
          {!loading.challenges && serverChallenges.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {serverChallenges.filter(ch => 
              !searchQuery || 
              ch.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              ch.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              ch.category?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(challenge => (
              <Card key={challenge._id || challenge.id} className="card-gradient hover-lift">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-2xl sm:text-3xl">
                      {getIconComponent(challenge.image, challenge.iconClass || 'h-6 w-6')}
                    </div>
                    <Badge className={getDifficultyColor(challenge.difficulty) + ' text-xs'}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg">{challenge.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{challenge.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span>{challenge.participants || 0} joined</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span>{challenge.timeRemaining || 'Ongoing'}</span>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{challenge.progress || 0}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-1.5 sm:h-2 progress-eco" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1 text-success">
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium">{challenge.reward || `${challenge.points || 0} eco-points`}</span>
                    </div>
                    {/* Button state maps to completion & auth */}
                    <Button
                      size="sm"
                      className={`${isChallengeCompleted(challenge) ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gradient-primary hover:shadow-medium text-white'} text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 disabled:opacity-60 border-0`}
                      disabled={isChallengeCompleted(challenge)}
                      aria-label={isChallengeCompleted(challenge) ? "Challenge already completed" : "Join this challenge"}
                      title={isChallengeCompleted(challenge) ? "You've already completed this challenge" : "Join this challenge to earn eco-points"}
                      onClick={async () => {
                        try {
                          if (!isChallengeCompleted(challenge)) {
                            // Optimistic update: mark as completed locally first
                            setServerChallenges(prev => (Array.isArray(prev) && prev.length > 0)
                              ? prev.map(c => c._id === challenge._id ? { ...c, completed: true } : c)
                              : prev
                            );
                            
                            // Complete challenge on server
                            const result = await challengesAPI.complete(challenge._id);
                            
                            // Show success message
                            toast.success('🎉 Challenge completed! Points added to your account.');
                            
                            // Refresh all data to ensure consistency
                            const [chData, lbData] = await Promise.all([
                              challengesAPI.list(),
                              challengesAPI.leaderboardExtended().catch(() => challengesAPI.leaderboard())
                            ]);
                            
                            if (Array.isArray(chData)) {
                              setServerChallenges(chData);
                            }
                            
                            if (Array.isArray(lbData)) setLeaderboard(lbData);
                            
                            try { 
                              const me = await challengesAPI.me(); 
                              setImpact({ 
                                totalPoints: me.totalPoints || 0, 
                                history: me.history || [],
                                rank: me.rank || 0,
                                badges: me.badges || 0,
                                badgesList: me.badgesList || [],
                                currentStreak: me.currentStreak || 0,
                                longestStreak: me.longestStreak || 0
                              }); 
                            } catch {
                              // Silently handle missing user data
                            }
                          }
                        } catch (e) {
                          // Revert optimistic update on error
                          setServerChallenges(prev => (Array.isArray(prev) && prev.length > 0)
                            ? prev.map(c => c._id === challenge._id ? { ...c, completed: false } : c)
                            : prev
                          );
                          
                          if (e?.status === 401) {
                            toast.error('Please log in to join challenges.');
                          } else if (e?.status === 409) {
                            // Challenge already completed - just update UI
                            toast.success('Challenge already completed!');
                            setServerChallenges(prev => (Array.isArray(prev) && prev.length > 0)
                              ? prev.map(c => c._id === challenge._id ? { ...c, completed: true } : c)
                              : prev
                            );
                          } else if (e?.status === 400 && e?.message?.includes('ID format')) {
                            console.error('Invalid challenge ID format:', challenge._id || challenge.id);
                            toast.error('Error: Invalid challenge format. Please try a different challenge.');
                          } else {
                            console.error('Challenge completion error:', e);
                            toast.error(e?.message || 'Failed to join challenge');
                          }
                        }
                      }}
                    >
                      {isChallengeCompleted(challenge) ? (
                        <>
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-white" />
                          <span className="text-white font-medium">Completed</span>
                        </>
                      ) : (
                        <span className="text-white">Join Challenge</span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-3 sm:space-y-6">
          {loading.groups && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading groups...</span>
            </div>
          )}
          {!loading.groups && serverGroups.length === 0 && (
            <div className="bg-muted/50 border border-dashed rounded-lg p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No Groups Yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to create a sustainability group and connect with like-minded individuals!
              </p>
            </div>
          )}
          {!loading.groups && serverGroups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {serverGroups.filter(gr => 
              !searchQuery || 
              gr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              gr.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              gr.category?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(group => (
              <Card key={group._id || group.id} className="card-gradient hover-lift">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl sm:text-4xl">
                      {getIconComponent(group.avatar, group.iconClass || 'h-6 w-6')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base sm:text-lg">{group.name}</CardTitle>
                        {group.active && (
                          <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs sm:text-sm">{group.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                      <div className="text-base sm:text-lg font-bold text-foreground">
                        {group.members.toLocaleString()}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Members</div>
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-foreground">{group.posts}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-foreground flex items-center justify-center gap-1">
                        {group.rating || group.averageRating || '-'}<Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">{group.location}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant={group.joined ? "destructive" : "outline"}
                      className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                      onClick={async () => {
                        try {
                          if (group.joined) {
                            await challengesAPI.leaveGroup(group._id);
                            toast.success('Left the group');
                          } else {
                            await challengesAPI.joinGroup(group._id);
                            toast.success('Joined the group!');
                          }
                          // Refresh groups list
                          const grData = await challengesAPI.groups();
                          if (Array.isArray(grData)) setServerGroups(grData);
                        } catch (e) {
                          if (e?.status === 401) {
                            toast.error('Please log in to join groups.');
                          } else if (e?.status === 409) {
                            toast.error('Already joined this group.');
                          } else {
                            toast.error(e?.message || 'Failed to join group');
                          }
                        }
                      }}
                    >
                      {group.joined ? 'Leave Group' : 'Join Group'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-3 sm:space-y-6">
          {loading.events && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading events...</span>
            </div>
          )}
          {!loading.events && serverEvents.length === 0 && (
            <div className="bg-muted/50 border border-dashed rounded-lg p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No Upcoming Events</h3>
              <p className="text-sm text-muted-foreground">
                There are no upcoming community events at the moment. Check back soon!
              </p>
            </div>
          )}
          {!loading.events && serverEvents.length > 0 && (
          <div className="space-y-2 sm:space-y-4">
            {serverEvents.filter(ev => 
              !searchQuery || 
              ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              ev.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              ev.location?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(event => (
              <Card key={event._id || event.id} className="card-gradient hover-lift">
                <CardContent className="p-3 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-6">
                    <div className="sm:col-span-3">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl sm:text-3xl">
                              {getIconComponent(event.avatar, event.iconClass || 'h-6 w-6')}
                            </div>
                            <h3 className="text-base sm:text-xl font-bold text-foreground">{event.title}</h3>
                          </div>
                          <Badge variant="outline" className="text-xs sm:text-sm">{event.organizer}</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{event.description}</p>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{event.date} at {event.time}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{event.attendees}/{event.maxAttendees} attending</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-2 sm:gap-3">
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-foreground">{event.attendees}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">people attending</div>
                      </div>
                      <Button 
                        className={`w-full ${event.joined ? 'btn-destructive' : 'btn-hero'} text-xs sm:text-base px-3 sm:px-5 py-2 sm:py-3`}
                        onClick={async () => {
                          try {
                            if (event.joined) {
                              await challengesAPI.leaveEvent(event._id);
                              toast.success('Left the event');
                            } else {
                              await challengesAPI.joinEvent(event._id);
                              toast.success('Joined the event!');
                            }
                            // Refresh events list
                            const evData = await challengesAPI.events();
                            if (Array.isArray(evData)) setServerEvents(evData);
                          } catch (e) {
                            if (e?.status === 401) {
                              toast.error('Please log in to join events.');
                            } else if (e?.status === 409) {
                              toast.error('Already joined this event.');
                            } else if (e?.status === 400 && e?.message?.includes('capacity')) {
                              toast.error('This event is at full capacity.');
                            } else {
                              toast.error(e?.message || 'Failed to join event');
                            }
                          }
                        }}
                      >
                        {event.joined ? 'Leave Event' : 'Join Event'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-3 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {/* Monthly Leaderboard */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <span className="text-base sm:text-lg">Monthly Leaderboard</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Top contributors this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayLeaderboard && displayLeaderboard.length > 0 ? displayLeaderboard.map(user => (
                  <div key={user.rank} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg border border-border/50">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      user.rank === 2 ? 'bg-gray-100 text-gray-700' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-700' :
                          'bg-muted text-muted-foreground'
                      }`}>
                      #{user.rank}
                    </div>
                    <div className="text-lg sm:text-2xl">{user.avatar}</div>

                    <div className="flex-1">
                      <div className="font-medium text-xs sm:text-base text-foreground">{user.name || `User ${user.rank}`}</div>
                      <div className="text-[10px] sm:text-sm text-muted-foreground">
                        {user.currentStreak || 0} day streak • {user.badges || 0} badges
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-xs sm:text-base text-foreground">{(user.points || 0).toLocaleString()}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">eco-points</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center p-4 text-muted-foreground">
                    {loading.leaderboard ? 'Loading leaderboard data...' : 'No leaderboard data yet. Complete challenges to appear on the leaderboard!'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Stats */}
            <Card className="card-eco">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-base sm:text-lg">Your Impact</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your community contributions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-6">
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">{impact.totalPoints || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Eco-Points</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">{impact.rank || '-'}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Rank</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">{impact.badges || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Badges</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">{impact.currentStreak || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Day Streak</div>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="font-medium text-xs sm:text-base text-foreground">Recent Achievements</h4>
                  {/* History from backend (still basic; badges TBD) */}
                  <div className="space-y-1 sm:space-y-2">
                    {impact.history && impact.history.length > 0 ? impact.history.slice(0, 4).map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 bg-success/10 rounded-lg">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                        <span className="text-xs sm:text-sm">Completed {h.title || 'a challenge'}</span>
                      </div>
                    )) : (
                      <div className="text-xs sm:text-sm text-muted-foreground">No recent achievements yet</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      <ChatBot />
    </div>
  );
};

const CommunityPage = () => {
  return (
    <AuthGuard intent="community">
      <Layout>
        <Community />
      </Layout>
    </AuthGuard>
  );
};

export default CommunityPage;