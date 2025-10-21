import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { imageGenerationService, ImageGenerationRequest } from '../../services/api';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentStyles,
  Layout,
} from '../../styles/designSystem';

interface AIImageResultsProps {
  navigation: any;
  route?: {
    params?: {
      ticketData?: any;
      reviewData?: {
        rating: number;
        reviewText: string;
      };
      images?: string[];
      settings?: {
        backgroundColor: string;
        includeText: boolean;
        imageStyle: string;
        aspectRatio: string;
      };
    };
  };
}

const { width } = Dimensions.get('window');

const AIImageResults: React.FC<AIImageResultsProps> = ({
  navigation,
  route,
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);

  const ticketData = route?.params?.ticketData;
  const reviewData = route?.params?.reviewData;
  const existingImages = route?.params?.images || [];
  const settings = route?.params?.settings;

  useEffect(() => {
    // 페이지 진입 시 자동으로 이미지 생성 시작
    handleGenerateAIImage();
  }, []);

  const handleGenerateAIImage = async () => {
    setIsGenerating(true);

    try {
      // 티켓 데이터와 후기 데이터가 있는지 확인
      if (!ticketData?.title || !reviewData?.reviewText) {
        Alert.alert('오류', '티켓 정보나 후기 정보가 없습니다.');
        setIsGenerating(false);
        return;
      }

      // 백엔드 API 요청 데이터 구성
      // 프론트엔드 장르를 백엔드가 이해할 수 있는 형태로 매핑
      const mapGenreForBackend = (frontendGenre: string): string => {
        if (frontendGenre?.includes('뮤지컬') || frontendGenre?.includes('연극')) {
          return '뮤지컬'; // 연극/뮤지컬 → 뮤지컬로 매핑
        }
        if (frontendGenre?.includes('밴드')) {
          return '밴드';
        }
        return '뮤지컬'; // 기본값
      };

      const requestData: ImageGenerationRequest = {
        title: ticketData.title,
        review: reviewData.reviewText,
        genre: mapGenreForBackend(ticketData.genre || ''), // 장르 매핑 적용
        location: ticketData.place || '', // 공연 장소
        date: ticketData.performedAt || '', // 공연 날짜
        cast: [], // 출연진 (현재는 빈 배열)
      };

      console.log('🔍 이미지 생성 요청 데이터:', requestData);

      // 백엔드 API 호출
      const result = await imageGenerationService.generateImage(requestData);

      if (result.success && result.data) {
        console.log('✅ 이미지 생성 성공:', result.data);
        
        // 생성된 이미지 URL 설정
        setGeneratedImage(result.data.imageUrl);
        setGenerationHistory(prev => [result.data.imageUrl, ...prev]);

        Alert.alert('성공', 'AI 이미지가 성공적으로 생성되었습니다!');
      } else {
        console.error('❌ 이미지 생성 실패:', result.error);
        Alert.alert('오류', result.error?.message || 'AI 이미지 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 이미지 생성 중 예외 발생:', error);
      Alert.alert('오류', 'AI 이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectImage = () => {
    if (generatedImage) {
      // AI 생성 이미지를 첫 번째로 설정 (모든 화면에서 일관되게 표시)
      navigation.navigate('TicketComplete', {
        ticketData,
        reviewData,
        images: [generatedImage], // 선택한 이미지만 전달
      });
    }
  };

  const handleRegenerateImage = () => {
    setGeneratedImage(null);
    handleGenerateAIImage();
  };

  const handleSelectFromHistory = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이미지 생성</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 생성 중 또는 결과 표시 */}
        {isGenerating ? (
          <View style={styles.generatingContainer}>
            <View style={styles.placeholderImage}>
              <ActivityIndicator size="large" color="#b11515" />
              <Text style={styles.generatingTitle}>AI 이미지 생성 중...</Text>
            </View>
          </View>
        ) : (
          generatedImage && (
            <View style={styles.generatedImageContainer}>
              <Text style={styles.generatedImageTitle}>생성된 이미지</Text>
              <Image
                source={{ uri: generatedImage }}
                style={styles.generatedImage}
                resizeMode="cover"
              />

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={handleRegenerateImage}
                  disabled={isGenerating}
                >
                  <Text style={styles.regenerateButtonText}>다시 생성하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={handleSelectImage}
                >
                  <Text style={styles.selectButtonText}>이미지 선택하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        )}

        {/* Generation History */}
        {generationHistory.length > 1 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>생성 히스토리</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.historyContainer}
            >
              {generationHistory.slice(1).map((imageUrl, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyImageWrapper}
                  onPress={() => handleSelectFromHistory(imageUrl)}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={[
                      styles.historyImage,
                      generatedImage === imageUrl &&
                        styles.selectedHistoryImage,
                    ]}
                    resizeMode="cover"
                  />
                  {generatedImage === imageUrl && (
                    <View style={styles.selectedOverlay}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
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
    zIndex: 2,
  },
  backButtonText: {
    ...Typography.title3,
    color: Colors.label,
    fontWeight: 'bold',
  },

  headerTitle: {
    ...Typography.headline,
    color: Colors.label,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  content: { flex: 1 },
  
  generatingContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  placeholderImage: {
    width: 300,
    height: 375,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  generatingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
  },
  
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  
  generatedImageContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  generatedImageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  generatedImage: {
    width: 300,
    height: 375,
    borderRadius: 12,
    marginBottom: 20,
  },
  actionButtonsContainer: { flexDirection: 'row', width: '100%', gap: 12 },
  regenerateButton: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  regenerateButtonText: { fontSize: 14, fontWeight: '600', color: '#000' },
  selectButton: {
    flex: 1,
    backgroundColor: '#b11515',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  selectButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  
  historyContainer: { marginTop: 12 },
  historyImageWrapper: { position: 'relative', marginRight: 12 },
  historyImage: {
    width: 80,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedHistoryImage: { borderColor: '#b11515' },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: { fontSize: 24, color: '#b11515', fontWeight: 'bold' },
});

export default AIImageResults;