// === ImageOptions.tsx (OCRPage UI 패턴으로 개선) ===

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
import { addTicketAtom, TicketStatus, basePromptAtom } from '../../atoms';
import { sttService } from '../../services/api/sttService';
import { Button } from '../../components/ui';
import ModalHeader from '../../components/ModalHeader';
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
} from '../../styles/designSystem';
import { Ticket, CreateTicketData } from '../../types/ticket';

const ImageOptions = () => {
  const navigation = useNavigation<ImageOptionsScreenNavigationProp>();
  const route = useRoute<ImageOptionsRouteProp>();
  const { ticketData, reviewData } = route.params;
  const [, addTicket] = useAtom(addTicketAtom);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  /**
   * 🎨 AI 이미지 생성
   * 1. /reviews/summarize 호출하여 5줄 영어 요약 생성
   * 2. basePrompt로 저장
   * 3. AIImageResults로 이동
   */
  const [, setBasePrompt] = useAtom(basePromptAtom);

  const handleAIImageSelect = async () => {
    const reviewText = reviewData.reviewText || reviewData.text || '';
    
    if (!reviewText.trim()) {
      Alert.alert('오류', '후기 내용이 없습니다.');
      return;
    }

    try {
      // /reviews/summarize 호출하여 5줄 영어 요약 생성
      const result = await sttService.summarizeReview(reviewText);

      if (result.success && result.data) {
        // summary 필드에서 basePrompt 추출 (5줄 영어 요약)
        const summary = result.data.summary;
        
        if (summary) {
          // basePrompt로 저장
          setBasePrompt(summary);
          console.log('✅ basePrompt 저장:', summary);

          const defaultSettings = {
            backgroundColor: '자동',
            includeText: true,
            imageStyle: '사실적',
            aspectRatio: '정사각형',
          };

          navigation.navigate('AIImageResults', {
            ticketData,
            reviewData: {
              reviewText: reviewText,
            },
            images: [],
            settings: defaultSettings,
          });
        } else {
          Alert.alert('오류', '요약 생성에 실패했습니다.');
        }
      } else {
        Alert.alert('오류', result.error?.message || '요약 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('요약 생성 오류:', error);
      Alert.alert('오류', '요약 생성 중 문제가 발생했습니다.');
    }
  };

  /**
   * 📷 갤러리 선택
   */
  const handleGallerySelect = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
      quality: 1.0,
      includeExtra: true,
      maxHeight: 2000,
      maxWidth: 2000,
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
        console.log('갤러리 선택:', asset.uri);
        setSelectedImage(asset.uri);

        navigation.navigate('TicketComplete', {
          ticketData,
          reviewData: {
            reviewText: reviewData.reviewText || reviewData.text || '',
          },
          images: [asset.uri],
        });
      }
    });
  };

  /**
   * 📸 카메라 or 갤러리 선택
   */
  const handleGalleryOrCameraSelect = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '사진 찍기', '사진 보관함에서 선택'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            // Camera
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
                  console.log('카메라 촬영:', asset.uri);
                  setSelectedImage(asset.uri);

                  navigation.navigate('TicketComplete', {
                    ticketData,
                    reviewData: {
                      reviewText: reviewData.reviewText || reviewData.text || '',
                    },
                    images: [asset.uri],
                  });
                }
              },
            );
          } else if (buttonIndex === 2) {
            handleGallerySelect();
          }
        },
      );
    } else {
      handleGallerySelect();
    }
  };

  /**
   * 📌 이미지 없이 완료 (저장)
   */
  const handleSkipImages = () => {
    try {
      const ticketToSave = {
        ...ticketData,
        review: {
          reviewText: reviewData.reviewText || reviewData.text || '',
        },
        createdAt: new Date(),
        images: [],
      };

      addTicket(ticketToSave);

      Alert.alert('티켓 저장 완료', '티켓이 성공적으로 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => {
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
      <ModalHeader
        title="티켓 이미지 선택하기"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 안내 메시지 */}
        <View style={styles.contextMessage}>
          <Text style={styles.contextSubtitle}>
            기억에 남는 장면을 이미지로 표현해보세요
          </Text>
        </View>

        {/* 이미지 선택 버튼 */}
        <View style={styles.buttonContainer}>
          {/* AI 이미지 생성 */}
          <TouchableOpacity
            style={[styles.imageButton, styles.aiButton]}
            onPress={handleAIImageSelect}
          >
            <Text style={styles.aiButtonText}>AI 이미지</Text>
          </TouchableOpacity>

          {/* 직접 선택하기 */}
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handleGalleryOrCameraSelect}
          >
            <Text style={styles.imageButtonText}>직접 선택하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 이미지 스킵 */}
      <View style={styles.bottomButtonContainer}>
        <Button
          title="이미지 없이 완료"
          variant="secondary"
          onPress={handleSkipImages}
          style={styles.skipButton}
        />
      </View>
    </SafeAreaView>
  );
};

// === OCRPage 기반 스타일 ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondarySystemBackground,
  },
  content: {
    flex: 1,
  },
  contextMessage: {
    backgroundColor: Colors.secondarySystemBackground,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.systemGray5,
  },
  contextSubtitle: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    textAlign: 'left',
  },


  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
    marginVertical: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.secondarySystemBackground,
    ...Shadows.small,
  },
  backButtonText: {
    ...Typography.title3,
    color: Colors.label,
    fontWeight: '500',
  },
  
  imageButton: {
    flex: 1,
    backgroundColor: Colors.systemBackground,
    borderWidth: 1,
    borderColor: Colors.systemGray4,
    borderRadius: BorderRadius.lg,
    minHeight: 140,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  aiButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  imageButtonText: {
    ...Typography.body,
    color: Colors.label,
    textAlign: 'center',
  },
  aiButtonText: {
    ...Typography.body,
    color: Colors.systemBackground,
    textAlign: 'center',
    fontWeight: '500',
  },

  bottomButtonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    backgroundColor: Colors.systemBackground,
    borderTopWidth: 0.5,
    borderTopColor: Colors.systemGray5,
    alignItems: 'center',
  },
  skipButton: {
    width: '100%',
  },
});

export default ImageOptions;
