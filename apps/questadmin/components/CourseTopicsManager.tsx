'use client'

import { MultilingualArrayInput, MultilingualInput, MultilingualTextarea } from '@/components/MultilingualInput'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
    AdminCourseTopic,
    addCourseTopic,
    deleteCourseTopic,
    getCourseTopics,
    updateCourseTopic
} from '@/data/services/admin-course-service'
import {
    DEFAULT_LANGUAGE,
    MultilingualArray,
    MultilingualText,
    RequiredMultilingualArray,
    RequiredMultilingualText
} from '@/lib/multilingual-types'
import {
    createMultilingualArray,
    createMultilingualText,
    getCompatibleArray,
    getCompatibleText,
    isMultilingualContent
} from '@/lib/multilingual-utils'
import {
    BookOpen,
    ChevronDown,
    ChevronUp,
    Edit,
    ExternalLink,
    FileText,
    Globe,
    GripVertical,
    Plus,
    Save,
    Trash2,
    Video
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface CourseTopicsManagerProps {
  courseId: string
  isEditable: boolean
  multilingualMode?: boolean
}

// Enhanced topic interface for multilingual support
interface HybridTopic extends Omit<AdminCourseTopic, 'title' | 'description' | 'learningObjectives'> {
  title: RequiredMultilingualText | string
  description?: MultilingualText | string
  learningObjectives?: MultilingualArray | string[]
}

interface Material {
  type: 'pdf' | 'video' | 'audio' | 'document' | 'link'
  title: string
  url: string
  description?: string
}

// Form data interface that handles both multilingual and regular modes
interface TopicFormData {
  title: string | RequiredMultilingualText
  description: string | MultilingualText
  order: number
  duration?: number
  videoUrl?: string
  isPublished: boolean
  learningObjectives: string[] | RequiredMultilingualArray
  materials: Material[]
}

export function CourseTopicsManager({ courseId, isEditable, multilingualMode = false }: CourseTopicsManagerProps) {
  const [topics, setTopics] = useState<HybridTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTopic, setEditingTopic] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())

  // Create form data based on multilingual mode
  const createInitialFormData = (): TopicFormData => ({
    title: multilingualMode ? createMultilingualText('') : '',
    description: multilingualMode ? createMultilingualText('') : '',
    order: 0,
    duration: 0,
    videoUrl: '',
    isPublished: false,
    learningObjectives: multilingualMode ? createMultilingualArray([]) : [],
    materials: [] as Material[]
  })

  const [formData, setFormData] = useState<TopicFormData>(createInitialFormData())

  useEffect(() => {
    loadTopics()
  }, [courseId])

  const loadTopics = async () => {
    try {
      setLoading(true)
      setError(null)
      const topicsData = await getCourseTopics(courseId)
      // Convert legacy topics to hybrid format
      const hybridTopics: HybridTopic[] = topicsData.map(topic => ({
        ...topic,
        title: topic.title,
        description: topic.description,
        learningObjectives: topic.learningObjectives || []
      }))
      setTopics(hybridTopics)
    } catch (err) {
      setError('Failed to load topics')
      console.error('Error loading topics:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field: keyof TopicFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAdd = async () => {
    try {
      // Remove courseId from topicData as it's passed as a parameter
      const topicData = {
        title: multilingualMode 
          ? getCompatibleText(formData.title as RequiredMultilingualText, DEFAULT_LANGUAGE) 
          : formData.title as string,
        description: multilingualMode 
          ? getCompatibleText(formData.description as MultilingualText, DEFAULT_LANGUAGE) 
          : (formData.description as string || undefined),
        order: topics.length + 1,
        duration: formData.duration,
        videoUrl: formData.videoUrl,
        isPublished: formData.isPublished,
        learningObjectives: multilingualMode 
          ? getCompatibleArray(formData.learningObjectives as RequiredMultilingualArray, DEFAULT_LANGUAGE) 
          : formData.learningObjectives as string[],
        materials: formData.materials.filter(m => m.title && m.url)
      }

      await addCourseTopic(courseId, topicData)
      toast.success('Topic added successfully')
      await loadTopics()
      setFormData(createInitialFormData())
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding topic:', error)
      toast.error('Failed to add topic')
    }
  }

  const handleEdit = (topic: HybridTopic) => {
    setFormData({
      title: multilingualMode 
        ? (isMultilingualContent(topic.title) ? topic.title as RequiredMultilingualText : createMultilingualText(topic.title as string))
        : (typeof topic.title === 'string' ? topic.title : getCompatibleText(topic.title, DEFAULT_LANGUAGE)),
      description: multilingualMode
        ? (isMultilingualContent(topic.description) ? topic.description as MultilingualText : createMultilingualText(topic.description as string || ''))
        : (typeof topic.description === 'string' ? topic.description || '' : getCompatibleText(topic.description || createMultilingualText(''), DEFAULT_LANGUAGE)),
      order: topic.order,
      duration: topic.duration,
      videoUrl: topic.videoUrl,
      isPublished: topic.isPublished,
      learningObjectives: multilingualMode
        ? (isMultilingualContent(topic.learningObjectives) ? topic.learningObjectives as RequiredMultilingualArray : createMultilingualArray(topic.learningObjectives as string[] || []))
        : (Array.isArray(topic.learningObjectives) ? topic.learningObjectives : getCompatibleArray(topic.learningObjectives || createMultilingualArray([]), DEFAULT_LANGUAGE)),
      materials: topic.materials || []
    })
    setEditingTopic(topic.id!)
  }

  const handleUpdate = async () => {
    if (!editingTopic) return

    try {
      const updateData = {
        title: multilingualMode 
          ? getCompatibleText(formData.title as RequiredMultilingualText, DEFAULT_LANGUAGE) 
          : formData.title as string,
        description: multilingualMode 
          ? getCompatibleText(formData.description as MultilingualText, DEFAULT_LANGUAGE) 
          : (formData.description as string || undefined),
        duration: formData.duration,
        videoUrl: formData.videoUrl,
        isPublished: formData.isPublished,
        learningObjectives: multilingualMode 
          ? getCompatibleArray(formData.learningObjectives as RequiredMultilingualArray, DEFAULT_LANGUAGE) 
          : formData.learningObjectives as string[],
        materials: formData.materials.filter(m => m.title && m.url)
      }

      await updateCourseTopic(courseId, editingTopic, updateData)
      toast.success('Topic updated successfully')
      await loadTopics()
      setFormData(createInitialFormData())
      setEditingTopic(null)
    } catch (error) {
      console.error('Error updating topic:', error)
      toast.error('Failed to update topic')
    }
  }

  const handleDelete = async (topicId: string) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return

    try {
      await deleteCourseTopic(courseId, topicId)
      toast.success('Topic deleted successfully')
      await loadTopics()
    } catch (error) {
      console.error('Error deleting topic:', error)
      toast.error('Failed to delete topic')
    }
  }

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { type: 'document', title: '', url: '', description: '' }]
    }))
  }

  const updateMaterial = (index: number, field: keyof Material, value: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }))
  }

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }))
  }

  const getMaterialIcon = (type: Material['type']) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'pdf': return <FileText className="h-4 w-4" />
      case 'audio': return <Video className="h-4 w-4" />
      case 'link': return <ExternalLink className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const toggleTopicExpansion = (topicId: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev)
      if (newSet.has(topicId)) {
        newSet.delete(topicId)
      } else {
        newSet.add(topicId)
      }
      return newSet
    })
  }

  // Helper function to get text for display
  const getDisplayText = (content: string | RequiredMultilingualText | MultilingualText | undefined, fallback: string = '') => {
    if (!content) return fallback
    if (typeof content === 'string') return content
    return getCompatibleText(content, DEFAULT_LANGUAGE) || fallback
  }

  // Helper function to get array for display
  const getDisplayArray = (content: string[] | RequiredMultilingualArray | MultilingualArray | undefined): string[] => {
    if (!content) return []
    if (Array.isArray(content)) return content
    return getCompatibleArray(content, DEFAULT_LANGUAGE) || []
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading topics...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-sm text-red-600">{error}</div>
            <Button 
              variant="outline" 
              onClick={loadTopics}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Topics
            {multilingualMode && <Globe className="h-4 w-4 text-blue-500" />}
            <Badge variant="secondary">{topics.length}</Badge>
          </div>
          {isEditable && (
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={editingTopic !== null}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {(showAddForm || editingTopic) && isEditable && (
          <Card className="border-2 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingTopic ? 'Edit Topic' : 'Add New Topic'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label className="flex items-center gap-2">
                  Title *
                  {multilingualMode && <Globe className="h-4 w-4 text-blue-500" />}
                </Label>
                {multilingualMode ? (
                  <MultilingualInput
                    value={formData.title as RequiredMultilingualText}
                    onChange={(value) => handleFormChange('title', value)}
                    placeholder="Enter topic title"
                    required
                  />
                ) : (
                  <Input
                    value={formData.title as string}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Enter topic title"
                    required
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <Label className="flex items-center gap-2">
                  Description
                  {multilingualMode && <Globe className="h-4 w-4 text-blue-500" />}
                </Label>
                {multilingualMode ? (
                  <MultilingualTextarea
                    value={formData.description as MultilingualText}
                    onChange={(value) => handleFormChange('description', value)}
                    placeholder="Describe what students will learn in this topic"
                  />
                ) : (
                  <Textarea
                    value={formData.description as string}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Describe what students will learn in this topic"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Duration */}
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.duration || 0}
                    onChange={(e) => handleFormChange('duration', parseInt(e.target.value) || 0)}
                    placeholder="30"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <Label>Video URL</Label>
                  <Input
                    value={formData.videoUrl || ''}
                    onChange={(e) => handleFormChange('videoUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <Label className="flex items-center gap-2">
                  Learning Objectives
                  {multilingualMode && <Globe className="h-4 w-4 text-blue-500" />}
                </Label>
                {multilingualMode ? (
                  <MultilingualArrayInput
                    value={formData.learningObjectives as RequiredMultilingualArray}
                    onChange={(value) => handleFormChange('learningObjectives', value)}
                    placeholder="Add learning objective"
                  />
                ) : (
                  <div className="space-y-2">
                    {(formData.learningObjectives as string[]).map((objective, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={objective}
                          onChange={(e) => {
                            const newObjectives = [...(formData.learningObjectives as string[])]
                            newObjectives[index] = e.target.value
                            handleFormChange('learningObjectives', newObjectives)
                          }}
                          placeholder={`Objective ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newObjectives = (formData.learningObjectives as string[]).filter((_, i) => i !== index)
                            handleFormChange('learningObjectives', newObjectives)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newObjectives = [...(formData.learningObjectives as string[]), '']
                        handleFormChange('learningObjectives', newObjectives)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Objective
                    </Button>
                  </div>
                )}
              </div>

              {/* Materials */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Course Materials</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMaterial}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Material
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.materials.map((material, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                          <Label>Type</Label>
                          <Select 
                            value={material.type} 
                            onValueChange={(value: Material['type']) => updateMaterial(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="audio">Audio</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="link">Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={material.title}
                            onChange={(e) => updateMaterial(index, 'title', e.target.value)}
                            placeholder="Material title"
                          />
                        </div>
                        <div>
                          <Label>URL</Label>
                          <Input
                            value={material.url}
                            onChange={(e) => updateMaterial(index, 'url', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMaterial(index)}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label>Description</Label>
                        <Input
                          value={material.description || ''}
                          onChange={(e) => updateMaterial(index, 'description', e.target.value)}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Published Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => handleFormChange('isPublished', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isPublished">Published</Label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={editingTopic ? handleUpdate : handleAdd}
                  disabled={!formData.title}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingTopic ? 'Update Topic' : 'Add Topic'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFormData(createInitialFormData())
                    setEditingTopic(null)
                    setShowAddForm(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Topics List */}
        <div className="space-y-3">
          {topics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No topics found. {isEditable && 'Click "Add Topic" to create the first topic.'}
            </div>
          ) : (
            topics.map((topic, index) => (
              <Card key={topic.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {getDisplayText(topic.title, 'Untitled Topic')}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {topic.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {topic.duration} min
                            </Badge>
                          )}
                          {topic.isPublished ? (
                            <Badge className="text-xs bg-green-100 text-green-800">
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Draft
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTopicExpansion(topic.id!)}
                      >
                        {expandedTopics.has(topic.id!) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      {isEditable && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(topic)}
                            disabled={editingTopic !== null}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(topic.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedTopics.has(topic.id!) && (
                  <CardContent className="pt-0">
                    {topic.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {getDisplayText(topic.description)}
                      </p>
                    )}
                    
                    {topic.videoUrl && (
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Video Available
                        </Badge>
                      </div>
                    )}

                    {getDisplayArray(topic.learningObjectives).length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-2">Learning Objectives:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {getDisplayArray(topic.learningObjectives).map((objective, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {topic.materials && topic.materials.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Course Materials:</h4>
                        <div className="space-y-2">
                          {topic.materials.map((material, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {getMaterialIcon(material.type)}
                              <span className="flex-1">{material.title}</span>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={material.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
