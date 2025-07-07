"use client"

import { useDesignById } from "@/hooks/use-designs"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Edit, ExternalLink, Figma, ImageIcon, MoreHorizontal, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

// Utility functions for download and share
async function downloadDesign(design: any) {
  if (!design.assetUrl) {
    throw new Error("No asset URL available for download")
  }

  try {
    // For Figma designs, we can't directly download the iframe content
    // So we'll open the Figma URL in a new tab
    if (design.type === "figma") {
      window.open(design.assetUrl, "_blank")
      return
    }

    // For mockup/image designs, download the actual file
    const response = await fetch(design.assetUrl)
    if (!response.ok) throw new Error("Failed to fetch design")

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `design-${design._id}.${getFileExtension(design.assetUrl)}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Download failed:", error)
    throw error
  }
}

function getFileExtension(url: string): string {
  const extension = url.split(".").pop()?.split("?")[0]
  return extension || "png"
}

async function shareDesign(design: any) {
  const shareData = {
    title: `Design: ${design._id}`,
    text: design.description || `Check out this ${design.type} design`,
    url: window.location.href,
  }

  try {
    // Use native Web Share API if available (mobile devices)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData)
      return
    }

    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(window.location.href)
    return "copied"
  } catch (error) {
    console.error("Share failed:", error)
    throw error
  }
}

export default function DesignPage() {
  const { designId }: { designId: string } = useParams()
  const router = useRouter()
  const { data: design, error, isLoading } = useDesignById(designId)

  // Add these state variables
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [isSharing, setIsSharing] = React.useState(false)
  const [shareMessage, setShareMessage] = React.useState("")

  // Add these handler functions
  const handleDownload = async () => {
    if (!design) return

    setIsDownloading(true)
    try {
      await downloadDesign(design)
      // Show success message or toast here if you have a toast system
    } catch (error) {
      console.error("Download failed:", error)
      // Show error message or toast here
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (!design) return

    setIsSharing(true)
    setShareMessage("")
    try {
      const result = await shareDesign(design)
      if (result === "copied") {
        setShareMessage("Link copied to clipboard!")
        setTimeout(() => setShareMessage(""), 3000)
      }
    } catch (error) {
      console.error("Share failed:", error)
      setShareMessage("Failed to share")
      setTimeout(() => setShareMessage(""), 3000)
    } finally {
      setIsSharing(false)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState />
  }

  if (!design) {
    return <NotFoundState />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-800/50">
                  {design.type === "figma" ? (
                    <Figma className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-foreground">Design: {design._id}</h1>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50"
                  >
                    {design.type === "figma" ? "Figma Design" : "Mockup Design"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hidden sm:flex bg-transparent relative"
                onClick={handleShare}
                disabled={isSharing}
              >
                <Share2 className="h-4 w-4" />
                {isSharing ? "Sharing..." : "Share"}
                {shareMessage && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                    {shareMessage}
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hidden sm:flex bg-transparent"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="sm:hidden" onClick={handleShare} disabled={isSharing}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {isSharing ? "Sharing..." : "Share"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="sm:hidden" onClick={handleDownload} disabled={isDownloading}>
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? "Downloading..." : "Download"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Design
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => design?.assetUrl && window.open(design.assetUrl, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Design Preview - Main Content */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {design.type === "figma" && design.assetUrl && (
                  <div className="relative bg-muted/30">
                    <iframe
                      src={design.assetUrl}
                      className="w-full h-[500px] sm:h-[600px] lg:h-[700px] border-0"
                      allowFullScreen
                      title={`Figma design ${design._id}`}
                    />
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2 bg-background/90 backdrop-blur"
                        onClick={() => window.open(design.assetUrl, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in Figma
                      </Button>
                    </div>
                  </div>
                )}

                {design.type === "mockup" && design.assetUrl && (
                  <div className="relative bg-muted/30 p-8 flex items-center justify-center min-h-[500px]">
                    <img
                      src={design.assetUrl || "/placeholder.svg"}
                      alt={`Design ${design._id}`}
                      className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {!design.assetUrl && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="p-4 rounded-full bg-muted mb-4">
                      {design.type === "figma" ? (
                        <Figma className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No preview available</h3>
                    <p className="text-muted-foreground">This design doesn't have a preview URL configured.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Design Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Design Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">{design._id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {design.type === "figma" ? "Figma Design" : "Mockup Design"}
                    </Badge>
                  </div>
                </div>

                {design.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm text-foreground mt-1 leading-relaxed">{design.description}</p>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Button className="w-full gap-2" size="sm">
                    <Edit className="h-4 w-4" />
                    Edit Design
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 bg-transparent"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading ? "Downloading..." : "Download"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription>Common tasks for this design</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  size="sm"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  <Share2 className="h-4 w-4" />
                  {isSharing ? "Sharing..." : "Share with team"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  size="sm"
                  onClick={() => design?.assetUrl && window.open(design.assetUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open original
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-16" />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 hidden sm:block" />
              <Skeleton className="h-8 w-24 hidden sm:block" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            <Skeleton className="w-full h-[500px] sm:h-[600px] lg:h-[700px] rounded-lg" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorState() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
          <ImageIcon className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">We couldn't load this design. It might have been moved or deleted.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    </div>
  )
}

function NotFoundState() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Design not found</h2>
        <p className="text-muted-foreground mb-6">The design you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    </div>
  )
}
