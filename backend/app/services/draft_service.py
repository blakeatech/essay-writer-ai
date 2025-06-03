from openai import OpenAI
import os
import logging
from app.models.outline import OutlineResponse, OutlineComponent
from app.services.source_service import SourceService
from app.core.config import settings
import re
from app.models.essay import EssayRequest, Section

# Configure logging
logger = logging.getLogger(__name__)

class DraftService:
    """Service for generating paper drafts"""
    
    def __init__(self, essay: EssayRequest):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.essay = essay

        self.previous_section = ""

    def generate_section_prompt(self, section: Section, is_introduction: bool = False, is_conclusion: bool = False, word_count: int = 0, number_of_sections: int = 0):
        """Generate prompt for a specific section"""

        estimated_word_count = word_count // max(number_of_sections, 1)
        try:
            
            # Create prompt with appropriate vocabulary level
            specific_instructions = ""
            if is_introduction:
                specific_instructions = """
                - This is the introduction section.
                - Include a clear thesis statement that communicates the main idea of the essay.
                """
            elif is_conclusion:
                specific_instructions = """
                - This is the conclusion section.
                - Do not introduce new ideas or information.
                - Wrap up the essay and restate the thesis statement.
                """
            prompt = f"""Write a section of a paper. This section should be several paragraphs long and flow naturally. The word count should be {estimated_word_count} words.

            Main idea to cover in this section: {section.main_idea}

            Key points that must be addressed:
            {' '.join(section.subtopics)}

            Sources:
            {str(self.essay.sources)}

            Writing style:
            {self.essay.writing_analysis}

            {specific_instructions}

            Important:
            - Do not use bullet points or markdown
            - Do not use section headers or titles
            - Do not use text that sounds AI-generated, such as overly verbose or overly formal language or text that is commonly used in AI-generated text.
            - Unless otherwise specified, do not use transitions like "In conclusion" or "In summary" or "To summarize."
            - Do not repeat ideas or words unless referencing a previous section or source.
            - Please use specific examples and details to support your points.
            - Do not use overly complex words or phrases. Stick to a 10th grade vocabulary.
            - Do not use this symbol: —
            - Include appropriate transitions between paragraphs
            - Include in-text citations where appropriate. If the author is not provided or listed as "Unknown", use the source title and page number. Do not overuse in-text citations. Aim to include just 1-2 citations for the whole section. Only include the most appropriate sources. If no sources are given, do not include any citations.
            - Each paragraph should be 4-6 sentences long

            If the essay is about literary analysis or analyzing a series, then:
            - Focus on interpreting the meaning of the text or texts.
            - Use specific examples of events that happened in the literature or series and explain how they support the argument or theme.
            - Analyze literary devices such as symbolism, tone, imagery, and character development.
            - Avoid plot summary unless it directly supports analysis.

            If the essay is about a specific work of literature, then:
            - Stay focused on the specific text and its components (plot, character, setting, etc.).
            - Tie all observations back to the thesis or main idea.
            - Discuss how the author's choices affect the meaning or impact of the work.
            - Avoid generic statements like "This book is about love"—be precise.

            If the essay is about a technical topic, then:
            - Use clear, concise language and avoid unnecessary jargon.
            - Define important terms and break down complex ideas step-by-step.
            - Structure the explanation logically and assume the reader is not an expert.
            - Include real-world examples or analogies if helpful.

            If the essay is about a historical event, then:
            - Use specific dates, names, and places to support points.
            - Focus on causes, effects, and broader historical context.
            - Cite primary or secondary sources where appropriate.
            - Avoid applying modern values to historical events (no presentism).

            If the essay is meant to be a book report, then:
            - Summarize the key elements of the book (characters, setting, plot) clearly.
            - Include your personal reaction or opinion where appropriate.
            - Keep tone thoughtful but not overly analytical.
            - Do not turn it into a literary analysis—focus on what the book is and how it impacted you.

            If the essay is meant to be a persuasive argument on a stance, then:
            - Clearly take a position and support it with logical reasoning and evidence.
            - Address possible counterarguments and respond to them.
            - Use strong examples, statistics, or source material to back up claims.
            - Keep tone confident but not aggressive or emotional.
            """
            return prompt
            
        except Exception as e:
            logger.error(f"Error generating section prompt: {str(e)}", exc_info=True)
            return ""

    def generate_refine_prompt(self, section_text: str, word_count: int, number_of_sections: int):
        """Generate prompt for refining a section"""
        estimated_word_count = word_count // max(number_of_sections, 1)
        prompt = f"""Refine the following section of a paper.

        Previous section:
        {self.previous_section}

        Section:
        {section_text}

        Estimated word count:
        {estimated_word_count}

        Please make sure the section is approximately {estimated_word_count} words long.

        Please ensure that the section is not too similar to the previous section and doesn't restate the same ideas or points unless referencing back to the previous section.

        Please ensure that the section doesn't sound AI-generated or use overly complex sentence structure or overly formal language.

        If the language is too complex, simplify it to sound more natural. Please keep the in-text citations.

        Write in a human-like tone that is appropriate for an academic paper. Return the refined section in the same format as the original section with the same paragraph breaks.

        Ensure that the text doesn't exceedingly use in-text citations. There should only be 2 to 3 citations in total.

        Please avoid using the symbol: — as that is a common symbol used in AI-generated text.

        Do not include any markdown formatting (including bolding symbols such as * or **) or bullet points or section headers or titles.
        """
        return prompt
    
    def token_estimater(self, estimated_word_count: int):
        """Estimate the number of tokens in a section"""
        return estimated_word_count * 4

    def refine_section(self, section_text: str, word_count: int, number_of_sections: int):
        """Refine a section of the paper"""
        try:
            prompt = self.generate_refine_prompt(section_text, word_count, number_of_sections)
            if not prompt:
                return ""

            system_prompt = """
            You are a helpful assistant that writes essays. You avoid surface-level analysis and text that sounds AI-generated.
            You speak in a human-like tone that is appropriate for an academic paper. You avoid repeating ideas or words unless referencing a previous section or source.
            """
            estimated_word_count = self.essay.word_count // max(number_of_sections, 1)
            response = self.client.chat.completions.create(
                model="gpt-4o-2024-11-20",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=self.token_estimater(estimated_word_count)
            )
            section_text = response.choices[0].message.content
            section_text = re.sub(r'\*\*', '', section_text)
            section_text = re.sub(r'\*', '', section_text)
            self.previous_section += section_text
            return section_text
            
        except Exception as e:
            logger.error(f"Error refining section: {str(e)}", exc_info=True)
            return section_text

    def generate_section(self, section: Section, is_introduction: bool = False, is_conclusion: bool = False):
        """Generate a section of the paper"""
        try:
            prompt = self.generate_section_prompt(section, is_introduction, is_conclusion, self.essay.word_count, len(self.essay.outline.outline_components))
            if not prompt:
                return ""

            system_prompt = """
            You are a helpful assistant that writes essays. You avoid surface-level analysis and text that sounds AI-generated.
            You speak in a human-like tone that is appropriate for an academic paper. You avoid repeating ideas or words unless referencing a previous section or source.
            
            To avoid sounding AI-generated, you avoid using the following transitional words and opt for simpler, more natural alternatives:

            Accordingly, additionally, arguably, certainly, consequently, hence, however, indeed, moreover, nevertheless, nonetheless, notwithstanding, thus, undoubtedly.

            You also avoid using the following adjectives and opt for simpler, more natural alternatives:

            Adept, commendable, dynamic, efficient, ever-evolving, exciting, exemplary, innovative, invaluable, robust, seamless, synergistic, thought-provoking, transformative, utmost, vibrant, vital.

            You also avoid the following nouns and opt for more natural, contextually appropriate alternatives:

            Efficiency, innovation, institution, integration, implementation, landscape, optimization, realm, tapestry, transformation

            You also avoid using the following verbs and opt for more natural alternatives:

            Aligns, augment, delve, embark, facilitate, implement, integrate, leverage, optimize, streamline, transform, weave, maximize, underscores, utilize

            You also avoid using the following phrases:

            A testament to, in conclusion, in summary, it's important to note, it's important to consider, it's worth noting that, on the contrary, on the other hand, 

            You also avoid:
            - Using the symbol: —
            - Overly complex sentence structure
            - An unusually formal tone
            - Unnecessarily long, flowery, and wordy language
            - Vague statements
            """
                
            response = self.client.chat.completions.create(
                model="gpt-4o-2024-11-20",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}],
                temperature=0.7
            )
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating section: {str(e)}", exc_info=True)
            return ""

    def generate_draft(self):
        """Generate a complete draft of the paper"""
        try:
            logger.info(f"Generating draft for paper: {self.essay.title}")
            draft = ""
            
            # Generate each section and combine them
            for idx, section in enumerate(self.essay.outline.outline_components):
                is_introduction = idx == 0
                is_conclusion = idx == len(self.essay.outline.outline_components) - 1
                section_text = self.generate_section(section, is_introduction, is_conclusion)
                section_text = self.refine_section(section_text, self.essay.word_count, len(self.essay.outline.outline_components))
                draft += section_text
                draft += "\n\n"
            
            logger.info(f"Generated draft with {len(self.essay.sources)} sources")
            return draft
            
        except Exception as e:
            logger.error(f"Error generating draft for '{self.essay.title}': {str(e)}", exc_info=True)
            return "" 