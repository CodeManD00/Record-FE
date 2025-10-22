import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { imageGenerationService, ImageGenerationRequest } from '../../services/api';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../styles/designSystem';

interface AIImageResultsProps {
  navigation: any;
  route?: {
    params?: {
      ticketData?: any;
      reviewData?: {
        rating: number;
        reviewText: string;
      };
      images?: string[];
      settings?: {
        backgroundColor: string;
        includeText: boolean;
        imageStyle: string;
        aspectRatio: string;
      };
    };
  };
}

const { width } = Dimensions.get('window');
const cardWidth = width - 48;
const cardHeight = (cardWidth * 5) / 4;

const AIImageResults: React.FC<AIImageResultsProps> = ({ navigation, route }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);

  const ticketData = route?.params?.ticketData;
  const reviewData = route?.params?.reviewData;
  const existingImages = route?.params?.images || [];
  const settings = route?.params?.settings;

  useEffect(() => {
    handleGenerateAIImage();
  }, []);

  const handleGenerateAIImage = async () => {
    setIsGenerating(true);

    try {
      let enhancedPrompt = '공연 후기 기반 AI 이미지';
      if (settings?.backgroundColor && settings.backgroundColor !== '자동') {
        enhancedPrompt += `, ${settings.backgroundColor} 배경`;
      }
      if (settings?.includeText === false) {
        enhancedPrompt += ', 텍스트나 글자 없이';
      }
      if (settings?.imageStyle && settings.imageStyle !== '사실적') {
        enhancedPrompt += `, ${settings.imageStyle} 스타일`;
      }

      console.log('Enhanced Prompt:', enhancedPrompt);

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));

      const seed = ticketData?.title
        ? ticketData.title.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
        : Math.floor(Math.random() * 10000);

      const mockGeneratedImageUrl = `https://picsum.photos/seed/${seed}/${Math.floor(cardWidth)}/${Math.floor(cardHeight)}`;
      console.log('생성된 이미지 URL:', mockGeneratedImageUrl);
      console.log('시드 값:', seed);

      setGeneratedImage(mockGeneratedImageUrl);
      setGenerationHistory((prev) => [mockGeneratedImageUrl, ...prev]);

        Alert.alert('성공', 'AI 이미지가 성공적으로 생성되었습니다!');
      } else {
        console.error('❌ 이미지 생성 실패:', result.error);
        Alert.alert('오류', result.error?.message || 'AI 이미지 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 이미지 생성 중 예외 발생:', error);
      Alert.alert('오류', 'AI 이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectImage = () => {
    if (generatedImage) {
      navigation.navigate('TicketComplete', {
        ticketData,
        reviewData,
        images: [generatedImage],
      });
    }
  };

  const handleRegenerateImage = () => {
    setGeneratedImage(null);
    handleGenerateAIImage();
  };

  const handleSelectFromHistory = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이미지 생성</Text>
      </View>

      {isGenerating ? (
        <View style={styles.loadingFullScreen}>
          <ActivityIndicator size="large" color="#b11515" />
          <Text style={styles.generatingTitle}>AI 이미지 생성 중...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {generatedImage && (
            <View style={styles.generatedImageContainer}>
              <Image
                source={{ uri: generatedImage }}
                style={styles.generatedImage}
                resizeMode="cover"
              />
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={handleRegenerateImage}
                >
                  <Text style={styles.regenerateButtonText}>다시 생성하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={handleSelectImage}
                >
                  <Text style={styles.selectButtonText}>이미지 선택하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {generationHistory.length > 1 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>생성 히스토리</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.historyContainer}
              >
                {generationHistory.slice(1).map((imageUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyImageWrapper}
                    onPress={() => handleSelectFromHistory(imageUrl)}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={[
                        styles.historyImage,
                        generatedImage === imageUrl &&
                          styles.selectedHistoryImage,
                      ]}
                      resizeMode="cover"
                    />
                    {generatedImage === imageUrl && (
                      <View style={styles.selectedOverlay}>
                        <Text style={styles.selectedText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  // 헤더
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

  // 본문
  content: { flex: 1 },

  loadingFullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    //height: Dimensions.get('window').height,
  },

  generatingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
  },

  generatedImageContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },

  generatedImage: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 12,
    marginBottom: 20,
  },

  // 버튼 두 개
  actionButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },

  regenerateButton: {
    width: (cardWidth - 12) / 2,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  regenerateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  selectButton: {
    width: (cardWidth - 12) / 2,
    backgroundColor: '#b11515',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 생성 히스토리
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },

  historyContainer: { marginTop: 12 },

  historyImageWrapper: { position: 'relative', marginRight: 12 },

  historyImage: {
    width: 80,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  selectedHistoryImage: { borderColor: '#b11515' },

  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedText: {
    fontSize: 24,
    color: '#b11515',
    fontWeight: 'bold',
  },
});

export default AIImageResults;
