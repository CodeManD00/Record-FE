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
import { voiceManager } from '../../utils/voiceUtils';
import { audioRecorder } from '../../utils/audioRecorder';
import { sttService } from '../../services/api/sttService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/reviewTypes';
import ReviewSummaryModal from '../../components/ReviewSummaryModal';

type AddReviewPageProps = NativeStackScreenProps<RootStackParamList, 'AddReview'>;

const { width } = Dimensions.get('window');

const AddReviewPage = ({ navigation, route }: AddReviewPageProps) => {
  const { ticketData } = route.params;

  const [reviewText, setReviewText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const [questions, setQuestions] = useState<string[]>([
    '이 공연을 보게 된 계기는?',
    '가장 인상 깊었던 순간은?',
    '다시 본다면 어떤 점이 기대되나요?',
  ]);
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

  useEffect(() => {
    let isMounted = true;

    const setupVoice = async () => {
      const available = await voiceManager.isVoiceAvailable();
      if (!available || !isMounted) return;

      await voiceManager.setListeners({
        onSpeechResults: (event: any) => {
          const text = event?.value?.[0];
          if (text) setReviewText(prev => `${prev} ${text}`);
        },
        onSpeechEnd: () => setIsRecording(false),
        onSpeechError: () => setIsRecording(false),
      });
    };

    setupVoice();

    return () => {
      isMounted = false;
      voiceManager.destroy();
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      try {
        // 녹음 중지
        setIsRecording(false);
        const audioFile = await audioRecorder.stopRecording();
        
        if (!audioFile || !audioFile.uri) {
          Alert.alert('오류', '녹음 파일을 찾을 수 없습니다.');
          return;
        }

        // STT 처리 시작
        setIsProcessingSTT(true);
        Alert.alert('처리중', 'STT 변환 중입니다...');
        
        const result = await sttService.transcribeAudio(audioFile.uri, audioFile.name);
        
        setIsProcessingSTT(false);
        
        if (result.success && result.data) {
          // 변환된 텍스트를 후기에 추가
          const newText = result.data.transcript;
          setReviewText(prev => {
            if (!prev) return newText;
            return `${prev}\n${newText}`;
          });
          Alert.alert('완료', 'STT 변환이 완료되었습니다.');
        } else {
          Alert.alert('오류', result.error?.message || 'STT 변환에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('STT Error:', error);
        setIsProcessingSTT(false);
        setIsRecording(false);
        Alert.alert('오류', 'STT 변환 중 오류가 발생했습니다.');
      }
    } else {
      try {
        // 녹음 시작
        const started = await audioRecorder.startRecording();
        if (started) {
          setIsRecording(true);
          setIsVoiceMode(true);
        } else {
          Alert.alert('오류', '녹음을 시작할 수 없습니다.');
        }
      } catch (error) {
        console.error('Recording start error:', error);
        Alert.alert('오류', '녹음을 시작할 수 없습니다.');
      }
    }
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
      
      const result = await sttService.summarizeText(reviewText);
      
      if (result.success && result.data) {
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
      {isCardVisible && (
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

        {/* 녹음 버튼 */}
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
            isProcessingSTT && styles.recordButtonProcessing,
          ]}
          onPress={toggleRecording}
          disabled={isProcessingSTT}
        >
          <Text style={styles.recordButtonIcon}>
            {isProcessingSTT ? '⏳' : isRecording ? '⏹' : '🎤'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
        
      {/* 후기 요약 모달 */}
      <ReviewSummaryModal
        visible={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        summaryText={reviewText || "이곳에 요약된 결과가 나옵니다."}
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

  // 녹음 버튼
  recordButton: {
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
  recordButtonActive: {
    backgroundColor: '#FF4444',
  },
  recordButtonProcessing: {
    backgroundColor: '#FFA500',
    opacity: 0.7,
  },
  recordButtonIcon: {
    fontSize: 24,
  },
});

export default AddReviewPage;
