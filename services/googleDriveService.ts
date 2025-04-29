import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import GDrive from 'react-native-google-drive-api-wrapper';
import { Todo } from '../types/todo';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo ekosisteminde AuthSession.makeRedirectUri kullanılır
WebBrowser.maybeCompleteAuthSession();

// Google Cloud Console'dan alınan kimlik bilgileri
// NOT: Gerçek bir uygulamada bunlar güvenli bir şekilde API veya env üzerinden sağlanmalıdır
const CLIENT_ID = ''; // Google Cloud Console'dan alınacak
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const TOKEN_STORAGE_KEY = 'google_drive_token';

// Google Drive API wrapper
const gdrive = new GDrive();

const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
const tokenEndpoint = 'https://oauth2.googleapis.com/token';

// Basit bir kimlik doğrulama yardımcısı
const createAuthRequest = () => {
  const discovery = {
    authorizationEndpoint,
    tokenEndpoint,
  };

  return new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
    usePKCE: false,
    responseType: AuthSession.ResponseType.Token,
  }, discovery);
};

export const googleDriveService = {
  // Google Drive'a giriş yapma
  async signIn() {
    try {
      // Daha önce token kaydedilmiş mi?
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        gdrive.setAccessToken(token);
        return {
          success: true,
          message: 'Önceki oturumla giriş yapıldı',
        };
      }

      // Yeni oturum açma işlemi
      const request = createAuthRequest();
      const result = await request.promptAsync({ useProxy: true });

      if (result.type === 'success') {
        const { access_token } = result.params;
        
        // Token'ı daha sonra kullanmak üzere kaydet
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, access_token);
        
        // GDrive API'yi ayarla
        gdrive.setAccessToken(access_token);
        
        return {
          success: true,
          message: 'Google Drive ile oturum açıldı',
        };
      } else {
        return {
          success: false,
          message: 'Oturum açma iptal edildi',
        };
      }
    } catch (error) {
      console.error('Google Drive giriş hatası:', error);
      return {
        success: false,
        message: 'Oturum açma sırasında bir hata oluştu',
        error,
      };
    }
  },

  // Yedekleri Google Drive'a kaydetme
  async backupToDrive(todos: Todo[]) {
    try {
      // Önce oturum açılmış mı kontrol et
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        const signInResult = await this.signIn();
        if (!signInResult.success) {
          return signInResult;
        }
      } else {
        gdrive.setAccessToken(token);
      }

      // Yedek dosyası için tarih ve zamanlı isim oluştur
      const backupName = `TodoBackup_${new Date().toISOString().replace(/[:.]/g, '_')}.json`;
      
      // Yedek verisini hazırla
      const backupData = {
        timestamp: new Date().toISOString(),
        todos: todos,
        appVersion: Constants.expoConfig?.version || '1.0.0',
      };
      
      // Dosyayı oluştur
      const response = await gdrive.files.createFileMultipart(
        JSON.stringify(backupData),
        'application/json',
        {
          parents: ['root'], // Ana klasöre kaydedecek
          name: backupName,
        },
        false // Dosya içeriğini döndürmesi gerekmiyor
      );
      
      if (response && response.id) {
        return {
          success: true,
          message: 'Yedekleme başarıyla tamamlandı',
          fileId: response.id,
          fileName: backupName,
        };
      } else {
        return {
          success: false,
          message: 'Yedekleme sırasında bir hata oluştu',
        };
      }
    } catch (error) {
      console.error('Google Drive yedekleme hatası:', error);
      return {
        success: false,
        message: 'Google Drive yedekleme sırasında bir hata oluştu',
        error,
      };
    }
  },

  // Google Drive'dan yedekleri listeleme
  async listBackups() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        const signInResult = await this.signIn();
        if (!signInResult.success) {
          return {
            success: false,
            message: 'Google Drive oturumu açılmadı',
          };
        }
      } else {
        gdrive.setAccessToken(token);
      }

      // TodoBackup_ ile başlayan dosyaları ara
      const response = await gdrive.files.list({
        q: "name contains 'TodoBackup_' and mimeType='application/json'",
        fields: 'files(id, name, createdTime, modifiedTime)',
        orderBy: 'modifiedTime desc',
      });

      if (response && response.files) {
        return {
          success: true,
          backups: response.files,
        };
      } else {
        return {
          success: false,
          message: 'Yedek listesi alınamadı',
        };
      }
    } catch (error) {
      console.error('Google Drive yedek listeleme hatası:', error);
      return {
        success: false,
        message: 'Yedek listesi alınırken hata oluştu',
        error,
      };
    }
  },

  // Google Drive'dan yedek dosyasını okuma
  async restoreFromDrive(fileId: string) {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        const signInResult = await this.signIn();
        if (!signInResult.success) {
          return {
            success: false,
            message: 'Google Drive oturumu açılmadı',
          };
        }
      } else {
        gdrive.setAccessToken(token);
      }

      // Dosya içeriğini indir
      const fileContent = await gdrive.files.download(fileId);
      
      // JSON'ı parse et
      if (fileContent) {
        try {
          const backupData = JSON.parse(fileContent);
          
          if (backupData && backupData.todos) {
            return {
              success: true,
              data: backupData,
            };
          } else {
            return {
              success: false,
              message: 'Geçersiz yedek dosyası formatı',
            };
          }
        } catch (parseError) {
          return {
            success: false,
            message: 'Yedek dosyası ayrıştırılamadı',
            error: parseError,
          };
        }
      } else {
        return {
          success: false,
          message: 'Yedek dosyası içeriği alınamadı',
        };
      }
    } catch (error) {
      console.error('Google Drive geri yükleme hatası:', error);
      return {
        success: false,
        message: 'Yedek geri yüklenirken hata oluştu',
        error,
      };
    }
  },

  // Oturumu kapat
  async signOut() {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      return {
        success: true,
        message: 'Oturum kapatıldı',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Oturum kapatılırken hata oluştu',
        error,
      };
    }
  },
}; 