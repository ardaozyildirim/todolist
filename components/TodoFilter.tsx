import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

type FilterType = 'all' | 'active' | 'completed';

type TodoFilterProps = {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
};

export function TodoFilter({ currentFilter, onFilterChange }: TodoFilterProps) {
  const { isDarkTheme } = useTheme();

  return (
    <View style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <FilterButton 
        title="All" 
        active={currentFilter === 'all'} 
        onPress={() => onFilterChange('all')} 
        isDarkTheme={isDarkTheme}
      />
      <FilterButton 
        title="Active" 
        active={currentFilter === 'active'} 
        onPress={() => onFilterChange('active')} 
        isDarkTheme={isDarkTheme}
      />
      <FilterButton 
        title="Completed" 
        active={currentFilter === 'completed'} 
        onPress={() => onFilterChange('completed')} 
        isDarkTheme={isDarkTheme}
      />
    </View>
  );
}

type FilterButtonProps = {
  title: string;
  active: boolean;
  onPress: () => void;
  isDarkTheme: boolean;
};

function FilterButton({ title, active, onPress, isDarkTheme }: FilterButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.filterButton, 
        active && styles.activeFilterButton,
        isDarkTheme && styles.darkFilterButton,
        isDarkTheme && active && styles.darkActiveFilterButton
      ]}
      onPress={onPress}
    >
      <Text 
        style={[
          styles.filterText, 
          active && styles.activeFilterText,
          isDarkTheme && styles.darkFilterText,
          isDarkTheme && active && styles.darkActiveFilterText
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    padding: 4,
  },
  darkContainer: {
    backgroundColor: '#2A2A2A',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  darkFilterButton: {
    backgroundColor: 'transparent',
  },
  activeFilterButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  darkActiveFilterButton: {
    backgroundColor: '#444444',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  filterText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  darkFilterText: {
    color: '#AAAAAA',
  },
  activeFilterText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  darkActiveFilterText: {
    color: '#4DA3FF',
  },
}); 