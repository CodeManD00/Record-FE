//check
import React, { useState, useRef, useMemo } from 'react';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { ticketsAtom } from '../../atoms/ticketAtoms';
import { fetchMyTicketsAtom, myTicketsAtom } from '../../atoms/ticketsAtomsApi';
import { friendsAtom, fetchFriendsAtom, friendCountAtom, fetchFriendCountAtom } from '../../atoms';
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
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { fetchMyProfileAtom } from '../../atoms/userAtomsApi';

interface MyPageProps {
  navigation: any;
}

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  isAccountPrivate: boolean;
}

const MyPage: React.FC<MyPageProps> = ({ navigation }) => {
  const [myTickets] = useAtom(ticketsAtom);
  const [apiTickets] = useAtom(myTicketsAtom);
  const [, fetchMyTickets] = useAtom(fetchMyTicketsAtom);
  const [friendsList] = useAtom(friendsAtom);
  const [, fetchFriends] = useAtom(fetchFriendsAtom);
  const [friendCount] = useAtom(friendCountAtom);
  const [, fetchFriendCount] = useAtom(fetchFriendCountAtom);

  const {
    data: profileData,
    loading: profileLoading,
  } = useUserProfileData();

  const [, fetchMyProfile] = useAtom(fetchMyProfileAtom);

  // 화면 포커스 시 프로필, 티켓, 친구 목록, 친구 수 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchMyProfile(true);
      fetchMyTickets(true); // 티켓 데이터도 백엔드에서 가져오기
      fetchFriends(true); // 친구 목록도 백엔드에서 가져오기
      // 친구 수는 userId가 있을 때만 조회
      if (actualProfile?.id) {
        fetchFriendCount(actualProfile.id, true);
      }
    }, [fetchMyProfile, fetchMyTickets, fetchFriends, fetchFriendCount, actualProfile?.id])
  );

  const profile = profileData as UserProfile | undefined;

  // API 티켓이 있으면 우선 사용, 없으면 로컬 티켓 사용
  const actualTickets: Ticket[] = (apiTickets.length > 0 ? apiTickets : myTickets || []) as Ticket[];
  const actualFriends = (friendsList || []) as any[];
  // 친구 수는 API에서 가져온 값 사용, 없으면 친구 목록 길이 사용
  const displayFriendCount = friendCount ?? actualFriends.length;

  const actualProfile: UserProfile = profile || {
    id: '',
    email: '',
    nickname: '사용자',
    profileImage: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAccountPrivate: false,
  };

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const scrollY = useRef(new Animated.Value(0)).current;

  const realTickets = useMemo(() => {
    return [...actualTickets].sort((a: Ticket, b: Ticket) => {
      return (
        (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
        (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      );
    });
  }, [actualTickets]);

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner loading />
      </SafeAreaView>
    );
  }

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GNB
        centerTitle={actualProfile.nickname}
        centerTitleOpacity={centerIdOpacity}
        headerStyle={{
          backgroundColor: headerOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'],
          }),
        }}
        rightContent={
          <Animated.View style={[styles.headerIcons, { opacity: headerIconsOpacity }]}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => navigation.navigate('PerformanceArchive' as never)}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                {/* 시계 원형 */}
                <Circle cx="12" cy="12" r="9" stroke="#1C1C1E" strokeWidth="2" fill="none" />
                {/* 시침 (10시 방향) - 짧고 두꺼운 */}
                <Line x1="12" y1="12" x2="10.5" y2="9" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round" />
                {/* 분침 (4시 방향) - 길고 얇은 */}
                <Line x1="12" y1="12" x2="15" y2="15" stroke="#1C1C1E" strokeWidth="1.5" strokeLinecap="round" />
                {/* 반시계 방향 화살표 호 (1시에서 11시까지, 시계 외곽) */}
                <Path
                  d="M 18.5 6.5 A 10.5 10.5 0 0 0 5.5 6.5"
                  stroke="#1C1C1E"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* 화살표 머리 (1시 방향) */}
                <Path
                  d="M 18.5 6.5 L 17 5 L 18.5 3.5"
                  stroke="#1C1C1E"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
              <Image source={require('../../assets/settings.png')} style={styles.iconImage} />
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
            {(() => {
              const resolvedUrl = resolveImageUrl(actualProfile.profileImage);
              return resolvedUrl ? (
                <Image source={{ uri: resolvedUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, styles.defaultAvatar]}>
                  <Text style={styles.defaultAvatarText}>👤</Text>
                </View>
              );
            })()}
          </View>

          {/* 티켓 개수 */}
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeEmoji}>🎟️</Text>
            <Text style={styles.badgeText}>{realTickets.length}</Text>
          </View>

          {/* 닉네임 */}
          <Text style={styles.username}>{actualProfile.nickname}</Text>

          {/* 통계 */}
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
              <Text style={styles.statValue}>{displayFriendCount}명</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 티켓 그리드 */}
        <View style={styles.ticketGridSection}>
          <TicketGrid tickets={realTickets} onTicketPress={(t) => {
            setSelectedTicket(t);
            setModalVisible(true);
          }} />
        </View>
      </Animated.ScrollView>

      {selectedTicket && (
        <TicketDetailModal
          visible={modalVisible}
          ticket={selectedTicket}
          onClose={() => setModalVisible(false)}
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
    alignItems: 'center',
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

  profileSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
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
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    ...Typography.largeTitle,
    fontWeight: '500',
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
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: 40,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
  },
  statValue: {
    ...Typography.callout,
    fontWeight: '700',
  },

  username: {
    ...Typography.title1,
    fontWeight: '600',
  },

  ticketGridSection: {
    paddingTop: Spacing.xs,
  },
});

export default MyPage;
