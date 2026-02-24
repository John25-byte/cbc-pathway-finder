

# CBC Pathway Guidance and Placement System

## Overview
A comprehensive web application helping Kenyan Grade 9 learners choose the right Senior School pathway (STEM, Arts & Sports Science, Social Sciences) through academic performance analysis, interest assessment, and admin-managed placement. Built with React + Supabase.

---

## Pages & Features

### 1. Authentication & Landing
- **Landing page** with system overview, pathway previews (STEM = Blue, Arts & Sports = Orange, Social Sciences = Green)
- **Login/Signup** with role selection (Student, Examiner, Admin)
- Supabase Auth with email/password
- Role-based routing after login

### 2. Student Dashboard
- **My Results**: View uploaded academic scores per subject with bar charts
- **Interest Assessment**: Interactive questionnaire (~15 questions) covering analytical, creative, physical, and social preferences
- **My Recommendation**: Pathway suitability scores displayed as radar chart, showing:
  - Recommended pathway with confidence percentage
  - Explanation of why (e.g., "Strong in Math & Sciences")
  - Score breakdown: Academic (70%) + Interest (30%)
- **Apply for Pathway**: Select preferred pathway (can differ from recommendation), submit application
- **Application Status**: Track placement status (Pending → Approved / Adjusted) with timeline

### 3. Examiner Dashboard
- **Upload Results**: Enter/upload student marks per subject (form-based entry)
- **Edit Results**: Modify previously entered scores
- **Student Analytics**: View individual student performance charts
- **Confirm Data**: Mark results as verified/accurate

### 4. Admin Dashboard
- **User Management**: View/manage all users, assign roles
- **Pathway Configuration**: 
  - Set subject weights per pathway (e.g., Math weight for STEM vs Arts)
  - Configure cluster cut-off scores
  - Edit interest questionnaire scoring
- **Application Review**: List all student applications, approve or reallocate placements with notes
- **Reports & Analytics**:
  - Students per pathway (bar chart)
  - Performance trends across subjects
  - Misalignment cases (interest ≠ performance recommendation)
  - Export to PDF and CSV

### 5. Guidance Panel (Public Module)
- Accessible to all logged-in users
- **Pathway Cards** for STEM, Arts & Sports, Social Sciences, each showing:
  - Description and focus areas
  - Required subject strengths
  - Career opportunities
  - Sample university/career progression paths
- Searchable and filterable

---

## Database Schema (Supabase/PostgreSQL)

- **profiles** — user_id, full_name, school, kcpe_index (for students)
- **user_roles** — user_id, role (enum: admin, examiner, student)
- **subjects** — id, name, description
- **results** — student_id, subject_id, score, verified, examiner_id
- **interest_questions** — id, question_text, pathway_weights (JSONB)
- **interest_responses** — student_id, question_id, answer_value
- **pathways** — id, name, color, description, careers, progression
- **pathway_weights** — pathway_id, subject_id, weight_value (admin-configurable)
- **cluster_requirements** — pathway_id, min_score, required_subjects
- **recommendations** — student_id, pathway_id, academic_score, interest_score, final_score, confidence, explanation
- **applications** — student_id, chosen_pathway_id, recommended_pathway_id, status (pending/approved/adjusted), admin_notes

All tables secured with Row-Level Security policies.

---

## Recommendation Engine Logic
- Compute academic score per pathway using admin-configured subject weights
- Compute interest score from questionnaire responses mapped to pathway weights
- Final Score = (Academic × 0.7) + (Interest × 0.3)
- Generate confidence level and text explanation
- Implemented as a Supabase Edge Function triggered on demand

---

## Design System
- Clean, student-friendly UI with shadcn/ui components
- Color-coded pathways: STEM (Blue), Arts & Sports (Orange), Social Sciences (Green)
- Recharts for bar graphs, radar charts, and analytics
- Responsive design for desktop and mobile
- Role-specific navigation sidebar

---

## Reports
- Admin can generate and download placement reports as PDF and CSV
- Reports include: student name, scores, recommendation, chosen pathway, final placement status

