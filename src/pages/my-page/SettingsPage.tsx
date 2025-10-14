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
import { Colors, Typography, Spacing, BorderRadius, Shadows, ComponentStyles, Layout } from '../../styles/designSystem';

interface SettingsPageProps {
  navigation: any;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [userProfile] = useAtom(userProfileAtom);

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
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* 화면 구성 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 사용자 프로필 */}
        <View style={styles.userSection}>
          {/* 사용자 프로필 수정 */}
          <TouchableOpacity 
            style={styles.userAvatarContainer}
            onPress={() => navigation.navigate('PersonalInfoEdit')}
          >
            {userProfile.profileImage ? (
              <Image source={{ uri: userProfile.profileImage }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            )}
            
            <View style={styles.editProfileOverlay}>
              <Text style={styles.editProfileText}>✏️</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userId}>{userProfile.userId}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          
          {/* 공개/비공개 계정 설정 */}
          {userProfile.isAccountPrivate && (
            <View style={styles.privateAccountBadge}>
              <Text style={styles.privateAccountText}>🔒 비공개 계정</Text>
            </View>
          )}
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
  backButtonText: {
    ...Typography.body,
    color: Colors.systemBlue,
    fontWeight: '400',
  },
  headerTitle: {
    ...Typography.headline,
    color: Colors.label,
  },
  placeholder: {
    position: 'absolute',
    right: Spacing.lg,
    width: 44,
    height: 44,
  },
  content: {
    flex: 1,
  },
  userSection: {
    backgroundColor: Colors.systemBackground,
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    marginBottom: Spacing.sectionSpacing,
    ...Shadows.small,
  },
  userAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.systemGray5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
  },
  editProfileOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.systemBackground,
  },
  editProfileText: {
    fontSize: 12,
  },
  userName: {
    ...Typography.title2,
    fontWeight: '700',
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  userId: {
    ...Typography.callout,
    fontWeight: '500',
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.footnote,
    color: Colors.tertiaryLabel,
    marginBottom: Spacing.sm,
  },
  privateAccountBadge: {
    backgroundColor: Colors.systemYellow + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.systemYellow + '40',
  },
  privateAccountText: {
    ...Typography.caption1,
    fontWeight: '500',
    color: Colors.systemYellow,
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
