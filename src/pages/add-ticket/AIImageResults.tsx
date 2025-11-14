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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { imageGenerationService, ImageGenerationRequest } from '../../services/api';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
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
const cardWidth = width - 48;
const cardHeight = (cardWidth * 5) / 4;

const AIImageResults: React.FC<AIImageResultsProps> = ({ navigation, route }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [regenerationRequest, setRegenerationRequest] = useState<string>(''); // 재생성 요구사항 입력 필드
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null); // 현재 프롬프트 저장 (나중에 백엔드 연동 시 사용)

  const ticketData = route?.params?.ticketData;
  const reviewData = route?.params?.reviewData;
  const existingImages = route?.params?.images || [];
  const settings = route?.params?.settings;

  useEffect(() => {
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
        genre: mapGenreForBackend(ticketData.genre || ''), // 매핑 함수 적용
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
        const imageData = result.data;
        if (imageData) {
          setGeneratedImage(imageData.imageUrl);
          setGenerationHistory(prev => [imageData.imageUrl, ...prev]);
          
          // 프롬프트 저장 (재생성 시 basePrompt로 사용하기 위해)
          if (imageData.prompt) {
            setCurrentPrompt(imageData.prompt);
          }
        }

        // Alert 제거 - 바로 재생성 UI를 보여줌
        // Alert.alert('성공', 'AI 이미지가 성공적으로 생성되었습니다!');
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
      navigation.navigate('TicketComplete', {
        ticketData,
        reviewData,
        images: [generatedImage],
      });
    }
  };

  /**
   * 재생성 버튼 클릭 시 호출되는 함수
   * 사용자가 입력한 요구사항(regenerationRequest)을 포함하여 이미지를 재생성합니다.
   * 
   * 현재는 백엔드 연동 전이므로, 요구사항을 포함한 요청을 보내지만
   * 백엔드에서 basePrompt와 imageRequest를 처리할 수 있도록 준비합니다.
   */
  const handleRegenerateImage = async () => {
    if (!generatedImage) {
      Alert.alert('오류', '생성된 이미지가 없습니다.');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null); // 재생성 중에는 이미지 숨김

    try {
      // 티켓 데이터와 후기 데이터가 있는지 확인
      if (!ticketData?.title || !reviewData?.reviewText) {
        Alert.alert('오류', '티켓 정보나 후기 정보가 없습니다.');
        setIsGenerating(false);
        return;
      }

      // 백엔드 API 요청 데이터 구성
      const mapGenreForBackend = (frontendGenre: string): string => {
        if (frontendGenre?.includes('뮤지컬') || frontendGenre?.includes('연극')) {
          return '뮤지컬';
        }
        if (frontendGenre?.includes('밴드')) {
          return '밴드';
        }
        return '뮤지컬';
      };

      // 재생성 요청 데이터 구성
      // TODO: 백엔드 연동 시 basePrompt와 imageRequest 필드 추가 필요
      const requestData: ImageGenerationRequest = {
        title: ticketData.title,
        review: reviewData.reviewText,
        genre: mapGenreForBackend(ticketData.genre || ''),
        location: ticketData.place || '',
        date: ticketData.performedAt || '',
        cast: [],
        // TODO: 백엔드에서 basePrompt와 imageRequest를 받을 수 있도록 확장 필요
        // basePrompt: currentPrompt,  // 이전 프롬프트
        // imageRequest: regenerationRequest,  // 사용자 요구사항
      };

      console.log('🔄 재생성 요청 데이터:', requestData);
      console.log('📝 사용자 요구사항:', regenerationRequest);
      console.log('📋 이전 프롬프트:', currentPrompt);

      // 백엔드 API 호출
      const result = await imageGenerationService.generateImage(requestData);

      if (result.success && result.data) {
        console.log('✅ 재생성 성공:', result.data);
        
        // 생성된 이미지 URL 설정
        const imageData = result.data;
        if (imageData) {
          setGeneratedImage(imageData.imageUrl);
          setGenerationHistory(prev => [imageData.imageUrl, ...prev]);
          
          // 프롬프트 업데이트
          if (imageData.prompt) {
            setCurrentPrompt(imageData.prompt);
          }

          // 요구사항 입력 필드 초기화
          setRegenerationRequest('');
        }
      } else {
        console.error('❌ 재생성 실패:', result.error);
        Alert.alert('오류', result.error?.message || '이미지 재생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 재생성 중 예외 발생:', error);
      Alert.alert('오류', '이미지 재생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 테스트 이미지 생성 (백엔드 연결 실패 시 대체)
  const handleGenerateTestImage = async () => {
    setIsGenerating(true);

    try {
      const requestData: ImageGenerationRequest = {
        title: ticketData?.title || '공연',
        review: reviewData?.reviewText || '',
        genre: ticketData?.genre,
        location: ticketData?.location,
        date: ticketData?.date,
        cast: ticketData?.cast,
      };

      console.log('🧪 테스트 이미지 생성 요청:', requestData);

      const response = await imageGenerationService.generateTestImage(requestData);

      if (response.success && response.data) {
        const { imageUrl } = response.data;
        setGeneratedImage(imageUrl);
        setGenerationHistory((prev) => [imageUrl, ...prev]);
        Alert.alert('테스트 모드', '테스트 이미지가 생성되었습니다.');
      } else {
        throw new Error(response.error?.message || '테스트 이미지 생성 실패');
      }
    } catch (error) {
      console.error('❌ 테스트 이미지 생성 실패:', error);
      Alert.alert('오류', '테스트 이미지 생성도 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectFromHistory = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>티켓 이미지 생성</Text>
        {generatedImage && (
          <TouchableOpacity style={styles.nextButton} onPress={handleSelectImage}>
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
        )}
      </View>

      {isGenerating ? (
        <View style={styles.loadingFullScreen}>
          <ActivityIndicator size="large" color="#b11515" />
          <Text style={styles.generatingTitle}>AI 이미지 생성 중...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {generatedImage && (
            <>
              {/* 생성 완료 메시지 */}
              <View style={styles.successMessageContainer}>
                <Text style={styles.successMessage}>이미지가 생성되었어요!</Text>
              </View>

              {/* 생성된 이미지 미리보기 */}
              <View style={styles.generatedImageContainer}>
                <Image
                  source={{ uri: generatedImage }}
                  style={styles.generatedImage}
                  resizeMode="cover"
                />
              </View>

              {/* 재생성 요구사항 입력 섹션 */}
              <View style={styles.regenerationSection}>
                <Text style={styles.regenerationTitle}>이렇게 바꿔주세요</Text>
                
                {/* 힌트 말풍선 */}
                <View style={styles.hintBubble}>
                  <Text style={styles.hintText}>
                    생성된 티켓이 마음에 들지 않나요?{'\n'}
                    원하는 스타일을 알려주세요!
                  </Text>
                </View>

                {/* 요구사항 입력 필드 */}
                <TextInput
                  style={styles.regenerationInput}
                  placeholder="요구사항을 입력하세요..."
                  placeholderTextColor={Colors.tertiaryLabel}
                  value={regenerationRequest}
                  onChangeText={setRegenerationRequest}
                  multiline
                  textAlignVertical="top"
                />

                {/* 다시 생성하기 버튼 */}
                <TouchableOpacity
                  style={[
                    styles.regenerateButton,
                    isGenerating && styles.regenerateButtonDisabled,
                  ]}
                  onPress={handleRegenerateImage}
                  disabled={isGenerating}
                >
                  <Text style={styles.regenerateButtonText}>다시 생성하기</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  // 헤더
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

  nextButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  nextButtonText: {
    ...Typography.callout,
    color: '#b11515',
    fontWeight: '600',
  },

  // 본문
  content: { flex: 1 },

  loadingFullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    //height: Dimensions.get('window').height,
  },

  generatingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
  },

  // 생성 완료 메시지
  successMessageContainer: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },

  successMessage: {
    ...Typography.title2,
    fontWeight: '600',
    color: Colors.label,
  },

  generatedImageContainer: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },

  generatedImage: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.systemGray5,
  },

  // 재생성 섹션
  regenerationSection: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.xxxl,
  },

  regenerationTitle: {
    ...Typography.title3,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.md,
  },

  // 힌트 말풍선
  hintBubble: {
    backgroundColor: '#FFF5F5',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    position: 'relative',
  },

  hintText: {
    ...Typography.caption1,
    color: '#8B4513',
    lineHeight: 18,
  },

  // 요구사항 입력 필드
  regenerationInput: {
    backgroundColor: Colors.systemBackground,
    borderWidth: 1,
    borderColor: Colors.systemGray5,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 100,
    ...Typography.body,
    color: Colors.label,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },

  // 다시 생성하기 버튼
  regenerateButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },

  regenerateButtonDisabled: {
    opacity: 0.6,
  },

  regenerateButtonText: {
    ...Typography.headline,
    color: Colors.white,
    fontWeight: '600',
  },

  // 생성 히스토리
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },

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

  selectedText: {
    fontSize: 24,
    color: '#b11515',
    fontWeight: 'bold',
  },
});

export default AIImageResults;
