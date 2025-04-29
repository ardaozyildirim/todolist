import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../types/todo';
import { useTheme } from '../contexts/ThemeContext';

type TodoItemProps = {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onToggleComplete, onDelete }: TodoItemProps) {
  const { isDarkTheme } = useTheme();

  return (
    <View style={[styles.todoItem, isDarkTheme && styles.darkTodoItem]}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => onToggleComplete(todo.id)}
      >
        <View style={[styles.checkbox, todo.completed && styles.checkboxChecked]}>
          {todo.completed && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
        <Text
          style={[
            styles.todoText,
            isDarkTheme && styles.darkTodoText,
            todo.completed && styles.todoTextCompleted,
            isDarkTheme && todo.completed && styles.darkTodoTextCompleted,
          ]}
        >
          {todo.title}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(todo.id)}
      >
        <Ionicons name="trash-outline" size={20} color={isDarkTheme ? "#FF6B6B" : "#FF3B30"} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  todoItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  darkTodoItem: {
    backgroundColor: '#333333',
    shadowColor: '#000',
    shadowOpacity: 0.4,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  todoText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  darkTodoText: {
    color: '#FFFFFF',
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  darkTodoTextCompleted: {
    color: '#AAAAAA',
  },
  deleteButton: {
    padding: 5,
  },
}); 