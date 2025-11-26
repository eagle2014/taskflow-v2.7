export const mockData = {
  // Spaces for Project Workspace
  spaces: [
    {
      id: "space-1",
      name: "Marketing Projects",
      color: "#7c66d9",
      projectIds: ["1", "2", "erp-project"],
      phases: [
        { id: "phase-space-1-1", name: "Planning", color: "#0394ff", taskCount: 12 },
        { id: "phase-space-1-2", name: "In Progress", color: "#51cf66", taskCount: 8 },
        { id: "phase-space-1-3", name: "Review", color: "#ffd43b", taskCount: 5 },
        { id: "phase-space-1-4", name: "Completed", color: "#22c55e", taskCount: 15 }
      ]
    },
    {
      id: "space-2",
      name: "Test01",
      color: "#ef4444",
      projectIds: ["3"],
      phases: [
        { id: "phase-space-2-1", name: "Backlog", color: "#838a9c", taskCount: 6 },
        { id: "phase-space-2-2", name: "Development", color: "#0394ff", taskCount: 4 }
      ]
    },
    {
      id: "space-3",
      name: "Marketing Campaign",
      color: "#f97316",
      projectIds: ["4"],
      phases: [
        { id: "phase-space-3-1", name: "Strategy", color: "#8b5cf6", taskCount: 3 },
        { id: "phase-space-3-2", name: "Execution", color: "#ec4899", taskCount: 7 },
        { id: "phase-space-3-3", name: "Analysis", color: "#14b8a6", taskCount: 2 }
      ]
    }
  ],
  
  // Project Phases - phases within specific projects
  projectPhases: {
    "1": [ // E-commerce Platform Redesign
      { id: "proj-1-phase-1", name: "Discovery", color: "#8b5cf6", taskCount: 5 },
      { id: "proj-1-phase-2", name: "Design", color: "#ec4899", taskCount: 8 },
      { id: "proj-1-phase-3", name: "Development", color: "#0394ff", taskCount: 12 },
      { id: "proj-1-phase-4", name: "Testing", color: "#ffd43b", taskCount: 6 }
    ],
    "2": [ // Mobile App Development
      { id: "proj-2-phase-1", name: "Requirements", color: "#64748b", taskCount: 4 },
      { id: "proj-2-phase-2", name: "UI/UX Design", color: "#ec4899", taskCount: 6 },
      { id: "proj-2-phase-3", name: "Sprint 1", color: "#0394ff", taskCount: 8 },
      { id: "proj-2-phase-4", name: "Sprint 2", color: "#22c55e", taskCount: 5 }
    ],
    "3": [ // Brand Identity Refresh
      { id: "proj-3-phase-1", name: "Research", color: "#8b5cf6", taskCount: 3 },
      { id: "proj-3-phase-2", name: "Concepts", color: "#f97316", taskCount: 5 }
    ],
    "4": [ // Q1 Marketing Campaign
      { id: "proj-4-phase-1", name: "Planning", color: "#0394ff", taskCount: 4 },
      { id: "proj-4-phase-2", name: "Content Creation", color: "#ec4899", taskCount: 6 },
      { id: "proj-4-phase-3", name: "Distribution", color: "#22c55e", taskCount: 3 }
    ]
  },
  
  // Project Tasks - tasks mapped to phases within projects
  projectTasks: {
    "1": [
      { id: "1", phaseId: "proj-1-phase-3" },
      { id: "6", phaseId: "proj-1-phase-2" },
      { id: "12", phaseId: "proj-1-phase-3" },
      { id: "13", phaseId: "proj-1-phase-3" },
      { id: "16", phaseId: "proj-1-phase-3" },
      { id: "17", phaseId: "proj-1-phase-4" },
      { id: "19", phaseId: "proj-1-phase-3" },
      { id: "21", phaseId: "proj-1-phase-4" },
      { id: "24", phaseId: "proj-1-phase-4" },
      { id: "26", phaseId: "proj-1-phase-4" }
    ],
    "2": [
      { id: "2", phaseId: "proj-2-phase-3" },
      { id: "14", phaseId: "proj-2-phase-2" },
      { id: "15", phaseId: "proj-2-phase-2" },
      { id: "18", phaseId: "proj-2-phase-2" },
      { id: "20", phaseId: "proj-2-phase-3" },
      { id: "25", phaseId: "proj-2-phase-4" },
      { id: "29", phaseId: "proj-2-phase-3" }
    ],
    "3": [
      { id: "3", phaseId: "proj-3-phase-2" },
      { id: "7", phaseId: "proj-3-phase-2" }
    ],
    "4": [
      { id: "4", phaseId: "proj-4-phase-1" },
      { id: "8", phaseId: "proj-4-phase-2" },
      { id: "9", phaseId: "proj-4-phase-2" },
      { id: "22", phaseId: "proj-4-phase-3" },
      { id: "27", phaseId: "proj-4-phase-2" },
      { id: "30", phaseId: "proj-4-phase-3" }
    ]
  },
  
  // Custom Columns with Formulas
  customColumns: [
    {
      id: "col-1",
      name: "Total Hours",
      type: "number",
      formula: "SUM",
      sourceField: "estimated_hours",
      isCalculated: true
    },
    {
      id: "col-2",
      name: "Task Count",
      type: "number",
      formula: "COUNT",
      sourceField: "id",
      isCalculated: true
    },
    {
      id: "col-3",
      name: "Avg. Hours",
      type: "number",
      formula: "AVG",
      sourceField: "estimated_hours",
      isCalculated: true
    },
    {
      id: "col-4",
      name: "Progress %",
      type: "number",
      formula: "AVG",
      sourceField: "progress",
      isCalculated: true
    },
    {
      id: "col-5",
      name: "Budget",
      type: "currency",
      formula: null,
      sourceField: null,
      isCalculated: false
    },
    {
      id: "col-6",
      name: "Priority Score",
      type: "number",
      formula: "WEIGHTED_SUM",
      sourceField: "priority",
      isCalculated: true
    }
  ],
  
  // Workload Data for Workload View
  workloadData: [
    {
      userId: "1",
      week: "2024-01-15",
      allocatedHours: 40,
      tasks: [
        { taskId: "1", hours: 15 },
        { taskId: "6", hours: 10 },
        { taskId: "16", hours: 15 }
      ]
    },
    {
      userId: "2",
      week: "2024-01-15",
      allocatedHours: 38,
      tasks: [
        { taskId: "2", hours: 12 },
        { taskId: "12", hours: 14 },
        { taskId: "20", hours: 12 }
      ]
    },
    {
      userId: "3",
      week: "2024-01-15",
      allocatedHours: 35,
      tasks: [
        { taskId: "7", hours: 10 },
        { taskId: "15", hours: 12 },
        { taskId: "9", hours: 8 },
        { taskId: "25", hours: 5 }
      ]
    },
    {
      userId: "4",
      week: "2024-01-15",
      allocatedHours: 42,
      tasks: [
        { taskId: "4", hours: 12 },
        { taskId: "10", hours: 15 },
        { taskId: "22", hours: 15 }
      ]
    },
    {
      userId: "5",
      week: "2024-01-15",
      allocatedHours: 36,
      tasks: [
        { taskId: "5", hours: 18 },
        { taskId: "8", hours: 8 },
        { taskId: "27", hours: 10 }
      ]
    }
  ],

  users: [
    {
      id: "1",
      email: "admin@acme.com",
      name: "Admin User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      role: "admin",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      last_active: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      email: "manager@acme.com",
      name: "Project Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager",
      role: "manager",
      status: "active",
      created_at: "2024-01-02T00:00:00Z",
      last_active: "2024-01-15T09:45:00Z"
    },
    {
      id: "3",
      email: "john@acme.com",
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      role: "developer",
      status: "active",
      created_at: "2024-01-03T00:00:00Z",
      last_active: "2024-01-15T09:30:00Z"
    },
    {
      id: "4",
      email: "jane@acme.com",
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      role: "developer",
      status: "active",
      created_at: "2024-01-04T00:00:00Z",
      last_active: "2024-01-15T08:15:00Z"
    },
    {
      id: "3",
      email: "jane.smith@taskflow.com",
      name: "Jane Smith",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e4d3ba?w=150&h=150&fit=crop&crop=face",
      role: "designer",
      status: "active",
      created_at: "2024-01-03T00:00:00Z",
      last_active: "2024-01-15T11:20:00Z"
    },
    {
      id: "4",
      email: "mike.wilson@taskflow.com",
      name: "Mike Wilson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      role: "manager",
      status: "busy",
      created_at: "2024-01-04T00:00:00Z",
      last_active: "2024-01-15T08:15:00Z"
    },
    {
      id: "5",
      email: "sarah.brown@taskflow.com",
      name: "Sarah Brown",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      role: "marketer",
      status: "away",
      created_at: "2024-01-05T00:00:00Z",
      last_active: "2024-01-14T16:30:00Z"
    },
    {
      id: "6",
      email: "nguyen.van.tuan@taskflow.vn",
      name: "Nguyễn Văn Tuấn",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "developer",
      status: "active",
      created_at: "2024-01-06T00:00:00Z",
      last_active: "2024-01-28T09:15:00Z"
    },
    {
      id: "7",
      email: "tran.thi.lan@taskflow.vn",
      name: "Trần Thị Lan",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e4d3ba?w=150&h=150&fit=crop&crop=face",
      role: "designer",
      status: "busy",
      created_at: "2024-01-07T00:00:00Z",
      last_active: "2024-01-28T11:30:00Z"
    },
    {
      id: "8",
      email: "le.minh.duc@taskflow.vn",
      name: "Lê Minh Đức",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      role: "project_manager",
      status: "active",
      created_at: "2024-01-08T00:00:00Z",
      last_active: "2024-01-28T14:45:00Z"
    }
  ],
  
  categories: [
    { id: "1", name: "web_development", color: "#0394ff" },
    { id: "2", name: "mobile_development", color: "#51cf66" },
    { id: "3", name: "design", color: "#ff6b6b" },
    { id: "4", name: "marketing", color: "#ffd43b" },
    { id: "5", name: "research", color: "#ff8cc8" },
    { id: "6", name: "operations", color: "#845ef7" },
    { id: "7", name: "finance", color: "#20c997" },
    { id: "8", name: "other", color: "#838a9c" }
  ],
  
  projects: [
    {
      id: "1",
      name: "E-commerce Platform Redesign",
      description: "Complete redesign of the existing e-commerce platform with modern UI/UX",
      category: "web_development",
      priority: "high",
      status: "in_progress",
      progress: 65,
      owner_id: "1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      due_date: "2024-02-28T23:59:59Z",
      members: ["1", "2", "3"]
    },
    {
      id: "2",
      name: "Mobile App Development",
      description: "Native mobile app for iOS and Android platforms",
      category: "mobile_development",
      priority: "high",
      status: "planning",
      progress: 25,
      owner_id: "2",
      created_at: "2024-01-05T00:00:00Z",
      updated_at: "2024-01-14T15:20:00Z",
      due_date: "2024-04-15T23:59:59Z",
      members: ["2", "3", "4"]
    },
    {
      id: "3",
      name: "Brand Identity Refresh",
      description: "Complete brand identity redesign including logo, colors, and guidelines",
      category: "design",
      priority: "medium",
      status: "review",
      progress: 80,
      owner_id: "3",
      created_at: "2024-01-08T00:00:00Z",
      updated_at: "2024-01-15T09:45:00Z",
      due_date: "2024-01-30T23:59:59Z",
      members: ["3", "5"]
    },
    {
      id: "4",
      name: "Q1 Marketing Campaign",
      description: "Digital marketing campaign for Q1 product launch",
      category: "marketing",
      priority: "high",
      status: "in_progress",
      progress: 45,
      owner_id: "5",
      created_at: "2024-01-10T00:00:00Z",
      updated_at: "2024-01-15T11:00:00Z",
      due_date: "2024-03-31T23:59:59Z",
      members: ["5", "4"]
    },
    {
      id: "5",
      name: "Market Research Analysis",
      description: "Comprehensive market research for new product development",
      category: "research",
      priority: "medium",
      status: "completed",
      progress: 100,
      owner_id: "4",
      created_at: "2023-12-15T00:00:00Z",
      updated_at: "2024-01-12T14:30:00Z",
      due_date: "2024-01-15T23:59:59Z",
      members: ["4", "1"]
    },
    {
      id: "6",
      name: "HỆ THỐNG QUẢN LÝ TASKFLOW VIỆT NAM",
      description: "Phát triển hệ thống quản lý công việc chuyên biệt cho thị trường Việt Nam",
      category: "web_development",
      priority: "high",
      status: "in_progress",
      progress: 78,
      owner_id: "1",
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-28T16:45:00Z",
      due_date: "2024-04-30T23:59:59Z",
      members: ["1", "2", "3", "4", "6", "7", "8"]
    },
    {
      id: "7",
      name: "DIGITAL TRANSFORMATION 2024",
      description: "Chuyển đổi số toàn diện cho doanh nghiệp Việt Nam",
      category: "operations",
      priority: "high",
      status: "planning",
      progress: 25,
      owner_id: "4",
      created_at: "2024-01-20T00:00:00Z",
      updated_at: "2024-01-28T10:20:00Z",
      due_date: "2024-12-31T23:59:59Z",
      members: ["4", "1", "5", "6", "8"]
    }
  ],
  
  tasks: [
    {
      id: "1",
      title: "CHƯƠNG TRÌNH TRADE QUY 4 (THÁNG 10/11/2025)",
      description: "Lên kế hoạch và triển khai chương trình trade quý 4",
      project_id: "1",
      assignee_id: "1",
      reporter_id: "1",
      priority: "high",
      status: "in_progress",
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-15T09:30:00Z",
      due_date: "2024-12-30T23:59:59Z",
      estimated_hours: 90,
      actual_hours: 90
    },
    {
      id: "2",
      title: "TRIỂN KHAI DỊCH VỤ MỚI HẠCH CHỐNG GỈ VÀ GỈ SÉT VỚI TẢI",
      description: "Phát triển và triển khai dịch vụ mới",
      project_id: "2",
      assignee_id: "2",
      reporter_id: "2",
      priority: "medium",
      status: "in_progress",
      created_at: "2024-01-02T10:00:00Z",
      updated_at: "2024-01-10T16:45:00Z",
      due_date: "2024-12-30T23:59:59Z",
      estimated_hours: 72,
      actual_hours: 72
    },
    {
      id: "3",
      title: "Planning thang giao City Sale bản đặp so 16/2025",
      description: "Lập kế hoạch và triển khai sales strategy",
      project_id: "3",
      assignee_id: "3",
      reporter_id: "3",
      priority: "high",
      status: "in_progress",
      created_at: "2024-01-03T10:00:00Z",
      updated_at: "2024-01-03T10:00:00Z",
      due_date: "2024-12-25T23:59:59Z",
      estimated_hours: 75,
      actual_hours: 75
    },
    {
      id: "4",
      title: "Nghiên cứu tính năng Plum",
      description: "Research & Development của tính năng mới",
      project_id: "4",
      assignee_id: "4",
      reporter_id: "4",
      priority: "medium",
      status: "in_progress",
      created_at: "2024-01-05T10:00:00Z",
      updated_at: "2024-01-14T11:20:00Z",
      due_date: "2024-11-20T23:59:59Z",
      estimated_hours: 58,
      actual_hours: 58
    },
    {
      id: "5",
      title: "Phát triển cái chính thưc, đại lành chánh mới tổt cửa tình",
      description: "Government Relations & Business Development",
      project_id: "5",
      assignee_id: "5",
      reporter_id: "5",
      priority: "low",
      status: "todo",
      created_at: "2024-01-06T10:00:00Z",
      updated_at: "2024-01-12T15:30:00Z",
      due_date: "2024-11-30T23:59:59Z",
      estimated_hours: 180,
      actual_hours: 180
    },
    {
      id: "6",
      title: "Tối ưu hóa quy trình làm việc nội bộ",
      description: "Process optimization for internal workflows",
      project_id: "1",
      assignee_id: "1",
      reporter_id: "1",
      priority: "medium",
      status: "todo",
      created_at: "2024-01-08T10:00:00Z",
      updated_at: "2024-01-14T14:15:00Z",
      due_date: "2024-01-28T23:59:59Z",
      estimated_hours: 40,
      actual_hours: 0
    },
    {
      id: "7",
      title: "Design new logo concepts",
      description: "Create multiple logo concept variations",
      project_id: "3",
      assignee_id: "3",
      reporter_id: "3",
      priority: "high",
      status: "completed",
      created_at: "2024-01-09T10:00:00Z",
      updated_at: "2024-01-13T16:00:00Z",
      due_date: "2024-01-25T23:59:59Z",
      estimated_hours: 20,
      actual_hours: 22
    },
    {
      id: "8",
      title: "Social media content calendar",
      description: "Create content calendar for Q1 social media posts",
      project_id: "4",
      assignee_id: "5",
      reporter_id: "5",
      priority: "medium",
      status: "in_progress",
      created_at: "2024-01-10T10:00:00Z",
      updated_at: "2024-01-15T10:45:00Z",
      due_date: "2024-01-30T23:59:59Z",
      estimated_hours: 12,
      actual_hours: 8
    },
    {
      id: "9",
      title: "Email campaign templates",
      description: "Design email templates for marketing campaigns",
      project_id: "4",
      assignee_id: "3",
      reporter_id: "5",
      priority: "medium",
      status: "todo",
      created_at: "2024-01-11T10:00:00Z",
      updated_at: "2024-01-11T10:00:00Z",
      due_date: "2024-02-05T23:59:59Z",
      estimated_hours: 10,
      actual_hours: 0
    },
    {
      id: "10",
      title: "Competitor analysis report",
      description: "Analyze competitor strategies and market positioning",
      project_id: "5",
      assignee_id: "4",
      reporter_id: "4",
      priority: "high",
      status: "completed",
      created_at: "2023-12-15T10:00:00Z",
      updated_at: "2024-01-05T14:20:00Z",
      due_date: "2024-01-10T23:59:59Z",
      estimated_hours: 40,
      actual_hours: 38
    },
    {
      id: "11",
      title: "Customer survey design",
      description: "Design customer satisfaction survey questionnaire",
      project_id: "5",
      assignee_id: "1",
      reporter_id: "4",
      priority: "medium",
      status: "completed",
      created_at: "2023-12-20T10:00:00Z",
      updated_at: "2024-01-08T11:30:00Z",
      due_date: "2024-01-12T23:59:59Z",
      estimated_hours: 8,
      actual_hours: 6
    },
    {
      id: "12",
      title: "Shopping cart functionality",
      description: "Implement shopping cart add/remove/update features",
      project_id: "1",
      assignee_id: "2",
      reporter_id: "1",
      priority: "high",
      status: "todo",
      created_at: "2024-01-12T10:00:00Z",
      updated_at: "2024-01-12T10:00:00Z",
      due_date: "2024-02-01T23:59:59Z",
      estimated_hours: 28,
      actual_hours: 0
    },
    {
      id: "13",
      title: "Payment gateway integration",
      description: "Integrate Stripe payment processing",
      project_id: "1",
      assignee_id: "2",
      reporter_id: "1",
      priority: "high",
      status: "todo",
      created_at: "2024-01-13T10:00:00Z",
      updated_at: "2024-01-13T10:00:00Z",
      due_date: "2024-02-10T23:59:59Z",
      estimated_hours: 20,
      actual_hours: 0
    },
    {
      id: "14",
      title: "Mobile app navigation",
      description: "Implement bottom tab navigation for mobile app",
      project_id: "2",
      assignee_id: "2",
      reporter_id: "2",
      priority: "medium",
      status: "todo",
      created_at: "2024-01-14T10:00:00Z",
      updated_at: "2024-01-14T10:00:00Z",
      due_date: "2024-02-15T23:59:59Z",
      estimated_hours: 16,
      actual_hours: 0
    },
    {
      id: "15",
      title: "User profile screens",
      description: "Design and implement user profile management screens",
      project_id: "2",
      assignee_id: "3",
      reporter_id: "2",
      priority: "medium",
      status: "in_progress",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T11:30:00Z",
      due_date: "2024-02-20T23:59:59Z",
      estimated_hours: 18,
      actual_hours: 4
    },
    {
      id: "16",
      title: "PHÁT TRIỂN MODULE QUẢN LÝ KHO HÀNG",
      description: "Xây dựng hệ thống quản lý kho hàng tự động với AI tracking",
      project_id: "1",
      assignee_id: "1",
      reporter_id: "1",
      priority: "high",
      status: "in_progress",
      created_at: "2024-01-16T08:00:00Z",
      updated_at: "2024-01-16T14:30:00Z",
      due_date: "2024-03-15T23:59:59Z",
      estimated_hours: 120,
      actual_hours: 65
    },
    {
      id: "17",
      title: "TỐI ỨU HÓA HIỆU SUẤT WEBSITE",
      description: "Cải thiện tốc độ tải trang và performance các API calls",
      project_id: "1",
      assignee_id: "2",
      reporter_id: "1",
      priority: "medium",
      status: "todo",
      created_at: "2024-01-17T09:00:00Z",
      updated_at: "2024-01-17T09:00:00Z",
      due_date: "2024-02-28T23:59:59Z",
      estimated_hours: 40,
      actual_hours: 0
    },
    {
      id: "18",
      title: "THIẾT KẾ GIAO DIỆN MOBILE RESPONSIVE",
      description: "Design và implement responsive UI cho tất cả màn hình mobile",
      project_id: "2",
      assignee_id: "7",
      reporter_id: "8",
      priority: "high",
      status: "review",
      created_at: "2024-01-18T10:00:00Z",
      updated_at: "2024-01-18T16:45:00Z",
      due_date: "2024-02-10T23:59:59Z",
      estimated_hours: 60,
      actual_hours: 55
    },
    {
      id: "19",
      title: "TÍCH HỢP PAYMENT GATEWAY VNPAY",
      description: "Kết nối và test VNPay payment system cho người dùng Việt Nam",
      project_id: "1",
      assignee_id: "2",
      reporter_id: "1",
      priority: "high",
      status: "todo",
      created_at: "2024-01-19T08:30:00Z",
      updated_at: "2024-01-19T08:30:00Z",
      due_date: "2024-02-15T23:59:59Z",
      estimated_hours: 32,
      actual_hours: 0
    },
    {
      id: "20",
      title: "XÂY DỰNG HỆ THỐNG NOTIFICATION",
      description: "Phát triển system notification real-time với WebSocket",
      project_id: "2",
      assignee_id: "2",
      reporter_id: "2",
      priority: "medium",
      status: "in_progress",
      created_at: "2024-01-20T09:15:00Z",
      updated_at: "2024-01-20T15:20:00Z",
      due_date: "2024-03-01T23:59:59Z",
      estimated_hours: 45,
      actual_hours: 18
    },
    {
      id: "21",
      title: "KIỂM THỬ BẢO MẬT ỨNG DỤNG",
      description: "Security testing và penetration test cho toàn bộ hệ thống",
      project_id: "1",
      assignee_id: "4",
      reporter_id: "1",
      priority: "high",
      status: "todo",
      created_at: "2024-01-21T10:00:00Z",
      updated_at: "2024-01-21T10:00:00Z",
      due_date: "2024-02-25T23:59:59Z",
      estimated_hours: 80,
      actual_hours: 0
    },
    {
      id: "22",
      title: "PHÂN TÍCH DỮ LIỆU NGƯỜI DÙNG",
      description: "Analytics và reporting dashboard cho user behavior",
      project_id: "4",
      assignee_id: "5",
      reporter_id: "4",
      priority: "medium",
      status: "completed",
      created_at: "2024-01-10T11:00:00Z",
      updated_at: "2024-01-22T17:30:00Z",
      due_date: "2024-01-25T23:59:59Z",
      estimated_hours: 50,
      actual_hours: 48
    },
    {
      id: "23",
      title: "TRAINING TEAM VỀ CÔNG NGHỆ MỚI",
      description: "Tổ chức workshop về React 19 và Next.js 15 cho dev team",
      project_id: "5",
      assignee_id: "1",
      reporter_id: "4",
      priority: "low",
      status: "in_progress",
      created_at: "2024-01-22T14:00:00Z",
      updated_at: "2024-01-22T16:45:00Z",
      due_date: "2024-02-05T23:59:59Z",
      estimated_hours: 24,
      actual_hours: 12
    },
    {
      id: "24",
      title: "BẢO TRÌ HỆ THỐNG SERVER",
      description: "Maintenance và update security patches cho production servers",
      project_id: "1",
      assignee_id: "2",
      reporter_id: "1",
      priority: "medium",
      status: "todo",
      created_at: "2024-01-23T08:00:00Z",
      updated_at: "2024-01-23T08:00:00Z",
      due_date: "2024-01-30T23:59:59Z",
      estimated_hours: 16,
      actual_hours: 0
    },
    {
      id: "25",
      title: "CẬP NHẬT TÀI LIỆU KỸ THUẬT",
      description: "Update API documentation và user manual mới nhất",
      project_id: "2",
      assignee_id: "3",
      reporter_id: "2",
      priority: "low",
      status: "completed",
      created_at: "2024-01-12T09:30:00Z",
      updated_at: "2024-01-24T11:20:00Z",
      due_date: "2024-01-28T23:59:59Z",
      estimated_hours: 12,
      actual_hours: 10
    },
    {
      id: "26",
      title: "THIẾT LẬP MONITORING & ALERTING",
      description: "Configure Prometheus và Grafana cho monitoring system health",
      project_id: "1",
      assignee_id: "6",
      reporter_id: "8",
      priority: "high",
      status: "review",
      created_at: "2024-01-24T10:15:00Z",
      updated_at: "2024-01-24T16:30:00Z",
      due_date: "2024-02-08T23:59:59Z",
      estimated_hours: 35,
      actual_hours: 32
    },
    {
      id: "27",
      title: "CHIẾN LƯỢC MARKETING Q1 2024",
      description: "Xây dựng và triển khai campaign marketing cho quý 1",
      project_id: "4",
      assignee_id: "5",
      reporter_id: "4",
      priority: "high",
      status: "in_progress",
      created_at: "2024-01-25T13:00:00Z",
      updated_at: "2024-01-25T15:45:00Z",
      due_date: "2024-02-12T23:59:59Z",
      estimated_hours: 90,
      actual_hours: 45
    },
    {
      id: "28",
      title: "NGHIÊN CỨU CÔNG NGHỆ BLOCKCHAIN",
      description: "Research khả năng tích hợp blockchain vào hệ thống hiện tại",
      project_id: "5",
      assignee_id: "1",
      reporter_id: "4",
      priority: "low",
      status: "todo",
      created_at: "2024-01-26T11:00:00Z",
      updated_at: "2024-01-26T11:00:00Z",
      due_date: "2024-03-30T23:59:59Z",
      estimated_hours: 60,
      actual_hours: 0
    },
    {
      id: "29",
      title: "CUSTOMER SUPPORT CHATBOT",
      description: "Phát triển AI chatbot để hỗ trợ customer service 24/7",
      project_id: "2",
      assignee_id: "2",
      reporter_id: "2",
      priority: "medium",
      status: "in_progress",
      created_at: "2024-01-27T09:45:00Z",
      updated_at: "2024-01-27T14:20:00Z",
      due_date: "2024-03-10T23:59:59Z",
      estimated_hours: 75,
      actual_hours: 28
    },
    {
      id: "30",
      title: "BÁO CÁO HIỆU SUẤT THÁNG 1",
      description: "Tổng hợp và phân tích performance metrics tháng 1/2024",
      project_id: "4",
      assignee_id: "4",
      reporter_id: "4",
      priority: "medium",
      status: "completed",
      created_at: "2024-01-28T16:00:00Z",
      updated_at: "2024-01-30T18:30:00Z",
      due_date: "2024-02-02T23:59:59Z",
      estimated_hours: 8,
      actual_hours: 6
    },
    {
      id: "31",
      title: "SETUP CI/CD PIPELINE",
      description: "Thiết lập automated deployment pipeline với GitHub Actions",
      project_id: "6",
      assignee_id: "1",
      reporter_id: "8",
      priority: "high",
      status: "in_progress",
      created_at: "2024-01-29T08:00:00Z",
      updated_at: "2024-01-29T10:30:00Z",
      due_date: "2024-02-10T23:59:59Z",
      estimated_hours: 25,
      actual_hours: 12
    },
    {
      id: "32",
      title: "CODE REVIEW & REFACTORING",
      description: "Review và refactor legacy code để improve maintainability",
      project_id: "6",
      assignee_id: "1",
      reporter_id: "8",
      priority: "medium",
      status: "todo",
      created_at: "2024-01-30T09:15:00Z",
      updated_at: "2024-01-30T09:15:00Z",
      due_date: "2024-02-20T23:59:59Z",
      estimated_hours: 40,
      actual_hours: 0
    },
    {
      id: "33",
      title: "DATABASE MIGRATION & OPTIMIZATION",
      description: "Migrate database schema và optimize query performance",
      project_id: "6",
      assignee_id: "1",
      reporter_id: "8",
      priority: "high",
      status: "completed",
      created_at: "2024-01-25T07:30:00Z",
      updated_at: "2024-01-31T16:20:00Z",
      due_date: "2024-02-01T23:59:59Z",
      estimated_hours: 30,
      actual_hours: 28
    },
    {
      id: "34",
      title: "API DOCUMENTATION UPDATE",
      description: "Cập nhật và hoàn thiện documentation cho RESTful APIs",
      project_id: "6",
      assignee_id: "1",
      reporter_id: "8",
      priority: "low",
      status: "todo",
      created_at: "2024-02-01T10:00:00Z",
      updated_at: "2024-02-01T10:00:00Z",
      due_date: "2024-02-15T23:59:59Z",
      estimated_hours: 15,
      actual_hours: 0
    },
    {
      id: "35",
      title: "UNIT TESTING COVERAGE",
      description: "Tăng test coverage lên 90% cho core business logic",
      project_id: "6",
      assignee_id: "1",
      reporter_id: "8", 
      priority: "medium",
      status: "in_progress",
      created_at: "2024-02-02T11:30:00Z",
      updated_at: "2024-02-02T14:45:00Z",
      due_date: "2024-02-25T23:59:59Z",
      estimated_hours: 35,
      actual_hours: 15
    }
  ],
  
  events: [
    {
      id: "1",
      title: "Project Kickoff Meeting",
      description: "Initial meeting to discuss project scope and timeline",
      project_id: "1",
      creator_id: "1",
      start_date: "2024-01-22T10:00:00Z",
      end_date: "2024-01-22T11:30:00Z",
      attendees: ["1", "2", "3"],
      location: "Conference Room A",
      type: "meeting",
      created_at: "2024-01-15T09:00:00Z"
    },
    {
      id: "2",
      title: "Design Review Session",
      description: "Review and feedback session for homepage mockups",
      project_id: "1",
      creator_id: "3",
      start_date: "2024-01-25T14:00:00Z",
      end_date: "2024-01-25T15:30:00Z",
      attendees: ["1", "3", "4"],
      location: "Design Studio",
      type: "review",
      created_at: "2024-01-15T10:30:00Z"
    },
    {
      id: "3",
      title: "Sprint Planning",
      description: "Plan tasks for the upcoming sprint",
      project_id: "2",
      creator_id: "2",
      start_date: "2024-01-29T09:00:00Z",
      end_date: "2024-01-29T10:30:00Z",
      attendees: ["2", "3", "4"],
      location: "Virtual Meeting",
      type: "planning",
      created_at: "2024-01-15T11:00:00Z"
    },
    {
      id: "4",
      title: "Brand Presentation",
      description: "Present new brand identity to stakeholders",
      project_id: "3",
      creator_id: "3",
      start_date: "2024-01-31T15:00:00Z",
      end_date: "2024-01-31T16:00:00Z",
      attendees: ["1", "3", "4", "5"],
      location: "Main Conference Room",
      type: "presentation",
      created_at: "2024-01-15T12:00:00Z"
    }
  ],
  
  comments: [
    {
      id: "1",
      task_id: "1",
      author_id: "1",
      content: "Great progress on the mockups! The layout looks clean and modern.",
      created_at: "2024-01-14T15:30:00Z",
      updated_at: "2024-01-14T15:30:00Z"
    },
    {
      id: "2",
      task_id: "1",
      author_id: "3",
      content: "Thanks! I'll incorporate the feedback from yesterday's meeting and have the final version ready by tomorrow.",
      created_at: "2024-01-14T16:45:00Z",
      updated_at: "2024-01-14T16:45:00Z"
    },
    {
      id: "3",
      task_id: "4",
      author_id: "2",
      content: "The wireframes are looking good. Can we add a user onboarding flow to the first-time user experience?",
      created_at: "2024-01-14T11:20:00Z",
      updated_at: "2024-01-14T11:20:00Z"
    },
    {
      id: "4",
      task_id: "4",
      author_id: "3",
      content: "Absolutely! I'll include the onboarding flow in the next iteration.",
      created_at: "2024-01-14T14:30:00Z",
      updated_at: "2024-01-14T14:30:00Z"
    },
    {
      id: "5",
      task_id: "6",
      author_id: "1",
      content: "The brand guidelines document is comprehensive. Just a few minor adjustments needed in the color usage section.",
      created_at: "2024-01-15T09:15:00Z",
      updated_at: "2024-01-15T09:15:00Z"
    }
  ]
};

export default mockData;