'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { College, getColleges } from '@/data/services/college-service'
import { Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CollegeSelectorProps {
  value?: string
  onChange: (value: string, collegeId?: string) => void
  required?: boolean
  placeholder?: string
  label?: string
  allowCustomEntry?: boolean
  useCollegeId?: boolean  // If true, returns college ID instead of name
}

export function CollegeSelector({ 
  value, 
  onChange, 
  required = false, 
  placeholder = "Select your college/institution",
  label = "College/Institution",
  allowCustomEntry = true,
  useCollegeId = false
}: CollegeSelectorProps) {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState('')

  useEffect(() => {
    loadColleges()
  }, [])

  useEffect(() => {
    // If value is set and not in the colleges list, show custom input
    if (value && colleges.length > 0) {
      let existsInList = false
      
      if (useCollegeId) {
        // Check if value matches any college ID
        existsInList = colleges.some(college => college.id === value)
      } else {
        // Check if value matches any college name
        existsInList = colleges.some(college => college.name === value)
      }
      
      if (!existsInList) {
        setShowCustomInput(true)
        setCustomValue(value)
      }
    }
  }, [value, colleges, useCollegeId])

  const loadColleges = async () => {
    try {
      setLoading(true)
      const data = await getColleges()
      setColleges(data.filter(college => college.isActive))
    } catch (error) {
      console.error('Error loading colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setShowCustomInput(true)
      setCustomValue('')
      onChange('', undefined)
    } else {
      setShowCustomInput(false)
      setCustomValue('')
      
      if (useCollegeId) {
        // Return college ID
        onChange(selectedValue, selectedValue)
      } else {
        // Find college by ID and return name
        const selectedCollege = colleges.find(college => college.id === selectedValue)
        onChange(selectedCollege?.name || selectedValue, selectedValue)
      }
    }
  }

  const handleCustomInputChange = (inputValue: string) => {
    setCustomValue(inputValue)
    onChange(inputValue, undefined)
  }

  const handleBackToSelect = () => {
    setShowCustomInput(false)
    setCustomValue('')
    onChange('', undefined)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label} {required && '*'}</Label>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading colleges...</span>
        </div>
      </div>
    )
  }

  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Label htmlFor="college-custom">{label} {required && '*'}</Label>
        <div className="flex gap-2">
          <Input
            id="college-custom"
            value={customValue}
            onChange={(e) => handleCustomInputChange(e.target.value)}
            placeholder="Enter your college/institution name"
            required={required}
          />
          {colleges.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToSelect}
              className="px-3"
            >
              ←
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the name of your college/institution if it's not in the list.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="college-select">{label} {required && '*'}</Label>
      <Select 
        value={useCollegeId && value ? value : (value ? colleges.find(c => c.name === value)?.id || '' : '')} 
        onValueChange={handleSelectChange} 
        required={required}
      >
        <SelectTrigger id="college-select">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {colleges.map((college) => (
            <SelectItem key={college.id} value={college.id!}>
              <div className="flex flex-col">
                <span>{college.name}</span>
                {college.affiliation && (
                  <span className="text-xs text-muted-foreground">
                    {college.affiliation}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
          {allowCustomEntry && (
            <>
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <Plus className="h-3 w-3" />
                  <span>Enter custom college name</span>
                </div>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
      {colleges.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No colleges found. You can enter the name manually.
        </p>
      )}
    </div>
  )
}
