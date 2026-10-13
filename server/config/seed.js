import Question from '../models/Question.js';
import { defaultQuestions } from '../data/seedQuestions.js';

export const seedQuestionsIfEmpty = async () => {
  try {
    const count = await Question.countDocuments();
    if (count === 0) {
      await Question.insertMany(defaultQuestions);
      console.log(`🌱 Successfully seeded ${defaultQuestions.length} curated interview questions into MongoDB.`);
    }
  } catch (error) {
    console.error(`⚠️ Could not seed questions: ${error.message}`);
  }
};
