"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, CreditCard, Trash2, ExternalLink } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { useAuth } from "../contexts/AuthContext"
import { essayAPI } from "../api/essay-api"
import { useToast } from "@/components/ui/use-toast"
import AuthCheck from "@/app/components/auth-check"
import { getUserCredits } from "@/lib/userProfile"
import EssayForm from "@/app/components/essay-form"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import DashboardFooter from "@/components/dashboard-footer"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function DashboardContent() {
  const { isAuthenticated, user, hasGoogleConnected, session } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [userEssays, setUserEssays] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("generate")
  const [credits, setCredits] = useState<string | number | null>('-')
  const [essayToDelete, setEssayToDelete] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingEssay, setDeletingEssay] = useState<any | null>(null)

  // Fetch user's essays and credits
  useEffect(() => {
    if (user) {
      fetchUserEssays()
      fetchUserCredits()
      
      // Check for URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      const highlightParam = urlParams.get('highlight')
      
      // Set active tab if specified in URL
      if (tabParam === 'history') {
        setActiveTab('history')
      }
      
      // If there's a highlighted essay, scroll to it after a short delay
      if (highlightParam) {
        setTimeout(() => {
          const essayElement = document.getElementById(`essay-${highlightParam}`)
          if (essayElement) {
            essayElement.scrollIntoView({ behavior: 'smooth' })
            essayElement.classList.add('highlight-essay')
            
            // Remove highlight class after animation
            setTimeout(() => {
              essayElement.classList.remove('highlight-essay')
            }, 5000)
          }
        }, 500) // Short delay to ensure the tab content is rendered
      }
    }
  }, [user])

  useEffect(() => {
    // Check if this is a redirect from OAuth sign-in
    const isOAuthRedirect = 
      window.location.hash.includes('access_token') || 
      window.location.search.includes('code=') ||
      sessionStorage.getItem('oauth_login') === 'true';
    
    if (isOAuthRedirect) {
      // Clear the flag
      sessionStorage.removeItem('oauth_login');
      
      // Force a full page refresh to ensure profile data is loaded
      window.location.href = window.location.pathname;
    }
  }, []);

  useEffect(() => {
    // Check if this is first visit after verification
    const isFirstVisit = sessionStorage.getItem('emailVerified');
    
    if (isFirstVisit === 'true') {
      // Clear the flag
      sessionStorage.removeItem('emailVerified');
      // Force refresh
      window.location.reload();
    }
  }, []);

  const fetchUserEssays = async () => {
    try {
      const essays = await essayAPI.getUserEssays()
      setUserEssays(essays)
    } catch (error) {
      console.error('Error fetching essays:', error)
      toast({
        title: "Error",
        description: "Failed to fetch your essays. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchUserCredits = async () => {
    try {
      // Assuming there's a method to get user credits
      const userCredits = await getUserCredits()
      setCredits(userCredits)
    } catch (error) {
      console.error('Error fetching credits:', error)
      setCredits(0) // Default to 0 if there's an error
    }
  }

  const handleDownload = async (storage_url: string, title: string) => {
    try {
      await essayAPI.downloadEssay(storage_url, title)
      toast({
        title: "Download Started",
        description: "Your essay is being downloaded.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error in handleDownload:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download the essay. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOpenInGoogleDocs = async (storage_url: string, title: string) => {
    try {
      
      // Show loading toast
      toast({
        title: "Opening in Google Docs",
        description: "Preparing your document...",
        variant: "default",
      });

        // Get the current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Check if Google token is available
      const provider = session.user?.app_metadata?.provider;
      let providerToken = session.provider_token;

      // If no provider token, we need to re-authenticate with Google
      if (!providerToken) {
        
        // Initiate a new sign-in with Google to get a fresh token
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
              scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents'
            },
            redirectTo: window.location.href
          }
        });
        
        if (error) {
          console.error('Error initiating Google OAuth:', error);
          throw new Error('Failed to connect with Google. Please try again.');
        }
        
        // This will redirect the user to Google's OAuth page
        if (data?.url) {
          window.location.href = data.url;
          return; // The function will continue after redirect back
        }
        
        throw new Error('Failed to start Google authentication flow');
      }
      
      // Use the same download URL format as in essay-api.ts
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
      
      // Upload to Google Drive with the simplest possible approach
      try {
        // Step 1: Upload the file content first
        const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${providerToken}`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX mime type
          },
          body: blob
        });

        const responseText = await uploadResponse.text();

        if (!uploadResponse.ok) {
          throw new Error(`File upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        const uploadData = JSON.parse(responseText);

        // Step 2: Update the metadata (name only, don't try to convert)
        const metadataResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${uploadData.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${providerToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: `${title}.docx`
          })
        });

        const metadataText = await metadataResponse.text();

        if (!metadataResponse.ok) {
          throw new Error(`Metadata update failed: ${metadataResponse.status} ${metadataResponse.statusText}`);
        }

        const fileData = JSON.parse(metadataText);
        
        // Open the file in Google Drive (not Docs)
        window.open(`https://drive.google.com/file/d/${fileData.id}/view`, '_blank');
        
        toast({
          title: "Success",
          description: "Your document has been uploaded to Google Drive",
          variant: "default",
        });
      } catch (driveError) {
        console.error('Drive API error:', driveError);
        throw driveError;
      }
    } catch (error) {
      console.error('Error opening in Google Docs:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open in Google Docs",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteEssay = (essay: any) => {
    setDeletingEssay(essay)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingEssay) return
    
    try {
      setDeleteDialogOpen(false)
      
      // Delete the essay from Supabase
      const { error } = await supabase
        .from('papers')
        .delete()
        .eq('id', deletingEssay.id);
      
      if (error) throw error;
      
      // Update the UI by removing the deleted essay
      setUserEssays(userEssays.filter(essay => essay.id !== deletingEssay.id));
      
      toast({
        title: "Essay Deleted",
        description: "Your essay has been permanently deleted.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting essay:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the essay. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingEssay(null)
    }
  };

  // Animation variants
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.3 
      }
    }
  }

  const cardVariants = {
    hover: { 
      scale: 1.02,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    }
  }

  const handleEmailVerification = () => {
    sessionStorage.setItem('emailVerified', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />
      {credits === '-' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                If your credits and essays aren't showing up, wait a few seconds and refresh the page. Do this as many times as needed. We're working on making the site more seamless.
              </p>
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger 
              value="generate"
              className={`relative overflow-hidden rounded-md transition-all duration-300 ${
                activeTab === "generate" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              <span>Generate Essay</span>
              <motion.div 
                className="absolute bottom-0 left-0 h-0.5 bg-primary" 
                initial={{ width: 0 }}
                animate={{ width: activeTab === "generate" ? "100%" : 0 }}
                transition={{ duration: 0.3 }}
              />
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className={`relative overflow-hidden rounded-md transition-all duration-300 ${
                activeTab === "history" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              <span>My Essays</span>
              <motion.div 
                className="absolute bottom-0 left-0 h-0.5 bg-primary" 
                initial={{ width: 0 }}
                animate={{ width: activeTab === "history" ? "100%" : 0 }}
                transition={{ duration: 0.3 }}
              />
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "generate" && (
              <motion.div
                key="generate"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative"
              >
                <EssayForm />
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>My Essays</CardTitle>
                    <CardDescription>
                      <div className="space-y-2">
                        <p>Your essays are generated using AI to help you get started, but they may need your personal touch.</p>
                        <p className="text-muted-foreground text-sm">💡 Tip: Always review and customize your essays to match your voice and ensure accuracy.</p>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userEssays.length > 0 ? (
                      <div className="space-y-4">
                        {userEssays.map((essay, index) => (
                          <motion.div 
                            key={essay.id} 
                            id={`essay-${essay.id}`} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            variants={cardVariants}
                            whileHover="hover"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              transition: { 
                                delay: index * 0.1,
                                duration: 0.4
                              }
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <FileText className="h-8 w-8 text-primary" />
                              <div>
                                <h3 className="font-medium">{essay.title}</h3>
                                <p className="text-sm text-gray-500">
                                  Generated on {new Date(essay.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownload(essay.storage_url, essay.title)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              
                              {/* Only show Google Docs button if user has Google connected */}
                              {hasGoogleConnected && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  onClick={() => handleOpenInGoogleDocs(essay.storage_url, essay.title)}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Open in Google Docs
                                </Button>
                              )}
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => confirmDeleteEssay(essay)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="flex flex-col items-center justify-center h-40 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.5 } }}
                      >
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500">You haven't generated any essays yet</p>
                        <p className="text-gray-400 text-sm mt-2">Go to the "Generate Essay" tab to create your first essay</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this essay? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {deletingEssay && (
              <div className="p-4 my-2 border rounded-md bg-gray-50">
                <h4 className="font-medium">{deletingEssay.title}</h4>
                <p className="text-sm text-gray-500">
                  Generated on {new Date(deletingEssay.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <DialogFooter className="flex sm:justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteConfirm}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Essay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <DashboardFooter />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthCheck>
      <DashboardContent />
    </AuthCheck>
  )
}

