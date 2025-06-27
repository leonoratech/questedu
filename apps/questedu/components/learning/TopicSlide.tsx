/**
 * Topic Slide Component
 * Displays course topic content in a mobile-friendly format
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import {
    Button,
    Card,
    Chip,
    IconButton,
    List,
    Text,
    useTheme
} from 'react-native-paper';
import { SlideType, TopicSlide as TopicSlideType } from '../../types/learning';

interface TopicSlideProps {
  slide: TopicSlideType;
  isCompleted: boolean;
  onComplete: (slideId: string, slideType: SlideType, data?: any) => void;
  style?: ViewStyle;
}

export const TopicSlide: React.FC<TopicSlideProps> = ({
  slide,
  isCompleted,
  onComplete,
  style
}) => {
  const theme = useTheme();
  const [showObjectives, setShowObjectives] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  const { topic } = slide;

  React.useEffect(() => {
    // Start tracking reading time
    const startTime = Date.now();
    
    return () => {
      const timeSpent = (Date.now() - startTime) / 1000 / 60; // Convert to minutes
      setReadingTime(timeSpent);
    };
  }, []);

  const handleMarkComplete = () => {
    onComplete(slide.id, SlideType.TOPIC, {
      timeSpent: readingTime,
      topicId: topic.id
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes > 0 ? remainingMinutes + 'm' : ''}`;
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return 'play-circle';
      case 'pdf': return 'file-pdf-box';
      case 'audio': return 'volume-high';
      case 'document': return 'file-document';
      case 'link': return 'link';
      default: return 'file';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Topic Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={styles.titleSection}>
                <Text variant="headlineSmall" style={styles.title}>
                  {topic.title}
                </Text>
                
                <View style={styles.metadataRow}>
                  {topic.duration && (
                    <Chip 
                      icon="clock" 
                      style={styles.chip}
                      compact
                    >
                      {formatDuration(topic.duration)}
                    </Chip>
                  )}
                  
                  {topic.isFree && (
                    <Chip 
                      icon="gift" 
                      style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
                      compact
                    >
                      Free
                    </Chip>
                  )}
                  
                  {isCompleted && (
                    <Chip 
                      icon="check-circle" 
                      style={[styles.chip, { backgroundColor: theme.colors.tertiaryContainer }]}
                      compact
                    >
                      Completed
                    </Chip>
                  )}
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Topic Description */}
        {topic.description && (
          <Card style={styles.contentCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                About this Topic
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                {topic.description}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Learning Objectives */}
        {topic.learningObjectives.length > 0 && (
          <Card style={styles.contentCard}>
            <Card.Content>
              <List.Item
                title="Learning Objectives"
                titleStyle={styles.sectionTitle}
                right={() => (
                  <IconButton
                    icon={showObjectives ? "chevron-up" : "chevron-down"}
                    onPress={() => setShowObjectives(!showObjectives)}
                  />
                )}
                onPress={() => setShowObjectives(!showObjectives)}
              />
              
              {showObjectives && (
                <View style={styles.objectivesList}>
                  {topic.learningObjectives.map((objective, index) => (
                    <View key={index} style={styles.objectiveItem}>
                      <Text variant="bodyMedium">
                        • {objective}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Topic Summary */}
        {topic.summary && (
          <Card style={styles.contentCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Summary
              </Text>
              <Text variant="bodyMedium" style={styles.summary}>
                {topic.summary}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Materials */}
        {topic.materials.length > 0 && (
          <Card style={styles.contentCard}>
            <Card.Content>
              <List.Item
                title="Additional Materials"
                titleStyle={styles.sectionTitle}
                right={() => (
                  <IconButton
                    icon={showMaterials ? "chevron-up" : "chevron-down"}
                    onPress={() => setShowMaterials(!showMaterials)}
                  />
                )}
                onPress={() => setShowMaterials(!showMaterials)}
              />
              
              {showMaterials && (
                <View style={styles.materialsList}>
                  {topic.materials.map((material, index) => (
                    <List.Item
                      key={index}
                      title={material.title}
                      description={material.description}
                      left={() => <List.Icon icon={getMaterialIcon(material.type)} />}
                      right={() => <IconButton icon="open-in-new" onPress={() => {}} />}
                      style={styles.materialItem}
                    />
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Notes Section */}
        {topic.notes && (
          <Card style={styles.contentCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Notes
              </Text>
              <Text variant="bodyMedium" style={styles.notes}>
                {topic.notes}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Video Section */}
        {topic.videoUrl && (
          <Card style={styles.contentCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Video Content
              </Text>
              <View style={styles.videoPlaceholder}>
                <IconButton 
                  icon="play-circle" 
                  size={64} 
                  iconColor={theme.colors.primary}
                  onPress={() => {}}
                />
                <Text variant="bodyMedium" style={styles.videoText}>
                  Tap to play video
                </Text>
                {topic.videoLength && (
                  <Text variant="bodySmall" style={styles.videoLength}>
                    Duration: {formatDuration(topic.videoLength)}
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Completion Button */}
        <View style={styles.completionSection}>
          <Button
            mode="contained"
            onPress={handleMarkComplete}
            disabled={isCompleted}
            style={styles.completeButton}
            icon={isCompleted ? "check" : "arrow-right"}
          >
            {isCompleted ? "Completed" : "Mark as Complete"}
          </Button>
          
          {!isCompleted && (
            <Text variant="bodySmall" style={styles.completionHint}>
              Mark this topic as complete to continue to questions
            </Text>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 28,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  contentCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    lineHeight: 24,
  },
  objectivesList: {
    marginTop: 8,
  },
  objectiveItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  summary: {
    lineHeight: 24,
  },
  materialsList: {
    marginTop: 8,
  },
  materialItem: {
    paddingLeft: 0,
  },
  notes: {
    lineHeight: 24,
    fontStyle: 'italic',
  },
  videoPlaceholder: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  videoText: {
    marginTop: 8,
  },
  videoLength: {
    marginTop: 4,
    opacity: 0.7,
  },
  completionSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  completeButton: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  completionHint: {
    textAlign: 'center',
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 32,
  },
});
