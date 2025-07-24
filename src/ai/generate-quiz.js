const OpenAI = require('openai');
const db = require('../db');
require('dotenv').config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateAndInsertQuestions(category = 'General Knowledge') {
  try {
    const prompt = `Generate 5 multiple-choice quiz questions about ${category}. 
    Provide each in JSON format: 
    { "question": "...", "options": ["A", "B", "C", "D"], "answer": "Correct Option" }`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    const aiContent = response.choices[0].message.content;
    const questions = JSON.parse(aiContent); // assuming AI returns a JSON array

    for (const q of questions) {
      await db.query(
        `INSERT INTO quiz_questions
         (question, option_a, option_b, option_c, option_d, options, answer, correct_option, category, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ai')
         ON CONFLICT (question) DO NOTHING`,
        [
          q.question,
          q.options[0],
          q.options[1],
          q.options[2],
          q.options[3],
          JSON.stringify(q.options),
          q.answer,
          q.options.findIndex(opt => opt === q.answer) === 0 ? 'A' :
          q.options.findIndex(opt => opt === q.answer) === 1 ? 'B' :
          q.options.findIndex(opt => opt === q.answer) === 2 ? 'C' : 'D',
          category
        ]
      );
    }

    console.log('✅ AI-generated questions inserted successfully!');
  } catch (err) {
    console.error('❌ Error generating questions:', err);
  }
}

generateAndInsertQuestions('Indian History');
