import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ActionSheetIOS,
  ScrollView,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  launchImageLibrary,
  launchCamera,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';
import { useAtom } from 'jotai';
import { addTicketAtom, TicketStatus } from '../../atoms';
import {
  ImageOptionsScreenNavigationProp,
  ImageOptionsRouteProp,
} from '../../types/reviewTypes';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentStyles,
  Layout,
} from '../../styles/designSystem';
import { Ticket, CreateTicketData } from '../../types/ticket';

// Types are now imported from reviewTypes

const ImageOptions = () => {
  const navigation = useNavigation<ImageOptionsScreenNavigationProp>();
  const route = useRoute<ImageOptionsRouteProp>();
  const { ticketData, reviewData } = route.params;
  const [, addTicket] = useAtom(addTicketAtom);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // AI 이미지 생성 - 기본 설정으로 바로 시작
  const handleAIImageSelect = () => {
    const defaultSettings = {
      backgroundColor: '자동',
      includeText: true,
      imageStyle: '사실적',
      aspectRatio: '정사각형',
    };

    navigation.navigate('AIImageResults', {
      ticketData,
      reviewData,
      images: [],
      settings: defaultSettings,
    });
  };

  // 갤러리에서 선택
  const handleGallerySelect = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.error(response.errorMessage);
        return;
      }

      const asset: Asset | undefined = response.assets?.[0];
      if (asset?.uri) {
        console.log('갤러리에서 선택한 이미지:', asset.uri);
        setSelectedImage(asset.uri);
        // 바로 TicketComplete로 이동
        navigation.navigate('TicketComplete', {
          ticketData,
          reviewData,
          images: [asset.uri],
        });
      }
    });
  };

  // 카메라 또는 갤러리 선택 UI
  const handleGalleryOrCameraSelect = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '사진 찍기', '사진 보관함에서 선택'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            // 카메라
            launchCamera(
              {
                mediaType: 'photo',
                maxHeight: 2000,
                maxWidth: 2000,
                quality: 0.8,
              },
              response => {
                if (response.didCancel) return;
                if (response.errorCode) {
                  console.error(response.errorMessage);
                  return;
                }
                const asset: Asset | undefined = response.assets?.[0];
                if (asset?.uri) {
                  console.log('카메라로 촬영한 이미지:', asset.uri);
                  setSelectedImage(asset.uri);
                  // 바로 TicketComplete로 이동
                  navigation.navigate('TicketComplete', {
                    ticketData,
                    reviewData,
                    images: [asset.uri],
                  });
                }
              },
            );
          } else if (buttonIndex === 2) {
            // 갤러리
            handleGallerySelect();
          }
        },
      );
    } else {
      // Android - 갤러리만 지원
      handleGallerySelect();
    }
  };

  // 다음 화면으로 이동
  const handleNext = () => {
    if (!selectedImage) return;
    navigation.navigate('TicketComplete', {
      ticketData,
      reviewData,
      images: [selectedImage],
    });
  };

  // 이미지 없이 완료
  const handleSkipImages = () => {
    try {
      const ticketToSave = {
        ...ticketData,
        review: {
          reviewText: reviewData.reviewText || reviewData.text || '',
        },
        createdAt: new Date(),
        images: [], // 빈 배열로 설정
      };

      addTicket(ticketToSave);

      Alert.alert('티켓 저장 완료', '티켓이 성공적으로 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            // Navigate back to main screen (reset navigation stack)
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' as never }],
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert('오류', '티켓 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>티켓 이미지 선택하기</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.contextMessage}>
          <Text style={styles.contextSubtitle}>
            기억에 남는 장면을 이미지로 표현해보세요
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {/* AI 이미지 */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleAIImageSelect}
          >
            <View style={styles.buttonContent}>
              <View style={styles.textContainer}>
                <Text style={styles.optionButtonText}>AI 이미지</Text>
                <Text style={styles.optionButtonSubText}>
                  AI가 만들어주는 나만의 티켓 이미지 ~
                </Text>
              </View>
              <Image
                source={require('../../assets/mic.png')}
                style={styles.buttonIcon}
              />
            </View>
          </TouchableOpacity>

          {/* 직접 선택하기 */}
          <TouchableOpacity
            style={[styles.optionButton]}
            onPress={handleGalleryOrCameraSelect}
          >
            <View style={styles.buttonContent}>
              <View style={styles.textContainer}>
                <Text style={[styles.optionButtonText, { color: '#000000' }]}>
                  직접 선택하기
                </Text>
                <Text
                  style={[styles.optionButtonSubText, { color: '#8E8E93' }]}
                >
                  사진 찍기 또는 사진 보관함에서 선택하세요.
                </Text>
              </View>
              <Image
                source={require('../../assets/mic.png')}
                style={styles.buttonIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 이미지 스킵 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkipImages}>
          <Text style={styles.skipButtonText}>이미지 없이 완료</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.systemBackground,
    ...Shadows.small,
    zIndex: 1,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.secondarySystemBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
    zIndex: 2,
  },
  backButtonText: {
    ...Typography.title3,
    color: Colors.label,
    fontWeight: 'bold',
  },

  headerTitle: {
    ...Typography.headline,
    color: Colors.label,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  placeholder: {
    position: 'absolute',
    right: Spacing.lg,
    width: 44,
    height: 44,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    marginBottom: 30,
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'left',
    lineHeight: 22,
  },

  // 안내 문구
  contextMessage: {
    backgroundColor: Colors.secondarySystemBackground,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.systemGray5,
  },
  contextSubtitle: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    textAlign: 'left',
    lineHeight: 20,
  },

  // 선택 버튼
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },

  optionButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 4,
  },
  generateButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#B11515',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 4,
  },

  optionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  optionButtonSubText: { 
    fontSize: 15, 
    fontWeight: '400', 
    color: '#FFFFFF' 
  },

  buttonContent: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },

  buttonIcon: {
    width: 50,
    height: 90,
    marginTop: 32,
    marginBottom: 16,
  },

  textContainer: { 
    flexDirection: 'column', 
  },

  // 이미지 skip 버튼
  bottomButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  skipButton: {
    backgroundColor: '#8E8E93',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ImageOptions;
