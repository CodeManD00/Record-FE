// =========================================
// AddReviewPage.tsx — 최종 완성본
// =========================================

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
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { sttService } from '../../services/api/sttService';
import { apiClient } from '../../services/api/client';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/reviewTypes';

type AddReviewPageProps = NativeStackScreenProps<RootStackParamList, 'AddReview'>;

const { width } = Dimensions.get('window');

const AddReviewPage = ({ navigation, route }: AddReviewPageProps) => {
  /** ===============================
   *              상태값
   *  =============================== */
  const { ticketData } = route.params;

  const [reviewText, setReviewText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
<<<<<<< Updated upstream
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const [transcriptionId, setTranscriptionId] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCardVisible, setIsCardVisible] = useState(true);
=======
>>>>>>> Stashed changes

  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);

  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);

  /** ⭐ STT 결과 저장할 때 받는 transcriptionId */
  const [transcriptionId, setTranscriptionId] = useState<number | undefined>(undefined);

  /** ===============================
   *       Navigation Warning Fix
   *  =============================== */
  useEffect(() => {
    if (ticketData.performedAt instanceof Date) {
      (ticketData as any).performedAt = ticketData.performedAt.toISOString();
    }
  }, [ticketData]);


  /** ===============================
   *           질문 가져오기
   *  =============================== */
  useEffect(() => {
    apiClient.ensureAuthToken?.();

    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);

        const mapGenre = (g: string) => {
          if (!g) return 'COMMON';
          if (g.includes('밴드')) return '밴드';
          if (g.includes('뮤지컬') || g.includes('연극')) return '연극/뮤지컬';
          return 'COMMON';
        };

<<<<<<< Updated upstream
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
=======
        const genre = mapGenre(ticketData.genre || '');
        console.log('🎭 질문 가져오기 | 장르:', genre);

        const result = await apiClient.get<{ success: boolean; data: string[] }>(
          `/review-questions?genre=${encodeURIComponent(genre)}`
        );

        if (result.success) {
          if (Array.isArray(result.data?.data) && result.data.success) {
            setQuestions(result.data.data);
            return;
          }
>>>>>>> Stashed changes
        }

        setQuestions([
          '이 공연을 보게 된 계기는?',
          '가장 인상 깊었던 순간은?',
          '다시 본다면 어떤 점이 기대되나요?',
        ]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [ticketData.genre]);

  /** ===============================
   *           스와이프 카드
   *  =============================== */
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const cardHeight = useRef(new Animated.Value(1)).current;
  const reviewTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const resetCard = () => {
    Animated.parallel([
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
      Animated.spring(opacity, { toValue: 1, useNativeDriver: false }),
    ]).start();
  };

  const bounce = (dir: 'left' | 'right') => {
    Animated.sequence([
      Animated.timing(pan, {
        toValue: { x: dir === 'left' ? -30 : 30, y: 0 },
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10,
      onPanResponderMove: (_, gs) => pan.setValue({ x: gs.dx, y: 0 }),
      onPanResponderRelease: (_, gs) => {
        const idx = currentIndexRef.current;
        const total = questions.length;

        const left = gs.dx < -80 || gs.vx < -0.3;
        const right = gs.dx > 80 || gs.vx > 0.3;

        if (right) {
          if (idx === 0) bounce('left');
          else {
            const next = idx - 1;
            setCurrentIndex(next);
            Animated.timing(scrollX, {
              toValue: next * width,
              duration: 200,
              useNativeDriver: false,
            }).start();
            resetCard();
          }
        } else if (left) {
          if (idx === total - 1) bounce('right');
          else {
            const next = idx + 1;
            setCurrentIndex(next);
            Animated.timing(scrollX, {
              toValue: next * width,
              duration: 200,
              useNativeDriver: false,
            }).start();
            resetCard();
          }
        } else {
          resetCard();
        }
      },
    })
  ).current;

  /** ===============================
<<<<<<< Updated upstream
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
=======
   *        리뷰 정리 (Organize)
   *  =============================== */
  const handleOrganizeReview = async (
    textOverride?: string,
    transcriptionIdOverride?: number,
    options?: { showAlert?: boolean }
  ) => {
    const textToUse = (textOverride ?? reviewText).trim();

    if (!textToUse) {
      Alert.alert('알림', '정리할 텍스트가 없습니다.');
      return;
    }

    try {
      setIsOrganizing(true);
      const organizeResult = await sttService.organizeReview(
        textToUse,
        transcriptionIdOverride ?? transcriptionId
      );

      if (organizeResult.success && organizeResult.data) {
        const organizedText =
          organizeResult.data.finalReview ??
          organizeResult.data.summary ??
          organizeResult.data.transcript ??
          textToUse;

        setReviewText(organizedText);

        if (organizeResult.data.id) {
          setTranscriptionId(organizeResult.data.id);
        }

        if (options?.showAlert ?? true) {
          Alert.alert('완료', '내용을 정리했어요.');
        }

        return organizedText;
      } else {
        // 에러 메시지 분석
        const errorMessage = organizeResult.error?.message || '정리에 실패했습니다.';
        const errorCode = organizeResult.error?.code || '';
        
        // 타임아웃 오류
        const isTimeout = errorCode === 'TIMEOUT_ERROR' || errorMessage.includes('timeout') || errorMessage.includes('Aborted');
        // OpenAI API 오류
        const isOpenAIError = errorMessage.includes('OpenAI') || errorMessage.includes('Retries exhausted');
        
        let alertMessage = errorMessage;
        if (isTimeout) {
          alertMessage = '요청 시간이 초과되었습니다.\n\nAI 처리가 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.';
        } else if (isOpenAIError) {
          alertMessage = 'AI 서비스에 일시적인 문제가 발생했습니다.\n\n잠시 후 다시 시도해주세요.';
        }
        
        Alert.alert(
          '정리 실패',
          alertMessage,
          [
            { text: '취소', style: 'cancel' },
            {
              text: '다시 시도',
              onPress: () => handleOrganizeReview(textOverride, transcriptionIdOverride, options),
            },
          ]
        );
      }
    } catch (error) {
      console.error('정리 요청 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('Aborted');
      
      Alert.alert(
        '오류',
        isTimeout
          ? '요청 시간이 초과되었습니다.\n\n네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.'
          : '정리 요청 중 문제가 발생했습니다.\n\n네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '다시 시도',
            onPress: () => handleOrganizeReview(textOverride, transcriptionIdOverride, options),
          },
        ]
      );
      return undefined;
    } finally {
      setIsOrganizing(false);
    }
>>>>>>> Stashed changes
  };

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

          await handleOrganizeReview(updatedText, newTranscriptionId, { showAlert: false });
          Alert.alert('완료', '오디오 파일을 텍스트로 변환하고 정리했어요.');
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

  /** ===============================
   *         이미지 생성 페이지 이동
   *  =============================== */
  const handleSubmit = () => {
    navigation.navigate('ImageOptions', {
      ticketData,
      reviewData: { reviewText },
    });
  };

<<<<<<< Updated upstream
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

=======
  /** ===============================
   *                 UI
   *  =============================== */
>>>>>>> Stashed changes
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>후기 작성하기</Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </View>

<<<<<<< Updated upstream
      {/* 질문 카드 스와이프 */}
      {isCardVisible && !isLoadingQuestions && questions.length > 0 && (
=======
      {/* 질문 카드 */}
      {questions.length > 0 && (
>>>>>>> Stashed changes
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
          {/* Swipe Indicators */}
          <View style={styles.dots}>
            {questions.map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: scrollX.interpolate({
                      inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                      outputRange: [6, 12, 6],
                      extrapolate: 'clamp',
                    }),
                    backgroundColor: scrollX.interpolate({
                      inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                      outputRange: ['#ccc', '#000', '#ccc'],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            ))}
          </View>

          {/* 카드 */}
          <Animated.View style={[styles.animatedCard, { transform: [...pan.getTranslateTransform(), { scale: cardScale }] }]} {...panResponder.panHandlers}>
            <View style={styles.questionCard}>
              <View style={styles.questionHeaderRow}>
                <Image source={require('../../assets/cat.png')} style={styles.catImage} />
                <View style={styles.textContainer}>
                  <Text style={styles.questionLabel}>질문 {currentIndex + 1}</Text>
                  <Text style={styles.questionText}>{questions[currentIndex]}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {/* Text Input / Recording */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[styles.reviewContainer, { transform: [{ translateY: reviewTranslateY }] }]}>
          <TextInput
            style={styles.reviewInput}
            placeholder="후기를 입력하세요..."
            placeholderTextColor="#999"
            multiline
            value={reviewText}
            onChangeText={setReviewText}
          />

          <TouchableOpacity
            style={[
              styles.reviewListButton,
              (isOrganizing || isProcessingSTT) && styles.reviewListButtonDisabled,
            ]}
            onPress={() => handleOrganizeReview()}
            disabled={isOrganizing || isProcessingSTT}
          >
            <Text style={styles.reviewListButtonIcon}>📝</Text>
            <Text style={styles.reviewListButtonText}>
              {isOrganizing ? '정리 중...' : '정리하기'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 오디오 파일 업로드 버튼 */}
        <TouchableOpacity
          style={[
<<<<<<< Updated upstream
            styles.audioUploadButton,
            isProcessingSTT && styles.audioUploadButtonProcessing,
=======
            styles.recordButton,
            isProcessingSTT && styles.recordButtonProcessing,
>>>>>>> Stashed changes
          ]}
          onPress={handleAudioFilePick}
          disabled={isProcessingSTT}
        >
<<<<<<< Updated upstream
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
=======
          <Text style={styles.recordButtonIcon}>{isProcessingSTT ? '⏳' : '🎵'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

>>>>>>> Stashed changes
    </SafeAreaView>
  );
};

/** ============================================
 *                  Styles
 *  ============================================ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  backButtonText: { ...Typography.title3 },
  headerTitle: { ...Typography.headline },
  nextButtonText: {
    ...Typography.body,
    color: '#B11515',
    fontWeight: '600',
  },
  nextButtonDisabled: {
    color: '#999',
  },

  questionSection: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  dot: { height: 6, borderRadius: 3, marginHorizontal: Spacing.xs },

  animatedCard: { width: '100%' },

  questionCard: {
    width: '100%',
    backgroundColor: '#ececec',
    borderRadius: 12,
    padding: 12,
    ...Shadows.small,
  },
  questionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catImage: { width: 60, height: 50, marginRight: 12 },
  textContainer: { flex: 1 },
  questionLabel: { fontSize: 16, fontWeight: '600', color: '#000' },
  questionText: { fontSize: 18, fontWeight: '500', color: '#000', marginTop: 4 },

  reviewContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: -20,
  },
  reviewInput: {
    minHeight: 450,
    backgroundColor: '#ececec',
    borderRadius: 12,
    padding: 20,
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top',
  },
  reviewListButton: {
    marginTop: -60,
    alignSelf: 'center',
    width: 140,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 25,
    ...Shadows.medium,
  },
  reviewListButtonDisabled: {
    opacity: 0.6,
  },
  reviewListButtonText: { fontSize: 14, fontWeight: '600', color: '#000' },
  reviewListButtonIcon: { fontSize: 18, marginRight: 6 },

<<<<<<< Updated upstream
  // 오디오 파일 업로드 버튼
  audioUploadButton: {
=======
  recordButton: {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  audioUploadButtonProcessing: {
    backgroundColor: '#FFA500',
    opacity: 0.7,
  },
  audioUploadButtonIcon: {
    fontSize: 24,
  },
=======
  recordButtonProcessing: { backgroundColor: '#FFA500', opacity: 0.7 },
  recordButtonIcon: { fontSize: 24 },
>>>>>>> Stashed changes
});

export default AddReviewPage;
