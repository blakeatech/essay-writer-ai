"""
Evaluation utilities for EssayGenius.
Provides functions to validate essay structure, citation formatting, and content quality.
"""

import re
from typing import List, Dict, Any, Optional, Tuple

def validate_essay_structure(essay_text: str, expected_sections: List[str]) -> Dict[str, Any]:
    """
    Validate the structure of an essay against expected sections.
    
    Args:
        essay_text: The full text of the essay
        expected_sections: List of expected section titles/headers
        
    Returns:
        Dictionary containing validation results:
            - has_introduction: Boolean indicating if introduction is present
            - has_conclusion: Boolean indicating if conclusion is present
            - has_body_paragraphs: Boolean indicating if body paragraphs are present
            - missing_sections: List of expected sections not found in the essay
            - section_coverage: Percentage of expected sections found
            - is_valid: Boolean indicating if the essay structure is valid
    """
    # Check for introduction
    has_introduction = bool(
        re.search(r'introduction|^[^\n]+\n+[^\n]', essay_text, re.IGNORECASE) or
        any("introduction" in section.lower() for section in expected_sections)
    )
    
    # Check for conclusion
    has_conclusion = bool(
        re.search(r'conclusion|in\s+summary|to\s+conclude|finally,', essay_text, re.IGNORECASE) or
        any("conclusion" in section.lower() for section in expected_sections)
    )
    
    # Check for body paragraphs (at least 1)
    paragraphs = re.split(r'\n\s*\n', essay_text)
    # Filter out very short paragraphs and those that are likely headers
    body_paragraphs = [p for p in paragraphs if len(p.split()) > 30 and not p.strip().endswith(':')]
    has_body_paragraphs = len(body_paragraphs) >= 1
    
    # Check for expected sections
    found_sections = []
    missing_sections = []
    
    for section in expected_sections:
        # Create a regex pattern that's flexible for section matching
        # This handles variations in formatting (e.g., "I. Introduction" vs "Introduction:")
        pattern = re.escape(section).replace(r"\ ", r"\s+").replace(r"\.", r"\.?")
        pattern = f"({pattern}|{re.escape(section.split('.')[-1].strip())})"
        
        if re.search(pattern, essay_text, re.IGNORECASE):
            found_sections.append(section)
        else:
            missing_sections.append(section)
    
    # Calculate section coverage
    section_coverage = (len(found_sections) / len(expected_sections)) * 100 if expected_sections else 100
    
    # Determine if structure is valid (must have intro, conclusion, and at least one body paragraph)
    is_valid = has_introduction and has_conclusion and has_body_paragraphs and section_coverage >= 75
    
    return {
        "has_introduction": has_introduction,
        "has_conclusion": has_conclusion,
        "has_body_paragraphs": has_body_paragraphs,
        "body_paragraph_count": len(body_paragraphs),
        "missing_sections": missing_sections,
        "section_coverage": section_coverage,
        "is_valid": is_valid
    }


def validate_citations(essay_text: str, sources: List[Dict[str, Any]], citation_style: str) -> Dict[str, Any]:
    """
    Validate citations in an essay against provided sources.
    
    Args:
        essay_text: The full text of the essay
        sources: List of source dictionaries
        citation_style: Citation style (APA, MLA, Chicago)
        
    Returns:
        Dictionary containing validation results:
            - has_citations: Boolean indicating if citations are present
            - has_bibliography: Boolean indicating if bibliography/references are present
            - citation_count: Number of citations found
            - sources_cited: List of sources that are cited in the essay
            - uncited_sources: List of sources not cited in the essay
            - citation_coverage: Percentage of sources that are cited
            - is_valid: Boolean indicating if citations are valid
    """
    # Check for bibliography/references section
    has_bibliography = bool(
        re.search(r'references|works cited|bibliography', essay_text, re.IGNORECASE)
    )
    
    # Count citations based on citation style
    citation_patterns = {
        "APA": r'\(\s*[A-Za-z]+(?:\s+et\s+al\.)?(?:\s*,\s*\d{4})?(?:\s*,\s*p\.?\s*\d+(?:-\d+)?)?\s*\)',
        "MLA": r'\(\s*[A-Za-z]+(?:\s+et\s+al\.)?(?:\s+\d+(?:-\d+)?)?\s*\)',
        "Chicago": r'\(\s*[A-Za-z]+(?:\s+et\s+al\.)?(?:\s+\d{4})?(?:\s*,\s*\d+(?:-\d+)?)?\s*\)'
    }
    
    # Default to APA if style not recognized
    pattern = citation_patterns.get(citation_style.upper(), citation_patterns["APA"])
    citations = re.findall(pattern, essay_text)
    citation_count = len(citations)
    has_citations = citation_count > 0
    
    # Check which sources are cited
    sources_cited = []
    uncited_sources = []
    
    for source in sources:
        author_last_name = source["author"].split()[-1]
        
        # Check if author is cited
        author_pattern = re.escape(author_last_name)
        if re.search(author_pattern, essay_text, re.IGNORECASE):
            sources_cited.append(source)
        else:
            uncited_sources.append(source)
    
    # Calculate citation coverage
    citation_coverage = (len(sources_cited) / len(sources)) * 100 if sources else 100
    
    # Determine if citations are valid
    is_valid = has_citations and has_bibliography and citation_coverage >= 75
    
    return {
        "has_citations": has_citations,
        "has_bibliography": has_bibliography,
        "citation_count": citation_count,
        "sources_cited": sources_cited,
        "uncited_sources": uncited_sources,
        "citation_coverage": citation_coverage,
        "is_valid": is_valid
    }


def evaluate_essay_quality(essay_text: str) -> Dict[str, Any]:
    """
    Evaluate the overall quality of an essay.
    
    Args:
        essay_text: The full text of the essay
        
    Returns:
        Dictionary containing quality metrics:
            - word_count: Total word count
            - avg_sentence_length: Average sentence length
            - avg_paragraph_length: Average paragraph length
            - readability_score: Estimated readability score
            - complexity_level: Estimated complexity level (basic, intermediate, advanced)
    """
    # Count words
    words = re.findall(r'\b\w+\b', essay_text)
    word_count = len(words)
    
    # Count sentences
    sentences = re.split(r'[.!?]+', essay_text)
    sentences = [s.strip() for s in sentences if s.strip()]
    sentence_count = len(sentences)
    
    # Count paragraphs
    paragraphs = re.split(r'\n\s*\n', essay_text)
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    paragraph_count = len(paragraphs)
    
    # Calculate averages
    avg_sentence_length = word_count / sentence_count if sentence_count else 0
    avg_paragraph_length = word_count / paragraph_count if paragraph_count else 0
    
    # Simple readability score (based on average sentence length)
    # This is a simplified version of readability metrics like Flesch-Kincaid
    if avg_sentence_length < 12:
        readability_score = "Easy"
        complexity_level = "Basic"
    elif avg_sentence_length < 18:
        readability_score = "Moderate"
        complexity_level = "Intermediate"
    else:
        readability_score = "Difficult"
        complexity_level = "Advanced"
    
    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "paragraph_count": paragraph_count,
        "avg_sentence_length": avg_sentence_length,
        "avg_paragraph_length": avg_paragraph_length,
        "readability_score": readability_score,
        "complexity_level": complexity_level
    }


def check_plagiarism_indicators(essay_text: str) -> Dict[str, Any]:
    """
    Check for indicators of potential plagiarism in an essay.
    This is not a full plagiarism check but looks for common indicators.
    
    Args:
        essay_text: The full text of the essay
        
    Returns:
        Dictionary containing plagiarism indicators:
            - style_inconsistencies: Number of potential style inconsistencies
            - unusual_formatting: Boolean indicating if unusual formatting is present
            - citation_issues: Number of potential citation issues
            - risk_level: Estimated plagiarism risk level (low, moderate, high)
    """
    # Check for style inconsistencies (sudden changes in writing style)
    paragraphs = re.split(r'\n\s*\n', essay_text)
    style_inconsistencies = 0
    
    # Simple heuristic: check for paragraphs with significantly different avg word lengths
    avg_word_lengths = []
    for paragraph in paragraphs:
        words = re.findall(r'\b\w+\b', paragraph)
        if words:
            avg_length = sum(len(word) for word in words) / len(words)
            avg_word_lengths.append(avg_length)
    
    if avg_word_lengths:
        mean_length = sum(avg_word_lengths) / len(avg_word_lengths)
        for length in avg_word_lengths:
            if abs(length - mean_length) > 1.5:  # Threshold for significant difference
                style_inconsistencies += 1
    
    # Check for unusual formatting
    unusual_formatting = bool(
        re.search(r'[^\x00-\x7F]', essay_text) or  # Non-ASCII characters
        re.search(r'[^\s\w.,;:!?"\'-]', essay_text)  # Unusual punctuation
    )
    
    # Check for citation issues
    citation_issues = 0
    
    # Missing closing parenthesis in citations
    open_parens = len(re.findall(r'\([^)]*$', essay_text, re.MULTILINE))
    citation_issues += open_parens
    
    # Inconsistent citation formats
    citation_formats = {
        "apa_year": len(re.findall(r'\(\s*\w+\s*,\s*\d{4}\s*\)', essay_text)),
        "mla_page": len(re.findall(r'\(\s*\w+\s+\d+\s*\)', essay_text)),
        "chicago": len(re.findall(r'\d+\.\s+\w+', essay_text))
    }
    
    # If multiple citation formats are used, count as issues
    if sum(1 for count in citation_formats.values() if count > 0) > 1:
        citation_issues += sum(citation_formats.values()) - max(citation_formats.values())
    
    # Determine risk level
    if style_inconsistencies > 3 or unusual_formatting or citation_issues > 3:
        risk_level = "High"
    elif style_inconsistencies > 1 or citation_issues > 1:
        risk_level = "Moderate"
    else:
        risk_level = "Low"
    
    return {
        "style_inconsistencies": style_inconsistencies,
        "unusual_formatting": unusual_formatting,
        "citation_issues": citation_issues,
        "risk_level": risk_level
    }
