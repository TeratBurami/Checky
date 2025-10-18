import { type Sidebar } from './types';
import { icons } from '@/components/icon';

export const SidebarData: Sidebar[] = [
    {
        name: 'Dashboard',
        link: '/',
        icon: icons.LayoutDashboard({}),
        role: 'all'
    },
    {
        name: 'Courses',
        link: '/courses',
        icon: icons.BookOpen({}),
        role: 'student'
    },
    {
        name: 'Rubrics',
        link: '/rubrics',
        icon: icons.FileText({}),
        role: 'teacher'
    }
]