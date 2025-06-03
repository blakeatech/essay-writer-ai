import axios from 'axios';
import { supabase } from '@/lib/supabase';

const API_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Add the token to the Authorization header
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  // Add CSRF token from cookie if available
  const getCsrfToken = () => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrf-token=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  const csrfToken = getCsrfToken();
  if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
    config.headers['x-csrf-token'] = csrfToken;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API
export const authAPI = {
  register: async (email: string, password: string) => {
    const response = await api.post('/api/v1/register', { email, password });
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/login', new URLSearchParams({
      'username': email,
      'password': password,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
};

// Essay API
export const essayAPI = {
  generateEssay: async (essayData: any) => {
    const response = await api.post('/api/v1/generate-paper', {
      paper_details: {
        title: essayData.topic,
        description: essayData.additionalInfo,
        num_sections: getNumSections(essayData.length),
        vocab_level: getVocabLevel(essayData.type)
      },
      student_details: {
        student_name: essayData.studentName || "Student",
        professor_name: essayData.professorName || "Professor",
        class_name: essayData.className || essayData.type
      }
    });
    return response.data;
  },
  
  getJobStatus: async (jobId: string) => {
    const response = await api.get(`/api/v1/job-status/${jobId}`);
    return response.data;
  },
  
  downloadEssay: async (storage_url: string, title: string) => {
    try {
      const response = await api.get(`/api/v1/download-paper/${storage_url}`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const mimeTypes = {
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
      
      const blob = new Blob([response.data], { type: mimeTypes['docx'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading essay:', error);
      throw error;
    }
  },
  
  getUserEssays: async () => {
    const response = await api.get('/api/v1/my-papers');
    return response.data;
  },

  getCredits: async () => {
    const response = await api.get('/api/v1/credits');
    return response.data.credits;
  },

  createCheckoutSession: async (quantity: number) => {
    try {
      const response = await api.post('/api/v1/create-checkout-session', { quantity });
      return response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  startOutlineAndSourcesJob: async (request: any) => {
    try {
      
      // This should call the endpoint that deducts credits
      const response = await api.get('/api/v1/outline-and-sources', {
        params: {
          topic: request.topic,
          writing_style: request.writing_style,
          word_count: request.word_count,
          citation_format: request.citation_format,
          num_sources: request.num_sources,
          assignment_description: request.assignment_description,
          previous_essay: request.previous_essay
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error starting outline job:', error);
      
      // Type check the error before accessing properties
      if (error && typeof error === 'object' && 'response' in error &&
          error.response && typeof error.response === 'object' && 
          'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 'error' in error.response.data &&
          typeof error.response.data.error === 'string' && 
          error.response.data.error.includes('Insufficient credits')) {
        return { error: 'Insufficient credits. Please purchase credits to continue.' };
      }
      
      return { error: 'Failed to start outline generation' };
    }
  },
};

// Helper functions
function getNumSections(length: string): number {
  switch (length) {
    case 'short': return 3;
    case 'medium': return 5;
    case 'long': return 7;
    case 'extra-long': return 9;
    default: return 5;
  }
}

function getVocabLevel(type: string): number {
  switch (type) {
    case 'argumentative': return 3;
    case 'expository': return 2;
    case 'narrative': return 2;
    case 'descriptive': return 3;
    case 'compare-contrast': return 3;
    case 'research': return 4;
    default: return 2;
  }
}

export default api; 