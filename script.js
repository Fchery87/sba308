function validateData(course, ag, submissions) {
  if (ag.course_id !== course.id) {
    throw new Error(
      'Invalid input: AssignmentGroup does not belong to the provided course.'
    );
  }
  submissions.forEach((submission) => {
    if (
      typeof submission.submission.score !== 'number' ||
      submission.submission.score < 0
    ) {
      throw new Error(
        'Invalid submission score: Score must be a non-negative number.'
      );
    }
    if (submission.submission.score === 0) {
      throw new Error('Invalid submission score: Score cannot be zero.');
    }
  });
}

function calculateWeightedAverage(assignments, submissions) {
  let totalScore = 0;
  let totalPossible = 0;
  let weightedScores = {};

  const currentDate = new Date(); // Current date for comparison

  assignments.forEach((assignment) => {
    // Check if the assignment is due
    const dueDate = new Date(assignment.due_at);
    if (currentDate >= dueDate) {
      submissions.forEach((submission) => {
        if (submission.assignment_id === assignment.id) {
          const lateSubmission =
            new Date(submission.submission.submitted_at) > dueDate;
          const adjustedScore = lateSubmission
            ? submission.submission.score - 0.1 * assignment.points_possible
            : submission.submission.score;
          totalScore += adjustedScore;
          totalPossible += assignment.points_possible;
          weightedScores[assignment.id] =
            (adjustedScore / assignment.points_possible) * 100;
        }
      });
    }
  });

  const weightedAverage = totalPossible !== 0 ? totalScore / totalPossible : 0;
  return { weightedAverage, weightedScores };
}

function formatData(submissions, assignments) {
  const learnerData = {};

  submissions.forEach((submission) => {
    if (!learnerData[submission.learner_id]) {
      learnerData[submission.learner_id] = [];
    }
    learnerData[submission.learner_id].push(submission);
  });

  const formattedResult = [];
  for (const learnerId in learnerData) {
    const { weightedAverage, weightedScores } = calculateWeightedAverage(
      assignments,
      learnerData[learnerId]
    );
    const learnerObject = { id: parseInt(learnerId), avg: weightedAverage };
    for (const assignmentId in weightedScores) {
      learnerObject[assignmentId] = weightedScores[assignmentId];
    }
    formattedResult.push(learnerObject);
  }

  return formattedResult;
}

function getLearnerData(course, ag, submissions) {
  try {
    validateData(course, ag, submissions);
    const result = formatData(submissions, ag.assignments);
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

// Sample data provided in the assessment
const CourseInfo = {
  id: 451,
  name: 'Introduction to JavaScript',
};

const AssignmentGroup = {
  id: 12345,
  name: 'Fundamentals of JavaScript',
  course_id: 451,
  group_weight: 25,
  assignments: [
    {
      id: 1,
      name: 'Declare a Variable',
      due_at: '2023-01-25',
      points_possible: 50,
    },
    {
      id: 2,
      name: 'Write a Function',
      due_at: '2023-02-27',
      points_possible: 150,
    },
    {
      id: 3,
      name: 'Code the World',
      due_at: '3156-11-15',
      points_possible: 500,
    },
  ],
};

const LearnerSubmissions = [
  {
    learner_id: 125,
    assignment_id: 1,
    submission: {
      submitted_at: '2023-01-25',
      score: 47,
    },
  },
  {
    learner_id: 125,
    assignment_id: 2,
    submission: {
      submitted_at: '2023-02-12',
      score: 150,
    },
  },
  {
    learner_id: 125,
    assignment_id: 3,
    submission: {
      submitted_at: '2023-01-25',
      score: 400,
    },
  },
  {
    learner_id: 132,
    assignment_id: 1,
    submission: {
      submitted_at: '2023-01-24',
      score: 39,
    },
  },
  {
    learner_id: 132,
    assignment_id: 2,
    submission: {
      submitted_at: '2023-03-07',
      score: 140,
    },
  },
];

// Run the function with sample data
const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
console.log(result);
