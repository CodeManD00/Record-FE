import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '../styles/designSystem';
import Button from './ui/Button';

const { height } = Dimensions.get('window');

interface ReviewSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  summaryText: string;
  title?: string; // 모달 제목을 동적으로 변경할 수 있도록 (기본값: "요약완료!")
}

const ReviewSummaryModal: React.FC<ReviewSummaryModalProps> = ({
  visible,
  onClose,
  summaryText,
  title = '정리완료!', // 기본값: "요약완료!"
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [editedText, setEditedText] = useState(summaryText);

  useEffect(() => {
    setEditedText(summaryText);
  }, [summaryText]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleCopy = async () => {
    try {
      // 클립보드에 현재 편집 중인 텍스트 복사
      // editedText는 사용자가 모달에서 수정한 최종 텍스트를 포함
      await Clipboard.setString(editedText);
      
      // 복사 성공 시 사용자에게 알림 표시
      // Alert를 사용하여 간단한 피드백 제공
      Alert.alert('복사 완료', '텍스트가 클립보드에 복사되었습니다.');
    } catch (error) {
      // 복사 실패 시 에러 처리
      console.error('클립보드 복사 실패:', error);
      Alert.alert('오류', '텍스트 복사에 실패했습니다.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Summary Content */}
              <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <TextInput
                  style={styles.summaryInput}
                  value={editedText}
                  onChangeText={setEditedText}
                  multiline
                  placeholder="요약된 내용을 수정할 수 있습니다..."
                  placeholderTextColor="#999"
                />
              </ScrollView>

              {/* Copy Button */}
              <Button
                title="정리된 후기 복사하기"
                onPress={handleCopy}
                variant="secondary"
                size="medium"
                leftIcon={<Text style={styles.copyIcon}>📋</Text>}
                style={styles.copyButton}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xxl,
    paddingTop: Spacing.inputPadding,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 50,
    minHeight: height * 0.4,
    maxHeight: height * 0.8,
    ...Shadows.large,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.xxl,
    right: Spacing.xxl,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.tertiaryLabel,
  },

  title: {
    ...Typography.title3,
    fontWeight: '400',
    color: '#000',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  contentContainer: {
    flex: 1,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.systemGray5,
  },
  summaryInput: {
    ...Typography.body,
    lineHeight: 24,
    color: '#333',
    backgroundColor: Colors.tertiarySystemBackground,
    padding: Spacing.inputPadding,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  copyButton: {
    marginTop: Spacing.sm,
  },
  copyIcon: {
    fontSize: 24,
  },
});

export default ReviewSummaryModal;
