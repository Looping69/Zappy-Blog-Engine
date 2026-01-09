
import { GoogleGenAI } from "@google/genai";
import { AgentId, TokenUsage } from "../types";

export class GeminiService {
  private getPromptForAgent(agentId: AgentId, keyword: string, context: string): string {
    switch (agentId) {
      case AgentId.RESEARCHER:
        return `You are Agent 1: Research & Keyword Analyst. 
        Topic: "${keyword}"
        
        TASKS:
        1. Conduct deep medical research: provide the latest clinical evidence, physiological explanations, and recent statistics.
        2. Keyword Strategy: Identify a Primary Keyword, 3 Secondary Keywords, and 5 Semantic LSI Keywords related to "${keyword}".
        3. Identify target audience (e.g., patients, caregivers, or practitioners).
        4. List at least 3 high-authority source types (e.g., PubMed, WHO, CDC) that would support this content.
        
        Format as a research briefing with a distinct "Keyword Strategy" section.`;

      case AgentId.WRITER:
        return `You are Agent 2: Content Drafting. 
        Topic: "${keyword}"
        
        Using the research provided, you must draft a professional medical blog post following this EXACT TEMPLATE:
        
        --- TEMPLATE START ---
        [META DESCRIPTION]: 150-160 characters summarizing the post.
        [TITLE]: H1 Header incorporating the primary keyword.
        [INTRODUCTION]: 
          - Hook: An engaging clinical or patient-centric opening.
          - Overview: Brief explanation of the topic.
          - Thesis: What this post covers.
        [MAIN BODY]:
          - Use H2 and H3 subheadings.
          - Detailed clinical explanations.
          - Evidence-based subsections.
        [CONCLUSION]:
          - Summary of key takeaways.
          - Call to Action (CTA): e.g., "Consult your physician..."
          - Future Outlook: Trends or upcoming research in this area.
        [MEDICAL DISCLAIMER]: Standard professional warning.
        --- TEMPLATE END ---
        
        Drafting Strategy: Ensure the primary keyword "${keyword}" is used naturally in the Title, first paragraph, and at least two subheadings.
        
        Context:
        ${context}`;

      case AgentId.COMPLIANCE:
        return `You are Agent 3: Medical Accuracy Review. 
        Topic: "${keyword}"
        
        TASKS:
        1. Fact-check the draft. Identify any medically dubious, exaggerated, or dangerous claims.
        2. Safety Warnings: Ensure proper "red flags" or "when to see a doctor" sections are robust.
        3. Accuracy: Ensure clinical terms are used correctly.
        4. Tone Check: Ensure the draft is not providing "diagnostic" advice but rather "educational" information.
        
        Provide specific corrections or rewritten segments to ensure clinical safety.
        
        Draft Content:
        ${context}`;

      case AgentId.ENHANCER:
        return `You are Agent 4: Readability & Engagement Enhancement. 
        Topic: "${keyword}"
        
        TASKS:
        1. Break down complex medical jargon into patient-friendly explanations without losing scientific integrity.
        2. Improve engagement: use active voice, bullet points, and transition phrases.
        3. Empathy Audit: Ensure the tone is supportive for patients dealing with this condition.
        4. Sentence Structure: Vary sentence length for better rhythm.
        
        Content Context:
        ${context}`;

      case AgentId.SEO:
        return `You are Agent 5: SEO Optimization. 
        Topic: "${keyword}"
        
        TASKS:
        1. Keyword Integration: Review the keyword strategy. Ensure the Primary and Secondary keywords are distributed naturally (density ~1.5%).
        2. Header Optimization: Refine H2/H3 headers for search intent (e.g., using questions people ask).
        3. Meta Optimization: Refine the Meta Title and Description.
        4. Internal/External Link Suggestions: Recommend where to link to clinical studies or related topics.
        
        Do NOT engage in keyword stuffing. Focus on semantic relevance and technical E-E-A-T.
        
        Content Context:
        ${context}`;

      case AgentId.EDITOR:
        return `You are Agent 6: Executive Medical Editor.
        Topic: "${keyword}"
        
        Your task is to produce the MASTER VERSION of the medical blog post by synthesizing inputs from 5 specialized agents.
        
        SYNTHESIS GUIDELINES:
        1. CRITICAL: Review the "Medical Accuracy Review" (Compliance) output and prioritize all safety and clinical corrections.
        2. FLOW: Use the "Readability & Engagement" improvements to ensure the text is accessible.
        3. STRUCTURE: Use the "SEO Optimization" headers and keyword placements.
        4. FORMATTING: Ensure clean Markdown with appropriate bolding, lists, and hierarchical headings.
        5. PROFESSIONALISM: The final output must read like a world-class health publication (e.g., Mayo Clinic, NIH).
        
        Output the complete final post including the Title, Meta Info, Full Content, and the mandatory Medical Disclaimer at the very end.
        
        Previous Agent Contexts and Refinements:
        ${context}`;

      default:
        return `Analyze and process "${keyword}" within the medical blog framework.`;
    }
  }

  async runAgentTask(agentId: AgentId, keyword: string, previousContext: string): Promise<{content: string, usage: TokenUsage}> {
    try {
      const prompt = this.getPromptForAgent(agentId, keyword, previousContext);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });

      const usage: TokenUsage = {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        responseTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0
      };

      return {
        content: response.text || "Agent failed to generate response.",
        usage
      };
    } catch (error) {
      console.error(`Error in agent ${agentId}:`, error);
      throw new Error(`Agent ${agentId} encountered a failure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const geminiService = new GeminiService();
