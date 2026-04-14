/**
 * Prompt template for parsing resume text into structured JSON.
 * Version: v1.0
 */
export function getResumeParsePrompt(resumeText: string): string {
  return `You are an expert resume parser. Extract structured data from the following resume text.

IMPORTANT RULES:
- Extract only factual information present in the resume
- Do NOT infer or assume demographics, age, gender, ethnicity, religion, or disability status
- Do NOT include any protected characteristics
- If information is not clearly stated, omit it
- Normalize skill names to common industry terms
- Ensure ALL technical, hard, and soft skills are extracted into the skills array
- Estimate total years of experience from work history dates if possible

Return a JSON object with this exact structure:
{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "summary": "brief professional summary or null",
  "skills": ["array of skill strings"],
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "duration": "e.g. Jan 2020 - Present",
      "description": "brief description of role"
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "school name",
      "year": "graduation year or null"
    }
  ],
  "certifications": ["array of certification strings"],
  "totalYearsOfExperience": number_or_null
}

RESUME TEXT:
---
${resumeText}
---

Return ONLY valid JSON, no additional text.`;
}
