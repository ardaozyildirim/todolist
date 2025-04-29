import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Todo } from '../types/todo';
import { todoService } from '../services/todoService';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load todos from AsyncStorage on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    try {
      const loadedTodos = await todoService.getTodos();
      // Sort by creation date, newest first
      setTodos(loadedTodos.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      Alert.alert('Error', 'Failed to load todos');
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTodo = useCallback(async (title: string) => {
    try {
      const newTodo = await todoService.addTodo(title);
      if (newTodo) {
        setTodos(prevTodos => [newTodo, ...prevTodos]);
        return true;
      }
      return false;
    } catch (error) {
      Alert.alert('Error', 'Failed to add todo');
      console.error('Error adding todo:', error);
      return false;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      const success = await todoService.deleteTodo(id);
      if (success) {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      Alert.alert('Error', 'Failed to delete todo');
      console.error('Error deleting todo:', error);
      return false;
    }
  }, []);

  const toggleTodoComplete = useCallback(async (id: string) => {
    try {
      const updatedTodo = await todoService.toggleTodoComplete(id);
      if (updatedTodo) {
        setTodos(prevTodos =>
          prevTodos.map(todo => (todo.id === id ? updatedTodo : todo))
        );
        return true;
      }
      return false;
    } catch (error) {
      Alert.alert('Error', 'Failed to update todo');
      console.error('Error toggling todo completion:', error);
      return false;
    }
  }, []);

  return {
    todos,
    loading,
    filter,
    setFilter,
    addTodo,
    deleteTodo,
    toggleTodoComplete,
    loadTodos,
  };
} 