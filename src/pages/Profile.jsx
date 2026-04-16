import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Bluetooth, Settings, FileText, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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

function ProfileRow({ icon: Icon, label, value, onClick, trailing }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition-colors"
      disabled={!onClick}
    >
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-foreground flex-1">{label}</span>
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      {trailing}
      {onClick && !trailing && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="px-5 pt-14 space-y-6 pb-8">
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

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 rounded-2xl h-12"
        onClick={() => base44.auth.logout()}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}