/**
 * OCRPage.tsx
 * 
 * 티켓 이미지에서 OCR을 통해 공연 정보를 자동으로 추출하는 페이지
 * - 카메라 촬영 또는 갤러리에서 이미지 선택
 * - OCR 처리 (Google Vision API 또는 온디바이스 처리)
 * - 추출된 데이터를 AddTicketPage로 전달
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../styles/designSystem';
import { CreateTicketData, TicketStatus } from '../../atoms';
import { ocrService, OCRResult as OCRResultType } from '../../services/api';

interface OCRPageProps {
  navigation: any;
  route?: {
    params?: {
      isFirstTicket?: boolean;
      fromEmptyState?: boolean;
      fromAddButton?: boolean;
    };
  };
}

// OCR 결과 타입
interface OCRResult {
  title?: string;
  artist?: string;
  place?: string;
  performedAt?: Date;
  bookingSite?: string;
  genre?: string;
}

const OCRPage: React.FC<OCRPageProps> = ({ navigation, route }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  // 라우트 파라미터 추출
  const isFirstTicket = route?.params?.isFirstTicket || false;
  const fromEmptyState = route?.params?.fromEmptyState || false;
  const fromAddButton = route?.params?.fromAddButton || false;

  /**
   * 카메라로 촬영
   * JPG 포맷으로 고품질 이미지 캡처
   */
  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.9, // 높은 품질로 설정 (OCR 정확도 향상)
        saveToPhotos: false,
        includeBase64: false, // Base64는 나중에 RNFS로 변환
        maxWidth: 2048, // 최대 너비 제한 (너무 크면 처리 느림)
        maxHeight: 2048, // 최대 높이 제한
      });

      if (result.assets && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
        processOCR(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('오류', '카메라를 실행할 수 없습니다.');
    }
  };

  /**
   * 갤러리에서 선택
   * JPG/PNG 이미지 선택 및 처리
   */
  const handleSelectFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.9, // 높은 품질로 설정
        includeBase64: false, // Base64는 나중에 RNFS로 변환
        maxWidth: 2048, // 최대 너비 제한
        maxHeight: 2048, // 최대 높이 제한
      });

      if (result.assets && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
        processOCR(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('오류', '갤러리를 열 수 없습니다.');
    }
  };

  /**
   * OCR 처리 함수
   * 
   * 사용 가능한 옵션:
   * 1. ocrService.extractTicketInfo() - 자체 서버 API (기본)
   * 2. ocrService.extractWithGoogleVision() - Google Vision API
   * 3. ocrService.extractWithDeviceOCR() - 온디바이스 OCR
   */
  const processOCR = async (imageUri: string) => {
    setIsProcessing(true);

    try {
      // 옵션 1: 자체 서버 API 사용 (권장)
      const response = await ocrService.extractTicketInfo(imageUri);

      // 옵션 2: Google Vision API 사용
      // const GOOGLE_VISION_API_KEY = 'YOUR_API_KEY_HERE';
      // const response = await ocrService.extractWithGoogleVision(imageUri, GOOGLE_VISION_API_KEY);

      // 옵션 3: 온디바이스 OCR 사용
      // const response = await ocrService.extractWithDeviceOCR(imageUri);

      if (response.success && response.data) {
        const apiResult = response.data;
        
        // API 결과를 OCRResult 형식으로 변환
        const ocrResult: OCRResult = {
          title: apiResult.title,
          artist: apiResult.artist,
          place: apiResult.place,
          performedAt: apiResult.performedAt 
            ? new Date(apiResult.performedAt) 
            : new Date(),
          bookingSite: apiResult.bookingSite,
          genre: apiResult.genre || '밴드',
        };

        setOcrResult(ocrResult);
        Alert.alert(
          'OCR 완료',
          '티켓 정보를 추출했습니다.\n확인 후 수정이 필요하면 직접 편집할 수 있습니다.',
          [
            {
              text: '확인',
              onPress: () => handleConfirmOCR(ocrResult),
            },
          ]
        );
      } else {
        // API 실패 시 더미 데이터 사용 (개발 중)
        console.warn('OCR API failed, using mock data');
        const mockResult: OCRResult = {
          title: 'Live Club Day',
          artist: '실리카겔',
          place: 'KT&G 상상마당',
          performedAt: new Date(2025, 9, 15, 19, 0),
          bookingSite: '인터파크',
          genre: '밴드',
        };
        
        setOcrResult(mockResult);
        Alert.alert(
          'OCR 완료 (테스트)',
          '티켓 정보를 추출했습니다.\n확인 후 수정이 필요하면 직접 편집할 수 있습니다.',
          [
            {
              text: '확인',
              onPress: () => handleConfirmOCR(mockResult),
            },
          ]
        );
      }
    } catch (error) {
      console.error('OCR error:', error);
      Alert.alert(
        '오류',
        'OCR 처리 중 오류가 발생했습니다.\n다시 시도해주세요.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * OCR 결과 확인 및 AddTicketPage로 이동
   */
  const handleConfirmOCR = (result: OCRResult) => {
    const ocrData: Partial<CreateTicketData> = {
      title: result.title || '',
      artist: result.artist || '',
      place: result.place || '',
      performedAt: result.performedAt || new Date(),
      bookingSite: result.bookingSite || '',
      genre: result.genre || '밴드',
      status: TicketStatus.PUBLIC,
    };

    // AddTicketPage로 이동하면서 OCR 결과 전달
    navigation.replace('AddTicket', {
      ocrData,
      isFirstTicket,
      fromEmptyState,
      fromAddButton,
    });
  };

  /**
   * 재촬영/재선택
   */
  const handleRetry = () => {
    setSelectedImage(null);
    setOcrResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>티켓 스캔하기</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 안내 메시지 */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📸 티켓을 스캔해보세요</Text>
          <Text style={styles.infoText}>
            티켓 이미지에서 공연 정보를 자동으로 추출합니다.{'\n'}
            추출 후 수정이 가능합니다.
          </Text>
        </View>

        {/* 이미지 선택 버튼 */}
        {!selectedImage && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleTakePhoto}
            >
              <Text style={styles.imageButtonIcon}>📷</Text>
              <Text style={styles.imageButtonText}>카메라로 촬영</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleSelectFromGallery}
            >
              <Text style={styles.imageButtonIcon}>🖼️</Text>
              <Text style={styles.imageButtonText}>갤러리에서 선택</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 선택된 이미지 미리보기 */}
        {selectedImage && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#B11515" />
                <Text style={styles.processingText}>티켓 정보 추출 중...</Text>
              </View>
            )}

            {!isProcessing && ocrResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>✅ 추출 완료</Text>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>공연 제목:</Text>
                  <Text style={styles.resultValue}>{ocrResult.title}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>아티스트:</Text>
                  <Text style={styles.resultValue}>{ocrResult.artist}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>공연장:</Text>
                  <Text style={styles.resultValue}>{ocrResult.place}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>장르:</Text>
                  <Text style={styles.resultValue}>{ocrResult.genre}</Text>
                </View>
              </View>
            )}

            {!isProcessing && (
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>다시 선택하기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 직접 입력 안내 */}
        <View style={styles.manualInputHint}>
          <Text style={styles.manualInputText}>
            OCR이 정확하지 않나요?{'\n'}
            다음 단계에서 직접 수정할 수 있습니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondarySystemBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.systemBackground,
    ...Shadows.small,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.secondarySystemBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  backButtonText: {
    ...Typography.title3,
    color: Colors.label,
    fontWeight: '500',
  },
  headerTitle: {
    ...Typography.headline,
    color: Colors.label,
  },
  content: {
    flex: 1,
  },
  infoContainer: {
    backgroundColor: Colors.systemBackground,
    margin: Spacing.sectionSpacing,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  infoTitle: {
    ...Typography.title3,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  infoText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sectionSpacing,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  imageButton: {
    flex: 1,
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    ...Shadows.medium,
  },
  imageButtonIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  imageButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.label,
    textAlign: 'center',
  },
  previewContainer: {
    margin: Spacing.sectionSpacing,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.systemGray6,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    ...Typography.body,
    color: Colors.systemBackground,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: Colors.systemBackground,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  resultTitle: {
    ...Typography.title3,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.md,
  },
  resultItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  resultLabel: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    width: 100,
  },
  resultValue: {
    ...Typography.body,
    color: Colors.label,
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    backgroundColor: Colors.secondarySystemBackground,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  retryButtonText: {
    ...Typography.body,
    color: Colors.label,
    fontWeight: '600',
  },
  manualInputHint: {
    margin: Spacing.sectionSpacing,
    padding: Spacing.lg,
    backgroundColor: Colors.systemGray6,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  manualInputText: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OCRPage;
