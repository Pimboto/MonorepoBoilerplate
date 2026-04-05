'use client';

import { changePasswordSchema, updateProfileSchema } from '@cocostudio/shared';
import { Avatar, Card, Chip, Input, Spinner, toast } from '@heroui/react';
// Añadimos Monitor, Mobile, Global para la mejora visual
import {
  Camera,
  Eye,
  EyeSlash,
  Global,
  LogoutCurve,
  Mobile,
  Monitor,
  Trash,
} from 'iconsax-reactjs';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ThemeSwitch } from '@/components/theme-switch';
import { CustomButton } from '@/components/ui/CustomButton';
import { useAuth } from '@/context/auth-context';
import { SIGN_OUT } from '@/lib/graphql/auth';
import {
  CHANGE_PASSWORD,
  MY_SESSIONS,
  REVOKE_SESSION,
  UPDATE_PROFILE,
} from '@/lib/graphql/profile';
import { graphqlClient } from '@/lib/graphql-client';
import { useUploadThing } from '@/lib/uploadthing';

interface Session {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper mejorado (Nativo, sin librerías) para obtener icono y nombre limpio
function getSessionDetails(uaString: string | null) {
  if (!uaString) return { name: 'Unknown Device', type: 'desktop' };

  const ua = uaString.toLowerCase();
  let os = 'Unknown OS';
  let type = 'desktop';

  // Detectar OS
  if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('android')) {
    os = 'Android';
    type = 'mobile';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
    type = 'mobile';
  } else if (ua.includes('linux')) os = 'Linux';

  // Detectar Navegador
  let browser = 'Browser';
  if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opr') || ua.includes('opera')) browser = 'Opera';

  return { name: `${os} / ${browser}`, type };
}

const PasswordToggle = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground transition-colors cursor-pointer"
  >
    {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
  </button>
);

export default function SettingsPage() {
  const router = useRouter();
  const { user, refetchUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionToken, setCurrentSessionToken] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);

  const { startUpload } = useUploadThing('profileImageUploader', {
    onClientUploadComplete: async res => {
      if (res?.[0]?.url) {
        await graphqlClient.request(UPDATE_PROFILE, {
          input: { image: res[0].url },
        });
        await refetchUser();
        toast.success('Profile image updated');
      }
      setUploading(false);
    },
    onUploadError: error => {
      toast.danger(`Upload failed: ${error.message}`);
      setUploading(false);
    },
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const data: { mySessions: { sessions: Session[]; currentSessionToken: string } } =
        await graphqlClient.request(MY_SESSIONS);
      setSessions(data.mySessions.sessions);
      setCurrentSessionToken(data.mySessions.currentSessionToken);
    } catch {
      toast.danger('Failed to load sessions');
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    startUpload(Array.from(files));
  };

  const handleSaveProfile = async () => {
    const validation = updateProfileSchema.safeParse({ name: name.trim() });
    if (!validation.success) {
      toast.danger(validation.error.errors[0]?.message || 'Invalid input');
      return;
    }
    setSavingProfile(true);
    try {
      await graphqlClient.request(UPDATE_PROFILE, {
        input: { name: validation.data.name },
      });
      await refetchUser();
      toast.success('Profile updated');
    } catch {
      toast.danger('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const validation = changePasswordSchema.safeParse({ currentPassword, newPassword });
    if (!validation.success) {
      toast.danger(validation.error.errors[0]?.message || 'Invalid input');
      return;
    }
    setSavingPassword(true);
    try {
      await graphqlClient.request(CHANGE_PASSWORD, {
        input: { currentPassword, newPassword },
      });
      setCurrentPassword('');
      setNewPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      toast.success('Password changed');
    } catch {
      toast.danger('Failed to change password. Check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevokeSession = async (token: string, sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await graphqlClient.request(REVOKE_SESSION, { sessionToken: token });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Session revoked');
    } catch {
      toast.danger('Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await graphqlClient.request(SIGN_OUT);
      await refetchUser();
      router.push('/login');
    } catch {
      toast.danger('Failed to sign out');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl">Settings</h1>
        <p className="text-default-400 mt-1">Manage your account, appearance, and security</p>
      </div>

      {/* Profile Section - INTACTO */}
      <Card className="bg-content1/50 border border-border/50">
        <Card.Header className="px-6 pt-6 pb-0">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Profile
          </h2>
        </Card.Header>
        <Card.Content className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar size="lg" className="h-16 w-16">
                {user?.image ? <Avatar.Image alt={user.name} src={user.image} /> : null}
                <Avatar.Fallback className="text-lg">{getInitials(user?.name)}</Avatar.Fallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? <Spinner size="sm" /> : <Camera size={20} className="text-white" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-default-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="profile-name" className="text-sm font-medium mb-1.5 block">
                Display name
              </label>
              <Input
                id="profile-name"
                value={name}
                onChange={e => setName(e.target.value)}
                variant="primary"
                fullWidth
              />
            </div>
            <CustomButton
              onPress={handleSaveProfile}
              isPending={savingProfile}
              isDisabled={name === user?.name || !name.trim()}
              size="sm"
            >
              Save
            </CustomButton>
          </div>
        </Card.Content>
      </Card>

      {/* Appearance Section - INTACTO */}
      <Card className="bg-content1/50 border border-border/50">
        <Card.Header className="px-6 pt-6 pb-0">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Appearance
          </h2>
        </Card.Header>
        <Card.Content className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-default-500">Switch between light and dark mode</p>
            </div>
            <ThemeSwitch />
          </div>
        </Card.Content>
      </Card>

      {/* Password Section - INTACTO */}
      <Card className="bg-content1/50 border border-border/50">
        <Card.Header className="px-6 pt-6 pb-0">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Password
          </h2>
        </Card.Header>
        <Card.Content className="px-6 py-5 space-y-3">
          <div>
            <label htmlFor="current-password" className="text-sm font-medium mb-1.5 block">
              Current password
            </label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                variant="primary"
                fullWidth
                autoComplete="current-password"
              />
              <PasswordToggle
                visible={showCurrentPassword}
                onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-password" className="text-sm font-medium mb-1.5 block">
              New password
            </label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                variant="primary"
                fullWidth
                autoComplete="new-password"
              />
              <PasswordToggle
                visible={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <CustomButton
              onPress={handleChangePassword}
              isPending={savingPassword}
              isDisabled={!currentPassword || !newPassword}
              size="sm"
            >
              Change password
            </CustomButton>
          </div>
        </Card.Content>
      </Card>

      {/* Sessions Section - MEJORADO */}
      <Card className="bg-content1/50 border border-border/50">
        <Card.Header className="px-6 pt-6 pb-0">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Active Sessions
          </h2>
        </Card.Header>
        <Card.Content className="px-6 py-5">
          {loadingSessions ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-default-500">No active sessions</p>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => {
                const isCurrent = session.token === currentSessionToken;
                const { name: deviceName, type } = getSessionDetails(session.userAgent);
                const DeviceIcon = type === 'mobile' ? Mobile : Monitor;

                return (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                      isCurrent
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-default-50 border-border/50 hover:border-default-300'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Icono diferenciado */}
                      <div
                        className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${
                          isCurrent ? 'bg-primary' : 'bg-default-200 text-default-500'
                        }`}
                      >
                        <DeviceIcon size={20} variant="Bold" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold truncate text-foreground">
                            {deviceName}
                          </p>
                          {isCurrent && (
                            <Chip
                              size="sm"
                              color="default"
                              variant="primary"
                              className="h-5 px-1 text-[10px] font-bold uppercase"
                            >
                              Current
                            </Chip>
                          )}
                        </div>
                        <p className="text-xs text-default-500 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Global size={12} className="text-default-400" />
                            {session.ipAddress || 'Unknown IP'}
                          </span>
                          <span>&middot;</span>
                          <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>

                    {!isCurrent && (
                      <CustomButton
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        onPress={() => handleRevokeSession(session.token, session.id)}
                        isPending={revokingId === session.id}
                        className="text-danger hover:bg-danger/10 hover:text-danger ml-2"
                      >
                        <Trash size={18} />
                      </CustomButton>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Sign Out Section - INTACTO */}
      <Card className="bg-content1/50 border border-danger/20">
        <Card.Content className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-danger">Sign out</p>
              <p className="text-xs text-default-500">End your current session</p>
            </div>
            <CustomButton variant="danger" onPress={handleSignOut} size="sm">
              <LogoutCurve size={16} />
              Sign Out
            </CustomButton>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
