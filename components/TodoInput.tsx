import React, { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

type TodoInputProps = {
  onAddTodo: (title: string) => void;
};

export function TodoInput({ onAddTodo }: TodoInputProps) {
  const [text, setText] = useState('');
  const { isDarkTheme } = useTheme();

  const handleAddTodo = () => {
    if (text.trim().length === 0) {
      Alert.alert('Error', 'Please enter a todo title');
      return;
    }

    onAddTodo(text.trim());
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input, 
          isDarkTheme && styles.darkInput
        ]}
        placeholder="Add a new todo..."
        placeholderTextColor={isDarkTheme ? '#888888' : '#AAAAAA'}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleAddTodo}
        returnKeyType="done"
        color={isDarkTheme ? '#FFFFFF' : '#333333'}
      />
      <TouchableOpacity
        style={[
          styles.addButton, 
          text.trim().length === 0 && styles.addButtonDisabled,
          isDarkTheme && text.trim().length === 0 && styles.darkAddButtonDisabled
        ]}
        onPress={handleAddTodo}
        disabled={text.trim().length === 0}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  darkInput: {
    borderColor: '#555555',
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#AAAAAA',
  },
  darkAddButtonDisabled: {
    backgroundColor: '#555555',
  },
}); 