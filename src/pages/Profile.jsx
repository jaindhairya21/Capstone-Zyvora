import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Bluetooth, Settings, FileText, ChevronRight, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { base44 } from '@/api/base44Client';

function ProfileSection({ title, children }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">{title}</p>
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value, onClick, trailing, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition-colors ${danger ? 'hover:bg-destructive/5' : ''}`}
      disabled={!onClick && !trailing}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${danger ? 'text-destructive' : 'text-muted-foreground'}`} />
      <span className={`text-sm flex-1 ${danger ? 'text-destructive' : 'text-foreground'}`}>{label}</span>
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      {trailing}
      {onClick && !trailing && (
        <ChevronRight className={`w-4 h-4 ${danger ? 'text-destructive/50' : 'text-muted-foreground'}`} />
      )}
    </button>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // In a real app, this would call an API to delete the account
    await new Promise(r => setTimeout(r, 1200));
    base44.auth.logout();
  };

  return (
    <div
      className="px-5 space-y-6 pb-8"
      style={{ paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top) + 3rem))' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Profile & Settings</h1>
      </div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-5 flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xl font-semibold text-primary">JD</span>
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">John Doe</p>
          <p className="text-xs text-muted-foreground">Age 52 · ACL Recovery</p>
          <p className="text-xs text-primary mt-0.5">Goal: 120° flexion</p>
        </div>
      </motion.div>

      {/* Personal Info */}
      <ProfileSection title="Personal">
        <ProfileRow icon={User} label="Name" value="John Doe" onClick={() => {}} />
        <ProfileRow icon={User} label="Age" value="52" onClick={() => {}} />
        <ProfileRow icon={User} label="Recovery Mode" value="ACL Recovery" onClick={() => {}} />
        <ProfileRow icon={User} label="Physiotherapy Goal" value="120°" onClick={() => {}} />
      </ProfileSection>

      {/* Device */}
      <ProfileSection title="Device">
        <ProfileRow icon={Bluetooth} label="Pair Device" value="Zyvora K1" onClick={() => {}} />
        <ProfileRow icon={Bluetooth} label="Firmware" value="v2.1.4" />
      </ProfileSection>

      {/* Settings */}
      <ProfileSection title="Settings">
        <ProfileRow icon={Settings} label="Units" value="Degrees (°)" onClick={() => {}} />
        <ProfileRow
          icon={Settings}
          label="Notifications"
          trailing={
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          }
        />
      </ProfileSection>

      {/* Reports */}
      <ProfileSection title="Reports">
        <ProfileRow icon={FileText} label="Export Report" onClick={() => {}} />
        <ProfileRow icon={FileText} label="Share with Physiotherapist" onClick={() => {}} />
      </ProfileSection>

      {/* Sign Out */}
      <Button
        variant="ghost"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 rounded-2xl h-12"
        onClick={() => base44.auth.logout()}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>

      {/* Danger Zone */}
      <ProfileSection title="Danger Zone">
        <ProfileRow
          icon={Trash2}
          label="Delete Account"
          onClick={() => setShowDeleteDialog(true)}
          danger
        />
      </ProfileSection>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-3xl mx-4 max-w-sm border-destructive/20">
          <AlertDialogHeader className="items-center text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-center leading-relaxed">
              This will permanently delete all your sessions, progress data, and account information.{' '}
              <span className="font-semibold text-foreground">This cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="px-1 pb-1">
            <p className="text-xs text-muted-foreground mb-2 text-center">
              Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-center font-mono focus:outline-none focus:border-destructive transition-colors select-text"
              autoCapitalize="characters"
            />
          </div>

          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl h-11 disabled:opacity-40"
            >
              {isDeleting ? 'Deleting…' : 'Delete my account'}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(''); }}
              className="w-full rounded-xl h-11 mt-0"
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}