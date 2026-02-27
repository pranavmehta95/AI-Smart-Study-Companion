const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Retry with exponential backoff for 429 quota errors
async function generateWithRetry(prompt, retries = 3, delayMs = 10000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      const is429 = err.message && err.message.includes('429');
      if (is429 && i < retries - 1) {
        console.log(`[Gemini] Rate limited. Retrying in ${delayMs / 1000}s... (attempt ${i + 1}/${retries})`);
        await new Promise(r => setTimeout(r, delayMs));
        delayMs *= 2; // exponential backoff
      } else {
        if (is429) {
          throw new Error('Gemini API rate limit reached. The free tier allows limited requests per day. Please try again in a few minutes or check your quota at https://ai.dev/rate-limit');
        }
        throw err;
      }
    }
  }
}

const geminiService = {
  async generateSummary(text) {
    const prompt = `You are an expert academic tutor. Given the following study material, generate a concise and well-structured summary that a college student can use for revision. Include the main concepts, important points, and key takeaways. Format with clear headings.

Study Material:
${text.substring(0, 15000)}

Return a detailed but concise summary in markdown format.`;
    const result = await generateWithRetry(prompt);
    return result.response.text();
  },

  async extractKeywords(text) {
    const prompt = `Extract the most important keywords, terms, and concepts from the following study material. Return ONLY a JSON array of strings with 15-25 keywords, no explanation needed.

Study Material:
${text.substring(0, 10000)}

Return format: ["keyword1", "keyword2", ...]`;
    const result = await generateWithRetry(prompt);
    const raw = result.response.text();
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return [];
  },

  async generateNotes(text) {
    const prompt = `You are an expert academic tutor. Create structured revision notes from the following study material. Use bullet points, numbered lists, and clear headings. Make it comprehensive yet easy to memorize for exams.

Study Material:
${text.substring(0, 15000)}

Return well-formatted revision notes in markdown format.`;
    const result = await generateWithRetry(prompt);
    return result.response.text();
  },

  async generateQuiz(text, questionTypes = ['mcq', 'short', 'long']) {
    const prompt = `You are an expert exam paper setter. Generate a comprehensive quiz from the following study material.
Include:
- 5 MCQ questions (with 4 options each, mark the correct answer)
- 3 Short answer questions  
- 2 Long answer questions

Study Material:
${text.substring(0, 12000)}

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "mcq",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "A) option1"
    },
    {
      "question": "Short answer question",
      "type": "short",
      "options": [],
      "correctAnswer": "Expected answer"
    },
    {
      "question": "Long answer question",
      "type": "long",
      "options": [],
      "correctAnswer": "Detailed expected answer"
    }
  ]
}`;
    const result = await generateWithRetry(prompt);
    const raw = result.response.text();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { questions: [] };
  },

  async generateVivaQuestion(text, previousQuestions = []) {
    const prevQ = previousQuestions.join(', ');
    const prompt = `You are a strict but fair university viva examiner. Based on this study material, generate ONE challenging oral examination question that tests deep conceptual understanding.
    
${prevQ ? `Already asked: ${prevQ}. Ask something different.` : ''}

Study Material:
${text.substring(0, 8000)}

Return ONLY the question as plain text, no extra explanation.`;
    const result = await generateWithRetry(prompt);
    return result.response.text().trim();
  },

  async evaluateVivaAnswer(question, answer, context) {
    const prompt = `You are a university examiner. Evaluate the student's viva answer.

Question: ${question}
Student's Answer: ${answer}
Study Context: ${context.substring(0, 3000)}

Provide:
1. A score out of 10
2. Specific feedback on what was correct and what was missing
3. The ideal answer

Return ONLY valid JSON:
{
  "score": 7,
  "feedback": "Your feedback here",
  "idealAnswer": "The ideal answer here"
}`;
    const result = await generateWithRetry(prompt);
    const raw = result.response.text();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { score: 5, feedback: 'Good attempt', idealAnswer: '' };
  },

  async generateFlashcards(text) {
    const prompt = `You are a learning specialist. Create flashcards from the following study material to help with active recall and spaced repetition.

Study Material:
${text.substring(0, 12000)}

Return ONLY valid JSON with exactly 15 flashcards:
{
  "cards": [
    {
      "front": "Question or concept",
      "back": "Answer or explanation",
      "difficulty": "easy"
    }
  ]
}
Difficulty must be "easy", "medium", or "hard".`;
    const result = await generateWithRetry(prompt);
    const raw = result.response.text();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { cards: [] };
  },

  async semanticSearch(text, query) {
    const prompt = `Given the following study material, find and return the most relevant passages that answer or relate to: "${query}"

Study Material:
${text.substring(0, 15000)}

Return a clear, concise answer based on the material, with relevant quotes if needed. Format in markdown.`;
    const result = await generateWithRetry(prompt);
    return result.response.text();
  },

  async generateStudyPlan(weakTopics, totalDays = 7) {
    const prompt = `You are a study coach. Create a ${totalDays}-day personalized study plan for a student who struggles with these topics: ${weakTopics.join(', ')}.

Return a structured day-by-day plan in markdown format with specific tasks, time allocations, and revision strategies.`;
    const result = await generateWithRetry(prompt);
    return result.response.text();
  },

  async evaluateQuizAnswer(question, userAnswer, correctAnswer) {
    const prompt = `Evaluate this student's answer to a study question.
  
Question: ${question}
Student Answer: ${userAnswer}
Expected Answer: ${correctAnswer}

Return ONLY valid JSON:
{
  "isCorrect": true,
  "score": 8,
  "feedback": "Brief feedback here"
}`;
    const result = await generateWithRetry(prompt);
    const raw = result.response.text();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { isCorrect: false, score: 0, feedback: 'Unable to evaluate' };
  }
};

module.exports = geminiService;
