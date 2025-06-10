'use client'

import { MultilingualArrayInput, MultilingualInput, MultilingualTextarea } from '@/components/MultilingualInput'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
}

// Enhanced topic interface for multilingual support
interface MultilingualTopic extends Omit<AdminCourseTopic, 'title' | 'description' | 'learningObjectives'> {
  title: RequiredMultilingualText | string
  description?: MultilingualText | string
  learningObjectives?: MultilingualArray | string[]
}

interface TopicFormData {
  title: RequiredMultilingualText
  description: MultilingualText
  order: number
  duration: number
  videoUrl: string
  isPublished: boolean
  learningObjectives: MultilingualArray
  materials: {
    type: 'pdf' | 'video' | 'audio' | 'document' | 'link'
    title: string
    url: string
    description?: string
  }[]
}

interface Material {
  type: 'pdf' | 'video' | 'audio' | 'document' | 'link'
  title: string
  url: string
  description?: string
}

const defaultTopicForm: TopicFormData = {
  title: createMultilingualText(''),
  description: createMultilingualText(''),
  order: 1,
  duration: 0,
  videoUrl: '',
  isPublished: false,
  learningObjectives: createMultilingualArray([]),
  materials: []
}

export function MultilingualCourseTopicsManager({ courseId, isEditable }: CourseTopicsManagerProps) {
  const [topics, setTopics] = useState<MultilingualTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTopic, setEditingTopic] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<TopicFormData>(defaultTopicForm)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadTopics()
  }, [courseId])

  const loadTopics = async () => {
    try {
      setLoading(true)
      setError(null)
      const topicsData = await getCourseTopics(courseId)
      // Convert legacy topics to multilingual format
      const multilingualTopics: MultilingualTopic[] = topicsData.map(topic => ({
        ...topic,
        title: typeof topic.title === 'string' ? topic.title : topic.title,
        description: typeof topic.description === 'string' ? topic.description : topic.description,
        learningObjectives: Array.isArray(topic.learningObjectives) ? topic.learningObjectives : topic.learningObjectives
      }))
      setTopics(multilingualTopics.sort((a, b) => a.order - b.order))
    } catch (err) {
      setError('Failed to load course topics')
      console.error('Error loading topics:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTopic = async () => {
    try {
      const topicData: CreateCourseTopicData = {
        title: getCompatibleText(formData.title, DEFAULT_LANGUAGE),
        description: getCompatibleText(formData.description, DEFAULT_LANGUAGE) || undefined,
        order: Math.max(...topics.map(t => t.order), 0) + 1,
        duration: formData.duration || undefined,
        videoUrl: formData.videoUrl || undefined,
        isPublished: formData.isPublished,
        learningObjectives: getCompatibleArray(formData.learningObjectives, DEFAULT_LANGUAGE).filter(obj => obj.trim()),
        materials: formData.materials.filter(m => m.title && m.url)
      }

      const topicId = await addCourseTopic(courseId, topicData)
      if (topicId) {
        await loadTopics()
        setShowAddForm(false)
        setFormData(defaultTopicForm)
        toast.success('Topic created successfully!')
      } else {
        setError('Failed to create topic')
        toast.error('Failed to create topic')
      }
    } catch (err) {
      setError('Failed to create topic')
      console.error('Error creating topic:', err)
      toast.error('Failed to create topic')
    }
  }

  const handleUpdateTopic = async (topicId: string) => {
    try {
      const topicData = {
        title: getCompatibleText(formData.title, DEFAULT_LANGUAGE),
        description: getCompatibleText(formData.description, DEFAULT_LANGUAGE) || undefined,
        duration: formData.duration || undefined,
        videoUrl: formData.videoUrl || undefined,
        isPublished: formData.isPublished,
        learningObjectives: getCompatibleArray(formData.learningObjectives, DEFAULT_LANGUAGE).filter(obj => obj.trim()),
        materials: formData.materials.filter(m => m.title && m.url)
      }

      const success = await updateCourseTopic(courseId, topicId, topicData)
      if (success) {
        await loadTopics()
        setEditingTopic(null)
        setFormData(defaultTopicForm)
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
    if (!confirm('Are you sure you want to delete this topic?')) return

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

  const startEditing = (topic: MultilingualTopic) => {
    setEditingTopic(topic.id!)
    setFormData({
      title: typeof topic.title === 'string' 
        ? createMultilingualText(topic.title) 
        : topic.title,
      description: typeof topic.description === 'string' 
        ? createMultilingualText(topic.description || '') 
        : topic.description || createMultilingualText(''),
      order: topic.order,
      duration: topic.duration || 0,
      videoUrl: topic.videoUrl || '',
      isPublished: topic.isPublished,
      learningObjectives: Array.isArray(topic.learningObjectives) 
        ? createMultilingualArray(topic.learningObjectives) 
        : topic.learningObjectives || createMultilingualArray([]),
      materials: topic.materials || []
    })
  }

  const cancelEditing = () => {
    setEditingTopic(null)
    setShowAddForm(false)
    setFormData(defaultTopicForm)
  }

  const toggleTopicExpansion = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  const handleFormChange = (field: keyof TopicFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'pdf': 
      case 'document': return <FileText className="h-4 w-4" />
      case 'link': return <Link className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const renderTopicForm = (isEditing: boolean, topic?: MultilingualTopic) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          {isEditing ? 'Edit Topic' : 'Add New Topic'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <MultilingualInput
              label="Topic Title"
              value={formData.title}
              onChange={(value) => handleFormChange('title', value)}
              placeholder="Enter topic title"
              required
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => handleFormChange('duration', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <MultilingualTextarea
            label="Description"
            value={formData.description}
            onChange={(value) => handleFormChange('description', value)}
            placeholder="Describe what this topic covers"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="videoUrl">Video URL</Label>
          <Input
            id="videoUrl"
            value={formData.videoUrl}
            onChange={(e) => handleFormChange('videoUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Learning Objectives */}
        <div>
          <MultilingualArrayInput
            label="Learning Objectives"
            value={formData.learningObjectives}
            onChange={(value) => handleFormChange('learningObjectives', value)}
            placeholder="Add learning objective"
          />
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
              <Card key={index} className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={material.type}
                      onValueChange={(value) => updateMaterial(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
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
                    value={material.description}
                    onChange={(e) => updateMaterial(index, 'description', e.target.value)}
                    placeholder="Brief description"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Published Status */}
        <div className="flex items-center space-x-2">
          <input
            id="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => handleFormChange('isPublished', e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isPublished">Publish this topic</Label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={isEditing ? () => handleUpdateTopic(topic!.id!) : handleAddTopic}
            disabled={!getCompatibleText(formData.title, DEFAULT_LANGUAGE).trim()}
          >
            <Save className="h-4 w-4 mr-1" />
            {isEditing ? 'Update Topic' : 'Add Topic'}
          </Button>
          <Button variant="outline" onClick={cancelEditing}>
            Cancel
          </Button>
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-600" />
          Multilingual Course Topics
        </h2>
        {isEditable && !showAddForm && !editingTopic && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {showAddForm && renderTopicForm(false)}

      <div className="space-y-4">
        {topics.map((topic, index) => (
          <Card key={topic.id} className="overflow-hidden">
            {editingTopic === topic.id ? (
              renderTopicForm(true, topic)
            ) : (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">
                          {topic.order}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {isMultilingualContent(topic.title) && (
                            <Globe className="h-4 w-4 text-blue-500" />
                          )}
                          {getCompatibleText(topic.title, DEFAULT_LANGUAGE)}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={topic.isPublished ? "default" : "secondary"}>
                            {topic.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          {topic.duration && (
                            <Badge variant="outline">
                              {topic.duration} min
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
                            onClick={() => startEditing(topic)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTopic(topic.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedTopics.has(topic.id!) && (
                  <CardContent className="border-t">
                    {topic.description && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-gray-600">
                          {getCompatibleText(topic.description, DEFAULT_LANGUAGE)}
                        </p>
                      </div>
                    )}

                    {topic.videoUrl && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Video</h4>
                        <a 
                          href={topic.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Video className="h-4 w-4" />
                          Watch Video
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {topic.learningObjectives && getCompatibleArray(topic.learningObjectives, DEFAULT_LANGUAGE).length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Learning Objectives</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {getCompatibleArray(topic.learningObjectives, DEFAULT_LANGUAGE).map((objective, i) => (
                            <li key={i} className="text-gray-600">{objective}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {topic.materials && topic.materials.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Course Materials</h4>
                        <div className="space-y-2">
                          {topic.materials.map((material, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              {getMaterialIcon(material.type)}
                              <div className="flex-1">
                                <a 
                                  href={material.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="font-medium text-blue-600 hover:underline"
                                >
                                  {material.title}
                                </a>
                                {material.description && (
                                  <p className="text-sm text-gray-600">{material.description}</p>
                                )}
                              </div>
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </>
            )}
          </Card>
        ))}

        {topics.length === 0 && !showAddForm && (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
              <p className="text-gray-600 mb-4">
                Add multilingual topics to structure your course content and help students learn step by step.
              </p>
              {isEditable && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Topic
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
