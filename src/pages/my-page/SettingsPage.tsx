import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { userProfileAtom } from '../../atoms/userAtoms';
import { ticketsAtom } from '../../atoms/ticketAtoms';
import { isPlaceholderTicket } from '../../utils/isPlaceholder';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ComponentStyles, Layout } from '../../styles/designSystem';
import ModalHeader from '../../components/ModalHeader';
import { useUserProfileData } from '../../hooks/useApiData';

interface SettingsPageProps {
  navigation: any;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // 사용자 프로필 데이터 가져오기 (백엔드에서 자동으로 로드)
  const { data: profile } = useUserProfileData({
    autoFetch: true,
  });
  
  const [userProfile] = useAtom(userProfileAtom);
  const [tickets] = useAtom(ticketsAtom);
  
  // 백엔드에서 가져온 프로필이 있으면 사용, 없으면 atom 값 사용
  const actualProfile = profile || userProfile;
  
  // 실제 티켓 개수 계산
  const realTickets = tickets.filter(ticket => !isPlaceholderTicket(ticket));

  //로그아웃
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            // 로그아웃 로직 구현
            console.log('로그아웃 처리');
          },
        },
      ]
    );
  };

  //회원탈퇴
  const handleDeleteAccount = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말 회원 탈퇴를 하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: () => {
            // 회원 탈퇴 로직 구현
            console.log('회원 탈퇴 처리');
          },
        },
      ]
    );
  };

  //설정 페이지 리스트
  const settingsOptions = [
    {
      id: 1,
      title: '개인정보 수정',
      icon: '👤',
      onPress: () => navigation.navigate('PersonalInfoEdit'),
      showArrow: true,
    },
    {
      id: 2,
      title: '히스토리',
      icon: '📋',
      onPress: () => navigation.navigate('History'),
      showArrow: true,
    },
    {
      id: 3,
      title: '로그아웃',
      icon: '🚪',
      onPress: handleLogout,
      showArrow: false,
      textColor: '#FF6B6B',
    },
    {
      id: 4,
      title: '회원 탈퇴',
      icon: '⚠️',
      onPress: handleDeleteAccount,
      showArrow: false,
      textColor: '#FF3B30',
    },
  ];
  

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* 헤더 */}
      <ModalHeader
        title="설정"
        onBack={() => navigation.goBack()}
      />
      
      {/* 화면 구성 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 사용자 프로필 */}
        <View style={styles.userSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('PersonalInfoEdit')}
          >
            {actualProfile.profileImage ? (
              <Image source={{ uri: actualProfile.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, styles.defaultAvatar]}>
                <Text style={styles.defaultAvatarText}>👤</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 사용자 이름 */}
          <Text style={styles.username}>{actualProfile.name || actualProfile.username || '사용자'}</Text>
        </View>

        {/* 설정 리스트 */}
        <View style={styles.optionsContainer}>
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={option.onPress}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.optionTitle,
                    option.textColor && { color: option.textColor },
                  ]}
                >
                  {option.title}
                </Text>
              </View>
              {option.showArrow && (
                <Text style={styles.optionArrow}>→</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 앱 버젼 */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>버전 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondarySystemBackground,
  },

  content: {
    flex: 1,
  },
  userSection: {
    backgroundColor: Colors.systemBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingBottom: Spacing.xxxl,
    borderBottomColor: Colors.systemGray5,
    borderBottomWidth: 0.5,
    marginBottom: Spacing.sectionSpacing,
  },
  avatarContainer: {},
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.systemGray5,
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

  username: {
    ...Typography.title1,
    fontWeight: 'bold',
    color: Colors.label,
    paddingVertical: 12,
  },
  optionsContainer: {
    ...ComponentStyles.card,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  optionTitle: {
    ...Typography.callout,
    fontWeight: '500',
    color: Colors.label,
  },
  optionArrow: {
    ...Typography.callout,
    color: Colors.systemGray2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    ...Typography.footnote,
    color: Colors.tertiaryLabel,
  },
});

export default SettingsPage;
