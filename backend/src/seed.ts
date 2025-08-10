/* eslint-disable no-console */
import prisma from "./config/prisma";

const competencies = [
  "MATHEMATICS",
  "SCIENTIFICMETHOD",
  "PROGRAMMING",
  "DATAANALYSIS",
  "MODELING",
  "LABORATORY",
  "DESIGN",
  "SYSTEMSTHINKING",
  "ALGORITHMS",
  "TECHNOLOGY",
  "CRITICALTHINKING",
  "QUANTITATIVE",
  "QUALITATIVE",
  "RESEARCH",
  "TROUBLESHOOTING",
  "COMMUNICATION",
  "COLLABORATION",
  "PROJECTMANAGEMENT",
  "ETHICS",
  "CREATIVITY",
  "ADAPTABILITY",
  "LIFELONGLEARNING",
] as const;

const stepLevels = {
  A: ["ONE", "TWO"],
  B: ["ONE", "TWO"],
  C: ["ONE", "TWO"],
};

function generateQuestion(
  competency: (typeof competencies)[number],
  level: "ONE" | "TWO" | "THREE",
) {
  const templates = {
    MATHEMATICS: {
      ONE: `Solve a simple arithmetic problem: What is 12 × 8?`,
      TWO: `Apply the quadratic formula to solve: x² - 5x + 6 = 0.`,
      THREE: `Prove why the sum of the angles in a triangle is always 180° using Euclidean geometry.`,
    },
    SCIENTIFICMETHOD: {
      ONE: `Identify the steps of the scientific method in correct order.`,
      TWO: `Design a simple experiment to test plant growth under different light conditions.`,
      THREE: `Critique a published study for flaws in hypothesis formulation and methodology.`,
    },
    PROGRAMMING: {
      ONE: `Write a loop in JavaScript to print numbers 1 to 10.`,
      TWO: `Implement a function to reverse a string without using built-in methods.`,
      THREE: `Optimize an algorithm that sorts a list of objects by multiple keys.`,
    },
    DATAANALYSIS: {
      ONE: `Identify the mean, median, and mode from a small dataset.`,
      TWO: `Interpret a histogram showing age distribution in a population.`,
      THREE: `Build a multiple regression model and explain the significance of coefficients.`,
    },
    MODELING: {
      ONE: `Explain what a simple linear model is.`,
      TWO: `Create a basic population growth model using a given dataset.`,
      THREE: `Develop a systems dynamics model to simulate the spread of a virus.`,
    },
    LABORATORY: {
      ONE: `Identify standard safety symbols used in a chemistry lab.`,
      TWO: `Perform a titration and record results accurately.`,
      THREE: `Design a lab protocol to ensure reproducibility of a complex experiment.`,
    },
    DESIGN: {
      ONE: `List three key principles of good product design.`,
      TWO: `Sketch a basic blueprint for a small mechanical device.`,
      THREE: `Develop a user-centered design plan for a new mobile application.`,
    },
    SYSTEMSTHINKING: {
      ONE: `Identify components and boundaries in a simple system like a coffee machine.`,
      TWO: `Analyze feedback loops in a small business supply chain.`,
      THREE: `Model interdependencies in an ecological system using causal loop diagrams.`,
    },
    ALGORITHMS: {
      ONE: `Describe the steps in a simple search algorithm like linear search.`,
      TWO: `Implement a binary search in pseudocode.`,
      THREE: `Analyze and compare the time complexities of Dijkstra’s vs. A* algorithms.`,
    },
    TECHNOLOGY: {
      ONE: `Identify three examples of renewable energy technology.`,
      TWO: `Explain how cloud computing differs from traditional on-premises solutions.`,
      THREE: `Evaluate the ethical implications of facial recognition systems.`,
    },
    CRITICALTHINKING: {
      ONE: `Identify assumptions in a short news article.`,
      TWO: `Compare two arguments and decide which is more logically sound.`,
      THREE: `Deconstruct a political speech to uncover hidden biases and logical fallacies.`,
    },
    QUANTITATIVE: {
      ONE: `Convert 250 cm to meters.`,
      TWO: `Calculate the percentage increase from 120 to 150.`,
      THREE: `Interpret statistical significance in a t-test result.`,
    },
    QUALITATIVE: {
      ONE: `List two methods of qualitative data collection.`,
      TWO: `Analyze a short interview transcript for emerging themes.`,
      THREE: `Design a qualitative study to explore cultural attitudes toward AI.`,
    },
    RESEARCH: {
      ONE: `Identify the difference between primary and secondary sources.`,
      TWO: `Write a research question for a small observational study.`,
      THREE: `Evaluate the reliability and validity of a research instrument.`,
    },
    TROUBLESHOOTING: {
      ONE: `List three steps to diagnose a non-functioning printer.`,
      TWO: `Identify the root cause of a recurring software bug.`,
      THREE: `Develop a systematic troubleshooting plan for an intermittent network outage.`,
    },
    COMMUNICATION: {
      ONE: `Write a short, clear email request for information.`,
      TWO: `Summarize a technical report for a non-technical audience.`,
      THREE: `Develop and deliver a persuasive presentation to stakeholders.`,
    },
    COLLABORATION: {
      ONE: `Describe the role of a facilitator in a team meeting.`,
      TWO: `Resolve a minor conflict between two team members.`,
      THREE: `Design a cross-functional workflow for a large project.`,
    },
    PROJECTMANAGEMENT: {
      ONE: `List the three main constraints in project management.`,
      TWO: `Create a simple Gantt chart for a week-long project.`,
      THREE: `Develop a risk management plan for a software rollout.`,
    },
    ETHICS: {
      ONE: `Identify an example of plagiarism in academic writing.`,
      TWO: `Analyze a workplace dilemma using an ethical decision-making model.`,
      THREE: `Debate the moral implications of autonomous weapons systems.`,
    },
    CREATIVITY: {
      ONE: `Generate three ideas for repurposing common household items.`,
      TWO: `Design a unique marketing slogan for a fictional product.`,
      THREE: `Develop an innovative solution to reduce ocean plastic waste.`,
    },
    ADAPTABILITY: {
      ONE: `Describe a situation where you had to learn a new skill quickly.`,
      TWO: `Adjust a work plan after unexpected changes in project requirements.`,
      THREE: `Lead a team through organizational restructuring while maintaining morale.`,
    },
    LIFELONGLEARNING: {
      ONE: `List two benefits of continuous learning in your profession.`,
      TWO: `Create a personal development plan for the next six months.`,
      THREE: `Evaluate and select advanced courses to stay ahead in your field.`,
    },
  };

  return templates[competency][level];
}

const questions = [];

Object.entries(stepLevels).forEach(([step, levels]) => {
  competencies.forEach((competency) => {
    levels.forEach((level) => {
      questions.push({
        question: generateQuestion(
          competency,
          level as "ONE" | "TWO" | "THREE",
        ),
        competency,
        step,
        level,
      });
    });
  });
});

(async () => {
  console.log("Checking for existing config...");
  const config = await prisma.config.findFirst();
  if (!config) {
    console.log("No config found. Creating default config...");
    await prisma.config.create({ data: {} });
    console.log("Default config created.");
  } else {
    console.log("Config already exists.");
  }

  console.log("Checking for existing admin user...");
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) {
    console.log("No admin user found. Creating admin user...");
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@testschool.edu",
        role: "ADMIN",
      },
    });
    console.log("Admin user created.");
  } else {
    console.log("Admin user already exists.");
  }

  console.log("Checking for existing questions...");
  const existingQuestions = await prisma.question.findMany();
  if (existingQuestions.length === 0) {
    console.log("No questions found. Inserting default questions...");
    // @ts-expect-error typed correctly
    await prisma.question.createMany({ data: questions });
    console.log("Default questions inserted.");
  } else {
    console.log("Questions already exist.");
  }
})();
