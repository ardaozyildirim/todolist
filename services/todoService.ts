import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types/todo';

const STORAGE_KEY = 'todos';

export const todoService = {
  async getTodos(): Promise<Todo[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading todos:', error);
      return [];
    }
  },

  async saveTodos(todos: Todo[]): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(todos);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving todos:', error);
      return false;
    }
  },

  async addTodo(title: string): Promise<Todo | null> {
    try {
      const todos = await this.getTodos();
      const newTodo: Todo = {
        id: Date.now().toString(),
        title,
        completed: false,
        createdAt: Date.now(),
      };
      
      await this.saveTodos([...todos, newTodo]);
      return newTodo;
    } catch (error) {
      console.error('Error adding todo:', error);
      return null;
    }
  },

  async deleteTodo(id: string): Promise<boolean> {
    try {
      const todos = await this.getTodos();
      const updatedTodos = todos.filter(todo => todo.id !== id);
      
      if (todos.length === updatedTodos.length) {
        return false; // Todo not found
      }
      
      await this.saveTodos(updatedTodos);
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      return false;
    }
  },

  async toggleTodoComplete(id: string): Promise<Todo | null> {
    try {
      const todos = await this.getTodos();
      const updatedTodos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      
      const updatedTodo = updatedTodos.find(todo => todo.id === id);
      if (!updatedTodo) {
        return null; // Todo not found
      }
      
      await this.saveTodos(updatedTodos);
      return updatedTodo;
    } catch (error) {
      console.error('Error toggling todo completion:', error);
      return null;
    }
  },
}; 