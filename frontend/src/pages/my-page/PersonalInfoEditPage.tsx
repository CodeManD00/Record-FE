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

interface PersonalInfoEditPageProps {
  navigation: any;
}

// 개인정보 수정
const PersonalInfoEditPage: React.FC<PersonalInfoEditPageProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [userProfile] = useAtom(userProfileAtom);
  const [, updateUserProfile] = useAtom(updateUserProfileAtom);
  
  // 프로필 수정 폼의 각 입력 필드와 연결된 로컬 상태 
  // useState로 선언한 값들은 해당 컴포넌트 안에서만 유효함
  // 컴포넌트가 사라지면 이 값들도 없어짐

  //현재 프로필 이미지의 경로
  const [profileImage, setProfileImage] = useState<string | null>(userProfile.profileImage || null);
  //사용자 닉네임
  const [name, setName] = useState(userProfile.name);
  //사용자 아이디
  const [userId, setUserId] = useState(userProfile.userId);
  //사용자 이메일
  const [email, setEmail] = useState(userProfile.email);
  //계정 공개여부
  const [isAccountPrivate, setIsAccountPrivate] = useState(userProfile.isAccountPrivate);
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
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 수정</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.editImageText}>📷</Text>
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
                  placeholderTextColor="#ADB5BD"
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
                trackColor={{ false: Colors.systemGray4, true: Colors.systemGreen }}
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
                  placeholderTextColor="#ADB5BD"
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
  saveButton: {
    position: 'absolute',
    right: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.systemBlue,
    borderRadius: BorderRadius.md,
    minWidth: 44,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    ...Typography.headline,
    color: Colors.systemBackground,
  },
  content: {
    flex: 1,
  },
  section: {
    ...ComponentStyles.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sectionSpacing,
  },
  sectionTitle: {
    ...Typography.title3,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...Typography.footnote,
    color: Colors.tertiaryLabel,
    marginBottom: Spacing.xl,
  },
  fieldContainer: {
    gap: 16,
  },
  fieldItem: {
    gap: 8,
  },
  fieldLabel: {
    ...Typography.footnote,
    fontWeight: '500',
    color: Colors.secondaryLabel,
  },
  textInput: {
    ...ComponentStyles.input,
    borderColor: Colors.systemGray4,
    backgroundColor: Colors.systemBackground,
  },
  guidelinesContainer: {
    backgroundColor: Colors.secondarySystemBackground,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sectionSpacing,
    marginBottom: Spacing.xxxl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  guidelinesTitle: {
    ...Typography.callout,
    fontWeight: '600',
    color: Colors.secondaryLabel,
    marginBottom: Spacing.md,
  },
  guidelineText: {
    ...Typography.footnote,
    color: Colors.tertiaryLabel,
    marginBottom: Spacing.xs,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.systemGray5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileImageText: {
    fontSize: 40,
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.systemBackground,
  },
  editImageText: {
    fontSize: 16,
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
    marginTop: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  privacyLeft: {
    flex: 1,
    marginRight: 16,
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
