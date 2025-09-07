import { GoogleGenerativeAI } from "@google/generative-ai";

class SimpleInterviewSimulator {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });
  }

  async generateQuestion(role, domain, mode, questionNumber) {
    const questionPrompt = this.getQuestionPrompt(
      role,
      domain,
      mode,
      questionNumber
    );

    try {
      const result = await this.model.generateContent(questionPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating question:", error);

      // Return a fallback question based on the parameters
      const fallbackQuestions = {
        technical: [
          `Describe your experience with ${domain.toLowerCase()} technologies and how you would approach solving a complex problem in this domain.`,
          `Explain a challenging technical project you worked on and the technologies you used.`,
          `How would you design a scalable system for handling large amounts of data in ${domain.toLowerCase()}?`,
          `What are the key considerations when building secure applications in ${domain.toLowerCase()}?`,
          `Describe your experience with version control and collaborative development practices.`,
        ],
        behavioral: [
          `Tell me about a time when you had to work with a difficult team member. How did you handle the situation?`,
          `Describe a project where you had to learn a new technology quickly. How did you approach it?`,
          `Give me an example of a time when you had to meet a tight deadline. How did you manage your time?`,
          `Tell me about a mistake you made in a project and how you learned from it.`,
          `Describe a time when you had to explain a complex technical concept to a non-technical person.`,
        ],
      };

      const questions = fallbackQuestions[mode] || fallbackQuestions.technical;
      return questions[questionNumber - 1] || questions[0];
    }
  }

  async evaluateAnswer(question, answer, mode) {
    const evaluationPrompt = this.getEvaluationPrompt(question, answer, mode);

    try {
      const result = await this.model.generateContent(evaluationPrompt);
      const response = await result.response;
      const content = response.text();

      // Try to parse JSON, fallback if it fails
      try {
        // Clean the content before parsing
        const cleanedContent = content.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error("Failed to parse evaluation JSON:", content);
        // If JSON parsing fails, return a structured response with the raw content
        return {
          score: 5,
          strengths: ["Response was processed"],
          weaknesses: ["Could not parse detailed evaluation from AI"],
          suggestions: ["Ensure your answer is clear and directly addresses the question"],
          overall_feedback: content, // Use the raw content as feedback
        };
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);

      // Simple fallback evaluation based on answer length and content
      const answerLength = answer.length;
      const hasKeywords = this.checkAnswerKeywords(answer, mode);
      const score = Math.min(
        10,
        Math.max(1, Math.floor(answerLength / 50) + (hasKeywords ? 3 : 0))
      );

      return {
        score: score,
        overall_feedback: "Answer evaluated using a fallback method due to API issues.",
        strengths:
          answerLength > 100
            ? ["Detailed response provided"]
            : ["Answer provided"],
        weaknesses:
          answerLength < 50
            ? ["Answer could be more detailed"]
            : ["Evaluation method was limited"],
        suggestions: [
          "Consider providing more specific examples in your next answer.",
        ],
      };
    }
  }

  checkAnswerKeywords(answer, mode) {
    const technicalKeywords = [
      "technology",
      "system",
      "design",
      "algorithm",
      "database",
      "API",
      "framework",
      "code",
      "development",
      "implementation",
    ];
    const behavioralKeywords = [
      "experience",
      "project",
      "team",
      "challenge",
      "learned",
      "situation",
      "problem",
      "solution",
      "collaboration",
      "leadership",
    ];

    const keywords =
      mode === "technical" ? technicalKeywords : behavioralKeywords;
    return keywords.some((keyword) => answer.toLowerCase().includes(keyword));
  }

  async generateSummary(
    questions,
    answers,
    evaluations,
    role,
    domain,
    mode,
    averageScore
  ) {
    const summaryPrompt = this.getSummaryPrompt(
      questions,
      answers,
      evaluations,
      role,
      domain,
      mode,
      averageScore
    );

    try {
      const result = await this.model.generateContent(summaryPrompt);
      const response = await result.response;
      const content = response.text();

      // Try to parse JSON, fallback if it fails
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, return a structured response
        return {
          overall_score: averageScore,
          strengths: ["Interview completed successfully"],
          weaknesses: ["Summary generation had issues"],
          recommendations: ["Continue practicing interview skills"],
          final_feedback: content,
        };
      }
    } catch (error) {
      console.error("Error generating summary:", error);

      // Generate fallback summary based on evaluations
      const strengths = [];
      const weaknesses = [];
      const recommendations = [];

      if (averageScore >= 7) {
        strengths.push(
          "Strong performance overall",
          "Good communication skills",
          "Relevant experience demonstrated"
        );
      } else if (averageScore >= 5) {
        strengths.push("Adequate performance", "Some good points made");
        weaknesses.push(
          "Could provide more detailed answers",
          "Consider more specific examples"
        );
      } else {
        weaknesses.push(
          "Answers need more detail",
          "Consider practicing more interview questions",
          "Try to be more specific with examples"
        );
      }

      recommendations.push(
        "Continue practicing interview questions",
        "Focus on providing specific examples",
        "Prepare stories that demonstrate your skills"
      );

      return {
        overall_score: averageScore,
        strengths: strengths,
        weaknesses: weaknesses,
        recommendations: recommendations,
        final_feedback: `Interview completed with an average score of ${averageScore.toFixed(
          1
        )}/10. ${
          averageScore >= 7
            ? "Great job!"
            : averageScore >= 5
            ? "Good effort, keep practicing!"
            : "Keep working on your interview skills!"
        }`,
      };
    }
  }

  getQuestionPrompt(role, domain, mode, questionNumber) {
    return `You are an expert interviewer conducting a ${mode} interview for a ${role} position in ${domain}.
    
    Generate a single, well-structured interview question that:
    1. Is appropriate for question ${questionNumber} of 5
    2. Tests relevant skills for the ${role} position
    3. Is specific to the ${domain} domain
    4. Is ${
      mode === "technical"
        ? "technical and problem-solving focused"
        : "behavioral and experience-based"
    }
    5. Is clear and concise
    
    Return only the question text, no additional formatting.`;
  }

  getEvaluationPrompt(question, answer, mode) {
    return `You are an expert interviewer evaluating a candidate's answer.

    Question: ${question}
    Answer: ${answer}
    Interview Type: ${mode}

    Evaluate the answer on a scale of 1-10 based on:
    - Clarity and communication
    - Technical accuracy (for technical questions) or relevant experience (for behavioral)
    - Completeness of response
    - Problem-solving approach
    - Professional presentation

    Return your evaluation as a JSON object with this structure:
    {
      "score": <number 1-10>,
      "strengths": [<array of positive aspects>],
      "weaknesses": [<array of areas for improvement>],
      "suggestions": [<array of specific recommendations>],
      "overall_feedback": "<brief summary of the evaluation>"
    }`;
  }

  getSummaryPrompt(
    questions,
    answers,
    evaluations,
    role,
    domain,
    mode,
    averageScore
  ) {
    return `You are an expert career coach providing a comprehensive interview summary.

    Interview Details:
    - Role: ${role}
    - Domain: ${domain}
    - Type: ${mode}
    - Average Score: ${averageScore}/10

    Questions Asked: ${questions.length}
    Questions: ${questions.join("\n")}

    Generate a comprehensive summary as a JSON object:
    {
      "overall_score": <average score>,
      "strengths": [<array of key strengths demonstrated>],
      "weaknesses": [<array of areas needing improvement>],
      "recommendations": [<array of specific next steps>],
      "final_feedback": "<encouraging summary message>",
      "key_insights": [<array of important observations>]
    }`;
  }
}

export default SimpleInterviewSimulator;
