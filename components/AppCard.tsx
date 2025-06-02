import React from 'react';
import { StyleSheet } from 'react-native';
import { Card as PaperCard, useTheme } from 'react-native-paper';

interface AppCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export function AppCard({
  title,
  subtitle,
  children,
  onPress,
  style,
}: AppCardProps) {
  const theme = useTheme();
  
  return (
    <PaperCard
      style={[styles.card, style]}
      onPress={onPress}
    >
      {title && (
        <PaperCard.Title
          title={title}
          subtitle={subtitle}
        />
      )}
      <PaperCard.Content>
        {children}
      </PaperCard.Content>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  }
});
