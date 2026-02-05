/**
 * Gemini AI Service for generating job descriptions and interview prep
 * Falls back to template-based generation when API key is not available
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GenerationOptions {
    positionName: string;
    category: string;
    experienceLevel?: string;
    locations?: string[];
    companyName?: string;
    workType?: string;
}

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
}

/**
 * Check if Gemini API is available
 */
export function isAIAvailable(): boolean {
    return GEMINI_API_KEY.length > 10;
}

/**
 * Generate Job Description using Gemini AI
 */
export async function generateJDWithAI(options: GenerationOptions): Promise<string> {
    if (!isAIAvailable()) {
        throw new Error('AI not available - falling back to templates');
    }

    const prompt = `You are an expert HR professional and technical recruiter. Generate a professional job description for the following position:

Position: ${options.positionName}
Category: ${options.category}
Experience Level: ${options.experienceLevel || 'Mid-Level'}
Work Type: ${options.workType || 'Full-time'}
Locations: ${options.locations?.join(', ') || 'Remote'}
Company: ${options.companyName || 'Our Company'}

Please generate a comprehensive job description in markdown format with the following sections:
1. **About the Role** - Brief overview
2. **Responsibilities** - 5-8 key responsibilities as bullet points
3. **Requirements** - Must-have qualifications
4. **Nice to Have** - Preferred qualifications
5. **What We Offer** - Benefits and perks

Keep the tone professional but engaging. Make it specific to the ${options.category} field.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

/**
 * Generate Interview Prep using Gemini AI
 */
export async function generateInterviewPrepWithAI(
    jobDescription: string,
    options: GenerationOptions
): Promise<string> {
    if (!isAIAvailable()) {
        throw new Error('AI not available - falling back to templates');
    }

    const prompt = `You are an expert interviewer and hiring manager. Based on the following job description, create a comprehensive interview preparation guide.

Job Description:
${jobDescription}

Position: ${options.positionName}
Category: ${options.category}

Generate an interview preparation document in markdown format with:
1. **Interview Structure** - Recommended interview stages
2. **Technical Questions** - 5-7 role-specific technical questions
3. **Behavioral Questions** - 5 STAR-method behavioral questions
4. **Case Study/Problem** - A practical problem to assess skills
5. **Evaluation Criteria** - Scoring rubric for each area
6. **Red Flags** - Warning signs to watch for

Be specific to the ${options.category} field and the job requirements.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1500,
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

/**
 * Smart generation - tries AI first, falls back to templates
 */
export async function smartGenerateJD(
    options: GenerationOptions,
    fallbackGenerator: () => string
): Promise<{ content: string; usedAI: boolean }> {
    if (isAIAvailable()) {
        try {
            const content = await generateJDWithAI(options);
            return { content, usedAI: true };
        } catch {
            console.log('AI generation failed, using templates');
        }
    }

    return { content: fallbackGenerator(), usedAI: false };
}

/**
 * Smart interview prep generation
 */
export async function smartGenerateInterviewPrep(
    jobDescription: string,
    options: GenerationOptions,
    fallbackGenerator: () => string
): Promise<{ content: string; usedAI: boolean }> {
    if (isAIAvailable()) {
        try {
            const content = await generateInterviewPrepWithAI(jobDescription, options);
            return { content, usedAI: true };
        } catch {
            console.log('AI generation failed, using templates');
        }
    }

    return { content: fallbackGenerator(), usedAI: false };
}
