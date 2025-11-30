import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/designSystem';
import { apiClient } from '../../../services/api/client';
import { Button } from '../../../components/ui';
import { Input } from '../../../components/ui';

const FindPasswordPage = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // UI 유지용 (백엔드에서 사용하지 않음)
  const [isLoading, setIsLoading] = useState(false);

  const handleFindPassword = async () => {
    if (!email.trim()) {
      Alert.alert('입력 오류', '이메일을 입력해주세요.');
      return;
    }
    if (!username.trim()) {
      Alert.alert('입력 오류', '아이디를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 임시 비밀번호 발급 요청:', { email });

      const result = await apiClient.post('/auth/forgot/temporary-password', {
        email: email,
      });

      console.log('📩 서버 응답:', result);

      if (result.success) {
        Alert.alert(
          '임시 비밀번호 발급 완료',
          '입력하신 이메일로 임시 비밀번호가 발송되었습니다.',
          [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          '오류',
          result.error?.message || '임시 비밀번호 발급에 실패했습니다.'
        );
      }
    } catch (error) {
      console.error('❌ 임시 비밀번호 발급 요청 오류:', error);
      Alert.alert(
        '오류 발생',
        '임시 비밀번호 발급 중 문제가 발생했습니다.\n다시 시도해주세요.'
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
          <View style={styles.header}>
            <Text style={styles.title}>비밀번호 찾기</Text>
            <Text style={styles.subtitle}>
              가입 시 사용한 이메일과 아이디를 입력해주세요.
            </Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>이메일</Text>
              <Input
                placeholder="record@gmail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                size="large"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>아이디</Text>
              <Input
                placeholder="아이디 입력"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                size="large"
              />
            </View>

            <Button
              title={isLoading ? '처리 중...' : '임시 비밀번호 받기'}
              onPress={handleFindPassword}
              loading={isLoading}
              disabled={isLoading}
              size="large"
              style={styles.submitButton}
            />

            <View style={styles.linksContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>로그인 화면으로 돌아가기</Text>
              </TouchableOpacity>
            </View>
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
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },

  title: {
    ...Typography.title1,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    textAlign: 'center',
  },

  formSection: { width: '100%' },
  inputContainer: { marginTop: Spacing.lg},
  inputLabel: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: Spacing.xl,
  },

  linksContainer: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  linkText: {
    color: Colors.primary,
    ...Typography.subheadline,
  },
});

export default FindPasswordPage;
