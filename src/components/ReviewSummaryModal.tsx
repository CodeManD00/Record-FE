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
} from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '../styles/designSystem';

const { height } = Dimensions.get('window');

interface ReviewSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  summaryText: string;
}

const ReviewSummaryModal: React.FC<ReviewSummaryModalProps> = ({
  visible,
  onClose,
  summaryText,
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

  const handleCopy = () => {
    // TODO: Implement copy to clipboard
    console.log('Copy to clipboard:', editedText);
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
              <Text style={styles.title}>요약완료!</Text>

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
              <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                <Text style={styles.copyIcon}>📋</Text>
                <Text style={styles.copyButtonText}>요약된 후기를 복사해서 사용하세요</Text>
              </TouchableOpacity>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: height * 0.4,
    maxHeight: height * 0.8,
    ...Shadows.large,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    marginBottom: 16,
  },
  summaryInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  copyButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  copyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  copyButtonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ReviewSummaryModal;
