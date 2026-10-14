import type { Role } from '@baymax/shared';

export interface TabConfig {
  name: string;
  title: string;
  icon: string;
  activeIcon: string;
  /** Only show on wide layouts (the sidebar), e.g. Profile for patients. */
  wideOnly?: boolean;
}

export const TABS: Record<Role, TabConfig[]> = {
  patient: [
    { name: 'home', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
    {
      name: 'care',
      title: 'Appointments',
      icon: 'calendar-blank-outline',
      activeIcon: 'calendar-check',
    },
    { name: 'check', title: 'Symptoms', icon: 'stethoscope', activeIcon: 'stethoscope' },
    { name: 'pharmacy', title: 'Pharmacy', icon: 'pill', activeIcon: 'pill' },
    { name: 'community', title: 'Community', icon: 'forum-outline', activeIcon: 'forum' },
    {
      name: 'profile',
      title: 'Profile',
      icon: 'account-circle-outline',
      activeIcon: 'account-circle',
      wideOnly: true,
    },
  ],
  doctor: [
    {
      name: 'home',
      title: 'Dashboard',
      icon: 'view-dashboard-outline',
      activeIcon: 'view-dashboard',
    },
    {
      name: 'care',
      title: 'Appointments',
      icon: 'calendar-blank-outline',
      activeIcon: 'calendar-check',
    },
    { name: 'availability', title: 'Availability', icon: 'clock-outline', activeIcon: 'clock' },
    { name: 'community', title: 'Community', icon: 'forum-outline', activeIcon: 'forum' },
    {
      name: 'profile',
      title: 'Profile',
      icon: 'account-circle-outline',
      activeIcon: 'account-circle',
    },
  ],
};
