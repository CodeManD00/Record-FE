import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/designSystem';
import { authService } from '../../services/auth/authService';
import { useNavigation } from '@react-navigation/native';
import { useAtom } from 'jotai';
import { fetchMyProfileAtom } from '../../atoms/userAtomsApi';

const LoginPage = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [, fetchMyProfile] = useAtom(fetchMyProfileAtom);

  const handleLogin = async () => {
    // 입력 검증
    if (!id.trim()) {
      Alert.alert('입력 오류', '아이디를 입력해주세요.', [{ text: '확인' }]);
      return;
    }
    if (!password.trim()) {
      Alert.alert('입력 오류', '비밀번호를 입력해주세요.', [{ text: '확인' }]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.signInWithId(id, password);
      
      if (result.success) {
        // 로그인 성공 후 사용자 프로필 정보 가져오기
        try {
          await fetchMyProfile(true);  // force: true로 최신 정보 가져오기
        } catch (error) {
          console.error('프로필 정보를 가져오는데 실패했습니다:', error);
          // 프로필 로드 실패해도 로그인은 성공한 것으로 처리
        }
        
        // Navigate to main app after successful login
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' as never }],
        });
      } else {
        Alert.alert(
          '로그인 실패',
          result.error?.message || '로그인 중 오류가 발생했습니다.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      Alert.alert(
        '로그인 실패',
        '예상치 못한 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/cat.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appTitle}>Record</Text>
            <Text style={styles.appSubtitle}>로그인하여 시작하세요</Text>
          </View>

          {/* Login Form Section */}
          <View style={styles.formSection}>
            {/* ID Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>아이디</Text>
              <TextInput
                style={styles.input}
                placeholder="아이디를 입력하세요"
                placeholderTextColor={Colors.placeholderText}
                value={id}
                onChangeText={setId}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={Colors.placeholderText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Account Recovery Links */}
            <View style={styles.recoveryLinksContainer}>
              <TouchableOpacity 
                style={styles.recoveryLink}
                onPress={() => navigation.navigate('FindId' as never)}
              >
                <Text style={styles.recoveryLinkText}>아이디 찾기</Text>
              </TouchableOpacity>
              <Text style={styles.recoveryLinkDivider}>|</Text>
              <TouchableOpacity 
                style={styles.recoveryLink}
                onPress={() => navigation.navigate('FindPassword' as never)}
              >
                <Text style={styles.recoveryLinkText}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>로그인</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>계정이 없으신가요? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
                <Text style={styles.signupLink}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Record. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.systemBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.xxxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
    ...Shadows.large,
  },
  appTitle: {
    ...Typography.largeTitle,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  appSubtitle: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.subheadline,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.systemBackground,
    borderWidth: 1,
    borderColor: Colors.systemGray5,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    ...Typography.body,
    color: Colors.label,
    ...Shadows.small,
  },
  recoveryLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  recoveryLink: {
    paddingHorizontal: Spacing.sm,
  },
  recoveryLinkText: {
    color: Colors.primary,
    ...Typography.caption1,
  },
  recoveryLinkDivider: {
    color: Colors.secondaryLabel,
    ...Typography.caption1,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.button,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...Typography.headline,
    color: Colors.white,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
  },
  signupLink: {
    ...Typography.subheadline,
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.caption2,
    color: Colors.quaternaryLabel,
  },
});

export default LoginPage;
