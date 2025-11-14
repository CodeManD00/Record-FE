/**
 * React Native 설정 파일
 * 
 * 일시적으로 react-native-nitro-sound를 제외하여 iOS 빌드 문제를 우회합니다.
 * iOS 빌드 문제가 해결되면 이 설정을 제거하거나 수정하세요.
 */
module.exports = {
  dependencies: {
    // react-native-nitro-sound를 일시적으로 제외합니다.
    // iOS 빌드 문제가 해결되면 이 줄을 제거하거나 주석 처리하세요.
    'react-native-nitro-sound': {
      platforms: {
        ios: null, // iOS에서 제외
        // android: null, // Android에서도 제외하려면 주석을 해제하세요
      },
    },
  },
};

