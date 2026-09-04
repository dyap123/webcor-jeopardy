// Default question bank — transcribed from "500 Review Jeopardy.ppt" (OSHA 500 trainer-course review).
// Answers are stored as the bare response; the apps show them as "What is …?".
// `accept` = comma-separated alternates the auto-marker also treats as correct.
window.DEFAULT_BANK = {
  title: 'OSHA 500 Review Jeopardy',
  categories: [
    {
      name: 'OSHA in General',
      clues: [
        { value: 100, clue: 'Year that the OSH Act was promulgated', answer: '1970', accept: '' },
        { value: 200, clue: '5(a)(1)', answer: 'the General Duty Clause', accept: 'general duty' },
        { value: 300, clue: "OSHA's highest inspection priority", answer: 'Imminent Danger', accept: '' },
        { value: 400, clue: 'Which one is not a classification of OSHA violation? Serious, Willful, Other-than-Serious, Major, Repeat', answer: 'Major', accept: '' },
        { value: 500, clue: 'Which one of the following is not under the multi-employer policy? Exposing, Creating, Controlling, Contributing, Correcting', answer: 'Contributing', accept: '' }
      ]
    },
    {
      name: 'Outreach',
      clues: [
        { value: 100, clue: 'Types of classes you are authorized to teach after successful completion of the OSHA 500 class', answer: '10 and 30 hour construction classes', accept: '10 and 30 hour, 10 hour and 30 hour, 10 and 30' },
        { value: 200, clue: 'OSHA 500 authorization must be renewed in this many years', answer: '4', accept: 'four, 4 years, every 4 years' },
        { value: 300, clue: 'OSHA 10 and 30-hour classes must be finished in this period of time', answer: '6 months', accept: 'six months, 6 mo' },
        { value: 400, clue: 'Location for you to process your 10 and 30-hour card "paperwork"', answer: 'UCSD', accept: 'uc san diego' },
        { value: 500, clue: 'Actual "class time" required for the 10-hour class', answer: '10 hours', accept: 'ten hours, 10 hrs' }
      ]
    },
    {
      name: 'Potpourri',
      clues: [
        { value: 100, clue: 'The 4 classes of fire', answer: 'A, B, C, and D', accept: 'abcd, a b c d, a b c and d' },
        { value: 200, clue: 'Distance to keep oxygen and acetylene cylinders apart when in storage', answer: '20 feet', accept: 'twenty feet, 20 ft, 20' },
        { value: 300, clue: 'Responsible for all the "stuff" employees bring on to the site', answer: 'the Employer', accept: 'employer' },
        { value: 400, clue: 'The minimum distance a crane, in transit, must be kept away from an overhead power line', answer: '4 feet', accept: 'four feet, 4 ft, 4' },
        { value: 500, clue: 'You must barricade this area on a crane to prevent entry', answer: 'the swing radius', accept: 'swing radius, swing area' }
      ]
    },
    {
      name: 'Fall Protection',
      clues: [
        { value: 100, clue: 'Fall protection shall be provided to each employee that is constructing a leading edge of ___ ft. or more above lower levels', answer: '6', accept: 'six, 6 feet, 6 ft' },
        { value: 200, clue: 'Required if the employer can demonstrate that it is infeasible or creates a greater hazard to use conventional fall protection', answer: 'a Fall Protection Plan', accept: 'fall protection plan, fpp' },
        { value: 300, clue: 'Which of the following is not considered conventional fall protection under Subpart M? 1. Guardrails  2. Safety Monitor  3. Safety nets', answer: 'Safety Monitor', accept: '2, safety monitoring, monitor' },
        { value: 400, clue: 'Which of the following is prohibited on a personal fall arrest system? 1. Locking snap hook  2. Body belt  3. Body harness', answer: 'a Body belt', accept: 'body belt, 2, belt' },
        { value: 500, clue: 'Height at which fall protection is required on scaffolds', answer: '10 feet', accept: 'ten feet, 10 ft, 10' }
      ]
    },
    {
      name: 'Steel Erection',
      clues: [
        { value: 100, clue: 'Cranes, in operation, must stay a minimum of this many feet from power lines', answer: '20 feet', accept: 'twenty feet, 20 ft, 20' },
        { value: 200, clue: 'Must be provided in writing by the controlling contractor to steel erectors', answer: 'Modifications/repairs to anchor bolts, and cure of concrete', accept: 'anchor bolts and concrete cure, anchor bolt repairs and concrete cure, concrete cure and anchor bolt modifications' },
        { value: 300, clue: 'Maximum number of pieces allowed in "multiple lift rigging"', answer: '5', accept: 'five, 5 pieces' },
        { value: 400, clue: 'At this height ALL ironworkers must be "tied-off"', answer: '30 feet', accept: 'thirty feet, 30 ft, 30' },
        { value: 500, clue: 'SENRAC', answer: 'Steel Erection Negotiated Rulemaking Advisory Committee', accept: '' }
      ]
    }
  ]
};
