export const statCards = [
  { label: "Total Interviews", value: "12", badge: "+2 this week", badgeColor: "#2563EB" },
  { label: "Pending Prep", value: "3", badge: "Action Required", badgeColor: "#d97706" },
  { label: "Offers Received", value: "2", badge: "Great Job!", badgeColor: "#16a34a" },
  { label: "Completed", value: "8", badge: "Lifetime", badgeColor: "#6b7280" },
];

export const upcomingInterviews = [
  {
    id: 1,
    company: "NexTech Solutions", initial: "N", role: "Senior Full-Stack Engineer",
    type: "Technical Round (Live Coding)", date: "Oct 24, 2024", time: "10:00 AM EST",
    matchScore: "94%", isAvailable: true,
  },
  {
    id: 2,
    company: "Global Finance Partners", initial: "G", role: "Lead Frontend Developer",
    type: "Behavioral / Culture Fit", date: "Oct 26, 2024", time: "02:30 PM EST",
    matchScore: null, isAvailable: false, availableIn: "2 days",
  },
];

export const completedInterviews = [
  { company: "CloudStream AI", role: "Backend Architect", date: "Oct 18, 2024", status: "Feedback Pending", statusColor: "#d97706", statusBg: "#fffbeb" },
  { company: "Velocity Labs", role: "DevOps Lead", date: "Oct 15, 2024", status: "Completed", statusColor: "#6b7280", statusBg: "#f9fafb" },
  { company: "BrightPath Health", role: "Engineering Manager", date: "Oct 12, 2024", status: "Offer Received", statusColor: "#16a34a", statusBg: "#f0fdf4" },
];
