const db = require('./db');

async function insertQuestions() {
  const questions = [
    {
      question: 'What is the national animal of India?',
      options: ['Tiger', 'Lion', 'Elephant', 'Leopard'],
      answer: 'Tiger',
      correct_option: 'A',
      category: 'General Knowledge',
      source: 'manual'
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
      answer: 'Mars',
      correct_option: 'B',
      category: 'Space',
      source: 'manual'
    }
    // Add more questions here...
  ];

  try {
    for (const q of questions) {
      const result = await db.query(
        `INSERT INTO quiz_questions
         (question, option_a, option_b, option_c, option_d, options, answer, correct_option, category, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
          q.correct_option,
          q.category,
          q.source
        ]
      );

      if (result.rows.length > 0) {
        console.log(`✅ Inserted question ID: ${result.rows[0].id}`);
      } else {
        console.log(`⚠️ Skipped duplicate question: "${q.question}"`);
      }
    }
  } catch (err) {
    console.error('❌ Error inserting questions:', err);
  }
}

insertQuestions();
