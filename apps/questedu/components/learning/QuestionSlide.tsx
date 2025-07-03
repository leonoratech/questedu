/**
 * Question Slide Component
 * Displays course questions with answer options and feedback
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  RadioButton,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import RenderHTML from 'react-native-render-html';
import { QuestionSlide as QuestionSlideType, SlideType, UserAnswer } from '../../types/learning';

interface QuestionSlideProps {
  slide: QuestionSlideType;
  isCompleted: boolean;
  userAnswer?: UserAnswer;
  onComplete: (slideId: string, slideType: SlideType, data?: any) => void;
  style?: ViewStyle;
  readOnly?: boolean; // New prop for read-only mode
}

export const QuestionSlide: React.FC<QuestionSlideProps> = ({
  slide,
  isCompleted,
  userAnswer,
  onComplete,
  style,
  readOnly = false, // Default to false
}) => {
  const theme = useTheme();
  const { question, topicTitle } = slide;
  const { width } = useWindowDimensions();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [textAnswer, setTextAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Initialize with existing user answer if available
  useEffect(() => {
    if (userAnswer) {
      setSelectedAnswer(userAnswer.selectedAnswer);
      if (typeof userAnswer.selectedAnswer === 'string') {
        setTextAnswer(userAnswer.selectedAnswer);
      }
      setAnswerSubmitted(true);
      setShowFeedback(true);
    }
  }, [userAnswer]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.tertiary;
      case 'medium': return theme.colors.secondary;
      case 'hard': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'circle';
      case 'medium': return 'circle-slice-3';
      case 'hard': return 'circle-slice-8';
      default: return 'circle';
    }
  };

  const isAnswerCorrect = () => {
    if (!question.correctAnswer) return false;
    
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      return selectedAnswer === question.correctAnswer;
    }
    
    if (question.type === 'fill_blank') {
      // Simple text comparison - could be enhanced with fuzzy matching
      return textAnswer.toLowerCase().trim() === (question.correctAnswer as string).toLowerCase().trim();
    }
    
    // For essay questions, we can't automatically check correctness
    return true;
  };

  const handleAnswerSubmit = () => {
    const timeTaken = (Date.now() - startTime) / 1000; // in seconds
    const isCorrect = isAnswerCorrect();
    const finalAnswer = question.type === 'fill_blank' || 
                       question.type === 'short_essay' || 
                       question.type === 'long_essay' 
                       ? textAnswer 
                       : selectedAnswer;

    setAnswerSubmitted(true);
    setShowFeedback(true);

    onComplete(slide.id, SlideType.QUESTION, {
      questionAnswer: {
        questionId: question.id!,
        selectedAnswer: finalAnswer,
        isCorrect,
        timeTaken
      }
    });
  };

  const renderMultipleChoice = () => (
    <View style={styles.optionsContainer}>
      <RadioButton.Group
        onValueChange={setSelectedAnswer}
        value={selectedAnswer as string}
      >
        {question.options?.map((option, index) => (
          <View key={index} style={styles.optionItem}>
            <RadioButton.Item
              label={option}
              value={option}
              disabled={answerSubmitted}
              style={styles.radioButton}
              labelStyle={styles.optionLabel}
            />
          </View>
        ))}
      </RadioButton.Group>
    </View>
  );

  const renderTrueFalse = () => (
    <View style={styles.optionsContainer}>
      <RadioButton.Group
        onValueChange={setSelectedAnswer}
        value={selectedAnswer as string}
      >
        <View style={styles.optionItem}>
          <RadioButton.Item
            label="True"
            value="True"
            disabled={answerSubmitted}
            style={styles.radioButton}
            labelStyle={styles.optionLabel}
          />
        </View>
        <View style={styles.optionItem}>
          <RadioButton.Item
            label="False"
            value="False"
            disabled={answerSubmitted}
            style={styles.radioButton}
            labelStyle={styles.optionLabel}
          />
        </View>
      </RadioButton.Group>
    </View>
  );

  const renderFillBlank = () => (
    <View style={styles.textInputContainer}>
      <TextInput
        mode="outlined"
        placeholder="Enter your answer..."
        value={textAnswer}
        onChangeText={setTextAnswer}
        disabled={answerSubmitted}
        style={styles.textInput}
        multiline={false}
      />
    </View>
  );

  const renderEssay = () => (
    <View style={styles.textInputContainer}>
      <TextInput
        mode="outlined"
        placeholder="Write your answer..."
        value={textAnswer}
        onChangeText={setTextAnswer}
        disabled={answerSubmitted}
        style={styles.essayInput}
        multiline={true}
        numberOfLines={6}
      />
    </View>
  );

  const renderAnswerOptions = () => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'true_false':
        return renderTrueFalse();
      case 'fill_blank':
        return renderFillBlank();
      case 'short_essay':
      case 'long_essay':
        return renderEssay();
      default:
        return null;
    }
  };

  const canSubmit = () => {
    if (answerSubmitted) return false;
    
    if (question.type === 'fill_blank' || question.type === 'short_essay' || question.type === 'long_essay') {
      return textAnswer.trim().length > 0;
    }
    
    return selectedAnswer !== '';
  };

  const renderFeedback = () => {
    if (!showFeedback) return null;

    const isCorrect = isAnswerCorrect();
    const canShowCorrectness = question.type !== 'short_essay' && question.type !== 'long_essay';

    return (
      <Card style={[
        styles.feedbackCard,
        { 
          backgroundColor: canShowCorrectness 
            ? (isCorrect ? theme.colors.tertiaryContainer : theme.colors.errorContainer)
            : theme.colors.surfaceVariant
        }
      ]}>
        <Card.Content>
          {canShowCorrectness && (
            <View style={styles.feedbackHeader}>
              <IconButton
                icon={isCorrect ? "check-circle" : "close-circle"}
                size={24}
                iconColor={isCorrect ? theme.colors.tertiary : theme.colors.error}
              />
              <Text variant="titleMedium" style={styles.feedbackTitle}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </Text>
            </View>
          )}

          {question.correctAnswer && canShowCorrectness && !isCorrect && (
            <Text variant="bodyMedium" style={styles.correctAnswer}>
              Correct answer: {question.correctAnswer}
            </Text>
          )}

          {question.explanation && (
            <>
              <Divider style={styles.feedbackDivider} />
              <Text variant="titleSmall" style={styles.explanationTitle}>
                Explanation:
              </Text>
              <Text variant="bodyMedium" style={styles.explanation}>
                {question.explanation}
              </Text>
            </>
          )}

          {question.type === 'short_essay' || question.type === 'long_essay' ? (
            <Text variant="bodyMedium" style={styles.essayFeedback}>
              Your answer has been recorded and will be reviewed.
            </Text>
          ) : null}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Question Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            {topicTitle && (
              <Text variant="bodySmall" style={styles.topicTitle}>
                {topicTitle}
              </Text>
            )}
            
            <View style={styles.questionMeta}>
              <Chip 
                icon={getDifficultyIcon(question.difficulty)}
                style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(question.difficulty) }]}
                textStyle={{ color: 'white' }}
                compact
              >
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </Chip>
              
              <Chip 
                icon="star"
                style={styles.pointsChip}
                compact
              >
                {question.marks} {question.marks === 1 ? 'point' : 'points'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Question Content */}
        <Card style={styles.questionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.answerTitle}>
              Question:
            </Text>
            {(question.type === 'short_essay' || question.type === 'long_essay') ? (
              <RenderHTML
                contentWidth={width - 64}
                source={{ html: question.questionRichText || ''}}
                baseStyle={{
                  ...styles.richQuestionText,
                  color: theme.colors.onSurface,
                  backgroundColor: 'transparent',
                }}
                tagsStyles={{
                  body: {
                    color: theme.colors.onSurface,
                    backgroundColor: 'transparent',
                  },
                  p: { color: theme.colors.onSurface },
                  span: { color: theme.colors.onSurface },
                  h1: { color: theme.colors.onSurface },
                  h2: { color: theme.colors.onSurface },
                  h3: { color: theme.colors.onSurface },
                  h4: { color: theme.colors.onSurface },
                  h5: { color: theme.colors.onSurface },
                  h6: { color: theme.colors.onSurface },
                  li: { color: theme.colors.onSurface },
                  strong: { color: theme.colors.onSurface },
                  em: { color: theme.colors.onSurface },
                  u: { color: theme.colors.onSurface },
                  a: { color: theme.colors.primary },
                }}
              />
            ) : (
              <Text variant="titleMedium" style={styles.questionText}>
                {question.questionText}
              </Text>
            )}

            {/* {question.questionRichText && (
              <Text variant="bodyMedium" style={styles.richQuestionText}>
                {question.questionRichText}
              </Text>
            )} */}
          </Card.Content>
        </Card>

        {/* Answer Options */}
        <Card style={styles.answerCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.answerTitle}>
              Your Answer:
            </Text>
            {readOnly ? (
              <View>
                {question.type === 'multiple_choice' && Array.isArray(question.options) ? (
                  <View style={styles.optionsContainer}>
                    {question.options.map((option: any, idx: number) => {
                      // option can be string or {text, isCorrect, explanation}
                      const optionText = typeof option === 'object' && option !== null && 'text' in option ? option.text : String(option);
                      const isCorrect = typeof option === 'object' && option !== null && 'isCorrect' in option ? option.isCorrect : (optionText === question.correctAnswer);
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.optionItem,
                            isCorrect && { backgroundColor: '#e0ffe0', borderRadius: 6 }
                          ]}
                        >
                          <Text
                            variant="bodyMedium"
                            style={[
                              styles.optionLabel,
                              isCorrect && { fontWeight: 'bold', color: '#388e3c' }
                            ]}
                          >
                            {optionText}
                            {isCorrect ? '  ✓' : ''}
                          </Text>
                          {isCorrect && option.explanation && (
                            <Text variant="bodySmall" style={{ color: '#388e3c', marginLeft: 8 }}>
                              {option.explanation}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : question.type === 'true_false' ? (
                  <View style={styles.optionsContainer}>
                    {[{text: 'True', value: 'true'}, {text: 'False', value: 'false'}].map((opt, idx) => {
                      const isCorrect = (question.correctAnswer?.toString().toLowerCase() === opt.value);
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.optionItem,
                            isCorrect && { backgroundColor: '#e0ffe0', borderRadius: 6 }
                          ]}
                        >
                          <Text
                            variant="bodyMedium"
                            style={[
                              styles.optionLabel,
                              isCorrect && { fontWeight: 'bold', color: '#388e3c' }
                            ]}
                          >
                            {opt.text}
                            {isCorrect ? '  ✓' : ''}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : question.type === 'fill_blank' ? (
                  <Text variant="bodyMedium" style={styles.correctAnswer}>
                    Correct answer: {question.correctAnswer}
                  </Text>
                ) : (question.type === 'short_essay' || question.type === 'long_essay') ? (
                  <View>
                    {question.correctAnswerRichText ? (
                      <RenderHTML
                        contentWidth={width - 64}
                        source={{ html: question.correctAnswerRichText }}
                        baseStyle={{
                          ...styles.correctAnswer,
                          color: theme.colors.onSurface,
                          backgroundColor: 'transparent',
                        }}
                        tagsStyles={{
                          body: {
                            color: theme.colors.onSurface,
                            backgroundColor: 'transparent',
                          },
                          p: { color: theme.colors.onSurface },
                          span: { color: theme.colors.onSurface },
                          h1: { color: theme.colors.onSurface },
                          h2: { color: theme.colors.onSurface },
                          h3: { color: theme.colors.onSurface },
                          h4: { color: theme.colors.onSurface },
                          h5: { color: theme.colors.onSurface },
                          h6: { color: theme.colors.onSurface },
                          li: { color: theme.colors.onSurface },
                          strong: { color: theme.colors.onSurface },
                          em: { color: theme.colors.onSurface },
                          u: { color: theme.colors.onSurface },
                          a: { color: theme.colors.primary },
                        }}
                      />
                    ) : (
                      <Text variant="bodyMedium" style={styles.correctAnswer}>
                        {question.correctAnswer}
                      </Text>
                    )}
                  </View>
                ) : null}
                {question.explanation && (
                  <>
                    <Divider style={styles.feedbackDivider} />
                    <Text variant="titleSmall" style={styles.explanationTitle}>
                      Explanation:
                    </Text>
                    <Text variant="bodyMedium" style={styles.explanation}>
                      {question.explanation}
                    </Text>
                  </>
                )}
              </View>
            ) : (
              renderAnswerOptions()
            )}
          </Card.Content>
        </Card>

        {/* Submit Button */}
        {!answerSubmitted && !readOnly && (
          <View style={styles.submitSection}>
            <Button
              mode="contained"
              onPress={handleAnswerSubmit}
              disabled={!canSubmit()}
              style={styles.submitButton}
              icon="check"
            >
              Submit Answer
            </Button>
          </View>
        )}

        {/* Feedback */}
        {renderFeedback()}

        {/* Tags */}
        {question.tags.length > 0 && (
          <Card style={styles.tagsCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.tagsTitle}>
                Related Topics:
              </Text>
              <View style={styles.tagsContainer}>
                {question.tags.map((tag, index) => (
                  <Chip key={index} style={styles.tag} compact>
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

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
  topicTitle: {
    opacity: 0.7,
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyChip: {
    marginRight: 8,
  },
  pointsChip: {
    marginRight: 8,
  },
  questionCard: {
    marginBottom: 16,
  },
  questionText: {
    fontWeight: 'bold',
    lineHeight: 24,
    marginBottom: 8,
  },
  richQuestionText: {
    lineHeight: 20,
    opacity: 0.8,
  },
  answerCard: {
    marginBottom: 16,
  },
  answerTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  optionsContainer: {
    gap: 8,
  },
  optionItem: {
    marginBottom: 4,
  },
  radioButton: {
    paddingLeft: 0,
  },
  optionLabel: {
    fontSize: 16,
  },
  textInputContainer: {
    marginTop: 8,
  },
  textInput: {
    marginBottom: 8,
  },
  essayInput: {
    marginBottom: 8,
    minHeight: 120,
  },
  submitSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    paddingHorizontal: 24,
  },
  feedbackCard: {
    marginBottom: 16,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  correctAnswer: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  feedbackDivider: {
    marginVertical: 12,
  },
  explanationTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanation: {
    lineHeight: 20,
  },
  essayFeedback: {
    fontStyle: 'italic',
    opacity: 0.8,
  },
  tagsCard: {
    marginBottom: 16,
  },
  tagsTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginRight: 4,
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 32,
  },
});
