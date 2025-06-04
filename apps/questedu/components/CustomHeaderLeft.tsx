import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

export function CustomHeaderLeft() {
  const navigation = useNavigation();
  const theme = useTheme();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <IconButton
      icon="menu"
      size={24}
      iconColor={theme.colors.primary}
      onPress={openDrawer}
      accessibilityLabel="Open drawer menu"
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    marginLeft: 5,
  },
});
