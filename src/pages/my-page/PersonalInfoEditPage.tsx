import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Switch,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useAtom } from 'jotai';
import { userProfileAtom, updateUserProfileAtom } from '../../atoms/userAtoms';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ComponentStyles, Layout } from '../../styles/designSystem';
import ModalHeader from '../../components/ModalHeader';
import { useUserProfileData } from '../../hooks/useApiData';
import { useEffect } from 'react';

interface PersonalInfoEditPageProps {
  navigation: any;
}

// 개인정보 수정
const PersonalInfoEditPage: React.FC<PersonalInfoEditPageProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // 사용자 프로필 데이터 가져오기 (백엔드에서 자동으로 로드)
  const { data: profile } = useUserProfileData({
    autoFetch: true,
  });
  
  const [userProfile] = useAtom(userProfileAtom);
  const [, updateUserProfile] = useAtom(updateUserProfileAtom);
  
  // 백엔드에서 가져온 프로필이 있으면 사용, 없으면 atom 값 사용
  const actualProfile = profile || userProfile;

  //현재 프로필 이미지의 경로
  const [profileImage, setProfileImage] = useState<string | null>(actualProfile.profileImage || null);
  //사용자 닉네임
  const [name, setName] = useState(actualProfile.name || '');
  //사용자 아이디
  const [userId, setUserId] = useState(actualProfile.userId || actualProfile.id || '');
  //사용자 이메일
  const [email, setEmail] = useState(actualProfile.email || '');
  //계정 공개여부
  const [isAccountPrivate, setIsAccountPrivate] = useState(actualProfile.isAccountPrivate || false);
  
  // 프로필이 업데이트되면 폼 필드도 업데이트
  useEffect(() => {
    if (actualProfile) {
      if (actualProfile.profileImage) setProfileImage(actualProfile.profileImage);
      if (actualProfile.name) setName(actualProfile.name);
      if (actualProfile.userId || actualProfile.id) setUserId(actualProfile.userId || actualProfile.id || '');
      if (actualProfile.email) setEmail(actualProfile.email);
      if (actualProfile.isAccountPrivate !== undefined) setIsAccountPrivate(actualProfile.isAccountPrivate);
    }
  }, [actualProfile]);
  //비밀번호 관련
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //프로필 이미지 변경
  const handleProfileImagePick = () => {
    //사진 선택 시 제한
    const options = {
      mediaType: 'photo' as const, //사진만 선택 가능하도록
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };
    //프로필 이미지 접근(갤러리열고, 선택한 결과를 콜백)
    launchImageLibrary(options, (response: ImagePickerResponse) => {
      //사용자가 취소했더나 에러 발생 시, 아무 동작도 하지 않음.
      if (response.didCancel || response.errorMessage) {
        return;
      }
      //선택된 이미지가 있을 때, 실행
      if (response.assets && response.assets[0]) {
        //선택한 이미지의 uri를 profileImage에 저장
        setProfileImage(response.assets[0].uri || null);
      }
    });
  };

  // 저장 관리
  const handleSave = () => {
    // 이름 유효성 검사
    if (!name.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.');
      return;
    }

    // 비밀번호 변경 시 유효성 검사
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword && !currentPassword) {
      Alert.alert('오류', '현재 비밀번호를 입력해주세요.');
      return;
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // Jotai atom을 통한 상태 업데이트
    const updateResult = updateUserProfile({
      profileImage: profileImage || undefined,
      name: name.trim(),
      userId,
      email,
      isAccountPrivate,
    });
    
    // 업데이트 실패 시 에러 처리
    if (!updateResult.success) {
      Alert.alert('오류', updateResult.error?.message || '프로필 업데이트에 실패했습니다.');
      return;
    }

    Alert.alert(
      '저장 완료',
      '개인정보가 성공적으로 수정되었습니다.',
      [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  // 수정 필드
  const editFields = [
    {
      id: 1,
      title: '이름',
      value: name,
      onChangeText: setName,
      placeholder: '이름을 입력하세요',
      keyboardType: 'default' as const,
      secureTextEntry: false,
    },
    {
      id: 2,
      title: '아이디',
      value: userId,
      onChangeText: setUserId,
      placeholder: '아이디를 입력하세요',
      keyboardType: 'default' as const,
      secureTextEntry: false,
    },
    {
      id: 3,
      title: '이메일',
      value: email,
      onChangeText: setEmail,
      placeholder: '이메일을 입력하세요',
      keyboardType: 'email-address' as const,
      secureTextEntry: false,
    },
  ];
  
  // 비밀번호 필드
  const passwordFields = [
    {
      id: 1,
      title: '현재 비밀번호',
      value: currentPassword,
      onChangeText: setCurrentPassword,
      placeholder: '현재 비밀번호를 입력하세요',
      secureTextEntry: true,
    },
    {
      id: 2,
      title: '새 비밀번호',
      value: newPassword,
      onChangeText: setNewPassword,
      placeholder: '새 비밀번호를 입력하세요',
      secureTextEntry: true,
    },
    {
      id: 3,
      title: '새 비밀번호 확인',
      value: confirmPassword,
      onChangeText: setConfirmPassword,
      placeholder: '새 비밀번호를 다시 입력하세요',
      secureTextEntry: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* 헤더 */}
      <ModalHeader
        title="개인정보 수정"
        onBack={() => navigation.goBack()}
        rightAction={{
          text: '저장',
          onPress: handleSave,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* 프로필 이미지 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>프로필 사진</Text>
            <View style={styles.profileImageContainer}>
            <TouchableOpacity
              style={styles.profileImageWrapper}
              onPress={handleProfileImagePick}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.defaultProfileImage}>
                  <Text style={styles.defaultProfileImageText}>👤</Text>
                </View>
              )}
              <View style={styles.editImageOverlay}>
                <Text style={styles.editImageText}>✏️</Text>
              </View>
            </TouchableOpacity>
            </View>
          </View>

          {/* 기본 정보 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            
            <View style={styles.fieldContainer}>
            {editFields.map((field) => (
              <View key={field.id} style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>{field.title}</Text>
                <TextInput
                  style={styles.textInput}
                  value={field.value}
                  onChangeText={field.onChangeText}
                  placeholder={field.placeholder}
                  keyboardType={field.keyboardType}
                  secureTextEntry={field.secureTextEntry}
                  placeholderTextColor={Colors.tertiaryLabel}
                />
              </View>
            ))}
            </View>
          </View>

          {/* 계정 설정 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>계정 설정</Text>
            <View style={styles.privacyContainer}>
            <View style={styles.privacyItem}>
              <View style={styles.privacyLeft}>
                <Text style={styles.privacyTitle}>계정 공개 설정</Text>
                <Text style={styles.privacyDescription}>
                  {isAccountPrivate 
                    ? '비공개 계정입니다. 승인된 사용자만 프로필을 볼 수 있습니다.' 
                    : '공개 계정입니다. 모든 사용자가 프로필을 볼 수 있습니다.'}
                </Text>
              </View>
              <Switch
                value={isAccountPrivate}
                onValueChange={setIsAccountPrivate}
                trackColor={{ false: Colors.systemGray4, true: Colors.primary }}
                thumbColor={Colors.systemBackground}
              />
            </View>
            </View>
          </View>

          {/* 비밀번호 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>비밀번호 변경</Text>
            <Text style={styles.sectionSubtitle}>
              비밀번호를 변경하지 않으려면 비워두세요
            </Text>
            <View style={styles.fieldContainer}>
            {passwordFields.map((field) => (
              <View key={field.id} style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>{field.title}</Text>
                <TextInput
                  style={styles.textInput}
                  value={field.value}
                  onChangeText={field.onChangeText}
                  placeholder={field.placeholder}
                  secureTextEntry={field.secureTextEntry}
                  placeholderTextColor={Colors.tertiaryLabel}
                />
              </View>
            ))}
            </View>
          </View>

          {/* 비밀번호 가이드라인 */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>비밀번호 설정 가이드</Text>
            <Text style={styles.guidelineText}>• 8자 이상 입력해주세요</Text>
            <Text style={styles.guidelineText}>• 영문, 숫자, 특수문자를 포함해주세요</Text>
            <Text style={styles.guidelineText}>• 개인정보와 관련된 내용은 피해주세요</Text>
          </View>
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
  formContainer: {
    padding: Spacing.screenPadding,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.title3,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.lg,
  },
  sectionSubtitle: {
    ...Typography.footnote,
    color: Colors.tertiaryLabel,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  fieldContainer: {
    gap: Spacing.xl,
  },
  fieldItem: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.callout,
    fontWeight: '500',
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  textInput: {
    ...ComponentStyles.input,
  },
  guidelinesContainer: {
    backgroundColor: Colors.systemGray6,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  guidelinesTitle: {
    ...Typography.callout,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  guidelineText: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.systemGray5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileImageText: {
    fontSize: 48,
    color: Colors.secondaryLabel,
  },

  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.systemBackground,
  },
  editImageText: {
    fontSize: 12,
  },

  changeImageButton: {
    ...ComponentStyles.secondaryButton,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  changeImageButtonText: {
    ...Typography.footnote,
    fontWeight: '500',
    color: Colors.secondaryLabel,
  },
  privacyContainer: {
    marginTop: Spacing.sm,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  privacyLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  privacyTitle: {
    ...Typography.callout,
    fontWeight: '500',
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  privacyDescription: {
    ...Typography.footnote,
    color: Colors.tertiaryLabel,
    lineHeight: 20,
  },
});

export default PersonalInfoEditPage;
