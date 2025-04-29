import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { todoService } from '../../services/todoService';
import { useTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const { isDarkTheme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Todoları yedekleme
  const backupTodos = async () => {
    setIsLoading(true);
    try {
      const todos = await todoService.getTodos();
      const timestamp = new Date().toISOString();
      const backupData = JSON.stringify({
        timestamp,
        todos
      });
      
      await AsyncStorage.setItem('todos_backup', backupData);
      setIsLoading(false);
      Alert.alert('Başarılı', 'Todos başarıyla yedeklendi');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Hata', 'Yedekleme işlemi başarısız oldu');
      console.error('Backup error:', error);
    }
  };

  // Yedekten geri yükleme
  const restoreFromBackup = async () => {
    setIsLoading(true);
    try {
      const backupData = await AsyncStorage.getItem('todos_backup');
      
      if (!backupData) {
        setIsLoading(false);
        Alert.alert('Hata', 'Kullanılabilir yedek bulunamadı');
        return;
      }
      
      const { timestamp, todos } = JSON.parse(backupData);
      
      // Onay dialogu
      Alert.alert(
        'Yedeği Geri Yükle',
        `${new Date(timestamp).toLocaleString()} tarihli yedeği geri yüklemek istiyor musunuz? Mevcut tüm todolar kaybolacaktır.`,
        [
          {
            text: 'İptal',
            style: 'cancel',
            onPress: () => setIsLoading(false)
          },
          {
            text: 'Geri Yükle',
            onPress: async () => {
              await todoService.saveTodos(todos);
              setIsLoading(false);
              Alert.alert('Başarılı', 'Todos başarıyla geri yüklendi');
            }
          }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Hata', 'Geri yükleme işlemi başarısız oldu');
      console.error('Restore error:', error);
    }
  };

  // Tüm todoları temizleme
  const clearAllTodos = () => {
    Alert.alert(
      'Tüm Todoları Sil',
      'Tüm todoları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await todoService.saveTodos([]);
              setIsLoading(false);
              Alert.alert('Başarılı', 'Tüm todolar temizlendi');
            } catch (error) {
              setIsLoading(false);
              Alert.alert('Hata', 'Temizleme işlemi başarısız oldu');
              console.error('Clear todos error:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
      <Text style={[styles.title, isDarkTheme && styles.darkText]}>Ayarlar</Text>
      
      <ScrollView style={styles.scrollView}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
        
        <View style={[styles.section, isDarkTheme && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDarkTheme && styles.darkText]}>Uygulama</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name={isDarkTheme ? "moon" : "sunny"} 
                size={22} 
                color={isDarkTheme ? "#FFFFFF" : "#000000"} 
                style={styles.icon} 
              />
              <Text style={[styles.settingText, isDarkTheme && styles.darkText]}>Karanlık Tema</Text>
            </View>
            <Switch 
              value={isDarkTheme} 
              onValueChange={toggleTheme} 
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>
        
        <View style={[styles.section, isDarkTheme && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDarkTheme && styles.darkText]}>Veri Yönetimi</Text>
          
          <TouchableOpacity style={styles.button} onPress={backupTodos}>
            <Ionicons name="save-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Todoları Yedekle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={restoreFromBackup}>
            <Ionicons name="refresh-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Yedekten Geri Yükle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearAllTodos}>
            <Ionicons name="trash-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Tüm Todoları Temizle</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, isDarkTheme && styles.darkText]}>Version 1.0.0</Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: 20,
    color: '#333333',
  },
  darkText: {
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: '#333333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333333',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  settingText: {
    fontSize: 16,
    color: '#333333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    color: '#888888',
    fontSize: 14,
  },
}); 