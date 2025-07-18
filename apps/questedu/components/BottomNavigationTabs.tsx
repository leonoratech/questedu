import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { FeaturedTab, MyLearningTab, SearchTab } from './tabs';

const renderScene = BottomNavigation.SceneMap({
  featured: FeaturedTab,
  search: SearchTab,
  myLearning: MyLearningTab,
});

export default function BottomNavigationTabs() {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { 
      key: 'featured', 
      title: 'Featured', 
      focusedIcon: 'star', 
      unfocusedIcon: 'star-outline' 
    },
    // { 
    //   key: 'search', 
    //   title: 'Search', 
    //   focusedIcon: 'magnify'
    // },
    { 
      key: 'myLearning', 
      title: 'My Learning', 
      focusedIcon: 'book-open-variant', 
      unfocusedIcon: 'book-outline' 
    },
  ]);

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={[
        styles.bottomNav,
        { 
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        }
      ]}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.onSurfaceVariant}
    />
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 1,
  },
});
