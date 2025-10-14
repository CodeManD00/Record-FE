import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { friendsMapAtom, removeFriendAtom, receivedFriendRequestsAtom, respondToFriendRequestAtom } from '../../atoms';
import { Friend, FriendRequest } from '../../types/friend';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ComponentStyles, Layout } from '../../styles/designSystem';

interface FriendsListPageProps {
  navigation: any;
}

const FriendsListPage: React.FC<FriendsListPageProps> = ({ navigation }) => {
  const [friendsMap] = useAtom(friendsMapAtom);
  const [, removeFriend] = useAtom(removeFriendAtom);
  const [friendRequests] = useAtom(receivedFriendRequestsAtom);
  const [, respondToRequest] = useAtom(respondToFriendRequestAtom);
  
  const friends = Array.from(friendsMap.values());

  const friendRequestsCount = friendRequests.length;
  const friendsCount = friends.length;

  // 친구 삭제
  const handleDeleteFriend = (friendId: string) => {
    Alert.alert('친구 삭제', '정말로 친구를 삭제하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => removeFriend({ friendId }),
      },
    ]);
  };

  // 친구 요청 거절
  const handleRejectRequest = (request: FriendRequest) => {
    Alert.alert(
      '친구 요청 거절',
      `${request.name}님의 친구 요청을 거절하시겠어요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '거절',
          style: 'destructive',
          onPress: () => {
            try {
              respondToRequest({ requestId: request.id, accept: false });
              Alert.alert('완료', '친구 요청을 거절했습니다.');
            } catch (error) {
              Alert.alert('오류', '친구 요청 거절 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  // 친구 프로필로 이동 (모달 닫기 → 풀스크린 열기)
  const handleNavigateToFriendProfile = (friend: Friend) => {
    // 먼저 현재 모달을 닫기
    navigation.goBack();
    
    // 모달 닫기 애니메이션이 완료된 후 풀스크린 열기
    setTimeout(() => {
      navigation.navigate('FriendProfile', { friend });
    }, 300); // 모달 닫기 애니메이션 시간 고려
  };

  // 친구 요청 수락
  const handleAcceptRequest = (request: FriendRequest) => {
    Alert.alert(
      '친구 요청 수락',
      `${request.name}님의 친구 요청을 수락하시겠어요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '수락',
          onPress: () => {
            try {
              respondToRequest({ requestId: request.id, accept: true });
              Alert.alert('성공', `${request.name}님과 친구가 되었습니다! 🎉`);
            } catch (error) {
              Alert.alert('오류', '친구 요청 수락 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>친구</Text>
        <TouchableOpacity
          style={styles.addFriendButton}
          onPress={() => navigation.navigate('AddFriend')}
        >
          <Text style={styles.addFriendIcon}>👥+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 친구 요청 섹션 */}
        <View style={styles.friendsSection}>
          <View style={styles.friendsSectionHeader}>
            <Text style={styles.friendsSectionTitle}>
              친구 요청 ({friendRequestsCount})
            </Text>

            <TouchableOpacity
              style={styles.sentFriendButton}
              onPress={() => navigation.navigate('SentRequests')}
            >
              <Text style={styles.sentFriendText}>보낸 요청</Text>
            </TouchableOpacity>
          </View>

          {friendRequests.map(request => (
            <View key={request.id} style={styles.friendItem}>
              {/* 프로필 클릭 가능 */}
              <TouchableOpacity
                style={styles.friendInfo}
                onPress={() => handleNavigateToFriendProfile(request)}
              >
                <Image
                  source={{ uri: request.avatar }}
                  style={styles.friendAvatar}
                />
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{request.name}</Text>
                  <Text style={styles.friendUsername}>{request.username}</Text>
                </View>
              </TouchableOpacity>

              {/* 수락 / 거절 버튼 */}
              <View style={styles.requestButtons}>
                <TouchableOpacity
                  style={[styles.requestButton, styles.acceptButton]}
                  onPress={() => handleAcceptRequest(request)}
                >
                  <Text style={styles.requestButtonText}>수락</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.requestButton, styles.rejectButton]}
                  onPress={() => handleRejectRequest(request)}
                >
                  <Text style={styles.requestButtonText}>거절</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* 친구 목록 섹션 */}
        <View style={styles.friendsSection}>
          <View style={styles.friendsSectionHeader}>
            <Text style={styles.friendsSectionTitle}>
              내 친구들 ({friendsCount})
            </Text>
            <View style={styles.placeholder} />
          </View>
          {friends.map(friend => (
            <View key={friend.id} style={styles.friendItem}>
              <TouchableOpacity
                style={styles.friendInfo}
                onPress={() => handleNavigateToFriendProfile(friend)}
              >
                <Image
                  source={{ uri: friend.avatar }}
                  style={styles.friendAvatar}
                />
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendUsername}>{friend.username}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuButtonLeft}
                onPress={() => handleDeleteFriend(friend.id)}
              >
                <Text style={styles.menuIcon}>⋯</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
    zIndex: 1,
  },
  backButtonText: { ...Typography.body, color: Colors.systemBlue, fontWeight: '400' },
  headerTitle: {
    ...Typography.headline,
    color: Colors.label,
  },
  addFriendButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFriendIcon: { ...Typography.headline, color: Colors.systemBlue, fontWeight: '600' },
  content: { flex: 1, backgroundColor: Colors.secondarySystemBackground },
  placeholder: {
    width: 44,
    height: 44,
  },

  friendsSection: {
    ...ComponentStyles.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    overflow: 'hidden',
    padding: 0,
  },
  friendsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  friendsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },

  sentFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sentFriendText: {
    color: '#0b0b0bff',
    fontSize: 14,
    fontWeight: '600',
  },

  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  friendInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#E9ECEF',
  },
  friendDetails: { flex: 1 },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 2,
  },
  friendUsername: { fontSize: 14, color: '#6C757D' },

  menuButtonLeft: { marginRight: 10 },
  menuIcon: { fontSize: 20, color: '#ADB5BD', fontWeight: 'bold' },

  requestButtons: { flexDirection: 'row' },
  requestButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  acceptButton: { backgroundColor: '#28A745' },
  rejectButton: { backgroundColor: '#DC3545' },
  requestButtonText: { color: '#FFFFFF', fontWeight: '600' },
});

export default FriendsListPage;