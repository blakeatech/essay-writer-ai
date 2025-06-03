'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Upload, AlertTriangle, AlertCircle, FileText, ChevronRight, ChevronLeft, ExternalLink, Plus, Trash2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getOutlineAndSources, OutlineResponse, Source, OutlineComponent, startOutlineAndSourcesJob, getJobStatus, essayAPI, generateEssayJob, getEssayStatus } from '../api/essay-api';
import { getUserCredits } from "@/lib/userProfile";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard } from "lucide-react";

// Placeholder data for API responses
const EXAMPLE_TOPICS = [
  "Analyze the impact of social media on modern communication",
  "Compare and contrast traditional and online education methods",
  "Discuss the ethical implications of artificial intelligence",
];

const PLACEHOLDER_CITATIONS = [
  { 
    id: 1, 
    title: "The Impact of Social Media on Modern Society", 
    author: "John Smith", 
    year: 2022, 
    selected: false,
    publisher: "Journal of Digital Studies",
    description: "A comprehensive study examining how social media platforms have transformed societal interactions",
    relevance: "Directly addresses the impact of social media on communication patterns",
    url: "https://example.com/paper1",
  },
  { 
    id: 2, 
    title: "Digital Age Communication", 
    author: "Sarah Johnson", 
    year: 2021, 
    selected: false,
    publisher: "Communications Quarterly",
    description: "Analysis of communication methods in the digital era",
    relevance: "Provides historical context and current trends in digital communication",
    url: "https://example.com/paper2",
  },
  { 
    id: 3, 
    title: "Understanding Social Networks", 
    author: "Michael Brown", 
    year: 2023, 
    selected: false,
    publisher: "Tech & Society Review",
    description: "Research on social network dynamics and their influence on society",
    relevance: "Explores the psychological aspects of social media interaction",
    url: "https://example.com/paper3",
  },
];

const PLACEHOLDER_OUTLINE = {
  title: "The Impact of Social Media",
  sections: [
    {
      title: "Introduction",
      subsections: ["Background of social media", "Thesis statement"]
    },
    {
      title: "Positive Effects",
      subsections: ["Enhanced connectivity", "Business opportunities", "Information sharing"]
    },
    {
      title: "Negative Effects",
      subsections: ["Mental health concerns", "Privacy issues", "Addiction"]
    },
    {
      title: "Conclusion",
      subsections: ["Summary of findings", "Future implications"]
    }
  ]
};

const CITATION_FORMATS = [
  { value: "apa", label: "APA" },
  { value: "mla", label: "MLA" },
  { value: "chicago", label: "Chicago" },
  { value: "harvard", label: "Harvard" },
];

export default function EssayForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: "",
    wordCount: 1500,
    citationFormat: "apa",
    writingStyle: "",
    selectedCitations: [] as number[],
    outline: null,
    studentName: "",
    professorName: "",
    className: "",
  });
  const [promptQuality, setPromptQuality] = useState<"poor" | "good" | "great" | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedAssignment, setUploadedAssignment] = useState<File | null>(null);
  const [citations, setCitations] = useState(PLACEHOLDER_CITATIONS);
  const [outline, setOutline] = useState(PLACEHOLDER_OUTLINE);
  const [pastedAssignment, setPastedAssignment] = useState("");
  const [writingAnalysis, setWritingAnalysis] = useState("");
  const [pastedEssay, setPastedEssay] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState<"sources" | "outline" | null>(null);
  const [generationStage, setGenerationStage] = useState<{
    writing: boolean;
    plagiarism: boolean;
    finalizing: boolean;
  }>({
    writing: false,
    plagiarism: false,
    finalizing: false,
  });
  const [apiOutline, setApiOutline] = useState<OutlineResponse | null>(null);
  const [apiSources, setApiSources] = useState<Source[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [showCreditConfirmation, setShowCreditConfirmation] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [essayJobId, setEssayJobId] = useState<string | null>(null);
  const [isFileLoading, setIsFileLoading] = useState<{
    essay: boolean;
    assignment: boolean;
  }>({
    essay: false,
    assignment: false,
  });
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingEssay, setIsGeneratingEssay] = useState(false);

  const totalSteps = 6;

  const assessPromptQuality = (prompt: string) => {
    if (prompt.length < 20) return "poor";
    if (prompt.length < 50) return "good";
    return "great";
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setFormData({ ...formData, topic: newPrompt });
    setPromptQuality(assessPromptQuality(newPrompt));
  };

  const handleExampleTopicClick = (topic: string) => {
    setFormData({ ...formData, topic: topic });
    setPromptQuality(assessPromptQuality(topic));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'essay' | 'assignment') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (type === 'essay') {
        setUploadedFile(file);
        setIsFileLoading({...isFileLoading, essay: true});
        
        // Extract text from the file
        try {
          const text = await extractTextFromFile(file);
          setPastedEssay(text);
        } catch (error) {
          console.error("Error extracting text from file:", error);
          setError("Failed to extract text from the uploaded file. Please try pasting the content manually.");
        } finally {
          setIsFileLoading({...isFileLoading, essay: false});
        }
      } else {
        setUploadedAssignment(file);
        setIsFileLoading({...isFileLoading, assignment: true});
        
        // Extract text from the file
        try {
          const text = await extractTextFromFile(file);
          setPastedAssignment(text);
        } catch (error) {
          console.error("Error extracting text from file:", error);
          setError("Failed to extract text from the uploaded file. Please try pasting the content manually.");
        } finally {
          setIsFileLoading({...isFileLoading, assignment: false});
        }
      }
    }
  };

  // Function to extract text from different file types
  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType === 'pdf') {
      // For PDF files
      const pdfjs = await import('pdfjs-dist');
      // Set the worker source
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        text += strings.join(' ') + '\n';
      }
      
      return text;
    } else if (fileType === 'docx') {
      // For DOCX files
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else if (fileType === 'doc') {
      // For DOC files - this is more complex and might require server-side processing
      // For now, we'll show a message to the user
      throw new Error("DOC files are not fully supported. Please convert to DOCX or PDF, or paste the content manually.");
    } else {
      throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
    }
  };

  const handleCitationToggle = (id: number) => {
    setCitations(citations.map(citation => 
      citation.id === id ? { ...citation, selected: !citation.selected } : citation
    ));
  };

  const addNewSection = () => {
    setOutline({
      ...outline,
      sections: [
        ...outline.sections,
        { title: "New Section", subsections: ["New subsection"] }
      ]
    });
  };

  const deleteSection = (index: number) => {
    const newSections = [...outline.sections];
    newSections.splice(index, 1);
    setOutline({ ...outline, sections: newSections });
  };

  const addNewSubsection = (sectionIndex: number) => {
    const newOutline = { ...outline };
    newOutline.sections[sectionIndex].subsections.push("New subsection");
    setOutline(newOutline);
  };

  const deleteSubsection = (sectionIndex: number, subsectionIndex: number) => {
    const newOutline = { ...outline };
    newOutline.sections[sectionIndex].subsections.splice(subsectionIndex, 1);
    setOutline(newOutline);
  };

  const fetchSourcesAndOutline = async () => {
    setIsLoading(true);
    setIsGeneratingOutline(true);
    setLoadingProgress(0);
    setLoadingStage("sources");
    setError(null);
    
    try {
      // Start the job
      const jobResponse = await startOutlineAndSourcesJob({
        topic: formData.topic,
        assignment_description: pastedAssignment || "",
        writing_style: formData.writingStyle,
        word_count: formData.wordCount,
        previous_essay: pastedEssay || "",
        citation_format: formData.citationFormat,
        num_sources: 3
      });
      
      if ('error' in jobResponse && jobResponse.error) {
        // Check if it's a guardrail error
        if (jobResponse.error.includes("Malicious prompt") || 
            jobResponse.error.includes("detected something strange")) {
          setError("We detected something strange in your assignment topic and description. Please rewrite it.");
          setIsLoading(false);
          setIsGeneratingOutline(false);
          setLoadingProgress(0);
          setLoadingStage(null);
          setCurrentStep(1); // Go back to step 1
          return;
        }
        
        throw new Error(jobResponse.error);
      }
      
      // Store the job ID and start polling
      setJobId(jobResponse.job_id);
      
    } catch (error) {
      console.error("Error fetching sources and outline:", error);
      setError(error instanceof Error ? error.message : "Failed to generate outline and sources");
      setIsLoading(false);
      setIsGeneratingOutline(false);
      setLoadingProgress(0);
      setLoadingStage(null);
    }
  };

  const generateFinalEssay = async () => {
    setIsLoading(true);
    setIsGeneratingEssay(true);
    setLoadingProgress(0);
    setGenerationStage({ writing: true, plagiarism: false, finalizing: false });
    setError(null);
    
    try {
      // Prepare the selected sources
      const selectedSourcesData = citations
        .filter(citation => citation.selected)
        .map(citation => ({
          title: citation.title,
          author: citation.author,
          publication_info: citation.publisher,
          author_last_name: citation.author.split(' ').pop() || '',
          publication_year: citation.year,
          url: citation.url,
          apa_citation: `${citation.author} (${citation.year}). ${citation.title}. ${citation.publisher}.`,
          relevance: citation.relevance,
          details: citation.description
        }));
      
      // Create the essay data object
      const essayData = {
        title: formData.topic,
        outline: apiOutline || {
          outline_components: outline.sections.map(section => ({
            main_idea: section.title,
            subtopics: section.subsections
          }))
        },
        word_count: formData.wordCount,
        sources: selectedSourcesData,
        studentName: formData.studentName || "Your Name",
        professorName: formData.professorName || "Your Professor",
        className: formData.className || "Your Class",
        citation_format: formData.citationFormat,
        writing_analysis: writingAnalysis || formData.writingStyle
      };
      
      
      // Start the essay generation job
      const jobResponse = await generateEssayJob(essayData);
      
      if ('error' in jobResponse && jobResponse.error) {
        // Check if it's a guardrail error
        if (jobResponse.error.includes("Malicious prompt") || 
            jobResponse.error.includes("detected something strange")) {
          setError("We detected something strange in your outline. Please make adjustments to it.");
          setIsLoading(false);
          setIsGeneratingEssay(false);
          setLoadingProgress(0);
          setGenerationStage({ writing: false, plagiarism: false, finalizing: false });
          setCurrentStep(2); // Go back to outline editing step
          return;
        }
        
        throw new Error(jobResponse.error);
      }
      
      // Store the job ID for polling
      setEssayJobId(jobResponse.job_id);
      
    } catch (err) {
      console.error("Error starting essay generation:", err);
      setError(err instanceof Error ? err.message : "Failed to start essay generation");
      setIsLoading(false);
      setIsGeneratingEssay(false);
      setLoadingProgress(0);
      setGenerationStage({ writing: false, plagiarism: false, finalizing: false });
    }
  };

  const getStepContent = () => {
    if (isLoading) {
      if (loadingStage) {
        return (
          <div className="py-12 space-y-8">
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                {loadingStage === "sources" ? (
                  <h3 className="text-xl font-medium">Finding relevant academic sources</h3>
                ) : (
                  <h3 className="text-xl font-medium">Generating essay outline</h3>
                )}
              </div>
              <p className="text-gray-500">
                {loadingStage === "sources" 
                  ? "We're searching through academic databases to find the most relevant sources for your essay..."
                  : "Creating a structured outline based on your topic and selected sources..."}
              </p>
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <Progress value={loadingProgress} className="h-2" />
              <p className="text-sm text-gray-500 text-right">{loadingProgress}%</p>
            </div>
          </div>
        );
      } else {
        // This is the essay generation checklist view
        return (
          <div className="py-12 space-y-8">
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center mb-6">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-medium">Generating your essay</h3>
                <p className="text-gray-500 mt-2">Please wait while we create your essay...</p>
              </div>
              <div className="space-y-2">
                <Progress value={loadingProgress} className="h-2" />
                <p className="text-sm text-gray-500 text-right">{loadingProgress}%</p>
              </div>
            </div>
          </div>
        );
      }
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label>Essay Topic (Required)</Label>
              <Textarea
                placeholder="Enter your essay topic here..."
                className="min-h-[100px]"
                value={formData.topic}
                onChange={handlePromptChange}
              />
              {promptQuality && (
                <div className={`flex items-center gap-2 mt-2 ${
                  promptQuality === "poor" ? "text-red-500" :
                  promptQuality === "good" ? "text-yellow-500" :
                  "text-green-500"
                }`}>
                  {promptQuality === "poor" ? <AlertTriangle className="h-4 w-4" /> :
                   promptQuality === "good" ? <AlertCircle className="h-4 w-4" /> :
                   <Check className="h-4 w-4" />}
                  <span className="text-sm">
                    {promptQuality === "poor" ? "Please provide more information about your topic" :
                     promptQuality === "good" ? "Good topic" :
                     "Great topic"}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Assignment Description (Optional)</Label>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'assignment')}
                >
                  <input
                    type="file"
                    accept=".doc,.docx,.pdf"
                    onChange={(e) => handleFileUpload(e, 'assignment')}
                    className="hidden"
                    id="assignment-upload"
                  />
                  <label htmlFor="assignment-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      {isFileLoading.assignment ? (
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {isFileLoading.assignment 
                          ? "Extracting text..." 
                          : uploadedAssignment 
                            ? uploadedAssignment.name 
                            : "Upload or drag and drop assignment description"}
                      </span>
                      <span className="text-xs text-gray-400">
                        DOCX or PDF
                      </span>
                    </div>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Or paste your assignment description here:</Label>
                  <Textarea
                    placeholder="Paste your assignment description here..."
                    value={pastedAssignment}
                    onChange={(e) => setPastedAssignment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Student Information (Required)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    placeholder="Your name"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="professorName">Professor Name</Label>
                  <Input
                    id="professorName"
                    placeholder="Professor's name"
                    value={formData.professorName}
                    onChange={(e) => setFormData({ ...formData, professorName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="className">Class Name</Label>
                  <Input
                    id="className"
                    placeholder="Class or course name"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Word Count</Label>
              <p className="text-sm text-gray-600">Enter the desired word count of your essay.</p>
              <div className="pt-2">
                <Label className="text-base">Word Count: {formData.wordCount}</Label>
                <Slider
                  value={[formData.wordCount]}
                  onValueChange={(value) => setFormData({ ...formData, wordCount: value[0] })}
                  min={500}
                  max={3000}
                  step={100}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>500 words</span>
                  <span>3000 words</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-600 mb-4">Select the desired citation format and writing style of your essay.</p>
            <div className="space-y-2">
              <Label>Citation Format</Label>
              <Select
                value={formData.citationFormat}
                onValueChange={(value) => setFormData({ ...formData, citationFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select citation format" />
                </SelectTrigger>
                <SelectContent>
                  {CITATION_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Writing Style</Label>
              <Select
                value={formData.writingStyle}
                onValueChange={(value) => setFormData({ ...formData, writingStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select writing style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                  <SelectItem value="argumentative">Argumentative</SelectItem>
                  <SelectItem value="narrative">Narrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Upload Previous Essay (Optional)</Label>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'essay')}
                >
                  <input
                    type="file"
                    accept=".doc,.docx,.pdf"
                    onChange={(e) => handleFileUpload(e, 'essay')}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      {isFileLoading.essay ? (
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {isFileLoading.essay 
                          ? "Extracting text..." 
                          : uploadedFile 
                            ? uploadedFile.name 
                            : "Click to upload or drag and drop"}
                      </span>
                      <span className="text-xs text-gray-400">
                        DOC, DOCX, or PDF (max. 10MB)
                      </span>
                    </div>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Or paste your essay here:</Label>
                  <Textarea
                    placeholder="Paste your previous essay here..."
                    value={pastedEssay}
                    onChange={(e) => setPastedEssay(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Upload a previous essay to help us match your writing style and tone in the generated essay.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Select Relevant Citations</Label>
              <p className="text-sm text-gray-600 mb-4">
                We found the following citations relevant to your topic. Please select the ones you'd like to include in your essay.
              </p>
              <div className="space-y-3">
                {citations.map((citation) => (
                  <TooltipProvider key={citation.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            citation.selected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
                          }`}
                          onClick={() => handleCitationToggle(citation.id)}
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium">{citation.title}</h4>
                              <p className="text-sm text-gray-600">
                                {citation.relevance}
                              </p>
                            </div>
                            {citation.selected && (
                              <Check className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(citation.url, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-3">
                        <div className="space-y-2">
                          <p><strong>Author:</strong> {citation.author}</p>
                          <p><strong>Date:</strong> {citation.year}</p>
                          <p><strong>Publisher:</strong> {citation.publisher}</p>
                          <p><strong>Description:</strong> {citation.description}</p>
                          <p><strong>Relevance:</strong> {citation.relevance}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Essay Outline</Label>
              <p className="text-sm text-gray-600 mb-4">
                Here's our proposed structure for your essay. Feel free to modify sections and subsections to better suit your needs.
              </p>
              <div className="space-y-4">
                {outline.sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-sm text-primary">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => {
                          const newOutline = { ...outline };
                          newOutline.sections[index].title = e.target.value;
                          setOutline(newOutline);
                        }}
                        className="font-medium bg-transparent border-none p-0 focus:ring-0 w-full"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSection(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="ml-8 space-y-2">
                      {section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={subsection}
                            onChange={(e) => {
                              const newOutline = { ...outline };
                              newOutline.sections[index].subsections[subIndex] = e.target.value;
                              setOutline(newOutline);
                            }}
                            className="text-sm text-gray-600 bg-transparent border-none p-0 focus:ring-0 w-full"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSubsection(index, subIndex)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addNewSubsection(index)}
                        className="text-primary hover:bg-primary/5"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subsection
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addNewSection}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Section
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Essay Topic";
      case 2: return "Word Count";
      case 3: return "Format & Style";
      case 4: return "Writing Style Analysis";
      case 5: return "Citations";
      case 6: return "Outline";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Enter your essay topic and get instant feedback";
      case 2: return "Choose your desired essay length";
      case 3: return "Select citation format and writing style";
      case 4: return "Upload a previous essay to match your writing style";
      case 5: return "Choose relevant citations for your essay";
      case 6: return "Review and customize your essay outline";
      default: return "";
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        // Require essay topic with at least 20 characters (poor quality threshold)
        return formData.topic.length >= 20 && formData.studentName && formData.professorName && formData.className;
      case 2:
        // Word count is always valid as it has a default value
        return true;
      case 3:
        // Require both citation format and writing style
        return formData.citationFormat && formData.writingStyle;
      default:
        return true;
    }
  };

  const getNextButtonText = () => {
    if (currentStep === totalSteps) {
      return "Generate Essay";
    }
    if (currentStep === 4) {
      return (
        <>
          Find sources for essay
          <ChevronRight className="h-4 w-4 ml-2" />
        </>
      );
    }
    if (!isStepValid() || insufficientCredits) {
      switch (currentStep) {
        case 1:
          return "Please fill out all required fields or purchase credits to proceed";
        case 3:
          return formData.citationFormat && !formData.writingStyle 
            ? "Please select writing style"
            : !formData.citationFormat && formData.writingStyle
            ? "Please select citation format"
            : "Please complete all fields";
        default:
          return "Please complete required fields";
      }
    }
    return (
      <>
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </>
    );
  };

  // This useEffect will handle the polling whenever jobId changes
  useEffect(() => {
    // Only set up polling if we have a jobId and we're in loading state
    if (jobId && isLoading) {
      
      // Create the polling function
      const pollJobStatus = async () => {
        try {
          const status = await getJobStatus(jobId);
          
          // Update UI based on status
          setLoadingProgress(status.progress);
          
          if (status.stage === "creating_outline") {
            setLoadingStage("outline");
          } else if (status.stage === "finding_sources") {
            setLoadingStage("sources");
          }
          
          // Check if job is complete
          if (status.status === "completed" && status.result) {
            
            // Process the result
            setApiOutline(status.result.outline);
            setWritingAnalysis(status.result.writing_analysis);
            setApiSources(status.result.sources);
            
            // Convert API outline to the format used in your UI
            const convertedOutline = {
              title: formData.topic,
              sections: status.result.outline.outline_components.map(component => ({
                title: component.main_idea,
                subsections: component.subtopics
              }))
            };
            
            setOutline(convertedOutline);
            
            // Log the structure to understand what we're working with

            // Try a different approach based on the actual structure
            let flatSources: any[] = [];
            try {
              // If it's an array of arrays (nested structure)
              if (Array.isArray(status.result.sources[0])) {
                flatSources = status.result.sources.flat();
              } 
              // If each item has a 'sources' property
              else if (status.result.sources[0] && 'sources' in status.result.sources[0]) {
                flatSources = status.result.sources.flatMap(item => (item as any).sources);
              }
              // If it's already a flat array of source objects
              else {
                flatSources = status.result.sources;
              }
            } catch (e) {
              console.error("Error processing sources:", e);
              flatSources = [];
            }

            // Filter out any null/undefined values
            flatSources = flatSources.filter(source => source);

            const convertedSources = flatSources.map((source, index) => ({
              id: index + 1,
              title: source.title || "Unknown Title",
              author: source.author || "Unknown",
              year: source.publication_year || new Date().getFullYear(),
              selected: false,
              publisher: source.publication_info || "Academic Source",
              description: source.details || "",
              relevance: source.relevance || "Relevant to your topic",
              url: source.url || "#"
            }));
            
            setCitations(convertedSources);
            
            // Complete the loading process
            setIsLoading(false);
            setIsGeneratingOutline(false);
            setLoadingProgress(100);
            setLoadingStage(null);
            setCurrentStep(5); // Move to citations step
            
            // Clear the job ID
            setJobId(null);
            return true; // Signal that we're done polling
          }
          
          // Check if job failed
          if (status.status === "failed") {
            console.error("Job failed with error:", status.error);
            setError(status.error || "Job failed");
            setIsLoading(false);
            setIsGeneratingOutline(false);
            setLoadingProgress(0);
            setLoadingStage(null);
            
            // Clear the job ID
            setJobId(null);
            return true; // Signal that we're done polling
          }
          
          // If we're still processing, continue polling
          return false;
          
        } catch (pollError) {
          console.error("Error during polling:", pollError);
          setError(pollError instanceof Error ? pollError.message : "Failed to check job status");
          setIsLoading(false);
          setIsGeneratingOutline(false);
          setLoadingProgress(0);
          setLoadingStage(null);
          
          // Clear the job ID
          setJobId(null);
          return true; // Signal that we're done polling
        }
      };
      
      // Immediately poll once
      pollJobStatus();
      
      // Then set up interval
      const interval = setInterval(async () => {
        const isDone = await pollJobStatus();
        if (isDone) {
          clearInterval(interval);
        }
      }, 2000);
      
      // Clean up the interval when the component unmounts or jobId changes
      return () => {
        clearInterval(interval);
      };
    }
  }, [jobId, isLoading]);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const credits = await getUserCredits();
        setUserCredits(credits);
        // Set insufficient credits if less than 2 credits
        setInsufficientCredits(credits < 2);
      } catch (error) {
        console.error("Error fetching user credits:", error);
        setUserCredits(0);
        setInsufficientCredits(true);
      }
    }
    
    fetchCredits();
  }, []);

  const handleGenerateOutline = () => {
    // Validate form data first
    if (!formData.topic) {
      setError("Please enter an essay topic");
      return;
    }
    if (!formData.studentName) {
      setError("Please enter a student name");
      return;
    }
    if (!formData.professorName) {
      setError("Please enter a professor name");
      return;
    }
    if (!formData.className) {
      setError("Please enter a class name");
      return;
    }
    
    // Show credit confirmation dialog
    setShowCreditConfirmation(true);
  };

  const confirmAndGenerateOutline = async () => {
    setShowCreditConfirmation(false);
    
    try {
      // Start the actual generation process
      await fetchSourcesAndOutline();
      
      // Update user credits after successful generation
      const updatedCredits = await getUserCredits();
      setUserCredits(updatedCredits);
    } catch (err) {
      console.error("Error generating outline:", err);
      setError(err instanceof Error ? err.message : "Failed to generate outline");
    }
  };

  // Add a new useEffect for polling the essay generation status
  useEffect(() => {
    if (essayJobId && isLoading) {
      
      const pollEssayStatus = async () => {
        try {
          const status = await getEssayStatus(essayJobId);
          
          // Update UI based on status
          setLoadingProgress(status.progress);
          
          if (status.stage === "writing_essay") {
            setGenerationStage({ writing: true, plagiarism: false, finalizing: false });
          } else if (status.stage === "checking_plagiarism") {
            setGenerationStage({ writing: true, plagiarism: true, finalizing: false });
          } else if (status.stage === "finalizing") {
            setGenerationStage({ writing: true, plagiarism: true, finalizing: true });
          }
          
          // Check if job is complete
          if (status.status === "completed" && status.result) {
            
            // Wait a moment to show the completed progress
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Navigate to the dashboard with the My Essays tab active and highlight the new essay
            if (status.result.paper_id) {
              window.location.href = `/dashboard?tab=history&highlight=${status.result.paper_id}`;
            } else {
              // Reset loading state
              setIsLoading(false);
              setIsGeneratingEssay(false);
              setLoadingProgress(0);
              setGenerationStage({ writing: false, plagiarism: false, finalizing: false });
            }
            
            // Clear the job ID
            setEssayJobId(null);
            return true; // Signal that we're done polling
          }
          
          // Check if job failed
          if (status.status === "failed") {
            console.error("Essay job failed with error:", status.error);
            setError(status.error || "Essay generation failed");
            setIsLoading(false);
            setIsGeneratingEssay(false);
            setLoadingProgress(0);
            setGenerationStage({ writing: false, plagiarism: false, finalizing: false });
            
            // Clear the job ID
            setEssayJobId(null);
            return true; // Signal that we're done polling
          }
          
          // If we're still processing, continue polling
          return false;
          
        } catch (pollError) {
          console.error("Error during essay polling:", pollError);
          setError(pollError instanceof Error ? pollError.message : "Failed to check essay status");
          setIsLoading(false);
          setIsGeneratingEssay(false);
          setLoadingProgress(0);
          setGenerationStage({ writing: false, plagiarism: false, finalizing: false });
          
          // Clear the job ID
          setEssayJobId(null);
          return true; // Signal that we're done polling
        }
      };
      
      // Immediately poll once
      pollEssayStatus();
      
      // Then set up interval
      const interval = setInterval(async () => {
        const isDone = await pollEssayStatus();
        if (isDone) {
          clearInterval(interval);
        }
      }, 2000);
      
      // Clean up the interval when the component unmounts or essayJobId changes
      return () => {
        clearInterval(interval);
      };
    }
  }, [essayJobId, isLoading]);

  // Add drag and drop functionality
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, type: 'essay' | 'assignment') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (type === 'essay') {
        setUploadedFile(file);
        setIsFileLoading({...isFileLoading, essay: true});
        
        try {
          const text = await extractTextFromFile(file);
          setPastedEssay(text);
        } catch (error) {
          console.error("Error extracting text from file:", error);
          setError("Failed to extract text from the uploaded file. Please try pasting the content manually.");
        } finally {
          setIsFileLoading({...isFileLoading, essay: false});
        }
      } else {
        setUploadedAssignment(file);
        setIsFileLoading({...isFileLoading, assignment: true});
        
        try {
          const text = await extractTextFromFile(file);
          setPastedAssignment(text);
        } catch (error) {
          console.error("Error extracting text from file:", error);
          setError("Failed to extract text from the uploaded file. Please try pasting the content manually.");
        } finally {
          setIsFileLoading({...isFileLoading, assignment: false});
        }
      }
    }
  };

  const handleStartOver = () => {
    if (error) {
      // If there was an error, determine which step to go back to
      if (isGeneratingEssay || currentStep === 4) {
        // If error occurred during essay generation, go back to outline step
        setCurrentStep(3);
      } else if (isGeneratingOutline || currentStep === 3) {
        // If error occurred during outline generation, go back to input step
        // but preserve the inputs
        setCurrentStep(1);
      }
      setError(null);
    } else {
      // Regular start over - reset everything
      setCurrentStep(1);
      setPastedAssignment("");
      setPastedEssay("");
      setUploadedFile(null);
      setUploadedAssignment(null);
      setOutline(PLACEHOLDER_OUTLINE);
      setCitations(PLACEHOLDER_CITATIONS);
      setIsGeneratingOutline(false);
      setIsGeneratingEssay(false);
      setError(null);
    }
  };

  if (error) {
    return (
      <div className="py-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="text-red-500">
            <AlertCircle className="h-12 w-12 mx-auto" />
            <h3 className="text-xl font-medium mt-4">Error</h3>
          </div>
          <p className="text-gray-500">{error}</p>
          <Button 
            onClick={handleStartOver} 
            className="mt-4 ml-4"
            variant="outline"
          >
            Start Over. You will not be charged a credit for this attempt.
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Combined credits check overlay */}
      {((userCredits !== null && parseInt(userCredits.toString()) <= 0) || insufficientCredits) && currentStep === 1 && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-lg animate-fadeIn">
          <div className="bg-white/90 p-8 rounded-xl shadow-lg max-w-md text-center border border-gray-100 animate-fadeInUp">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">
              {insufficientCredits ? "Insufficient Credits" : "No Credits Available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {insufficientCredits 
                ? "You need at least 2 credits to generate an essay. Purchase credits to continue."
                : "You need credits to generate essays. Purchase credits to continue creating high-quality essays instantly."}
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard/buy-credits">
                Purchase Credits
              </Link>
            </Button>
          </div>
        </div>
      )}
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {!isLoading ? getStepTitle() : loadingStage ? "Processing" : "Generating Essay"}
          </CardTitle>
          <CardDescription>
            {!isLoading 
              ? "Follow the steps below to generate your essay" 
              : loadingStage 
              ? "Please wait while we process your request"
              : "Please wait while we generate your essay"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isLoading && (
            <div className="mb-8">
              <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
              <div className="mt-2 text-sm text-gray-500 text-right">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
          )}

          {getStepContent()}

          {!isLoading && (
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => {
                  if (currentStep === totalSteps) {
                    generateFinalEssay();
                  } else if (currentStep === 4) {
                    handleGenerateOutline();
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                disabled={!isStepValid()}
                variant={isStepValid() ? "default" : "secondary"}
              >
                {getNextButtonText()}
              </Button>
            </div>
          )}

          {showCreditConfirmation && (
            <Dialog open={showCreditConfirmation} onOpenChange={setShowCreditConfirmation}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Credit Usage</DialogTitle>
                  <DialogDescription>
                    This will consume 2 credits from your account to generate your outline, sources, and complete essay.
                    {userCredits !== null && (
                      <p className="mt-2">You currently have <span className="font-medium">{userCredits} credit{userCredits !== 1 ? 's' : ''}</span>.</p>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreditConfirmation(false)}>
                    Cancel
                  </Button>
                  <Button onClick={confirmAndGenerateOutline}>
                    Yes, proceed
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 