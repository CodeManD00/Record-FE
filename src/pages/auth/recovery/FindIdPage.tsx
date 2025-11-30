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
import { authService } from '../../../services/api';
import { Button } from '../../../components/ui';
import { Input } from '../../../components/ui';

const FindIdPage = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /** 아이디 찾기 요청 */
  const handleFindId = async () => {
    if (!email.trim()) {
      Alert.alert('입력 오류', '이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📨 아이디 찾기 요청:', email);

      const result = await authService.findIdByEmail(email);

      console.log('🔍 서버 응답:', result);

      if (!result.success) {
        Alert.alert(
          '오류',
          result.error?.message || '아이디 찾기에 실패했습니다.'
        );
      } else {
        Alert.alert(
          '아이디 찾기 완료',
          '가입하신 이메일로 아이디 정보가 전송되었습니다.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('❌ 아이디 찾기 에러:', error);
      Alert.alert(
        '오류 발생',
        '아이디 찾기 중 문제가 발생했습니다. 다시 시도해주세요.'
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
            <Text style={styles.title}>아이디 찾기</Text>
            <Text style={styles.subtitle}>가입 시 사용한 이메일을 입력해주세요.</Text>
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

            <Button
              title={isLoading ? '처리 중...' : '아이디 찾기'}
              onPress={handleFindId}
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
  keyboardView: { flex: 1 },
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
  linkText: { color: Colors.primary, ...Typography.subheadline },
});

export default FindIdPage;
