import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  ImageBackground,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { addTicketAtom, TicketStatus } from '../../atoms';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentStyles,
  Layout,
} from '../../styles/designSystem';

interface TicketCompletePageProps {
  navigation: any;
  route?: {
    params?: {
      ticketData?: any;
      reviewData?: {
        reviewText?: string;
        text?: string;
        isPublic?: boolean;
      };
      images?: string[];
    };
  };
}

const { width, height } = Dimensions.get('window');

const TicketCompletePage: React.FC<TicketCompletePageProps> = ({ navigation, route }) => {
  const ticketData = route?.params?.ticketData;
  const reviewData = route?.params?.reviewData;
  const images = route?.params?.images;
  const [, addTicket] = useAtom(addTicketAtom);
  const insets = useSafeAreaInsets();

  // Get the first image (likely AI generated) to display on ticket
  const ticketImage = images && images.length > 0 ? images[0] : null;

  useEffect(() => {
    // Save the complete ticket with review and images
    if (ticketData) {
      console.log('=== 티켓 추가 시작 ===');
      console.log('ticketData:', ticketData);
      console.log('reviewData:', reviewData);
      console.log('images:', images);
      console.log('🖼️ 전달받은 이미지 배열:', images);
      console.log('🖼️ 첫 번째 이미지 (표시될 이미지):', images?.[0]);

      // ReviewData를 TicketReview 형식으로 변환
      const ticketReview = reviewData?.reviewText || reviewData?.text 
        ? { 
            reviewText: reviewData.reviewText || reviewData.text || '',
            createdAt: new Date(),
          }
        : undefined;

      const ticketToAdd = {
        ...ticketData,
        review: ticketReview,
        images: images || [],
        status: reviewData?.isPublic === false ? TicketStatus.PRIVATE : TicketStatus.PUBLIC,
      };

      console.log('최종 티켓 데이터:', ticketToAdd);
      console.log('🖼️ 최종 티켓의 이미지 배열:', ticketToAdd.images);

      const result = addTicket(ticketToAdd);

      // Result 패턴 처리
      if (!result.success) {
        console.error('❌ 티켓 추가 실패:', result.error);
        // 에러 발생 시에도 홈으로 이동 (사용자 경험 개선)
      } else {
        console.log('✅ 티켓 추가 성공:', result.data);
        console.log('🖼️ 저장된 티켓의 이미지:', result.data?.images);
      }
    } else {
      console.warn('⚠️ ticketData가 없습니다!');
    }

    // Auto-navigate to home after 3 seconds
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, ticketData, reviewData, images, addTicket]);

  const handleBackPress = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Main Content */}
      <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
        {/* Title */}
        <Text style={styles.title}>새로운 티켓 생성 완료~!</Text>
        <Text style={styles.subtitle}>하나의 추억을 저장했어요.</Text>

        {/* Ticket Card */}
        <View style={styles.ticketCard}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketHeaderText}>{ticketData?.title}</Text>
          </View>

          {/* Main Ticket Content */}
          <View style={styles.ticketMain}>
            {ticketImage ? (
              <Image
                source={{ uri: ticketImage }}
                style={styles.ticketImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.ticketPlaceholder}>
                <Text style={styles.placeholderText}>🎫</Text>
              </View>
            )}
          </View>

          {/* Ticket Footer */}
          <View style={styles.ticketFooter}>
            <Text style={styles.footerText}>{ticketData?.title}</Text>
            <Text style={styles.footerSubtext}>
              {ticketData?.place} •{' '}
              {ticketData?.performedAt
                ? new Date(ticketData.performedAt).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                  })
                : '10월 4일'}{' '}
              • 8PM
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 40,
  },
  ticketCard: {
    width: width - 60,
    height: height * 0.6,
    backgroundColor: '#8FBC8F',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  ticketHeader: {
    padding: 20,
    position: 'relative',
  },
  ticketHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 2,
  },
  ticketMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  ticketImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  ticketPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 48,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ticketFooter: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
  },
});

export default TicketCompletePage; 