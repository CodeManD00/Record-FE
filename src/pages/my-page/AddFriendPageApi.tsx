/**
 * 친구 추가 페이지 - API 연동 버전
 * 기존 AddFriendPage.tsx를 API 연동으로 리팩토링
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ComponentStyles, Layout } from '../../styles/designSystem';
import { Friend } from '../../types/friend';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useFriendsData } from '../../hooks/useApiData';
import {
  searchFriendsAtom,
  sendFriendRequestAtom,
  friendSearchResultsAtom,
  friendSearchLoadingAtom,
  friendSearchErrorAtom,
  searchQueryAtom,
} from '../../atoms/friendsAtomsApi';
import { userProfileAtom } from '../../atoms/userAtomsApi';

interface AddFriendPageApiProps {
  navigation: any;
}

const AddFriendPageApi: React.FC<AddFriendPageApiProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  
  // API 연동 atoms
  const [, searchFriends] = useAtom(searchFriendsAtom);
  const [, sendFriendRequest] = useAtom(sendFriendRequestAtom);
  const [searchResults] = useAtom(friendSearchResultsAtom);
  const [searchLoading] = useAtom(friendSearchLoadingAtom);
  const [searchError] = useAtom(friendSearchErrorAtom);
  const [userProfile] = useAtom(userProfileAtom);
  
  // 친구 데이터 훅 사용
  const { data: friendsData, loading: friendsLoading, refresh: refreshFriends } = useFriendsData({
    fetchOnMount: true,
    showErrorAlert: true,
  });
  
  // 타입 안전성을 위한 처리
  const friends = (friendsData as Friend[]) || [];

  // 검색 디바운싱
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchFriends(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFriends]);

  // 친구 요청 보내기
  const handleSendFriendRequest = async (user: Friend) => {
    if (sentRequests.includes(user.id)) {
      return;
    }

    try {
      setSentRequests(prev => [...prev, user.id]);
      
      const result = await sendFriendRequest({
        toUserId: user.id,
        name: user.name,
        username: user.username,
        message: `안녕하세요! ${userProfile?.name || '사용자'}입니다. 친구가 되어주세요!`,
      });

      if (result.success) {
        Alert.alert('성공', `${user.name}님에게 친구 요청을 보냈습니다.`);
      } else {
        // 실패 시 상태 롤백
        setSentRequests(prev => prev.filter(id => id !== user.id));
        Alert.alert('오류', result.error?.message || '친구 요청 전송에 실패했습니다.');
      }
    } catch (error) {
      setSentRequests(prev => prev.filter(id => id !== user.id));
      Alert.alert('오류', '친구 요청 전송 중 오류가 발생했습니다.');
    }
  };

  // 친구 프로필로 이동하는 함수
  const navigateToFriendProfile = (friend: Friend) => {
    navigation.goBack();
    setTimeout(() => {
      navigation.navigate('FriendProfile', { friend });
    }, 300);
  };

  // 프로필 공유 정보
  const myProfile = userProfile ? {
    id: userProfile.id,
    name: 'Re:cord 프로필 공유',
    username: userProfile.username,
    avatar: userProfile.avatar || '👩🏻‍💼',
  } : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>친구 추가</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 검색창 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="사용자 검색"
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 검색 결과 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <>
          {/* 내 프로필 공유 카드 */}
          {myProfile && (
          <View style={styles.userItem}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{myProfile.avatar}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{myProfile.name}</Text>
                <Text style={styles.userHandle}>{myProfile.username}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareText}>공유</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 검색 로딩 */}
        {searchLoading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner loading={true} message="검색 중..." size="small" />
          </View>
        )}

        {/* 검색 결과 */}
        {searchResults.length > 0 && searchResults.map((user: Friend) => (
          <View key={user.id} style={styles.userItem}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.avatar || user.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userHandle}>{user.username}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                sentRequests.includes(user.id) && styles.sentButton,
              ]}
              onPress={() => handleSendFriendRequest(user)}
              disabled={sentRequests.includes(user.id)}
            >
              <Text
                style={[
                  styles.addButtonText,
                  sentRequests.includes(user.id) && styles.sentButtonText,
                ]}
              >
                {sentRequests.includes(user.id) ? '보냈음' : '추가'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* 기존 친구들 섹션 */}
        {!searchQuery && friends && friends.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>내 친구들 ({friends.length})</Text>
            </View>
            {friends.map((friend: Friend) => (
              <TouchableOpacity 
                key={friend.id} 
                style={styles.userItem}
                onPress={() => navigateToFriendProfile(friend)}
                activeOpacity={0.7}
              >
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {friend.avatar || friend.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{friend.name}</Text>
                    <Text style={styles.userHandle}>{friend.username}</Text>
                  </View>
                </View>
                <View style={styles.friendBadgeContainer}>
                  <View style={styles.friendBadge}>
                    <Text style={styles.friendBadgeText}>친구</Text>
                  </View>
                  <Text style={styles.tapHint}>탭하여 프로필 보기</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* 친구 로딩 */}
        {friendsLoading && !searchQuery && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner loading={true} message="친구 목록 로딩 중..." size="small" />
          </View>
        )}

        {/* 검색 결과 없음 */}
        {searchQuery && !searchLoading && searchResults.length === 0 && !searchError && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>검색 결과가 없습니다.</Text>
          </View>
        )}

        {/* 검색 에러 */}
        {searchError && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{searchError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => searchFriends(searchQuery)}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}
        </>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.secondarySystemBackground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    height: Layout.navigationBarHeight,
    backgroundColor: Colors.systemBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: { ...Typography.title2, color: Colors.systemBlue },
  headerTitle: { ...Typography.headline, color: Colors.label, fontWeight: '600' },
  placeholder: { width: 44, height: 44 },

  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.systemBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  searchInput: {
    backgroundColor: Colors.secondarySystemBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.label,
    borderWidth: 1,
    borderColor: Colors.separator,
  },

  content: { flex: 1 },
  loadingContainer: {
    paddingVertical: Spacing.xl,
  },

  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.systemBackground,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.tertiarySystemBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: { fontSize: 24 },
  userDetails: { flex: 1 },
  userName: { ...Typography.headline, color: Colors.label, fontWeight: '600' },
  userHandle: { ...Typography.callout, color: Colors.secondaryLabel, marginTop: 2 },

  addButton: {
    backgroundColor: Colors.systemBlue,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addButtonText: { ...Typography.callout, color: Colors.white, fontWeight: '600' },
  sentButton: { backgroundColor: Colors.systemGray },
  sentButtonText: { color: Colors.white },

  shareButton: {
    backgroundColor: Colors.systemGreen,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  shareText: { ...Typography.callout, color: Colors.white, fontWeight: '600' },

  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.secondarySystemBackground,
  },
  sectionTitle: {
    ...Typography.headline,
    color: Colors.label,
    fontWeight: '600',
  },

  friendBadgeContainer: {
    alignItems: 'flex-end',
  },
  friendBadge: {
    backgroundColor: Colors.systemGreen + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.systemGreen + '40',
    marginBottom: 2,
  },
  friendBadgeText: {
    ...Typography.caption1,
    color: Colors.systemGreen,
    fontWeight: '600',
  },
  tapHint: {
    ...Typography.caption2,
    color: Colors.tertiaryLabel,
    fontSize: 10,
  },

  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.callout,
    color: Colors.tertiaryLabel,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.systemBlue,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    ...Typography.callout,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default AddFriendPageApi;
