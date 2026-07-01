export const weekDays = [
  { day: 'MON', date: 21, isToday: false },
  { day: 'W', date: 2, isToday: false },
  { day: 'TI', date: 2, isToday: false },
  { day: 'FRI', date: 25, isToday: true },
];

export const calendarEvents = [
  {
    id: 1,
    name: 'Sarah Johnson',
    type: 'Technical Interview',
    startHour: 10,
    startMin: 0,
    durationMins: 60,
    dayIndex: 0,
    color: '#3b82f6',
  },
  {
    id: 2,
    name: 'Michael Lee',
    type: 'Final Round',
    startHour: 14,
    startMin: 0,
    durationMins: 60,
    dayIndex: 0,
    color: '#14b8a6',
  },
];

export const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];

export const upcomingInterviews = [
  {
    id: 1,
    initials: 'SJ',
    color: '#14b8a6',
    name: 'Sarah Johnson',
    role: 'Senior Data Analyst',
    time: 'In 15 mins',
    timeUrgent: true,
    aiInsight: 'Focus on AWS Cloud architecture experience.',
    action: 'Join Meeting',
    actionStyle: 'primary',
  },
  {
    id: 2,
    initials: 'ML',
    color: '#3b82f6',
    name: 'Michael Lee',
    role: 'Software Engineer',
    time: 'Today, 2:00 PM',
    timeUrgent: false,
    aiInsight: null,
    action: 'View Prep Notes',
    actionStyle: 'outline',
  },
  {
    id: 3,
    initials: 'ER',
    color: '#f97316',
    name: 'Elena Rodriguez',
    role: 'Product Designer',
    time: null,
    timeUrgent: false,
    badge: 'Needs Feedback',
    badgeColor: '#3b82f6',
    aiInsight: null,
    action: 'Submit Score',
    actionStyle: 'blue',
  },
];
