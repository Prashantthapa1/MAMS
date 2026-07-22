# Employee Management System Tasks

Status values: Complete, Pending, Not Started.

## Completed Product Work
- Complete: Auth, role guards, admin/staff navigation, dashboard, employee CRUD/profile, attendance, leave, salaries, revenue, expenses, profit, reports with CSV export, and company settings
- Complete: PostgreSQL migrations, Railway configuration, GitHub Actions deployment workflow, and core README deployment documentation

## Pending Backend and Operations Work
- Complete: Add seed script with the default admin, five employees, and sample business records
- Complete: Complete README database seeding instructions after the seed script exists
- Complete: Add database-backed authentication, staff invitations, email delivery configuration, and manager access role
- Pending: Configure Railway project variables, services, and GitHub repository secrets, then perform the first production deployment

## Frontend Completion (Design Alignment)

Design references: `design/clarity_ems/DESIGN.md`, `design/login_staffsync_pro`, `design/admin_dashboard_staffsync_pro`, `design/employees_staffsync_pro`, and `design/staff_portal_staffsync_pro`.

### Shared Design System and App Shell
- Not Started: Apply the Clarity EMS indigo/blue palette, Inter typography, tonal surfaces, borders, focus rings, and status colors across the client
- Not Started: Restyle shared buttons, inputs, tables, cards, empty/loading states, and confirmation dialogs to match the design system
- Not Started: Rebuild the responsive StaffSync-style sidebar with active navigation marker, compact mobile state, and polished top bar
- Not Started: Add accessible top-bar search UI, notifications/help affordances, and a user menu/sign-out presentation
- Not Started: Use the saved company name for application branding where available

### Login Experience
- Complete: Rebuild the login page to match the supplied StaffSync login design
- Complete: Add password visibility control, remember-device UI, and accessible inline authentication feedback
- Complete: Add clearly labelled placeholder support/help and policy links until real destinations exist

### Admin Dashboard
- Complete: Restyle dashboard summary cards, charts, and recent activity table to match the admin dashboard design
- Complete: Add chart legends, metric context, and a compact attendance-rate summary panel using existing dashboard data
- Complete: Add tablet and mobile dashboard layouts

### Employees Experience
- Complete: Restyle employee list, profile links, create/edit form, and delete controls to match the employee-management design
- Complete: Add client-side employee search and status filtering
- Complete: Add pagination UI; extend the API only when server-side pagination is required
- Not Started: Add employee CSV export UI; extend the API before making it functional
- Not Started: Add robust employee photo fallback/avatar treatment and improved position/contact metadata layout

### Staff Portal
- Complete: Create a dedicated staff dashboard matching the staff portal design instead of reusing the admin dashboard
- Complete: Add staff attendance summary, current-shift/check-in state, weekly-hours summary, and attendance history presentation
- Complete: Add staff leave-request overview cards and a guided leave-request flow
- Not Started: Keep staff views responsive and ensure admin financial and employee-management UI never renders

### Remaining Admin Pages
- Not Started: Restyle attendance, leave, salaries, revenue, expenses, profit, reports, and settings with the shared design system
- Not Started: Add consistent action bars, table toolbars, filter treatments, and mobile-safe card/table variants
- Not Started: Add polished success/error notices and destructive-action feedback throughout the interface

### Frontend Quality
- Not Started: Add component tests for auth guards, role navigation, key forms, and CSV export controls
- Not Started: Run an accessibility pass for labels, keyboard navigation, focus visibility, contrast, and responsive behavior
- Not Started: Review bundle size and code-split large chart/page bundles
