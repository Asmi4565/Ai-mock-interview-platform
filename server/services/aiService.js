// Live AI Evaluation Service using LLM API (Google Gemini / OpenAI compatible)

export class MissingCredentialsError extends Error {
  constructor(message = 'AI API credentials are not configured.') {
    super(message);
    this.name = 'MissingCredentialsError';
    this.code = 'MISSING_AI_KEY';
  }
}

export const evaluateAnswerWithAI = async ({
  role,
  interviewType,
  difficulty,
  questionPrompt,
  studentAnswer,
  attemptNumber = 1,
  previousAnswer = null,
}) => {
  const apiKey = process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  // 1. Check for missing or placeholder credentials - fallback to heuristic evaluator
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_api_key_here')) {
    console.warn('[AI Service] No external AI API key provided. Utilizing automated rubric evaluator fallback.');
    return generateHeuristicFeedback({ role, questionPrompt, studentAnswer });
  }

  // 2. Build the System Rubric Prompt adhering to SRS Section 8.1
  const promptText = `
You are an expert technical and HR interviewer evaluating a college student's mock interview answer.
Target Role: ${role}
Interview Category: ${interviewType}
Difficulty Level: ${difficulty}
Attempt Number: ${attemptNumber}
${previousAnswer ? `Previous Attempt Answer: "${previousAnswer}"` : ''}

Question Prompt:
"${questionPrompt}"

Student Answer:
"${studentAnswer}"

Evaluate the student's answer strictly against the 5-point SRS Rubric:
1. Relevance (1-10): Does the answer directly address the question?
2. Clarity & Structure (1-10): Is the explanation understandable and logically organized?
3. Completeness (1-10): Does the answer cover the expected core concepts?
4. Technical Correctness (1-10): Are the technical assertions conceptually accurate? (For HR, evaluate reasoning validity).
5. Examples & Reasoning (1-10): Does the answer include concrete project examples, STAR method, or rationale?

Return your response as a valid JSON object matching EXACTLY this structure:
{
  "rubricScores": {
    "relevance": <integer 1-10>,
    "clarity": <integer 1-10>,
    "completeness": <integer 1-10>,
    "technicalCorrectness": <integer 1-10>,
    "examplesAndReasoning": <integer 1-10>
  },
  "overallScore": <integer 1-100>,
  "strengths": [<array of 2-3 specific positive points>],
  "improvements": [<array of 2-3 actionable areas to improve>],
  "missingPoints": [<array of 1-3 key concepts or examples omitted>],
  "explanation": "<constructive multi-sentence review of the answer>",
  "suggestedAnswer": "<an exemplary, well-structured model answer suitable for a college student in this interview>"
}
`;

  // 3. Make LLM API Request with Timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35-second timeout

  try {
    let rawResponseText = '';

    if (provider === 'openai') {
      // OpenAI API Compatible call
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an accurate, constructive interview evaluator. Always return valid JSON.' },
            { role: 'user', content: promptText },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error?.message || `OpenAI API returned status ${res.status}`);
      }

      const data = await res.json();
      rawResponseText = data.choices?.[0]?.message?.content || '';
    } else {
      // Google Gemini API call with model fallback cascade
      const modelsToTry = [
        process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
      ];

      let lastError = null;

      for (const model of modelsToTry) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const res = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: promptText }],
                },
              ],
              generationConfig: {
                response_mime_type: 'application/json',
                temperature: 0.2,
              },
            }),
            signal: controller.signal,
          });

          if (res.ok) {
            const data = await res.json();
            rawResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (rawResponseText) break; // Successfully obtained response!
          } else {
            const errBody = await res.json().catch(() => ({}));
            const errMsg = errBody.error?.message || `Gemini API returned status ${res.status}`;
            lastError = new Error(errMsg);
            console.warn(`[AI Service] Model ${model} returned: ${errMsg}. Trying next candidate model...`);
          }
        } catch (fetchErr) {
          lastError = fetchErr;
        }
      }

      if (!rawResponseText) {
        console.warn('[AI Service] Live AI unavailable (' + (lastError?.message || 'unknown error') + '). Engaging automated rubric evaluator fallback.');
        clearTimeout(timeoutId);
        return generateHeuristicFeedback({ role, questionPrompt, studentAnswer });
      }
    }


    clearTimeout(timeoutId);

    // 4. Parse and Validate Structured JSON Response
    if (!rawResponseText) {
      throw new Error('LLM returned an empty response.');
    }

    const parsed = JSON.parse(rawResponseText);
    return validateAndNormalizeFeedback(parsed);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('The AI evaluation service timed out after 35 seconds. Please retry.');
    }
    throw error;
  }
};

// Validation Helper
const validateAndNormalizeFeedback = (data) => {
  const clamp = (val, min, max, defaultVal) => {
    const num = Number(val);
    if (isNaN(num)) return defaultVal;
    return Math.min(Math.max(Math.round(num), min), max);
  };

  const rawRubric = data.rubricScores || {};
  const rubricScores = {
    relevance: clamp(rawRubric.relevance, 1, 10, 7),
    clarity: clamp(rawRubric.clarity, 1, 10, 7),
    completeness: clamp(rawRubric.completeness, 1, 10, 6),
    technicalCorrectness: clamp(rawRubric.technicalCorrectness, 1, 10, 7),
    examplesAndReasoning: clamp(rawRubric.examplesAndReasoning, 1, 10, 6),
  };

  // Compute calculated score if overallScore is missing
  const calculatedAvg =
    (rubricScores.relevance +
      rubricScores.clarity +
      rubricScores.completeness +
      rubricScores.technicalCorrectness +
      rubricScores.examplesAndReasoning) * 2;

  const overallScore = clamp(data.overallScore, 0, 100, calculatedAvg);

  const toStringArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => String(item).trim()).filter((s) => s.length > 0);
  };

  return {
    rubricScores,
    overallScore,
    strengths: toStringArray(data.strengths),
    improvements: toStringArray(data.improvements),
    missingPoints: toStringArray(data.missingPoints),
    explanation: String(data.explanation || 'Answer reviewed against standard interview rubric.').trim(),
    suggestedAnswer: String(data.suggestedAnswer || '').trim(),
    providerStatus: 'live_ai',
  };
};

// Heuristic Fallback Evaluator (ensures interview flow never crashes if API keys or networks fail)
export const generateHeuristicFeedback = ({ role, questionPrompt, studentAnswer }) => {
  const words = (studentAnswer || '').trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const relevance = Math.min(Math.max(wordCount > 35 ? 9 : (wordCount > 15 ? 7 : 5)), 10);
  const clarity = Math.min(Math.max(wordCount > 25 ? 8 : 6), 10);
  const completeness = Math.min(Math.max(wordCount > 50 ? 9 : (wordCount > 25 ? 7 : 5)), 10);
  const technicalCorrectness = Math.min(Math.max(wordCount > 35 ? 8 : 6), 10);
  const hasExample = /for example|in my project|specifically|such as|implemented|we used/i.test(studentAnswer || '');
  const examplesAndReasoning = hasExample ? 8 : 5;

  const overallScore = Math.round(
    (relevance + clarity + completeness + technicalCorrectness + examplesAndReasoning) * 2
  );

  return {
    rubricScores: {
      relevance,
      clarity,
      completeness,
      technicalCorrectness,
      examplesAndReasoning,
    },
    overallScore,
    strengths: [
      'Directly addresses the primary question prompt for ' + role + '.',
      'Communicates foundational principles with reasonable clarity.',
    ],
    improvements: [
      'Structure the answer using the STAR method (Situation, Task, Action, Result).',
      'Cite concrete examples, trade-offs, and metrics from past project implementations.',
    ],
    missingPoints: [
      'Mention edge cases, scale constraints, or alternative design approaches.',
    ],
    explanation:
      'The response shows a good conceptual understanding. For top-tier scoring, expand on concrete technical decisions and quantify your achievements with clear metrics.',
    suggestedAnswer:
      'A top-performing answer begins with a concise thesis, walks through a real production scenario, explains the engineering choices made, and summarizes the impact or trade-offs involved.',
    providerStatus: 'heuristic_fallback',
  };
};
