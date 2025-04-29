import React from 'react';
import { StyleSheet, FlatList, Text, View } from 'react-native';
import { TodoItem } from './TodoItem';
import { Todo } from '../types/todo';

type TodoListProps = {
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  filter: 'all' | 'active' | 'completed';
};

export function TodoList({ todos, onToggleComplete, onDelete, filter }: TodoListProps) {
  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  if (filteredTodos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {filter === 'all' 
            ? 'Add your first todo!'
            : `No ${filter} todos`}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredTodos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TodoItem 
          todo={item} 
          onToggleComplete={onToggleComplete} 
          onDelete={onDelete}
        />
      )}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
  },
}); 