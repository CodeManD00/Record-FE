/**
 * OCRPage.tsx
 * 티켓 이미지에서 공연 정보를 자동으로 추출하는 페이지
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

const OCRPage: React.FC<OCRPageProps> = ({ navigation, route }) => {
  /** 선택된 이미지 경로 (URI) */
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  /** OCR 처리 중 여부 */
  const [isProcessing, setIsProcessing] = useState(false);
  /** OCR 결과 데이터 */
  const [ocrResult, setOcrResult] = useState<OCRResultType | null>(null);

  // 라우트 파라미터 (AddTicket 전송 시 사용)
  const isFirstTicket = route?.params?.isFirstTicket || false;
  const fromEmptyState = route?.params?.fromEmptyState || false;
  const fromAddButton = route?.params?.fromAddButton || false;

  /* 카메라로 촬영 */
  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.9,
        saveToPhotos: false,
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

  /* 갤러리에서 선택 */
  const handleSelectFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.9,
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

  /* OCR 처리 */
  const processOCR = async (imageUri: string) => {
    setIsProcessing(true);
    try {
      console.log('이미지 URI: ', imageUri);
      console.log('OCR 시작:', imageUri);
      const result = await ocrService.extractTicketInfo(imageUri);

      if (!result) throw new Error('OCR 결과가 없습니다.');

      const formatted: CreateTicketData = {
        title: result.title ?? '',
        artist: result.artist ?? '',
        place: result.place ?? '',
        performedAt: result.performedAt
          ? new Date(result.performedAt)
          : new Date(),
        genre: null,
        status: TicketStatus.PUBLIC,
      };

      setOcrResult(result);
      Alert.alert(
        'OCR 완료',
        '티켓 정보를 추출했습니다.\n확인 후 수정이 필요하면 직접 편집할 수 있습니다.',
        [{ text: '확인', onPress: () => handleConfirmOCR(formatted) }],
      );
    } catch (error) {
      console.error('OCR error:', error);
      Alert.alert(
        '오류',
        'OCR 처리 중 문제가 발생했습니다.\n\n1️⃣ 백엔드 서버 실행 여부\n2️⃣ API URL 확인\n3️⃣ 네트워크 연결 상태를 점검해주세요.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /* OCR 결과 전달 */
  const handleConfirmOCR = (formatted: CreateTicketData) => {
    navigation.replace('AddTicket', {
      ocrData: formatted,
      isFirstTicket,
      fromEmptyState,
      fromAddButton,
    });
  };

  /* 재촬영 / 재선택 */
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
        <View style={styles.contextMessage}>
          <Text style={styles.contextSubtitle}>
            OCR이 정확하지 않나요?{'\n'}
            다음 단계에서 직접 수정할 수 있습니다.
          </Text>
        </View>

        {/* 이미지 선택 버튼 */}
        {!selectedImage && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleTakePhoto}
            >
              <Text style={styles.imageButtonText}>카메라로 촬영</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleSelectFromGallery}
            >
              <Text style={styles.imageButtonText}>갤러리에서 선택</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 선택된 이미지 미리보기 */}
        {selectedImage && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
            />

            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#B11515" />
                <Text style={styles.processingText}>티켓 정보 추출 중...</Text>
              </View>
            )}


            {!isProcessing && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>다시 선택하기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  contextMessage: {
    backgroundColor: Colors.secondarySystemBackground,
    paddingHorizontal: Spacing.sectionSpacing,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.systemGray5,
  },
  contextSubtitle: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    textAlign: 'left',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sectionSpacing,
    gap: Spacing.md,
    marginVertical: Spacing.lg,
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
