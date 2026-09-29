import type { RoutineData } from '@/features/routine/routine.types';

// Fixture for the Routine tab, transcribed from the my_routine_tracker mockup: Morning
// 2/4 done, Night 0/3 done, 18-day streak, 86% weekly consistency (Mon–Thu complete, Fri
// = today, weekend upcoming), and the "Today's Tip" copy. Reminder times are added per
// docs/03 (Routine Item requires one; the mockup omits it). Returned by getRoutine()
// while EXPO_PUBLIC_USE_MOCK_API is on; swapped for the real API response later unchanged.
export const mockRoutineData: RoutineData = {
  streakDays: 18,
  weeklyConsistencyPct: 86,
  weeklyDays: [
    { label: 'M', status: 'complete' },
    { label: 'T', status: 'complete' },
    { label: 'W', status: 'complete' },
    { label: 'T', status: 'complete' },
    { label: 'F', status: 'today' },
    { label: 'S', status: 'upcoming' },
    { label: 'S', status: 'upcoming' },
  ],
  tip: {
    title: "Today's Tip",
    message:
      'Apply sunscreen even on cloudy days to help reduce pigmentation over time. UV rays penetrate clouds and reflect off surfaces.',
  },
  sections: [
    {
      timeOfDay: 'morning',
      steps: [
        {
          id: 'am-cleanser',
          productName: 'Cleanser',
          productDetail: 'Gentle Milk Cleanser',
          icon: 'cleanser',
          reminderTime: '7:30 AM',
          completed: true,
        },
        {
          id: 'am-serum',
          productName: 'Vitamin C Serum',
          productDetail: '15% Brightening',
          icon: 'serum',
          reminderTime: '7:35 AM',
          completed: true,
        },
        {
          id: 'am-moisturizer',
          productName: 'Moisturizer',
          productDetail: 'Barrier Repair Cream',
          icon: 'moisturizer',
          reminderTime: '7:40 AM',
          completed: false,
        },
        {
          id: 'am-spf',
          productName: 'Sunscreen SPF50',
          productDetail: 'Broad Spectrum Invisible',
          icon: 'sunscreen',
          reminderTime: '7:45 AM',
          completed: false,
        },
      ],
    },
    {
      timeOfDay: 'night',
      steps: [
        {
          id: 'pm-facewash',
          productName: 'Face Wash',
          productDetail: 'Deep Pore Purifying',
          icon: 'faceWash',
          reminderTime: '9:30 PM',
          completed: false,
        },
        {
          id: 'pm-retinol',
          productName: 'Retinol',
          productDetail: 'Advanced Renewal 0.5%',
          icon: 'retinol',
          reminderTime: '9:40 PM',
          completed: false,
        },
        {
          id: 'pm-moisturizer',
          productName: 'Moisturizer',
          productDetail: 'Night Recovery Balm',
          icon: 'nightCream',
          reminderTime: '9:45 PM',
          completed: false,
        },
      ],
    },
  ],
};
