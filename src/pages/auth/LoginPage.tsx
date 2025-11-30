//check
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/designSystem';
import { authService } from '../../services/auth/authService';
import { useNavigation } from '@react-navigation/native';
import { useAtom } from 'jotai';
import { fetchMyProfileAtom } from '../../atoms/userAtomsApi';
import { Button } from '../../components/ui';
import { Input } from '../../components/ui';

const LoginPage = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [, fetchMyProfile] = useAtom(fetchMyProfileAtom);

  const handleLogin = async () => {
    // 입력 검증
    console.log("🔵 handleLogin 실행됨, id:", id, "pw:", password);
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
      const result = await authService.signIn(id, password);
      
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
      console.error('로그인 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      Alert.alert(
        '로그인 실패',
        `예상치 못한 오류가 발생했습니다.\n\n${errorMessage}`,
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
            <Text style={styles.appTitle}>Record</Text>
            <Text style={styles.appSubtitle}>지금 로그인하고 공연 후기를 작성해보세요.</Text>
          </View>

          {/* Login Form Section */}
          <View style={styles.formSection}>
            {/* ID Input */}
            <Input
              label="아이디"
              placeholder="아이디를 입력하세요"
              value={id}
              onChangeText={setId}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              containerStyle={styles.inputContainer}
              size="large"
            />

            {/* Password Input */}
            <Input
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              containerStyle={styles.inputContainer}
              size="large"
            />

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
            <View style={styles.loginButtonContainer}>
              <Button
                title="로그인"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading
                }
                size="large"
              />
            </View>

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
              © 2025 Record. All rights reserved.
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
    paddingTop: 120,
    paddingBottom: 70,
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
  },

  formSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },

  recoveryLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  recoveryLink: {
    paddingHorizontal: Spacing.sm,
  },
  recoveryLinkText: {
    color: Colors.primary,
    ...Typography.subheadline,
  },
  recoveryLinkDivider: {
    color: Colors.secondaryLabel,
    ...Typography.subheadline,
  },


  loginButtonContainer: {
    marginTop: Spacing.lg,
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  signupText: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
  },
  signupLink: {
    ...Typography.subheadline,
    color: Colors.primary,
    fontWeight: '500',
    paddingHorizontal: Spacing.xs,
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
