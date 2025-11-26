import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Translation keys
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.myTasks': 'My Tasks',
    'nav.calendar': 'Calendar',
    'nav.reports': 'Reports',
    'nav.team': 'Team',
    'nav.settings': 'Settings',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.refresh': 'Refresh',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    'common.language': 'Language',
    'common.welcome': 'Welcome',
    
    // General
    'Summary': 'Summary',
    'Details': 'Details',
    'Events': 'Events',
    'Updates': 'Updates',
    'Project Milestones': 'Project Milestones',
    'Documents': 'Documents',
    'Quotes': 'Quotes',
    'Cases': 'Cases',
    'Invoices': 'Invoices',
    'Edge Documents': 'Edge Documents',
    'Tasks': 'Tasks',
    'Timelog': 'Timelog',
    'Related Tasks': 'Related Tasks',
    'Back': 'Back',
    'Settings': 'Settings',
    'Filters': 'Filters',
    'Add Task': 'Add Task',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.tagline': 'Modern task management for productive teams',
    'auth.quickDemo': 'Quick Demo Access',
    'auth.quickDemoDesc': 'Try TaskFlow instantly with demo data',
    'auth.demoLogin': 'Enter Demo',
    'auth.demoAccounts': 'Demo Accounts',
    'auth.adminAccount': 'Admin',
    'auth.developerAccount': 'Developer',
    'auth.designerAccount': 'Designer',
    'auth.demoPassword': 'Password',
    'auth.accountCreated': 'Account created successfully',
    'auth.signOut': 'Sign Out',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to TaskFlow',
    'dashboard.overviewCards.totalProjects': 'Total Projects',
    'dashboard.overviewCards.activeTasks': 'Active Tasks',
    'dashboard.overviewCards.completedTasks': 'Completed Tasks',
    'dashboard.overviewCards.teamMembers': 'Team Members',
    'dashboard.recentProjects': 'Recent Projects',
    'dashboard.upcomingDeadlines': 'Upcoming Deadlines',
    'dashboard.activityFeed': 'Recent Activity',
    
    // Projects
    'projects.title': 'Projects',
    'projects.createNew': 'Create New Project',
    'projects.allProjects': 'All Projects',
    'projects.myProjects': 'My Projects',
    'projects.recentProjects': 'Recent Projects',
    'projects.projectName': 'Project Name',
    'projects.description': 'Description',
    'projects.category': 'Category',
    'projects.priority': 'Priority',
    'projects.dueDate': 'Due Date',
    'projects.status': 'Status',
    'projects.progress': 'Progress',
    'projects.members': 'Members',
    
    // Tasks
    'tasks.title': 'Tasks',
    'tasks.createNew': 'Create New Task',
    'tasks.myTasks': 'My Tasks',
    'tasks.allTasks': 'All Tasks',
    'tasks.taskName': 'Task Name',
    'tasks.assignee': 'Assignee',
    'tasks.priority.high': 'High',
    'tasks.priority.medium': 'Medium',
    'tasks.priority.low': 'Low',
    'tasks.status.todo': 'To Do',
    'tasks.status.inProgress': 'In Progress',
    'tasks.status.review': 'Review',
    'tasks.status.done': 'Done',
    
    // Calendar
    'calendar.title': 'Calendar',
    'calendar.today': 'Today',
    'calendar.month': 'Month',
    'calendar.week': 'Week',
    'calendar.day': 'Day',
    'calendar.events': 'Events',
    'calendar.createEvent': 'Create Event',
    
    // Reports
    'reports.title': 'Reports',
    'reports.projectProgress': 'Project Progress',
    'reports.taskCompletion': 'Task Completion',
    'reports.teamPerformance': 'Team Performance',
    'reports.timeTracking': 'Time Tracking',
    
    // Team
    'team.title': 'Team',
    'team.members': 'Team Members',
    'team.addMember': 'Add Member',
    'team.role': 'Role',
    'team.email': 'Email',
    'team.status': 'Status',
    'team.lastActive': 'Last Active',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.preferences': 'Preferences',
    'settings.notifications': 'Notifications',
    'settings.security': 'Security',
    'settings.integrations': 'Integrations',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.timezone': 'Timezone',
    
    // Categories
    'category.web_development': 'Web Development',
    'category.mobile_development': 'Mobile Development',
    'category.design': 'Design',
    'category.marketing': 'Marketing',
    'category.research': 'Research',
    'category.operations': 'Operations',
    'category.finance': 'Finance',
    'category.other': 'Other',
    
    // View modes
    'view.list': 'List View',
    'view.kanban': 'Kanban View',
    'view.calendar': 'Calendar View',
    'view.timeline': 'Timeline View',
    'view.workload': 'Workload View',
    
    // Messages
    'message.taskCreated': 'Task created successfully',
    'message.taskUpdated': 'Task updated successfully',
    'message.taskDeleted': 'Task deleted successfully',
    'message.projectCreated': 'Project created successfully',
    'message.projectUpdated': 'Project updated successfully',
    'message.projectDeleted': 'Project deleted successfully',
    'message.error': 'An error occurred',
    'message.success': 'Operation completed successfully',
  },
  vi: {
    // Navigation
    'nav.dashboard': 'Bảng điều khiển',
    'nav.projects': 'Dự án',
    'nav.myTasks': 'Nhiệm vụ của tôi',
    'nav.calendar': 'Lịch',
    'nav.reports': 'Báo cáo',
    'nav.team': 'Nhóm',
    'nav.settings': 'Cài đặt',
    
    // Common
    'common.loading': 'Đang tải...',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.delete': 'Xóa',
    'common.edit': 'Chỉnh sửa',
    'common.create': 'Tạo mới',
    'common.update': 'Cập nhật',
    'common.search': 'Tìm kiếm',
    'common.filter': 'Lọc',
    'common.export': 'Xuất',
    'common.import': 'Nhập',
    'common.refresh': 'Làm mới',
    'common.close': 'Đóng',
    'common.open': 'Mở',
    'common.yes': 'Có',
    'common.no': 'Không',
    'common.confirm': 'Xác nhận',
    'common.language': 'Ngôn ngữ',
    'common.welcome': 'Chào mừng',
    
    // General
    'Summary': 'Tổng quan',
    'Details': 'Chi tiết',
    'Events': 'Sự kiện',
    'Updates': 'Cập nhật',
    'Project Milestones': 'Mốc dự án',
    'Documents': 'Tài liệu',
    'Quotes': 'Báo giá',
    'Cases': 'Trường hợp',
    'Invoices': 'Hóa đơn',
    'Edge Documents': 'Tài liệu Edge',
    'Tasks': 'Nhiệm vụ',
    'Timelog': 'Nhật ký thời gian',
    'Related Tasks': 'Nhiệm vụ liên quan',
    'Back': 'Quay lại',
    'Settings': 'Cài đặt',
    'Filters': 'Bộ lọc',
    'Add Task': 'Thêm nhiệm vụ',
    
    // Auth
    'auth.signIn': 'Đăng nhập',
    'auth.signUp': 'Đăng ký',
    'auth.email': 'Email',
    'auth.password': 'Mật khẩu',
    'auth.fullName': 'Họ và tên',
    'auth.tagline': 'Quản lý nhiệm vụ hiện đại cho các nhóm làm việc hiệu quả',
    'auth.quickDemo': 'Truy cập Demo nhanh',
    'auth.quickDemoDesc': 'Thử TaskFlow ngay lập tức với dữ liệu demo',
    'auth.demoLogin': 'Vào Demo',
    'auth.demoAccounts': 'Tài khoản Demo',
    'auth.adminAccount': 'Quản trị viên',
    'auth.developerAccount': 'Lập trình viên',
    'auth.designerAccount': 'Thiết kế viên',
    'auth.demoPassword': 'Mật khẩu',
    'auth.accountCreated': 'Tạo tài khoản thành công',
    'auth.signOut': 'Đăng xuất',
    
    // Dashboard
    'dashboard.title': 'Bảng điều khiển',
    'dashboard.welcome': 'Chào mừng đến với TaskFlow',
    'dashboard.overviewCards.totalProjects': 'Tổng số dự án',
    'dashboard.overviewCards.activeTasks': 'Nhiệm vụ hoạt động',
    'dashboard.overviewCards.completedTasks': 'Nhiệm vụ hoàn thành',
    'dashboard.overviewCards.teamMembers': 'Thành viên nhóm',
    'dashboard.recentProjects': 'Dự án gần đây',
    'dashboard.upcomingDeadlines': 'Hạn chót sắp tới',
    'dashboard.activityFeed': 'Hoạt động gần đây',
    
    // Projects
    'projects.title': 'Dự án',
    'projects.createNew': 'Tạo dự án mới',
    'projects.allProjects': 'Tất cả dự án',
    'projects.myProjects': 'Dự án của tôi',
    'projects.recentProjects': 'Dự án gần đây',
    'projects.projectName': 'Tên dự án',
    'projects.description': 'Mô tả',
    'projects.category': 'Danh mục',
    'projects.priority': 'Ưu tiên',
    'projects.dueDate': 'Hạn chót',
    'projects.status': 'Trạng thái',
    'projects.progress': 'Tiến độ',
    'projects.members': 'Thành viên',
    
    // Tasks
    'tasks.title': 'Nhiệm vụ',
    'tasks.createNew': 'Tạo nhiệm vụ mới',
    'tasks.myTasks': 'Nhiệm vụ của tôi',
    'tasks.allTasks': 'Tất cả nhiệm vụ',
    'tasks.taskName': 'Tên nhiệm vụ',
    'tasks.assignee': 'Người được giao',
    'tasks.priority.high': 'Cao',
    'tasks.priority.medium': 'Trung bình',
    'tasks.priority.low': 'Thấp',
    'tasks.status.todo': 'Cần làm',
    'tasks.status.inProgress': 'Đang thực hiện',
    'tasks.status.review': 'Đánh giá',
    'tasks.status.done': 'Hoàn thành',
    
    // Calendar
    'calendar.title': 'Lịch',
    'calendar.today': 'Hôm nay',
    'calendar.month': 'Tháng',
    'calendar.week': 'Tuần',
    'calendar.day': 'Ngày',
    'calendar.events': 'Sự kiện',
    'calendar.createEvent': 'Tạo sự kiện',
    
    // Reports
    'reports.title': 'Báo cáo',
    'reports.projectProgress': 'Tiến độ dự án',
    'reports.taskCompletion': 'Hoàn thành nhiệm vụ',
    'reports.teamPerformance': 'Hiệu suất nhóm',
    'reports.timeTracking': 'Theo dõi thời gian',
    
    // Team
    'team.title': 'Nhóm',
    'team.members': 'Thành viên nhóm',
    'team.addMember': 'Thêm thành viên',
    'team.role': 'Vai trò',
    'team.email': 'Email',
    'team.status': 'Trạng thái',
    'team.lastActive': 'Hoạt động lần cuối',
    
    // Settings
    'settings.title': 'Cài đặt',
    'settings.profile': 'Hồ sơ',
    'settings.preferences': 'Tùy chọn',
    'settings.notifications': 'Thông báo',
    'settings.security': 'Bảo mật',
    'settings.integrations': 'Tích hợp',
    'settings.language': 'Ngôn ngữ',
    'settings.theme': 'Giao diện',
    'settings.timezone': 'Múi giờ',
    
    // Categories
    'category.web_development': 'Phát triển Web',
    'category.mobile_development': 'Phát triển Mobile',
    'category.design': 'Thiết kế',
    'category.marketing': 'Marketing',
    'category.research': 'Nghiên cứu',
    'category.operations': 'Vận hành',
    'category.finance': 'Tài chính',
    'category.other': 'Khác',
    
    // View modes
    'view.list': 'Dạng danh sách',
    'view.kanban': 'Dạng Kanban',
    'view.calendar': 'Dạng lịch',
    'view.timeline': 'Dạng thời gian',
    'view.workload': 'Dạng khối lượng',
    
    // Messages
    'message.taskCreated': 'Tạo nhiệm vụ thành công',
    'message.taskUpdated': 'Cập nhật nhiệm vụ thành công',
    'message.taskDeleted': 'Xóa nhiệm vụ thành công',
    'message.projectCreated': 'Tạo dự án thành công',
    'message.projectUpdated': 'Cập nhật dự án thành công',
    'message.projectDeleted': 'Xóa dự án thành công',
    'message.error': 'Đã xảy ra lỗi',
    'message.success': 'Thao tác hoàn thành thành công',
  }
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage for saved language preference
    const saved = localStorage.getItem('taskflow-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('taskflow-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}