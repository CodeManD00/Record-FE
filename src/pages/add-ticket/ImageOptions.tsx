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
import { ImageOptionsScreenNavigationProp, ImageOptionsRouteProp } from '../../types/reviewTypes';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ComponentStyles, Layout } from '../../styles/designSystem';
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

  // 갤러리에서 선택 (데모용)
  const handleGallerySelect = () => {
    /*
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
          navigation.navigate('TicketComplete', {
            ticketData,
            reviewData: { ...reviewData, image: undefined },
            images: [asset.uri],
          });
        }
      });
    */
    const demoImage = 'https://placekitten.com/800/800'; // 데모 이미지
    setSelectedImage(demoImage);
  };

  // 카메라 또는 갤러리 선택 UI (iOS ActionSheet, Android는 갤러리 바로)
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
                const asset: Asset | undefined = response.assets?.[0];
                if (asset?.uri) setSelectedImage(asset.uri);
              },
            );
          } else if (buttonIndex === 2) {
            // 갤러리
            handleGallerySelect();
          }
        },
      );
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
      
      Alert.alert(
        '티켓 저장 완료',
        '티켓이 성공적으로 저장되었습니다.',
        [
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
        ]
      );
    } catch (error) {
      Alert.alert('오류', '티켓 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.subtitle}>
          기억에 남는 장면을 이미지로 표현해보세요!
        </Text>

        <View style={styles.optionsContainer}>
          {/* AI 이미지 */}
          <TouchableOpacity style={styles.generateButton} onPress={handleAIImageSelect}>
            <Image
              source={require('../../assets/mic.png')}
              style={styles.buttonIcon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.optionButtonText}>AI 이미지</Text>
              <Text style={styles.optionButtonSubText}>
                AI가 만들어주는 나만의 티켓 이미지 ~
              </Text>
            </View>
          </TouchableOpacity>

          {/* 직접 선택하기 (갤러리/카메라 선택) */}
          <TouchableOpacity
            style={[styles.optionButton, styles.GalleryButton]}
            onPress={handleGalleryOrCameraSelect}
          >
            <Image
              source={require('../../assets/mic.png')}
              style={styles.buttonIcon}
            />
            <View style={styles.textContainer}>
              <Text style={[styles.optionButtonText, { color: '#000000' }]}>
                직접 선택하기
              </Text>
              <Text style={[styles.optionButtonSubText, { color: '#8E8E93' }]}>
                사진 찍기 또는 사진 보관함에서 선택하세요.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 선택된 이미지 미리보기 */}
        {selectedImage && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>선택된 이미지:</Text>
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
            />
          </View>
        )}

        {/* 다음 버튼 */}
        {selectedImage && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>다음으로</Text>
          </TouchableOpacity>
        )}
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
  },
  content: {
    padding: 24,
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

  optionsContainer: { width: '100%', gap: 16 },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonIcon: { width: 80, height: 80, marginRight: 16 },
  AIImageButton: { backgroundColor: '#B11515', height: 120 },
  GalleryButton: {
    backgroundColor: '#FFFFFF',
    height: 120,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textContainer: { flexDirection: 'column', flex: 1 },

  optionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  optionButtonSubText: { fontSize: 15, fontWeight: '400', color: '#FFFFFF' },

  previewContainer: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  previewText: {
    fontSize: 17,
    color: '#000000',
    marginBottom: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  nextButton: {
    backgroundColor: '#B11515',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 17,
  },

    generateButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#B11515', 
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },


  bottomButtonContainer: {
    padding: 24,
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