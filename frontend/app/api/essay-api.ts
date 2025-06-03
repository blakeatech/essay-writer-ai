// API client for essay generation services

import axios from 'axios';
import { supabase } from '@/lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://essay-gen.fly.dev';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(async (config) => {
  // Get the session from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  // If we have a session, add the access token to the Authorization header
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export interface OutlineRequest {
  topic: string;
  assignment_description?: string;
  writing_style: string;
  word_count: number;
  previous_essay?: string;
  citation_format: string;
  num_sources: number;
}

export interface Source {
  title: string;
  author: string;
  publication_info: string;
  author_last_name: string;
  publication_year: number;
  url: string;
  apa_citation: string;
  relevance: string;
  details: string;
}

export interface OutlineComponent {
  main_idea: string;
  subtopics: string[];
  sources?: Source[];
}

export interface OutlineResponse {
  outline_components: OutlineComponent[];
}

export interface ApiResponse {
  outline: OutlineResponse;
  writing_analysis: string;
  sources: Source[][];
}

export interface JobStatus {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  result?: ApiResponse;
  error?: string;
}

export interface JobResponse {
  job_id: string;
  status: string;
  error?: string;
}

export async function getOutlineAndSources(request: OutlineRequest): Promise<ApiResponse> {
  try {
    // Convert the request object to URL parameters
    const params = new URLSearchParams({
      topic: request.topic,
      writing_style: request.writing_style,
      word_count: request.word_count.toString(),
      citation_format: request.citation_format.toUpperCase(),
      num_sources: request.num_sources.toString(),
      previous_essay: request.previous_essay || ""
    });

    if (request.assignment_description) {
      params.append('assignment_description', request.assignment_description);
    }

    if (request.previous_essay) {
      params.append('previous_essay', request.previous_essay);
    }

    const response = await api.get(`/api/v1/outline-and-sources?${params.toString()}`);

    // Axios already parses JSON, so we can directly return response.data
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

export async function startOutlineAndSourcesJob(request: OutlineRequest): Promise<JobResponse> {
  try {
    
    // Convert the request object to URL parameters
    const params = new URLSearchParams({
      topic: request.topic,
      writing_style: request.writing_style,
      word_count: request.word_count.toString(),
      citation_format: request.citation_format.toUpperCase(),
      num_sources: request.num_sources.toString()
    });

    if (request.assignment_description) {
      params.append('assignment_description', request.assignment_description);
    }

    if (request.previous_essay) {
      params.append('previous_essay', request.previous_essay);
    }

    
    const response = await api.get(`/api/v1/outline-and-sources?${params.toString()}`);

    // Axios already parses JSON, so we can directly return response.data
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  try {
    
    const response = await api.get(`/api/v1/job-status/${jobId}`);

    // Axios already parses JSON, so we can directly return response.data
    return response.data;
  } catch (error) {
    console.error(`Error checking status for job ${jobId}:`, error);
    throw error;
  }
}

// Essay API
export const essayAPI = {
  generateEssay: async (essayData: any) => {
    const response = await api.post('/api/v1/generate-essay', {
      title: essayData.topic,
      outline: essayData.outline,
      sources: essayData.sources,
      student_name: essayData.studentName || "Student",
      professor_name: essayData.professorName || "Professor",
      word_count: essayData.wordCount,
      class_name: essayData.className || essayData.type,
      citation_format: essayData.citationStyle,
      writing_analysis: essayData.writingAnalysis
    });
    return response.data;
  },
  
  // Other API methods...

  getUserEssays: async () => {
    try {
      // Fetch essays directly from Supabase
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user essays:', error);
      throw error;
    }
  },

  downloadEssay: async (storage_url: string, title: string) => {
    try {
      
      // Get the current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Construct direct download URL using Supabase REST API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const downloadUrl = `${supabaseUrl}/storage/v1/object/papers/${storage_url}`;
      
      // Fetch the file with authentication
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title}.docx`;
      
      // Add to DOM, trigger click, and clean up
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Error downloading essay:', error);
      throw error;
    }
  }
};

export async function getCredits() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }
    const response = await fetch(`${API_BASE_URL}/api/v1/get-credits`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
    });
    return response.json();
  } catch (error) {
    console.error('Error getting credits:', error);
    throw error;
  }
}

export async function generateEssayJob(essayData: any) {
  try {
    // Get the session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v1/generate-essay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(essayData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to start essay generation');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error starting essay generation:', error);
    throw error;
  }
}

export async function getEssayStatus(jobId: string) {
  try {
    // Get the session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v1/essay-status/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get essay status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting essay status:', error);
    throw error;
  }
} 