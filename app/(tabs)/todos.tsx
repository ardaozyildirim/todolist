import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTodos } from '../../hooks/useTodos';
import { TodoList } from '../../components/TodoList';
import { TodoInput } from '../../components/TodoInput';
import { TodoFilter } from '../../components/TodoFilter';
import { useTheme } from '../../contexts/ThemeContext';

export default function TodoScreen() {
  const { 
    todos, 
    loading, 
    filter, 
    setFilter, 
    addTodo, 
    deleteTodo, 
    toggleTodoComplete 
  } = useTodos();

  const { isDarkTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.content}>
          <Text style={[styles.title, isDarkTheme && styles.darkText]}>Todo List</Text>
          
          <TodoInput onAddTodo={addTodo} />
          
          <TodoFilter 
            currentFilter={filter} 
            onFilterChange={setFilter} 
          />
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <TodoList
              todos={todos}
              onToggleComplete={toggleTodoComplete}
              onDelete={deleteTodo}
              filter={filter}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  darkContainer: {
    backgroundColor: '#1A1A1A',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
  },
  darkText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 