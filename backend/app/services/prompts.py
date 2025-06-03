"""
Prompt templates for EssayGenius AI services.
Contains structured prompts for outline generation, source retrieval, 
draft generation, and citation formatting.
"""

class PromptTemplates:
    # Outline generation prompts
    OUTLINE_PROMPT = """
    Generate a {paragraph_count}-paragraph outline on {topic} in {citation_style} format.
    The outline should include:
    1. Introduction with a clear thesis statement
    2. {body_paragraph_count} body paragraphs with main arguments
    3. Conclusion summarizing key points
    
    Include section headers and bullet points for each main idea.
    """
    
    OUTLINE_WITH_SOURCES_PROMPT = """
    Generate a {paragraph_count}-paragraph outline on {topic} in {citation_style} format.
    The outline should incorporate the following sources:
    {sources}
    
    The outline should include:
    1. Introduction with a clear thesis statement
    2. {body_paragraph_count} body paragraphs with main arguments
    3. Conclusion summarizing key points
    
    Include section headers and bullet points for each main idea.
    """
    
    # Source retrieval prompts
    SOURCE_RETRIEVAL_PROMPT = """
    Find {source_count} high-quality academic sources on the topic: {topic}
    
    For each source, provide:
    1. Title
    2. Author(s)
    3. Publication year
    4. Publication venue (journal, conference, etc.)
    5. A brief summary of the source's relevance to the topic
    6. Key points that could be cited in the essay
    
    Focus on sources that are peer-reviewed, recent (within the last {max_years} years unless historically significant),
    and directly relevant to the topic.
    """
    
    # Draft generation prompts
    DRAFT_GENERATION_PROMPT = """
    Generate a well-structured {paragraph_count}-paragraph essay on {topic} following {citation_style} format.
    
    Use the following outline:
    {outline}
    
    Incorporate these sources:
    {sources}
    
    The essay should include:
    1. An engaging introduction with a clear thesis statement
    2. Well-developed body paragraphs with topic sentences, evidence, analysis, and transitions
    3. A conclusion that restates the thesis and provides closure
    4. Proper in-text citations in {citation_style} format
    5. A complete references/works cited section at the end
    
    Writing style: {writing_style}
    Tone: {tone}
    """
    
    # Citation formatting prompts
    CITATION_FORMATTING_PROMPT = """
    Format the following sources according to {citation_style} citation style:
    
    {sources}
    
    For each source, provide:
    1. In-text citation format
    2. Reference list/bibliography entry
    
    Follow all {citation_style} formatting rules including proper punctuation, 
    italicization, and ordering of elements.
    """
    
    # Essay evaluation prompt
    ESSAY_EVALUATION_PROMPT = """
    Evaluate the following essay on {topic} for academic quality and structure:
    
    {essay_content}
    
    Assess the following aspects:
    1. Structure (introduction, body paragraphs, conclusion)
    2. Thesis clarity and development
    3. Evidence and source integration
    4. Citation accuracy and formatting ({citation_style})
    5. Grammar, style, and academic tone
    6. Overall coherence and flow
    
    Provide specific suggestions for improvement.
    """


def format_prompt(prompt_template, **kwargs):
    """
    Format a prompt template with the provided keyword arguments.
    
    Args:
        prompt_template (str): The prompt template string
        **kwargs: Keyword arguments to format the template
        
    Returns:
        str: The formatted prompt
    """
    return prompt_template.format(**kwargs)
