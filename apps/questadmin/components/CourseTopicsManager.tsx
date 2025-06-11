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
    CreateCourseTopicData,
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
    Link,
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
  type: 'pdf' | 'video' | 'audio' | 'document' | 'link' | 'assignment'
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
      toast.error('Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field: keyof TopicFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTopic = async () => {
    try {
      const topicData: CreateCourseTopicData = {
        title: multilingualMode 
          ? getCompatibleText(formData.title as RequiredMultilingualText, DEFAULT_LANGUAGE)
          : formData.title as string,
        description: multilingualMode 
          ? getCompatibleText(formData.description as MultilingualText, DEFAULT_LANGUAGE) || undefined
          : formData.description as string || undefined,
        order: Math.max(...topics.map(t => t.order), 0) + 1,
        duration: formData.duration || undefined,
        videoUrl: formData.videoUrl || undefined,
        isPublished: formData.isPublished,
        learningObjectives: multilingualMode
          ? getCompatibleArray(formData.learningObjectives as RequiredMultilingualArray, DEFAULT_LANGUAGE).filter(obj => obj.trim())
          : (formData.learningObjectives as string[]).filter(obj => obj.trim()),
        materials: formData.materials
          .filter(m => m.title && m.url)
          .map(m => ({
            ...m,
            // Map 'assignment' type to 'document' for service compatibility
            type: m.type === 'assignment' ? 'document' : m.type
          }) as { type: 'pdf' | 'video' | 'audio' | 'document' | 'link'; title: string; url: string; description?: string })
      }

      const success = await addCourseTopic(courseId, topicData)
      if (success) {
        await loadTopics()
        setShowAddForm(false)
        setFormData(createInitialFormData())
        toast.success('Topic added successfully!')
      } else {
        setError('Failed to add topic')
        toast.error('Failed to add topic')
      }
    } catch (err) {
      setError('Failed to add topic')
      console.error('Error adding topic:', err)
      toast.error('Failed to add topic')
    }
  }

  const handleEditTopic = (topic: HybridTopic) => {
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

  const handleUpdateTopic = async () => {
    if (!editingTopic) return

    try {
      const topicData: CreateCourseTopicData = {
        title: multilingualMode 
          ? getCompatibleText(formData.title as RequiredMultilingualText, DEFAULT_LANGUAGE)
          : formData.title as string,
        description: multilingualMode 
          ? getCompatibleText(formData.description as MultilingualText, DEFAULT_LANGUAGE) || undefined
          : formData.description as string || undefined,
        order: formData.order,
        duration: formData.duration || undefined,
        videoUrl: formData.videoUrl || undefined,
        isPublished: formData.isPublished,
        learningObjectives: multilingualMode
          ? getCompatibleArray(formData.learningObjectives as RequiredMultilingualArray, DEFAULT_LANGUAGE).filter(obj => obj.trim())
          : (formData.learningObjectives as string[]).filter(obj => obj.trim()),
        materials: formData.materials
          .filter(m => m.title && m.url)
          .map(m => ({
            ...m,
            // Map 'assignment' type to 'document' for service compatibility
            type: m.type === 'assignment' ? 'document' : m.type
          }) as { type: 'pdf' | 'video' | 'audio' | 'document' | 'link'; title: string; url: string; description?: string })
      }

      const success = await updateCourseTopic(courseId, editingTopic, topicData)
      if (success) {
        await loadTopics()
        setEditingTopic(null)
        setFormData(createInitialFormData())
        toast.success('Topic updated successfully!')
      } else {
        setError('Failed to update topic')
        toast.error('Failed to update topic')
      }
    } catch (err) {
      setError('Failed to update topic')
      console.error('Error updating topic:', err)
      toast.error('Failed to update topic')
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        const success = await deleteCourseTopic(courseId, topicId)
        if (success) {
          await loadTopics()
          toast.success('Topic deleted successfully!')
        } else {
          setError('Failed to delete topic')
          toast.error('Failed to delete topic')
        }
      } catch (err) {
        setError('Failed to delete topic')
        console.error('Error deleting topic:', err)
        toast.error('Failed to delete topic')
      }
    }
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'link': return <Link className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'assignment': return <FileText className="h-4 w-4" />
      default: return <ExternalLink className="h-4 w-4" />
    }
  }

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { type: 'document', title: '', url: '' }]
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

  const addLearningObjective = () => {
    if (multilingualMode) {
      const objectives = formData.learningObjectives as RequiredMultilingualArray
      const newObjectives = [...getCompatibleArray(objectives, DEFAULT_LANGUAGE), '']
      handleFormChange('learningObjectives', createMultilingualArray(newObjectives))
    } else {
      handleFormChange('learningObjectives', [...(formData.learningObjectives as string[]), ''])
    }
  }

  const updateLearningObjective = (index: number, value: string) => {
    if (multilingualMode) {
      const objectives = formData.learningObjectives as RequiredMultilingualArray
      const currentObjectives = getCompatibleArray(objectives, DEFAULT_LANGUAGE)
      const newObjectives = currentObjectives.map((obj, i) => i === index ? value : obj)
      handleFormChange('learningObjectives', createMultilingualArray(newObjectives))
    } else {
      const newObjectives = (formData.learningObjectives as string[]).map((obj, i) => 
        i === index ? value : obj
      )
      handleFormChange('learningObjectives', newObjectives)
    }
  }

  const removeLearningObjective = (index: number) => {
    if (multilingualMode) {
      const objectives = formData.learningObjectives as RequiredMultilingualArray
      const currentObjectives = getCompatibleArray(objectives, DEFAULT_LANGUAGE)
      const newObjectives = currentObjectives.filter((_, i) => i !== index)
      handleFormChange('learningObjectives', createMultilingualArray(newObjectives))
    } else {
      const newObjectives = (formData.learningObjectives as string[]).filter((_, i) => i !== index)
      handleFormChange('learningObjectives', newObjectives)
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

  const renderTopicForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {editingTopic ? 'Edit Topic' : 'Add New Topic'}
          {multilingualMode && <Globe className="h-5 w-5 text-blue-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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

          {/* Duration and Video URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration || ''}
                onChange={(e) => handleFormChange('duration', parseInt(e.target.value) || 0)}
                placeholder="e.g., 45"
              />
            </div>
            <div>
              <Label>Video URL (optional)</Label>
              <Input
                value={formData.videoUrl || ''}
                onChange={(e) => handleFormChange('videoUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
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
                label="Learning Objectives"
                value={formData.learningObjectives as RequiredMultilingualArray}
                onChange={(value) => handleFormChange('learningObjectives', value)}
                placeholder="Add a learning objective"
              />
            ) : (
              <div className="space-y-2">
                {(formData.learningObjectives as string[]).map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={objective}
                      onChange={(e) => updateLearningObjective(index, e.target.value)}
                      placeholder="Enter learning objective"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLearningObjective(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLearningObjective}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Objective
                </Button>
              </div>
            )}
          </div>

          {/* Materials */}
          <div>
            <Label>Materials</Label>
            <div className="space-y-2">
              {formData.materials.map((material, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded">
                  <Select
                    value={material.type}
                    onValueChange={(value) => updateMaterial(index, 'type', value)}
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
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={material.title}
                    onChange={(e) => updateMaterial(index, 'title', e.target.value)}
                    placeholder="Material title"
                  />
                  <Input
                    value={material.url}
                    onChange={(e) => updateMaterial(index, 'url', e.target.value)}
                    placeholder="URL"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMaterial(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addMaterial}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Material
              </Button>
            </div>
          </div>

          {/* Published Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => handleFormChange('isPublished', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPublished">Published</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={editingTopic ? handleUpdateTopic : handleAddTopic}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {editingTopic ? 'Update Topic' : 'Add Topic'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingTopic(null)
                setShowAddForm(false)
                setFormData(createInitialFormData())
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading topics...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Course Topics
            {multilingualMode && (
              <Badge className="bg-blue-100 text-blue-800">
                <Globe className="h-3 w-3 mr-1" />
                Multilingual
              </Badge>
            )}
          </h2>
          <p className="text-gray-600">
            Manage topics and learning materials for this course
          </p>
        </div>
        
        {isEditable && !showAddForm && !editingTopic && (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Topic
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingTopic) && renderTopicForm()}

      {/* Topics List */}
      <Card>
        <CardHeader>
          <CardTitle>Topics ({topics.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topics.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
                <p className="text-gray-600">Start by adding your first topic to organize course content.</p>
                {isEditable && (
                  <Button onClick={() => setShowAddForm(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Topic
                  </Button>
                )}
              </div>
            ) : (
              topics.map((topic) => {
                const isExpanded = expandedTopics.has(topic.id!)
                const topicTitle = multilingualMode 
                  ? getCompatibleText(topic.title as RequiredMultilingualText, DEFAULT_LANGUAGE)
                  : (topic.title as string)
                const topicDescription = multilingualMode 
                  ? getCompatibleText(topic.description as MultilingualText, DEFAULT_LANGUAGE)
                  : (topic.description as string)
                const learningObjectives = multilingualMode
                  ? getCompatibleArray(topic.learningObjectives as RequiredMultilingualArray, DEFAULT_LANGUAGE)
                  : (topic.learningObjectives as string[])

                return (
                  <Card key={topic.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{topicTitle}</h3>
                            <Badge variant={topic.isPublished ? "default" : "secondary"}>
                              {topic.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                            {topic.duration && (
                              <Badge variant="outline">{topic.duration} min</Badge>
                            )}
                          </div>
                          
                          {topicDescription && (
                            <p className="text-gray-600 mb-2">{topicDescription}</p>
                          )}

                          {/* Learning Objectives Preview */}
                          {learningObjectives && learningObjectives.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Learning Objectives:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {learningObjectives.slice(0, isExpanded ? undefined : 2).map((objective, index) => (
                                  <li key={index}>{objective}</li>
                                ))}
                                {!isExpanded && learningObjectives.length > 2 && (
                                  <li className="text-gray-400">... and {learningObjectives.length - 2} more</li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Materials Preview */}
                          {topic.materials && topic.materials.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {topic.materials.slice(0, isExpanded ? undefined : 3).map((material, index) => (
                                <div key={index} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                  {getMaterialIcon(material.type)}
                                  <span>{material.title}</span>
                                </div>
                              ))}
                              {!isExpanded && topic.materials.length > 3 && (
                                <div className="text-xs text-gray-400 px-2 py-1">
                                  +{topic.materials.length - 3} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTopicExpansion(topic.id!)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          {isEditable && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTopic(topic)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTopic(topic.id!)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t pt-4 space-y-4">
                          {/* Video URL */}
                          {topic.videoUrl && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Video:</p>
                              <a
                                href={topic.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <Video className="h-4 w-4" />
                                Watch Video
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}

                          {/* All Materials */}
                          {topic.materials && topic.materials.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Materials:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {topic.materials.map((material, index) => (
                                  <a
                                    key={index}
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                  >
                                    {getMaterialIcon(material.type)}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{material.title}</p>
                                      {material.description && (
                                        <p className="text-xs text-gray-600 truncate">{material.description}</p>
                                      )}
                                    </div>
                                    <ExternalLink className="h-3 w-3 text-gray-400" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
