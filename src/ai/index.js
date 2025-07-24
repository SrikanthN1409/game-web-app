// src/ai/index.js
require('dotenv').config();
const OpenAI = require('openai');
const db = require('../db');
const nodemailer = require('nodemailer');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const categories = ['General Knowledge', 'Science', 'Indian History', 'Space'];

async function generateQuestions(category, count = 30) {
  const prompt = `Generate ${count} multiple-choice quiz questions for kids in the category "${category}".
Return the result as a valid JSON array of objects, like this:

[
  {
    "question": "What color is the sky?",
    "options": ["Blue", "Green", "Red", "Yellow"],
    "answer": "Blue"
  },
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "answer": "4"
  }
]`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  const raw = response.choices[0].message.content;
  const match = raw.match(/\[.*\]/s); // Extract JSON array

  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (err) {
      console.error(`⚠️ Failed to parse JSON for ${category}:\n`, raw);
      return [];
    }
  }

  return [];
}

function getCorrectOptionLetter(options, answer) {
  const index = options.findIndex(o => o === answer);
  return ['A', 'B', 'C', 'D'][index] || 'A';
}

async function insertQuestions(questions, category) {
  let inserted = 0;

  for (const q of questions) {
    const result = await db.query(
      `INSERT INTO quiz_questions
       (question, option_a, option_b, option_c, option_d, options, answer, correct_option, category, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ai')
       ON CONFLICT (question) DO NOTHING
       RETURNING id`,
      [
        q.question,
        q.options[0],
        q.options[1],
        q.options[2],
        q.options[3],
        JSON.stringify(q.options),
        q.answer,
        getCorrectOptionLetter(q.options, q.answer),
        category
      ]
    );
    if (result.rows.length > 0) inserted++;
  }

  return inserted;
}

async function run() {
  const report = [];

  for (const category of categories) {
    console.log(`⏳ Generating questions for ${category}...`);
    const generated = await generateQuestions(category);
    console.log(`📥 Got ${generated.length} questions`);

    const inserted = await insertQuestions(generated, category);
    console.log(`✅ Inserted ${inserted} into DB for "${category}"`);

    report.push({ category, generated: generated.length, inserted });
  }

  await sendReportEmail(report);
  console.log('📧 Report sent');
}

async function sendReportEmail(report) {
  const transporter = nodemailer.createTransport({
    service: 'Yahoo',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const html = report.map(r =>
    `<li><strong>${r.category}</strong>: Generated ${r.generated}, Inserted ${r.inserted}</li>`
  ).join('');

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: '📊 AI Quiz Insertion Report',
    html: `<h3>AI Quiz Generation Report</h3><ul>${html}</ul>`
  });
}

run().catch(console.error);
