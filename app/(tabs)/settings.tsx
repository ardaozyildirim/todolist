import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { todoService } from '../../services/todoService';
import { useTheme } from '../../contexts/ThemeContext';
import { useTodos } from '../../hooks/useTodos';
import { googleDriveService } from '../../services/googleDriveService';

export default function SettingsScreen() {
  const { isDarkTheme, toggleTheme } = useTheme();
  const { todos, backupTodos, restoreFromBackup, clearAllTodos } = useTodos();
  const [isLoading, setIsLoading] = useState(false);
  const [showDriveBackups, setShowDriveBackups] = useState(false);
  const [driveBackups, setDriveBackups] = useState<any[]>([]);
  const [loadingDriveBackups, setLoadingDriveBackups] = useState(false);

  // Todoları yedekleme
  const handleLocalBackup = async () => {
    setIsLoading(true);
    try {
      const result = await backupTodos();
      setIsLoading(false);
      
      if (result.success) {
        Alert.alert('Başarılı', 'Todos başarıyla yedeklendi');
      } else {
        Alert.alert('Hata', 'Yedekleme işlemi başarısız oldu');
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Hata', 'Yedekleme işlemi başarısız oldu');
      console.error('Backup error:', error);
    }
  };

  // Yedekten geri yükleme
  const handleLocalRestore = async () => {
    setIsLoading(true);
    try {
      const result = await restoreFromBackup();
      setIsLoading(false);
      
      if (result.success) {
        Alert.alert('Başarılı', 'Todos başarıyla geri yüklendi');
      } else {
        Alert.alert('Hata', result.error || 'Geri yükleme işlemi başarısız oldu');
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Hata', 'Geri yükleme işlemi başarısız oldu');
      console.error('Restore error:', error);
    }
  };

  // Tüm todoları temizleme
  const handleClearAllTodos = () => {
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
              const result = await clearAllTodos();
              setIsLoading(false);

              if (result.success) {
                Alert.alert('Başarılı', 'Tüm todolar temizlendi');
              } else {
                Alert.alert('Hata', 'Temizleme işlemi başarısız oldu');
              }
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

  // Google Drive'a yedekleme
  const handleDriveBackup = async () => {
    setIsLoading(true);
    try {
      const result = await googleDriveService.backupToDrive(todos);
      setIsLoading(false);
      
      if (result.success) {
        Alert.alert('Başarılı', 'Todos Google Drive\'a başarıyla yedeklendi');
      } else {
        Alert.alert('Hata', result.message || 'Google Drive yedekleme işlemi başarısız oldu');
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Hata', 'Google Drive yedekleme işlemi başarısız oldu');
      console.error('Google Drive backup error:', error);
    }
  };

  // Google Drive'dan yedekleri listeleme
  const handleListDriveBackups = async () => {
    setLoadingDriveBackups(true);
    try {
      const result = await googleDriveService.listBackups();
      
      if (result.success && result.backups) {
        setDriveBackups(result.backups);
        setShowDriveBackups(true);
      } else {
        Alert.alert('Hata', result.message || 'Yedek listesi alınamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Yedek listesi alınırken hata oluştu');
      console.error('List drive backups error:', error);
    } finally {
      setLoadingDriveBackups(false);
    }
  };

  // Google Drive'dan yedek geri yükleme
  const handleRestoreFromDrive = async (fileId: string, fileName: string) => {
    setShowDriveBackups(false);
    setIsLoading(true);
    
    try {
      const result = await googleDriveService.restoreFromDrive(fileId);
      
      if (result.success && result.data) {
        // Yedekteki todoları yerel depolamaya ve state'e kaydet
        const restoreResult = await restoreFromBackup();
        
        if (restoreResult.success) {
          Alert.alert('Başarılı', `"${fileName}" yedeği başarıyla geri yüklendi`);
        } else {
          Alert.alert('Hata', 'Yedek geri yüklenirken bir sorun oluştu');
        }
      } else {
        Alert.alert('Hata', result.message || 'Yedek geri yüklenirken hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', 'Google Drive\'dan geri yükleme işlemi başarısız oldu');
      console.error('Restore from drive error:', error);
    } finally {
      setIsLoading(false);
    }
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
          <Text style={[styles.sectionTitle, isDarkTheme && styles.darkText]}>Yerel Yedekleme</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleLocalBackup}>
            <Ionicons name="save-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Todoları Yedekle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={handleLocalRestore}>
            <Ionicons name="refresh-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Yedekten Geri Yükle</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, isDarkTheme && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDarkTheme && styles.darkText]}>Google Drive Yedekleme</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleDriveBackup}>
            <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Google Drive'a Yedekle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={handleListDriveBackups}>
            <Ionicons name="cloud-download-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Google Drive'dan Geri Yükle</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, isDarkTheme && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDarkTheme && styles.darkText]}>Veri Yönetimi</Text>
          
          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearAllTodos}>
            <Ionicons name="trash-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Tüm Todoları Temizle</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, isDarkTheme && styles.darkText]}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Google Drive Yedek Listesi Modalı */}
      <Modal
        visible={showDriveBackups}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDriveBackups(false)}
      >
        <View style={[styles.modalContainer, isDarkTheme && styles.darkModalContainer]}>
          <View style={[styles.modalContent, isDarkTheme && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkTheme && styles.darkText]}>
                Google Drive Yedekleri
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDriveBackups(false)}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={isDarkTheme ? "#FFFFFF" : "#000000"} 
                />
              </TouchableOpacity>
            </View>

            {loadingDriveBackups ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : driveBackups.length === 0 ? (
              <View style={styles.emptyListContainer}>
                <Text style={[styles.emptyListText, isDarkTheme && styles.darkText]}>
                  Henüz yedek bulunamadı
                </Text>
              </View>
            ) : (
              <FlatList
                data={driveBackups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.backupItem, isDarkTheme && styles.darkBackupItem]}
                    onPress={() => handleRestoreFromDrive(item.id, item.name)}
                  >
                    <View style={styles.backupItemContent}>
                      <Ionicons 
                        name="document-text-outline" 
                        size={24} 
                        color={isDarkTheme ? "#FFFFFF" : "#000000"} 
                        style={styles.backupIcon} 
                      />
                      <View style={styles.backupInfo}>
                        <Text style={[styles.backupName, isDarkTheme && styles.darkText]}>
                          {item.name.replace('TodoBackup_', '').replace('.json', '')}
                        </Text>
                        <Text style={[styles.backupDate, isDarkTheme && styles.darkSubText]}>
                          {new Date(item.modifiedTime).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={isDarkTheme ? "#AAAAAA" : "#888888"} 
                    />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  darkModalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  darkModalContent: {
    backgroundColor: '#333333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#888888',
  },
  backupItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkBackupItem: {
    borderBottomColor: '#444444',
  },
  backupItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backupIcon: {
    marginRight: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  backupDate: {
    fontSize: 14,
    color: '#888888',
    marginTop: 3,
  },
  darkSubText: {
    color: '#AAAAAA',
  },
}); 