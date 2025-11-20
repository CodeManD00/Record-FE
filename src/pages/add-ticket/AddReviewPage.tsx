import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../styles/designSystem';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { sttService } from '../../services/api/sttService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/reviewTypes';
import ReviewSummaryModal from '../../components/ReviewSummaryModal';
import { apiClient } from '../../services/api/client';

type AddReviewPageProps = NativeStackScreenProps<RootStackParamList, 'AddReview'>;

const { width } = Dimensions.get('window');

const AddReviewPage = ({ navigation, route }: AddReviewPageProps) => {
  const { ticketData } = route.params;

  const [reviewText, setReviewText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const [transcriptionId, setTranscriptionId] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCardVisible, setIsCardVisible] = useState(true);

  const scrollX = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardHeight = useRef(new Animated.Value(1)).current;
  const reviewTranslateY = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(0);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // 후기 작성 화면 진입 시 질문 가져오기
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        
        // 장르 매핑 (프론트엔드 → 백엔드)
        // 백엔드의 mapGenre 메서드가 "밴드", "연극/뮤지컬" 등을 받아서 "band", "musical", "common"으로 매핑합니다.
        const mapGenreForBackend = (frontendGenre: string): string => {
          if (!frontendGenre) {
            console.warn('장르가 없어서 COMMON으로 설정');
            return 'COMMON';
          }
          const genre = frontendGenre.trim();
          if (genre.includes('밴드') || genre === '밴드') {
            return '밴드';  // 백엔드에서 "band"로 매핑됨
          } else if (genre.includes('뮤지컬') || genre.includes('연극')) {
            return '연극/뮤지컬';  // 백엔드에서 "musical"로 매핑됨
          }
          return 'COMMON';  // 백엔드에서 "common"으로 매핑됨
        };

        const genre = mapGenreForBackend(ticketData.genre || '');
        console.log('=== 질문 가져오기 시작 ===');
        console.log('원본 장르:', ticketData.genre);
        console.log('매핑된 장르:', genre);
        console.log('API 요청 URL:', `/review-questions?genre=${encodeURIComponent(genre)}`);
        
        const result = await apiClient.get<string[]>(`/review-questions?genre=${encodeURIComponent(genre)}`);
        
        console.log('API 응답 전체:', JSON.stringify(result, null, 2));
        console.log('응답 success:', result.success);
        console.log('응답 data:', result.data);
        console.log('응답 data 타입:', typeof result.data);
        console.log('응답 data가 배열인가?', Array.isArray(result.data));
        
        if (result.success && result.data) {
          // result.data가 배열인지 확인
          const questionsArray = Array.isArray(result.data) 
            ? result.data 
            : (result.data as any)?.data || [];
          
          if (questionsArray.length > 0) {
            console.log('✅ 질문 가져오기 성공! 가져온 질문:', questionsArray);
            setQuestions(questionsArray);
          } else {
            console.warn('⚠️ 질문 배열이 비어있음');
            // 기본 질문 사용
            setQuestions([
              '이 공연을 보게 된 계기는?',
              '가장 인상 깊었던 순간은?',
              '다시 본다면 어떤 점이 기대되나요?',
            ]);
          }
        } else {
          // API 호출 실패 시 기본 질문 사용
          console.warn('⚠️ 질문 가져오기 실패');
          console.warn('응답 상세:', {
            success: result.success,
            data: result.data,
            error: result.error,
          });
          setQuestions([
            '이 공연을 보게 된 계기는?',
            '가장 인상 깊었던 순간은?',
            '다시 본다면 어떤 점이 기대되나요?',
          ]);
        }
      } catch (error) {
        console.error('❌ 질문 가져오기 오류:', error);
        console.error('오류 상세:', error instanceof Error ? error.message : String(error));
        // 오류 발생 시 기본 질문 사용
      } finally {
        setIsLoadingQuestions(false);
        console.log('=== 질문 가져오기 완료 ===');
      }
    };

    fetchQuestions();
  }, [ticketData.genre]);

  const resetCardPosition = () => {
    Animated.parallel([
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(opacity, { toValue: 1, useNativeDriver: false }),
    ]).start();
  };

  const createBounceEffect = (direction: 'left' | 'right') => {
    const bounceDistance = direction === 'left' ? -30 : 30;
    Animated.sequence([
      Animated.timing(pan, {
        toValue: { x: bounceDistance, y: 0 },
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        tension: 300,
        friction: 8,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) =>
        pan.setValue({ x: gestureState.dx, y: 0 }),
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 80;
        const velocityThreshold = 0.3;
        const totalCards = questions.length;
        const currentIdx = currentIndexRef.current;

        const shouldSwipeRight =
          gestureState.dx > swipeThreshold ||
          (gestureState.dx > 30 && gestureState.vx > velocityThreshold);
        const shouldSwipeLeft =
          gestureState.dx < -swipeThreshold ||
          (gestureState.dx < -30 && gestureState.vx < -velocityThreshold);

        if (shouldSwipeRight) {
          if (currentIdx === 0) createBounceEffect('left');
          else {
            const newIndex = currentIdx - 1;
            setCurrentIndex(newIndex);
            Animated.timing(scrollX, {
              toValue: newIndex * width,
              duration: 200,
              useNativeDriver: false,
            }).start();
            resetCardPosition();
          }
        } else if (shouldSwipeLeft) {
          if (currentIdx === totalCards - 1) createBounceEffect('right');
          else {
            const newIndex = currentIdx + 1;
            setCurrentIndex(newIndex);
            Animated.timing(scrollX, {
              toValue: newIndex * width,
              duration: 200,
              useNativeDriver: false,
            }).start();
            resetCardPosition();
          }
        } else resetCardPosition();
      },
    }),
  ).current;

  /** ===============================
   *          오디오 파일 선택 + STT 처리
   *  =============================== */
  const handleAudioFilePick = () => {
    const options = {
      mediaType: 'mixed' as const, // 이미지, 비디오, 오디오 모두 선택 가능
      includeBase64: false,
      quality: 1.0,
      includeExtra: true,
      selectionLimit: 1,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      const asset: Asset | undefined = response.assets?.[0];
      if (!asset?.uri) {
        return;
      }

      // 오디오 파일인지 확인 (파일 확장자 또는 타입으로)
      const uri = asset.uri.toLowerCase();
      const isAudioFile = 
        uri.endsWith('.m4a') || 
        uri.endsWith('.mp3') || 
        uri.endsWith('.wav') || 
        uri.endsWith('.aac') ||
        uri.endsWith('.flac') ||
        uri.endsWith('.mpeg') ||
        uri.endsWith('.ogg') ||
        asset.type?.startsWith('audio/');

      if (!isAudioFile) {
        Alert.alert('알림', '오디오 파일만 선택할 수 있습니다.\n\n(.m4a, .mp3, .wav, .aac, .flac 형식의 파일을 선택해주세요.)');
        return;
      }

      try {
        setIsProcessingSTT(true);

        // 파일 이름과 타입 추출
        const fileName = asset.fileName || asset.uri.split('/').pop() || 'audio.m4a';
        const fileType = asset.type || 'audio/m4a';

        const sttResult = await sttService.transcribeAndSave(asset.uri, fileName, fileType);

        if (sttResult.success && sttResult.data) {
          const transcript = sttResult.data.transcript;
          const updatedText = reviewText ? `${reviewText}\n${transcript}` : transcript;
          setReviewText(updatedText);

          const newTranscriptionId = sttResult.data.id ?? transcriptionId;
          if (newTranscriptionId) setTranscriptionId(newTranscriptionId);

          Alert.alert('완료', '오디오 파일을 텍스트로 변환했어요.');
        } else {
          Alert.alert('오류', sttResult.error?.message || 'STT 변환 실패');
        }
      } catch (error) {
        console.error('오디오 파일 처리 오류:', error);
        Alert.alert('오류', '오디오 파일 처리 중 문제가 발생했습니다.');
      } finally {
        setIsProcessingSTT(false);
      }
    });
  };

  const handleSubmit = () => {
    navigation.navigate('ImageOptions', {
      ticketData,
      reviewData: { reviewText },
    });
  };

  const handleSummary = async () => {
    if (!reviewText || reviewText.trim().length === 0) {
      Alert.alert('알림', '요약할 후기 내용을 먼저 작성해주세요.');
      return;
    }

    try {
      Alert.alert('처리중', '후기를 요약하는 중입니다...');
      
      const result = await sttService.summarizeReview(reviewText);
      
      if (result.success && result.data) {
        const summary = result.data.summary || result.data.finalReview || result.data.transcript || reviewText;
        setSummaryText(summary);
        setShowSummaryModal(true);
      } else {
        Alert.alert('오류', result.error?.message || '요약 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Summary error:', error);
      Alert.alert('오류', '요약 생성 중 오류가 발생했습니다.');
    }
  };

  const handleCloseCard = () => {
    Animated.parallel([
      Animated.timing(cardScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(cardHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(reviewTranslateY, {
        toValue: 44,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsCardVisible(false);
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>후기 작성하기</Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </View>

      {/* 질문 카드 스와이프 */}
      {isCardVisible && !isLoadingQuestions && questions.length > 0 && (
        <Animated.View
          style={[
            styles.questionSection,
            {
              height: cardHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 150],
              }),
              opacity,
            },
          ]}
        >
          {/* Animated 점 인디케이터 */}
          <View style={styles.dots}>
            {questions.map((_, i) => {
              const inputRange = [
                (i - 1) * width,
                i * width,
                (i + 1) * width,
              ];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [6, 12, 6],
                extrapolate: 'clamp',
              });
              const dotColor = scrollX.interpolate({
                inputRange,
                outputRange: ['#BDC3C7', '#2C3E50', '#BDC3C7'],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    { width: dotWidth, backgroundColor: dotColor },
                  ]}
                />
              );
            })}
          </View>

          {/* Animated 질문 카드 */}
          <Animated.View
            style={[
              styles.animatedCard,
              {
                transform: [
                  ...pan.getTranslateTransform(),
                  { scale: cardScale },
                ],
                opacity,
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.questionCard}>
              <View style={styles.questionHeaderRow}>
                {/* 이미지 */}
                <Image
                  source={require('../../assets/cat.png')}
                  style={styles.catImage}
                />

                {/* 오른쪽 텍스트 영역 */}
                <View style={styles.textContainer}>
                  <View style={styles.questionLabelRow}>
                    <Text style={styles.questionLabel}>
                      질문 {currentIndex + 1}
                    </Text>
                  </View>
                  <Text style={styles.questionText}>
                    {questions[currentIndex]}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseCard}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 후기 입력 영역 */}
        <Animated.View
          style={[
            styles.reviewContainer,
            { transform: [{ translateY: reviewTranslateY }] },
          ]}
        >
          <TextInput
            style={styles.reviewInput}
            placeholder="후기를 입력하세요..."
            placeholderTextColor="#BDC3C7"
            multiline
            numberOfLines={8}
            maxLength={1000}
            value={reviewText}
            onChangeText={setReviewText}
          />

          {/* 후기 요약하기 버튼 */}
          <TouchableOpacity
            style={styles.reviewListButton}
            onPress={handleSummary}
          >
            <Text style={styles.reviewListButtonIcon}>🎫</Text>
            <Text style={styles.reviewListButtonText}>후기 요약하기</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 오디오 파일 업로드 버튼 */}
        <TouchableOpacity
          style={[
            styles.audioUploadButton,
            isProcessingSTT && styles.audioUploadButtonProcessing,
          ]}
          onPress={handleAudioFilePick}
          disabled={isProcessingSTT}
        >
          <Text style={styles.audioUploadButtonIcon}>
            {isProcessingSTT ? '⏳' : '🎵'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
        
      {/* 후기 요약 모달 */}
      <ReviewSummaryModal
        visible={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        summaryText={summaryText || "이곳에 요약된 결과가 나옵니다."}
      />
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
  },
  backButtonText: {
    ...Typography.title3,
    color: Colors.label,
    fontWeight: '500',
  },
  headerTitle: { ...Typography.headline, color: Colors.label },
  nextButtonText: { ...Typography.body, color: '#B11515' },

  questionSection: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  
  // 인디케이터
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dot: { height: 6, borderRadius: 3, marginHorizontal: Spacing.xs },

  animatedCard: { width: '100%' },
  questionCard: {
    width: '100%',
    backgroundColor: '#eaeaea',
    borderRadius: 12,
    padding: 8,
    ...Shadows.small,
  },

  catImage: {
    width: 60,
    height: 50,
    margin: 12,
  },

  questionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },

  // 닫기 버튼
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#000000ff',
  },
  questionText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
    lineHeight: 24,
  },

  // 후기 작성
  reviewContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  reviewInput: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#eaeaea',
    minHeight: 450,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#000',
    marginTop: -20,
  },

  // 후기 요약하기 버튼
  reviewListButton: {
    marginTop: -60,
    alignSelf: 'center',
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    ...Shadows.medium,
  },

  reviewListButtonIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  reviewListButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  // 오디오 파일 업로드 버튼
  audioUploadButton: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  audioUploadButtonProcessing: {
    backgroundColor: '#FFA500',
    opacity: 0.7,
  },
  audioUploadButtonIcon: {
    fontSize: 24,
  },
});

export default AddReviewPage;
