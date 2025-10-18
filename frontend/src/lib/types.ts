import { type ReactNode } from 'react';

export interface Sidebar {
  name: string;
  link: string;
  icon: ReactNode;
  role: 'teacher' | 'student' | 'all';
}