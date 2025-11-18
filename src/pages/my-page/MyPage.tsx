import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { ticketsAtom } from '../../atoms/ticketAtoms';
import { friendsAtom } from '../../atoms/friendsAtoms';
import { Ticket } from '../../types/ticket';
import TicketDetailModal from '../../components/TicketDetailModal';
import GNB from '../../components/GNB';
import TicketGrid from '../../components/TicketGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useUserProfileData } from '../../hooks/useApiData';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../styles/designSystem';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// 마이 페이지 Props 타입 정의
interface MyPageProps {
  navigation: any;
}

// 백엔드 사용자 프로필 타입 (SignupRequest 기준)
interface UserProfile {
  id: string;          // 로그인 아이디
  email: string;       // 이메일
  nickname: string;    // 닉네임
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

const MyPage: React.FC<MyPageProps> = ({ navigation }) => {
  // 로컬 상태 관리 atoms 사용
  const [myTickets] = useAtom(ticketsAtom);
  const [friendsList] = useAtom(friendsAtom);

  // 사용자 프로필 데이터 가져오기
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
  } = useUserProfileData();

  // 안전한 타입 캐스팅
  const profile = profileData as UserProfile | undefined;

  // 기본값으로 안전하게 처리
  const actualTickets: Ticket[] = (myTickets || []) as Ticket[];
  const actualFriends = (friendsList || []) as any[];

  // 사용자 프로필 (없을 때 기본값)
  const actualProfile: UserProfile = profile || {
    id: '',
    email: '',
    nickname: '사용자',
    profileImage: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAccountPrivate: Boolean,
  };

  // 로딩 상태
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  // 스크롤 애니메이션을 위한 Animated.Value
  const scrollY = useRef(new Animated.Value(0)).current;

  // 최신순으로 정렬
  const realTickets = useMemo(() => {
    return [...actualTickets].sort((a: Ticket, b: Ticket) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [actualTickets]);

  // 디버깅용 로그
  console.log('===== MyPage 티켓 디버깅 =====');
  console.log('actualTickets:', actualTickets);
  console.log('realTickets (정렬 후):', realTickets);
  console.log('TicketGrid 전달용 티켓 수:', realTickets.length);

  // 티켓 모달 열기
  const handleTicketPress = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  // 티켓 모달 닫기
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTicket(null);
  };

  // 헤더 애니메이션
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.5, 0.2],
    extrapolate: 'clamp',
  });

  const centerIdOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const headerIconsOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  // 프로필 로딩 처리
  if (profileLoading) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LoadingSpinner loading />
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 애니메이션 헤더 - 스크롤에 따라 투명도 변화 */}
      <GNB
        // 헤더 중앙에는 닉네임이 보이게, 없으면 아이디
        centerTitle={actualProfile.nickname || actualProfile.id}
        centerTitleOpacity={centerIdOpacity}
        headerStyle={{
          backgroundColor: headerOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'],
          }),
        }}
        rightContent={
          <Animated.View
            style={[styles.headerIcons, { opacity: headerIconsOpacity }]}
          >
            {/* 친구 추가 버튼 */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('AddFriend')}
            >
              <Image
                source={require('../../assets/person_add.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
            {/* 설정 버튼 */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Image
                source={require('../../assets/settings.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
          </Animated.View>
        }
      />

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
          { paddingBottom: tabBarHeight + insets.bottom },
        ]}
      >
        {/* 사용자 프로필 섹션 */}
        <View style={styles.profileSection}>
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

          {/* 티켓 개수 뱃지 */}
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeEmoji}>🎟️</Text>
            <Text style={styles.badgeText}>{realTickets.length}</Text>
          </View>

          {/* 사용자 닉네임 */}
          <Text style={styles.username}>{actualProfile.nickname}</Text>

          {/* 사용자 통계 */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>tickets</Text>
              <Text style={styles.statValue}>{realTickets.length}개</Text>
            </View>
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
          <TicketGrid tickets={realTickets} onTicketPress={handleTicketPress} />
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
  scrollViewContent: { flexGrow: 1 },

  headerIcons: {
    flexDirection: 'row',
    gap: Spacing.md,
    transform: [{ translateY: 10 }],
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: `${Colors.secondarySystemBackground}CC`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },

  // 프로필 섹션 스타일
  profileSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingBottom: Spacing.xxxl,
    borderBottomColor: Colors.systemGray5,
    borderBottomWidth: 0.5,
  },

  avatarContainer: {},
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.systemGray5,
  },

  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.systemGray5,
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.xl,
    height: 32,
    paddingHorizontal: Spacing.md,
    top: -20,
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

  // 티켓 그리드 섹션
  ticketGridSection: {
    flex: 1,
    backgroundColor: Colors.systemBackground,
    paddingTop: Spacing.xs,
  },
});

export default MyPage;
