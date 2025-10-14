import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { ticketsAtom } from '../../atoms/ticketAtoms';
import { friendsAtom } from '../../atoms/friendsAtoms';
import { userProfileAtom } from '../../atoms/userAtoms';
import { Ticket } from '../../types/ticket';
import { isPlaceholderTicket } from '../../utils/isPlaceholder';
import TicketDetailModal from '../../components/TicketDetailModal';
import TicketGrid from '../../components/TicketGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useMyTicketsData, useFriendsData, useUserProfileData } from '../../hooks/useApiData';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ComponentStyles } from '../../styles/designSystem';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// 마이 페이지 Props 타입 정의
interface MyPageProps {
  navigation: any;
}

// 헤더 높이 상수 정의
const HEADER_HEIGHT = 80;

const MyPage: React.FC<MyPageProps> = ({ navigation }) => {
  // 로컬 상태 관리 atoms 사용
  const [myTickets] = useAtom(ticketsAtom);
  const [friendsList] = useAtom(friendsAtom);
  const [profile] = useAtom(userProfileAtom);

  // 기본값으로 안전하게 처리
  const actualTickets = myTickets || [];
  const actualFriends = friendsList || [];
  const actualProfile = profile || {
    id: 'default',
    name: '사용자',
    username: '@user',
    email: 'user@example.com',
    profileImage: undefined,
    avatar: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 로딩 상태
  const isLoading = false;
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null); // 선택된 티켓
  const [modalVisible, setModalVisible] = useState(false); // 모달 표시 여부
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight(); // 하단 탭 바 높이 가져오기

  // 스크롤 애니메이션을 위한 Animated.Value
  const scrollY = useRef(new Animated.Value(0)).current;

  // 실제 등록된 티켓만 필터링하고 최신순으로 정렬 (useMemo로 최적화 및 재렌더링 보장)
  const realTickets = useMemo(() => {
    return actualTickets
      .filter((ticket: Ticket) => !isPlaceholderTicket(ticket))
      .sort((a: Ticket, b: Ticket) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // 최신순 정렬
      });
  }, [actualTickets]);

  // 🔹 디버깅용 로그
  console.log('===== MyPage 티켓 디버깅 =====');
  console.log('actualTickets:', actualTickets);
  console.log('realTickets (필터 후):', realTickets);
  console.log('TicketGrid 전달용 티켓 수:', realTickets.length);

  // 티켓 카드 클릭 시 상세 모달 열기
  const handleTicketPress = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  // 티켓 상세 모달 닫기
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTicket(null);
  };

  // 스크롤에 따른 헤더 배경 투명도 애니메이션
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.5, 0.2],
    extrapolate: 'clamp',
  });

  // 스크롤에 따른 중앙 아이디 표시 투명도 애니메이션
  const centerIdOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  // 스크롤에 따른 헤더 아이콘들 투명도 애니메이션
  const headerIconsOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 애니메이션 헤더 - 스크롤에 따라 투명도 변화 */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            height: HEADER_HEIGHT + insets.top,
            backgroundColor: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'],
            }),
          },
        ]}
      >
        {/* 왼쪽 앱 타이틀 */}
        <Animated.Text style={[styles.appTitle, { opacity: headerOpacity }]}>
          Re:cord
        </Animated.Text>

        {/* 중앙 사용자 아이디 (스크롤 시 나타남) */}
        <Animated.View
          style={[
            styles.centerIdContainer,
            {
              opacity: centerIdOpacity,
              top: insets.top + 10,
            },
          ]}
        >
          <Text style={styles.centerId}>
            {actualProfile.username || '사용자'}
          </Text>
        </Animated.View>

        {/* 오른쪽 기능 아이콘들 (친구 추가, 설정) */}
        <Animated.View
          style={[styles.headerIcons, { opacity: headerIconsOpacity }]}
        >
          {/* 친구 추가 버튼 */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('AddFriend')}
          >
            <Text style={styles.iconText}>👥+</Text>
          </TouchableOpacity>
          {/* 설정 버튼 */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingBottom: tabBarHeight },
        ]}
      >
        {/* 사용자 프로필 섹션 - 아바타, 통계, 사용자 정보 */}
        <View
          style={[styles.profileSection, { paddingTop: HEADER_HEIGHT + 32 }]}
        >
          <View style={styles.avatarContainer}>
            {actualProfile.profileImage ? (
              <Image
                source={{ uri: actualProfile.profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatarImage, styles.defaultAvatar]}>
                <Text style={styles.defaultAvatarText}>👤</Text>
              </View>
            )}
          </View>

          {/* 티켓 개수 뱃지 - 실제 등록된 티켓 수 표시 */}
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeEmoji}>🎟️</Text>
            <Text style={styles.badgeText}>{realTickets.length}</Text>
          </View>

          {/* 사용자 아이디 */}
          <Text style={styles.username}>
            {actualProfile.name || actualProfile.username || '사용자'}
          </Text>

          {/* 사용자 통계 정보 (티켓 수, 친구 수) */}
          <View style={styles.statsRow}>
            {/* 티켓 통계 */}
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>tickets</Text>
              <Text style={styles.statValue}>{realTickets.length}개</Text>
            </View>
            {/* 친구 통계 (클릭 시 친구 목록으로 이동) */}
            <TouchableOpacity
              style={styles.statBox}
              onPress={() => navigation.navigate('FriendsList')}
            >
              <Text style={styles.statLabel}>친구들</Text>
              <Text style={styles.statValue}>{actualFriends.length}명</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 티켓 그리드 섹션 */}
        <View style={styles.ticketGridSection}>
          {isLoading ? (
            <LoadingSpinner loading={true} message="티켓 로딩 중..." />
          ) : (
            <TicketGrid
              tickets={realTickets}
              onTicketPress={handleTicketPress}
            />
          )}
        </View>
      </Animated.ScrollView>

      {/* 티켓 상세 모달 */}
      {selectedTicket && (
        <TicketDetailModal
          visible={modalVisible}
          ticket={selectedTicket}
          onClose={handleCloseModal}
          isMine={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.systemBackground },

  content: { flex: 1 },
  scrollViewContent: {
    flexGrow: 1, // 스크롤뷰 콘텐츠가 화면을 채우도록 설정
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    zIndex: 10,
  },
  appTitle: {
    ...Typography.title2,
    fontWeight: '700',
    color: Colors.label,
    flex: 1,
  },
  centerIdContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  centerId: {
    ...Typography.callout,
    fontWeight: 'bold',
    color: Colors.label,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: `${Colors.secondarySystemBackground}CC`,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  iconText: {
    ...Typography.callout,
  },

  // 프로필 섹션 스타일 - 수정됨
  profileSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingBottom: Spacing.xl, // 하단 패딩 조정
    backgroundColor: 'transparent', // 배경색 제거
    // ...Shadows.large, // 그림자 제거
  },
  
  // 티켓 그리드 섹션 추가
  ticketGridSection: {
    flex: 1,
    backgroundColor: Colors.systemBackground,
    paddingTop: Spacing.lg,
  },

  avatarContainer: {
    marginBottom: Spacing.xl,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.systemGray5,
    shadowColor: Colors.label,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.xl,
    height: 32,
    paddingHorizontal: Spacing.md,
    top: -16,
    ...Shadows.medium,
  },
  badgeEmoji: {
    ...Typography.footnote,
    marginRight: Spacing.xs,
  },
  badgeText: {
    color: Colors.primary,
    ...Typography.caption1,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 40,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.callout,
    fontWeight: 'bold',
    color: Colors.label,
  },
  username: {
    ...Typography.title1,
    fontWeight: 'bold',
    color: Colors.label,
  },
  defaultAvatar: {
    backgroundColor: Colors.systemGray5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    fontSize: 48,
    color: Colors.secondaryLabel,
  },
});

export default MyPage;