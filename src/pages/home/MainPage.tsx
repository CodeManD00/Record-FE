import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { ticketsAtom } from '../../atoms';
import { fetchMyTicketsAtom, myTicketsAtom } from '../../atoms/ticketsAtomsApi';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { Ticket } from '../../types/ticket';
import TicketDetailModal from '../../components/TicketDetailModal';
import GNB from '../../components/GNB';
import { Button } from '../../components/ui';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../styles/designSystem';

const { width } = Dimensions.get('window');

interface MainPageProps {
  navigation: any;
}

const MainPage: React.FC<MainPageProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [tickets] = useAtom(ticketsAtom);
  const [apiTickets] = useAtom(myTicketsAtom);
  const [, fetchMyTickets] = useAtom(fetchMyTicketsAtom);
  
  // 백엔드 API에서 티켓 데이터 가져오기
  useFocusEffect(
    useCallback(() => {
      fetchMyTickets(true); // 강제 새로고침
    }, [fetchMyTickets])
  );
  
  // API 티켓이 있으면 우선 사용, 없으면 로컬 티켓 사용
  const displayTicketsFromApi = apiTickets.length > 0 ? apiTickets : tickets;
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    '전체' | '밴드' | '연극/뮤지컬'
  >('전체');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);

  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // 인디케이터용 애니메이션 값
  const scrollX = useRef(new Animated.Value(0)).current;

  const currentTicketIndexRef = useRef(0);
  useEffect(() => {
    currentTicketIndexRef.current = currentTicketIndex;
  }, [currentTicketIndex]);

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

  const handleTicketPress = (ticket: Ticket) => {
    if (!ticket.id || !ticket.performedAt) return;
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTicket(null);
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getMonth() + 1}월`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const handleFilterSelect = (filter: '전체' | '밴드' | '연극/뮤지컬') => {
    setSelectedFilter(filter);
    setShowFilterDropdown(false);
  };

  const getCurrentMonthNumber = () => new Date().getMonth();
  const getCurrentYear = () => new Date().getFullYear();

  const currentMonthTickets = displayTicketsFromApi
    .filter(ticket => {
      if (!ticket?.performedAt) return false;
      const ticketDate = new Date(ticket.performedAt);
      const isCurrentMonth =
        ticketDate.getMonth() === getCurrentMonthNumber() &&
        ticketDate.getFullYear() === getCurrentYear();
      const matchesGenre =
        selectedFilter === '전체' ||
        ticket.genre === selectedFilter ||
        !ticket.genre;
      return isCurrentMonth && matchesGenre;
    })
    .sort(
      (a, b) =>
        new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime(),
    );

  const displayTickets: Ticket[] = currentMonthTickets;
  const hasTickets = displayTickets.length > 0;

  useEffect(() => {
    if (!hasTickets) {
      setCurrentTicketIndex(0);
      return;
    }
    if (currentTicketIndex >= displayTickets.length) setCurrentTicketIndex(0);
  }, [displayTickets.length, currentTicketIndex, hasTickets]);

  useEffect(() => {
    setCurrentTicketIndex(0);
    resetCardPosition();
  }, [selectedFilter]);

  const currentTicket = hasTickets ? displayTickets[currentTicketIndex] : null;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) =>
        pan.setValue({ x: gestureState.dx, y: 0 }),
      onPanResponderRelease: (_, gestureState) => {
        if (!displayTickets.length) {
          resetCardPosition();
          return;
        }
        const swipeThreshold = 80;
        const velocityThreshold = 0.3;
        const totalCards = displayTickets.length;
        const currentIndex = currentTicketIndexRef.current;

        const shouldSwipeRight =
          gestureState.dx > swipeThreshold ||
          (gestureState.dx > 30 && gestureState.vx > velocityThreshold);
        const shouldSwipeLeft =
          gestureState.dx < -swipeThreshold ||
          (gestureState.dx < -30 && gestureState.vx < -velocityThreshold);

        if (shouldSwipeRight) {
          if (currentIndex === 0) createBounceEffect('left');
          else {
            const newIndex = currentIndex - 1;
            setCurrentTicketIndex(newIndex);
            Animated.timing(scrollX, {
              toValue: newIndex * width,
              duration: 200,
              useNativeDriver: false,
            }).start();
            resetCardPosition();
          }
        } else if (shouldSwipeLeft) {
          if (currentIndex === totalCards - 1) createBounceEffect('right');
          else {
            const newIndex = currentIndex + 1;
            setCurrentTicketIndex(newIndex);
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 헤더 */}
        <GNB
          rightContent={
            <View style={styles.headerRight}>
              <Button
                title={selectedFilter}
                variant="secondary"
                size="small"
                rightIcon={<Text style={styles.filterArrow}>▼</Text>}
                onPress={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                }}
                style={styles.filterButton}
              />
              {showFilterDropdown && (
                <View style={styles.filterDropdown}>
                  {['전체', '밴드', '연극/뮤지컬'].map(option => (
                    <Button
                      key={option}
                      title={option}
                      variant="tertiary"
                      size="small"
                      onPress={() => handleFilterSelect(option as any)}
                      style={{
                        ...styles.filterOption,
                        ...(selectedFilter === option ? styles.filterOptionSelected : {}),
                      }}
                      textStyle={{
                        ...styles.filterOptionText,
                        ...(selectedFilter === option ? styles.filterOptionTextSelected : {}),
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          }
        />

        {/* 서브 헤더 */}
        <View style={styles.subHeader}>
          <Text style={styles.monthTitle}>
            {getCurrentMonth()}에 관람한 공연
          </Text>
          <Text style={styles.monthSubtitle}>
            한 달의 기록, 옆으로 넘기며 다시 만나보세요 ( ♪˶´・‎ᴗ・`˶♪ )
          </Text>
        </View>

        {/* 콘텐츠 */}
        <TouchableWithoutFeedback onPress={() => setShowFilterDropdown(false)}>
          <View style={styles.contentContainer}>
            <View style={styles.cardContainer}>
              {/* Animated 점 인디케이터 */}
              <View style={styles.dots}>
                {displayTickets.map((_, i) => {
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

              {/* Animated 티켓 */}
              {hasTickets && currentTicket ? (
                <>
                  <Animated.View
                    style={[
                      styles.animatedCard,
                      { transform: pan.getTranslateTransform(), opacity },
                    ]}
                    {...panResponder.panHandlers}
                  >
                    <TouchableOpacity
                      style={[
                        styles.mainTicketCard,
                        (!currentTicket.images ||
                          currentTicket.images.length === 0) &&
                          styles.mainTicketCardNoImage,
                      ]}
                      onPress={() => handleTicketPress(currentTicket)}
                      activeOpacity={0.7}
                    >
                      {currentTicket.images && currentTicket.images.length > 0 ? (
                        <Image
                          source={{ uri: currentTicket.images[0] }}
                          style={styles.mainTicketImage}
                        />
                      ) : (
                        <View style={styles.mainTicketPlaceholder}>
                          <Text style={styles.placeholderText}>이미지 없음</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  <View style={styles.dateButtonContainer}>
                    <Button
                      title={formatDate(currentTicket.performedAt)}
                      variant="secondary"
                      size="small"
                      style={styles.dateButton}
                      onPress={() => {}}
                    />
                  </View>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.emptyCard}
                  onPress={() =>
                    navigation.navigate('AddTicket', {
                      fromAddButton: true,
                    })
                  }
                >
                  <Text style={styles.emptyCardTitle}>이번 달 티켓이 없어요{"\n"}눌러서 새 티켓을 추가해보세요</Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        </TouchableWithoutFeedback>

        {selectedTicket && (
          <TicketDetailModal
            visible={modalVisible}
            ticket={selectedTicket}
            onClose={handleCloseModal}
            isMine={true}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.systemBackground },
  safeArea: { flex: 1 },

  headerRight: { position: 'relative' },

  // 헤더 티켓 필터링
  filterButton: {
    transform: [{ translateY: 10 }],
  },
  filterArrow: { fontSize: 10, color: Colors.secondaryLabel },
  filterDropdown: {
    position: 'absolute',
    top: 52,
    right: 0,
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.lg,
    minWidth: 120,
    borderWidth: 0.5,
    borderColor: Colors.systemGray5,
    ...Shadows.large,
    zIndex: 1000,
  },
  filterOption: {
    paddingVertical: Spacing.md,
  },
  filterOptionSelected: {
    backgroundColor: Colors.secondarySystemBackground,
  },
  filterOptionText: {
    ...Typography.callout,
    color: Colors.label,
  },
  filterOptionTextSelected: {
    color: Colors.primary,
  },

  // 서브 헤더
  subHeader: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.systemBackground,
  },
  monthTitle: {
    ...Typography.title1,
    fontWeight: '500',
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  monthSubtitle: {
    ...Typography.callout,
    color: Colors.label,
    lineHeight: 20,
  },

  // 콘텐츠
  contentContainer: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: Spacing.screenPadding,
  },
  cardContainer: { alignItems: 'center', flex: 1 },
  
  // 인디케이터
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dot: { height: 6, borderRadius: 3, marginHorizontal: Spacing.xs },

  // 애니메이션 카드
  animatedCard: { alignItems: 'center' },
  mainTicketCard: {
    width: (width - 80) * 1.05,
    height: (width - 80) * 1.3 * 1.05,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: Colors.systemGray6,
    shadowColor: Colors.label,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  mainTicketCardNoImage: {
  },

  disabledCard: { opacity: 0.75 },

  mainTicketImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  mainTicketPlaceholder: {
    flex: 1,
    backgroundColor: Colors.systemGray6,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    ...Typography.callout,
    color: Colors.tertiaryLabel,
    fontWeight: '400',
  },
  emptyCard: {
    width: (width - 80) * 1.05,
    height: (width - 80) * 1.3 * 1.05,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  emptyCardTitle: {
    ...Typography.callout,
    color: Colors.tertiaryLabel,
    textAlign: 'center',
  },

  // 하단 date 버튼
  dateButtonContainer: { marginTop: 12, alignItems: 'center' },
  dateButton: {},
});

export default MainPage;
