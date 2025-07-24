const db = require('./db');

async function insertSampleQuestion() {
  try {
  const result = await db.query(
  `INSERT INTO quiz_questions 
   (question, option_a, option_b, option_c, option_d, options, answer, correct_option, category, source)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
   RETURNING id`,
  [
    'What is the capital of India?',
    'Delhi',
    'Mumbai',
    'Chennai',
    'Kolkata',
    JSON.stringify(['Delhi', 'Mumbai', 'Chennai', 'Kolkata']),
    'Delhi',
    'A',
    'General Knowledge',
    'manual'
  ]
);

    console.log('✅ Inserted quiz question with ID:', result.rows[0].id);
  } catch (err) {
    console.error('❌ Error inserting quiz question:', err);
  } finally {
//    await db.end();  

  }
}

insertSampleQuestion();
