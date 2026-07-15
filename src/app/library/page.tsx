"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PageHeader } from "@/components/ui/page-header"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback, 
  AvatarBadge, 
  AvatarGroup 
} from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  Field, 
  FieldLabel, 
  FieldDescription, 
  FieldError 
} from "@/components/ui/field"
import { 
  InputGroup, 
  InputGroupAddon, 
  InputGroupInput 
} from "@/components/ui/input-group"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { 
  Search, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Apple,
  MoreHorizontal,
  Check,
  Archive,
  Upload,
  Trash2,
  AlertTriangle,
  CircleCheck,
  Info,
  XCircle
} from "lucide-react"

// Country flag mockups
const FlagChina = () => (
  <svg className="size-4 shrink-0 rounded-sm" viewBox="0 0 30 20">
    <rect width="30" height="20" fill="#DE2910" />
    <polygon points="5,5 4,8 7,6 3,6 6,8" fill="#FFDE00" />
  </svg>
)

const FlagIndia = () => (
  <svg className="size-4 shrink-0 rounded-sm border border-neutral-100" viewBox="0 0 30 20">
    <rect width="30" height="6.6" fill="#FF9933" />
    <rect y="6.6" width="30" height="6.8" fill="#FFFFFF" />
    <rect y="13.4" width="30" height="6.6" fill="#128807" />
    <circle cx="15" cy="10" r="2" fill="#000080" />
  </svg>
)

const FlagFrance = () => (
  <svg className="size-4 shrink-0 rounded-sm" viewBox="0 0 30 20">
    <rect width="10" height="20" fill="#002395" />
    <rect x="10" width="10" height="20" fill="#FFFFFF" />
    <rect x="20" width="10" height="20" fill="#ED2939" />
  </svg>
)

const FlagGreenland = () => (
  <svg className="size-4 shrink-0 rounded-sm" viewBox="0 0 30 20">
    <rect width="30" height="10" fill="#FFFFFF" />
    <rect y="10" width="30" height="10" fill="#C8102E" />
    <path d="M 13 10 A 6 6 0 0 0 7 10" fill="#C8102E" />
    <path d="M 7 10 A 6 6 0 0 0 13 10" fill="#FFFFFF" />
  </svg>
)

const FlagItaly = () => (
  <svg className="size-4 shrink-0 rounded-sm" viewBox="0 0 30 20">
    <rect width="10" height="20" fill="#009246" />
    <rect x="10" width="10" height="20" fill="#F1F2F1" />
    <rect x="20" width="10" height="20" fill="#CE2B37" />
  </svg>
)

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path
      fill="#EA4335"
      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.336 0 3.327 2.682 1.386 6.618l3.88 3.147z"
    />
    <path
      fill="#34A853"
      d="M16.04 15.345c-1.077.737-2.43 1.182-4.04 1.182a7.077 7.077 0 0 1-6.734-4.855L1.386 14.82C3.327 18.755 7.336 21.436 12 21.436c3.11 0 5.964-1.127 8.036-3.082l-4-3.009z"
    />
    <path
      fill="#4285F4"
      d="M23.49 12.273c0-.818-.073-1.609-.209-2.373H12v4.582h6.445A5.51 5.51 0 0 1 16.04 18.09l4 3.01c2.336-2.155 3.45-5.328 3.45-8.827z"
    />
    <path
      fill="#FBBC05"
      d="M5.266 12.236A7.09 7.09 0 0 1 5.266 9.764L1.386 6.618A11.968 11.968 0 0 0 0 12c0 1.936.46 3.764 1.386 5.382l3.88-3.146z"
    />
  </svg>
)

interface CountryItem {
  id: string
  name: string
  flag: React.ComponentType
  count?: number
}

const COUNTRIES: CountryItem[] = [
  { id: "cn", name: "China", flag: FlagChina, count: 2 },
  { id: "in", name: "India", flag: FlagIndia, count: 3 },
  { id: "fr", name: "France", flag: FlagFrance },
  { id: "gl", name: "Greenland", flag: FlagGreenland, count: 1 },
  { id: "it", name: "Italy", flag: FlagItaly }
]

export default function LibraryPage() {
  // Switch & Select states for showcase
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [visaSelectorValue, setVisaSelectorValue] = React.useState("Visa Approved")

  // Dropdown mockup states
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCountries, setSelectedCountries] = React.useState<Record<string, boolean>>({
    cn: true,
    in: true
  })

  // Filtered countries
  const filteredCountries = React.useMemo(() => {
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery])

  // All countries checked
  const allCountriesChecked = React.useMemo(() => {
    return COUNTRIES.every(c => selectedCountries[c.id])
  }, [selectedCountries])

  const handleSelectAllCountries = (checked: boolean) => {
    const updated: Record<string, boolean> = {}
    COUNTRIES.forEach(c => {
      updated[c.id] = checked
    })
    setSelectedCountries(updated)
  }

  const handleSelectCountry = (id: string, checked: boolean) => {
    setSelectedCountries(prev => ({
      ...prev,
      [id]: checked
    }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="max-w-6xl w-full mx-auto p-2xl md:p-4xl flex flex-col gap-2xl">
        <PageHeader 
          title="Figma Component Library" 
          label="VIEMS v1.1" 
        />

        <div className="flex flex-col gap-8 mt-4 animate-fade-in">
            
            {/* Design System Token Reference Panel */}
            <Card className="border border-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Figma Design Tokens Reference</CardTitle>
                <CardDescription>Extracted tokens for color swatches, shadows, and typography hierarchy</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2xl">
                
                {/* Colors Grid */}
                <div>
                  <h4 className="text-subheading-2xs font-bold text-neutral-400 mb-lg">Color Swatches</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-lg">
                    
                    <div className="flex flex-col p-sm border border-neutral-100 dark:border-neutral-800 rounded-compact bg-neutral-50 dark:bg-neutral-900/30">
                      <div className="h-10 w-full rounded bg-brand-medium mb-xs" />
                      <span className="text-subheading-2xs font-bold text-neutral-900 dark:text-neutral-100">brand-medium</span>
                      <span className="text-paragraph-xs text-neutral-500">#7D52F4</span>
                    </div>

                    <div className="flex flex-col p-sm border border-neutral-100 dark:border-neutral-800 rounded-compact bg-neutral-50 dark:bg-neutral-900/30">
                      <div className="h-10 w-full rounded bg-brand-dark mb-xs" />
                      <span className="text-subheading-2xs font-bold text-neutral-900 dark:text-neutral-100">brand-dark</span>
                      <span className="text-paragraph-xs text-neutral-500">#351A75</span>
                    </div>

                    <div className="flex flex-col p-sm border border-neutral-100 dark:border-neutral-800 rounded-compact bg-neutral-50 dark:bg-neutral-900/30">
                      <div className="h-10 w-full rounded bg-brand-light mb-xs border border-neutral-200 dark:border-neutral-700" />
                      <span className="text-subheading-2xs font-bold text-neutral-900 dark:text-neutral-100">brand-light</span>
                      <span className="text-paragraph-xs text-neutral-500">#EFEBFF</span>
                    </div>

                    <div className="flex flex-col p-sm border border-neutral-100 dark:border-neutral-800 rounded-compact bg-neutral-50 dark:bg-neutral-900/30">
                      <div className="h-10 w-full rounded bg-success-dark mb-xs" />
                      <span className="text-subheading-2xs font-bold text-neutral-900 dark:text-neutral-100">success-dark</span>
                      <span className="text-paragraph-xs text-neutral-500">#0B4627</span>
                    </div>

                    <div className="flex flex-col p-sm border border-neutral-100 dark:border-neutral-800 rounded-compact bg-neutral-50 dark:bg-neutral-900/30">
                      <div className="h-10 w-full rounded bg-error-dark mb-xs" />
                      <span className="text-subheading-2xs font-bold text-neutral-900 dark:text-neutral-100">error-dark</span>
                      <span className="text-paragraph-xs text-neutral-500">#681219</span>
                    </div>

                    <div className="flex flex-col p-sm border border-neutral-100 dark:border-neutral-800 rounded-compact bg-neutral-50 dark:bg-neutral-900/30">
                      <div className="h-10 w-full rounded bg-neutral-200 mb-xs border border-neutral-300 dark:border-neutral-700" />
                      <span className="text-subheading-2xs font-bold text-neutral-900 dark:text-neutral-100">neutral-200</span>
                      <span className="text-paragraph-xs text-neutral-500">#EBEBEB</span>
                    </div>

                  </div>
                </div>

                {/* Typography Grid */}
                <div className="border-t border-border pt-xl">
                  <h4 className="text-subheading-2xs font-bold text-neutral-400 mb-lg">Typography System</h4>
                  <div className="flex flex-col gap-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-50 dark:border-neutral-900 pb-sm">
                      <span className="text-h3-title text-neutral-900 dark:text-white">Title/H3 Title (Mona Sans)</span>
                      <span className="text-subheading-2xs text-neutral-400 mt-xs sm:mt-0">font-size: 40px / line-height: 48px / weight: 600</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-50 dark:border-neutral-900 pb-sm">
                      <span className="text-h5-title text-neutral-900 dark:text-white">Title/H5 Title (Mona Sans)</span>
                      <span className="text-subheading-2xs text-neutral-400 mt-xs sm:mt-0">font-size: 24px / line-height: 32px / weight: 600</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-50 dark:border-neutral-900 pb-sm">
                      <span className="text-h6-title text-neutral-900 dark:text-white">Landing Title/H6 Title (Inter)</span>
                      <span className="text-subheading-2xs text-neutral-400 mt-xs sm:mt-0">font-size: 20px / line-height: 28px / weight: 550</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-50 dark:border-neutral-900 pb-sm">
                      <span className="text-label-sm text-neutral-900 dark:text-white">Label/Small (Inter)</span>
                      <span className="text-subheading-2xs text-neutral-400 mt-xs sm:mt-0">font-size: 14px / line-height: 20px / weight: 500</span>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2xl">
              
              {/* Left Column - Buttons, Radio buttons, Dialogs/Selects/Switches, Toasts */}
              <div className="flex flex-col gap-2xl">
                
                {/* Buttons Showcase */}
                <Card className="border border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Buttons [1.1]</CardTitle>
                    <CardDescription>Statically displaying Default, Hover, Focus, Disabled states for all button variants</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2xl">
                    
                    {/* Primary Button Column */}
                    <div className="flex flex-col gap-lg">
                      <h4 className="text-subheading-2xs font-bold text-neutral-400">Primary Button (variant="default")</h4>
                      <div className="flex flex-wrap gap-sm items-center">
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="default">Default</Button>
                          <span className="text-subheading-2xs text-neutral-400">Default</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button className="bg-brand-dark">Hovered</Button>
                          <span className="text-subheading-2xs text-neutral-400">Hover</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button className="shadow-primary-focus">Focused</Button>
                          <span className="text-subheading-2xs text-neutral-400">Focus</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="default" disabled>Disabled</Button>
                          <span className="text-subheading-2xs text-neutral-400">Disabled</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="default" onClick={() => toast.success("Primary Button clicked!")}>Interactive</Button>
                          <span className="text-subheading-2xs text-neutral-400">Live</span>
                        </div>
                      </div>
                    </div>

                    {/* Primary-Neutral Button Column */}
                    <div className="flex flex-col gap-lg border-t border-border pt-xl">
                      <h4 className="text-subheading-2xs font-bold text-neutral-400">Neutral Button (variant="primary-neutral")</h4>
                      <div className="flex flex-wrap gap-sm items-center">
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="primary-neutral">Default</Button>
                          <span className="text-subheading-2xs text-neutral-400">Default</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="primary-neutral" className="bg-neutral-900 text-white">Hovered</Button>
                          <span className="text-subheading-2xs text-neutral-400">Hover</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="primary-neutral" className="shadow-important-focus">Focused</Button>
                          <span className="text-subheading-2xs text-neutral-400">Focus</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="primary-neutral" disabled>Disabled</Button>
                          <span className="text-subheading-2xs text-neutral-400">Disabled</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="primary-neutral" onClick={() => toast.info("Neutral Button clicked!")}>Interactive</Button>
                          <span className="text-subheading-2xs text-neutral-400">Live</span>
                        </div>
                      </div>
                    </div>

                    {/* Light Button Column */}
                    <div className="flex flex-col gap-lg border-t border-border pt-xl">
                      <h4 className="text-subheading-2xs font-bold text-neutral-400">Light Button (variant="light")</h4>
                      <div className="flex flex-wrap gap-sm items-center">
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="light">Default</Button>
                          <span className="text-subheading-2xs text-neutral-400">Default</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="light" className="bg-neutral-200 text-neutral-800">Hovered</Button>
                          <span className="text-subheading-2xs text-neutral-400">Hover</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="light" className="shadow-important-focus">Focused</Button>
                          <span className="text-subheading-2xs text-neutral-400">Focus</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="light" disabled>Disabled</Button>
                          <span className="text-subheading-2xs text-neutral-400">Disabled</span>
                        </div>
                        <div className="flex flex-col items-center gap-xs">
                          <Button variant="light" onClick={() => toast.success("Light Button clicked!")}>Interactive</Button>
                          <span className="text-subheading-2xs text-neutral-400">Live</span>
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>

                {/* Radio Buttons Showcase */}
                <Card className="border border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Radio Buttons [1.1]</CardTitle>
                    <CardDescription>Mockups of inactive, active, hover/focus, and disabled radio button states</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2xl">
                      <div className="flex flex-col gap-lg">
                        <h4 className="text-subheading-2xs font-bold text-neutral-400">Interactive Radio Group</h4>
                        <RadioGroup defaultValue="option-1" className="flex flex-col gap-lg">
                          <label className="flex items-center gap-lg cursor-pointer">
                            <RadioGroupItem value="option-1" />
                            <span className="text-paragraph-sm font-medium text-neutral-800 dark:text-neutral-100">Option One (Selected)</span>
                          </label>
                          <label className="flex items-center gap-lg cursor-pointer">
                            <RadioGroupItem value="option-2" />
                            <span className="text-paragraph-sm font-medium text-neutral-800 dark:text-neutral-100">Option Two</span>
                          </label>
                          <label className="flex items-center gap-lg cursor-not-allowed opacity-50">
                            <RadioGroupItem value="option-3" disabled />
                            <span className="text-paragraph-sm font-medium text-neutral-800 dark:text-neutral-100">Option Three (Disabled)</span>
                          </label>
                        </RadioGroup>
                      </div>
                      <div className="flex flex-col gap-lg border-t md:border-t-0 md:border-l border-border pt-xl md:pt-0 md:pl-2xl">
                        <h4 className="text-subheading-2xs font-bold text-neutral-400">Figma States Mockup</h4>
                        <div className="flex flex-col gap-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-paragraph-sm text-neutral-500">Default (Inactive)</span>
                            <RadioGroup value="" readOnly>
                              <RadioGroupItem value="val" />
                            </RadioGroup>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-paragraph-sm text-neutral-500">Active (Checked)</span>
                            <RadioGroup value="val" readOnly>
                              <RadioGroupItem value="val" />
                            </RadioGroup>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-paragraph-sm text-neutral-500">Disabled (Inactive)</span>
                            <RadioGroup value="" disabled readOnly>
                              <RadioGroupItem value="val" />
                            </RadioGroup>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-paragraph-sm text-neutral-500">Disabled (Active)</span>
                            <RadioGroup value="val" disabled readOnly>
                              <RadioGroupItem value="val" />
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Toasts Showcase */}
                <Card className="border border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Toasts (Sonner) [1.1]</CardTitle>
                    <CardDescription>Premium micro-animations for feedback notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-lg">
                    <div className="grid grid-cols-2 gap-sm">
                      <Button 
                        variant="light" 
                        onClick={() => toast.success("Case saved successfully", {
                          description: "Taylor Johnson's visa case details have been stored."
                        })}
                      >
                        Trigger Success
                      </Button>
                      <Button 
                        variant="light" 
                        onClick={() => toast.error("File upload failed", {
                          description: "The file 'passport_scan.pdf' exceeds size limit of 10MB."
                        })}
                      >
                        Trigger Error
                      </Button>
                      <Button 
                        variant="light" 
                        onClick={() => toast.info("New message received", {
                          description: "Case officer sent you a new notification."
                        })}
                      >
                        Trigger Info
                      </Button>
                      <Button 
                        variant="light" 
                        onClick={() => toast.warning("Session expiring soon", {
                          description: "Your session will expire in 2 minutes due to inactivity."
                        })}
                      >
                        Trigger Warning
                      </Button>
                    </div>
                    <Button 
                      variant="primary-neutral" 
                      onClick={() => {
                        const promise = new Promise((resolve) => setTimeout(() => resolve({ name: 'Document' }), 2000));
                        toast.promise(promise, {
                          loading: 'Uploading document...',
                          success: () => `Document uploaded successfully`,
                          error: 'Error uploading document',
                        });
                      }}
                    >
                      Trigger Promise Toast
                    </Button>
                  </CardContent>
                </Card>

                {/* Modals, Selects & Switches Showcase */}
                <Card className="border border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Modals, Selects & Switches [1.1]</CardTitle>
                    <CardDescription>Interactive elements conforming to Design System tokens</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2xl">
                    {/* Switch Row */}
                    <div className="flex items-center justify-between border-b border-border pb-xl">
                      <div className="flex flex-col gap-xs">
                        <span className="text-label-sm font-semibold text-neutral-800 dark:text-neutral-100">Toggle Notifications</span>
                        <span className="text-paragraph-xs text-neutral-400">Receive alerts when case updates occur</span>
                      </div>
                      <Switch 
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>

                    {/* Select Row */}
                    <div className="flex flex-col gap-sm border-b border-border pb-xl">
                      <span className="text-label-sm font-semibold text-neutral-800 dark:text-neutral-100">Visa Status Selector</span>
                      <Select 
                        value={visaSelectorValue} 
                        onValueChange={(val) => setVisaSelectorValue(val || "")}
                      >
                        <SelectTrigger className="w-full">
                          <span className="flex items-center gap-sm">
                            {visaSelectorValue === "Visa Approved" && <span className="size-2 rounded-full bg-success-dark shrink-0" />}
                            {visaSelectorValue === "Pending Review" && <span className="size-2 rounded-full bg-warning-dark shrink-0" />}
                            {visaSelectorValue === "Refused / Denied" && <span className="size-2 rounded-full bg-error-dark shrink-0" />}
                            <SelectValue placeholder="Select visa status" />
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visa Approved">
                            <span className="flex items-center gap-sm">
                              <span className="size-2 rounded-full bg-success-dark shrink-0" />
                              Visa Approved
                            </span>
                          </SelectItem>
                          <SelectItem value="Pending Review">
                            <span className="flex items-center gap-sm">
                              <span className="size-2 rounded-full bg-warning-dark shrink-0" />
                              Pending Review
                            </span>
                          </SelectItem>
                          <SelectItem value="Refused / Denied">
                            <span className="flex items-center gap-sm">
                              <span className="size-2 rounded-full bg-error-dark shrink-0" />
                              Refused / Denied
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dialog Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-xs">
                        <span className="text-label-sm font-semibold text-neutral-800 dark:text-neutral-100">Case Actions Dialog</span>
                        <span className="text-paragraph-xs text-neutral-400">Perform destructive file operations</span>
                      </div>
                      <Dialog>
                        <DialogTrigger render={<Button variant="destructive" />}>
                          Open Modal
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Destructive Action</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to permanently delete this migrant profile and all associated files? This cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter showCloseButton>
                            <Button 
                              variant="destructive" 
                              onClick={() => {
                                toast.error("Migrant profile permanently deleted.");
                              }}
                            >
                              Delete Profile
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                {/* Accordion, Progress & Sliders Showcase */}
                <Card className="border border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Accordion, Progress & Sliders [1.1]</CardTitle>
                    <CardDescription>Collapsible contents, status tracking bars, and interactive ranges</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2xl">
                    
                    {/* Accordion */}
                    <div className="flex flex-col gap-sm border-b border-border pb-xl">
                      <span className="text-label-md font-semibold text-neutral-800 dark:text-neutral-100">FAQ Accordion</span>
                      <Accordion defaultValue={["item-1"]}>
                        <AccordionItem value="item-1">
                          <AccordionTrigger>What is VIEMS?</AccordionTrigger>
                          <AccordionContent>
                            VIEMS is a high-performance Visa and Immigration Information Management System designed to handle case management workflows.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>Are the animations custom?</AccordionTrigger>
                          <AccordionContent>
                            Yes, all animations conform to our design system guidelines and execute smoothly via native transition declarations.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-sm border-b border-border pb-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-label-md font-semibold text-neutral-800 dark:text-neutral-100">Case Setup Progress</span>
                        <span className="text-paragraph-xs text-neutral-400">75% Complete</span>
                      </div>
                      <Progress value={75} className="w-full">
                        <ProgressTrack className="bg-neutral-100 dark:bg-neutral-800 h-2">
                          <ProgressIndicator className="bg-brand-medium h-full rounded-full" />
                        </ProgressTrack>
                      </Progress>
                    </div>

                    {/* Slider Control */}
                    <div className="flex flex-col gap-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-label-md font-semibold text-neutral-800 dark:text-neutral-100">Risk Assessment Threshold</span>
                        <span className="text-paragraph-xs text-neutral-400">Range: 20% - 80%</span>
                      </div>
                      <Slider defaultValue={[20, 80]} min={0} max={100} step={1} className="w-full" />
                    </div>

                  </CardContent>
                </Card>

              </div>

              {/* Right Column - Inputs, Table Rows, Cards */}
              <div className="flex flex-col gap-2xl">
                
                {/* Inputs Showcase */}
                <Card className="border border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Text Input [1.1]</CardTitle>
                    <CardDescription>Statically displaying Default, Hover, Focus, Filled, Disabled, and Error states</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2xl">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                      
                      <div className="flex flex-col gap-xs">
                        <span className="text-subheading-2xs font-bold text-neutral-400">1. Default</span>
                        <Input placeholder="Placeholder text..." />
                      </div>

                      <div className="flex flex-col gap-xs">
                        <span className="text-subheading-2xs font-bold text-neutral-400">2. Hover</span>
                        <Input className="border-neutral-300" placeholder="Placeholder text..." />
                      </div>

                      <div className="flex flex-col gap-xs">
                        <span className="text-subheading-2xs font-bold text-neutral-400">3. Focus</span>
                        <Input className="border-neutral-900 shadow-important-focus" placeholder="Placeholder text..." />
                      </div>

                      <div className="flex flex-col gap-xs">
                        <span className="text-subheading-2xs font-bold text-neutral-400">4. Filled</span>
                        <Input defaultValue="Taylor Johnson" />
                      </div>

                      <div className="flex flex-col gap-xs">
                        <span className="text-subheading-2xs font-bold text-neutral-400">5. Disabled</span>
                        <Input placeholder="Placeholder text..." disabled />
                      </div>

                      <div className="flex flex-col gap-xs">
                        <span className="text-subheading-2xs font-bold text-neutral-400">6. Error State</span>
                        <Input className="border-error-dark border-2 focus-visible:shadow-important-focus" defaultValue="Invalid text input value" />
                      </div>

                    </div>

                    <div className="border-t border-border pt-xl flex flex-col gap-lg">
                      <h4 className="text-subheading-2xs font-bold text-neutral-400">7. Interactive Input Fields</h4>
                      <Field>
                        <FieldLabel>Email Address</FieldLabel>
                        <InputGroup>
                          <InputGroupAddon align="inline-start">
                            <Mail className="size-4" />
                          </InputGroupAddon>
                          <InputGroupInput type="email" placeholder="name@company.com" />
                        </InputGroup>
                      </Field>
                    </div>

                  </CardContent>
                </Card>

                {/* Popover Checklist dropdown (Node 2256:62628) */}
                <Card className="border border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Popover Checklist dropdown [1.1]</CardTitle>
                    <CardDescription>Mockup of country checklist and context list layout from Figma</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-2xl">
                    
                    {/* Country Dropdown Panel */}
                    <div className="w-[300px] border border-border rounded-input bg-card text-card-foreground shadow-custom-medium overflow-hidden flex flex-col">
                      <div className="p-lg">
                        <InputGroup>
                          <InputGroupAddon align="inline-start">
                            <Search className="size-4 text-neutral-400" />
                          </InputGroupAddon>
                          <InputGroupInput 
                            placeholder="Search countries" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </InputGroup>
                      </div>
                      
                      {/* All countries checkbox */}
                      <div className="flex items-center gap-lg px-xl py-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                        <Checkbox 
                          checked={allCountriesChecked}
                          onCheckedChange={(checked) => handleSelectAllCountries(!!checked)}
                        />
                        <span className="text-paragraph-sm font-medium text-neutral-800 dark:text-neutral-100">All countries</span>
                      </div>

                      <span className="h-px bg-border w-full" />

                      {/* Countries list */}
                      <div className="flex flex-col max-h-[200px] overflow-y-auto py-1">
                        {filteredCountries.map((c) => {
                          const FlagIcon = c.flag
                          return (
                            <div 
                              key={c.id}
                              className="flex items-center justify-between px-xl py-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                            >
                              <label className="flex items-center gap-lg flex-1 cursor-pointer">
                                <Checkbox 
                                  checked={!!selectedCountries[c.id]}
                                  onCheckedChange={(checked) => handleSelectCountry(c.id, !!checked)}
                                />
                                <FlagIcon />
                                <span className="text-paragraph-sm text-neutral-800 dark:text-neutral-100">{c.name}</span>
                              </label>
                              {c.count !== undefined && (
                                <Badge variant="success" className="text-subheading-2xs px-xs bg-success-light text-success-dark rounded-full font-bold select-none h-4 min-w-4 justify-center">
                                  {c.count}
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                        {filteredCountries.length === 0 && (
                          <div className="px-xl py-2xl text-center text-paragraph-xs text-neutral-400">
                            No countries found.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Context Menu Actions Dropdown */}
                    <div className="w-[200px] border border-border rounded-input bg-card text-card-foreground shadow-custom-medium py-sm flex flex-col h-fit">
                      <button 
                        onClick={() => toast.info("Archiving case...")}
                        className="flex items-center justify-between px-lg py-sm text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 text-paragraph-sm text-neutral-800 dark:text-neutral-100 w-full cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-sm">
                          <Archive className="size-4 text-neutral-400" />
                          Archive
                        </span>
                        <kbd className="text-subheading-2xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border border-border px-xs rounded-compact">⌘1</kbd>
                      </button>
                      <button 
                        onClick={() => toast.success("Uploading documents...")}
                        className="flex items-center gap-sm px-lg py-sm text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 text-paragraph-sm text-neutral-800 dark:text-neutral-100 w-full cursor-pointer transition-colors"
                      >
                        <Upload className="size-4 text-neutral-400" />
                        Upload documents
                      </button>
                      <span className="h-px bg-neutral-100 dark:bg-neutral-800 my-xs w-full" />
                      <button 
                        onClick={() => toast.error("Case deletion triggered.")}
                        className="flex items-center gap-sm px-lg py-sm text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 text-paragraph-sm text-error-dark w-full cursor-pointer font-medium transition-colors"
                      >
                        <Trash2 className="size-4" />
                        Delete case
                      </button>
                    </div>

                  </CardContent>
                </Card>

                {/* Table Row Cells Showcase */}
                <Card className="border border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Table Row Cell [1.1]</CardTitle>
                    <CardDescription>Metadata lists rendering badges, actions, checklists, and description layout</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col">
                    <div className="border border-border rounded-input overflow-hidden divide-y divide-border">
                      
                      {/* Taylor Johnson Row */}
                      <div className="flex items-center gap-xl py-xl px-2xl bg-card text-card-foreground">
                        <Avatar size="lg">
                          <AvatarFallback>TJ</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0">
                          <h4 className="text-label-sm text-neutral-900 dark:text-neutral-100 font-medium truncate">Taylor Johnson</h4>
                          <p className="text-paragraph-xs text-neutral-400 truncate">AX Studios</p>
                        </div>
                        <button className="p-xs hover:bg-neutral-50 rounded-compact text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer">
                          <MoreHorizontal className="size-5" />
                        </button>
                      </div>

                      {/* Visa Status Row */}
                      <div className="flex items-center gap-xl py-xl px-2xl bg-card text-card-foreground">
                        <div className="flex flex-col flex-1 min-w-0">
                          <h4 className="text-label-sm text-neutral-900 dark:text-neutral-100 font-medium truncate">Visa Approved Status</h4>
                        </div>
                        <Badge variant="success" withDot>Visa Approved</Badge>
                      </div>

                      {/* Action Row */}
                      <div className="flex items-center gap-xl py-xl px-2xl bg-card text-card-foreground">
                        <div className="flex flex-col flex-1 min-w-0">
                          <h4 className="text-label-sm text-neutral-900 dark:text-neutral-100 font-medium truncate">taylor_docs.pdf</h4>
                          <p className="text-paragraph-xs text-neutral-400 truncate">1.9 MB</p>
                        </div>
                        <button 
                          onClick={() => toast.success("Downloading document...")}
                          className="text-label-sm text-brand-medium hover:text-brand-dark hover:underline cursor-pointer"
                        >
                          Download
                        </button>
                      </div>

                    </div>
                  </CardContent>
                </Card>

                {/* Alerts Showcase */}
                <Card className="border border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Alerts [1.1]</CardTitle>
                    <CardDescription>Semantic statuses displaying inline announcements and notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-lg">
                    <Alert>
                      <Info className="size-4" />
                      <AlertTitle>Default / General Info</AlertTitle>
                      <AlertDescription>
                        This is a standard system message with no specific priority.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="success">
                      <CircleCheck className="size-4" />
                      <AlertTitle>Success State</AlertTitle>
                      <AlertDescription>
                        The migrant application has been successfully updated.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="warning">
                      <AlertTriangle className="size-4" />
                      <AlertTitle>Warning State</AlertTitle>
                      <AlertDescription>
                        Right to Work check is pending. Please verify user status.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="destructive">
                      <XCircle className="size-4" />
                      <AlertTitle>Error / Destructive State</AlertTitle>
                      <AlertDescription>
                        Failed to connect to the backend database. Retrying...
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Badges Showcase */}
                <Card className="border border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Badge [1.1]</CardTitle>
                    <CardDescription>Light backgrounds with optional status dot indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-xl">
                    <div className="flex flex-wrap gap-lg">
                      <Badge variant="success">Visa Approved</Badge>
                      <Badge variant="destructive">Arrived – RTW Pending</Badge>
                      <Badge variant="warning">Check RTW</Badge>
                      <Badge variant="info">Pending Review</Badge>
                      <Badge variant="neutral-lighter">Neutral</Badge>
                    </div>
                    
                    <div className="border-t border-border pt-xl">
                      <h4 className="text-subheading-2xs font-bold text-neutral-400 mb-sm">With Dot Indicator</h4>
                      <div className="flex flex-wrap gap-lg">
                        <Badge variant="success" withDot>Active</Badge>
                        <Badge variant="destructive" withDot>Error</Badge>
                        <Badge variant="warning" withDot>Warning</Badge>
                        <Badge variant="info" withDot>Info</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

            </div>
          </div>
        </div>
        <Toaster />
      </div>
  )
}
