import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { userProfileAtom, resetUserDataAtom } from '../../atoms/userAtoms';
import { ticketsAtom } from '../../atoms/ticketAtoms';
import { logoutAtom, deleteAccountAtom } from '../../atoms/userAtomsApi';
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

  // 로그아웃 atom
  const [, logout] = useAtom(logoutAtom);
  const [, resetUserData] = useAtom(resetUserDataAtom);
  const [, deleteAccount] = useAtom(deleteAccountAtom);

  // 회원탈퇴 모달 상태
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');

  //로그아웃
  const handleLogout = async () => {
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
          onPress: async () => {
            try {
              // 로그아웃 실행 (토큰 제거, 상태 초기화)
              await logout();
              
              // 사용자 데이터 초기화
              resetUserData();
              
              // 로그인 화면으로 이동
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
            } catch (error) {
              console.error('로그아웃 오류:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  //회원탈퇴 확인 다이얼로그
  const handleDeleteAccount = () => {
    if (Platform.OS === 'ios') {
      // iOS는 Alert.prompt 사용
      Alert.prompt(
        '회원 탈퇴',
        '정말 회원 탈퇴를 하시겠습니까?\n이 작업은 되돌릴 수 없습니다.\n\n비밀번호를 입력해주세요.',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '탈퇴',
            style: 'destructive',
            onPress: async (password) => {
              if (!password || password.trim() === '') {
                Alert.alert('오류', '비밀번호를 입력해주세요.');
                return;
              }
              await executeDeleteAccount(password.trim());
            },
          },
        ],
        'secure-text' // 비밀번호 입력 모드
      );
    } else {
      // Android는 커스텀 모달 사용
      setDeleteAccountModalVisible(true);
    }
  };

  // 회원탈퇴 실행
  const executeDeleteAccount = async (password: string) => {
    try {
      // 회원탈퇴 실행
      const result = await deleteAccount(password);
      
      if (result.success) {
        // 사용자 데이터 초기화
        resetUserData();
        
        // 모달 닫기
        setDeleteAccountModalVisible(false);
        setDeleteAccountPassword('');
        
        // 로그인 화면으로 이동
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' as never }],
        });
      } else {
        Alert.alert(
          '회원탈퇴 실패',
          result.error?.message || '회원탈퇴 중 오류가 발생했습니다.'
        );
      }
    } catch (error) {
      console.error('회원탈퇴 오류:', error);
      Alert.alert('오류', '회원탈퇴 중 오류가 발생했습니다.');
    }
  };

  // Android용 회원탈퇴 모달에서 확인 버튼 클릭
  const handleDeleteAccountConfirm = () => {
    if (!deleteAccountPassword || deleteAccountPassword.trim() === '') {
      Alert.alert('오류', '비밀번호를 입력해주세요.');
      return;
    }
    executeDeleteAccount(deleteAccountPassword.trim());
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

      {/* Android용 회원탈퇴 비밀번호 입력 모달 */}
      <Modal
        visible={deleteAccountModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setDeleteAccountModalVisible(false);
          setDeleteAccountPassword('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>회원 탈퇴</Text>
            <Text style={styles.modalMessage}>
              정말 회원 탈퇴를 하시겠습니까?{'\n'}
              이 작업은 되돌릴 수 없습니다.{'\n\n'}
              비밀번호를 입력해주세요.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="비밀번호"
              placeholderTextColor={Colors.tertiaryLabel}
              value={deleteAccountPassword}
              onChangeText={setDeleteAccountPassword}
              secureTextEntry
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setDeleteAccountModalVisible(false);
                  setDeleteAccountPassword('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={handleDeleteAccountConfirm}
              >
                <Text style={styles.modalButtonDeleteText}>탈퇴</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // 회원탈퇴 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.large,
  },
  modalTitle: {
    ...Typography.title2,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.md,
  },
  modalMessage: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  modalInput: {
    ...ComponentStyles.input,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  modalButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.systemGray5,
  },
  modalButtonDelete: {
    backgroundColor: '#FF3B30',
  },
  modalButtonCancelText: {
    ...Typography.callout,
    fontWeight: '600',
    color: Colors.label,
  },
  modalButtonDeleteText: {
    ...Typography.callout,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default SettingsPage;
