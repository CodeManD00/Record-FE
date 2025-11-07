/**
 * 오디오 녹음 유틸리티
 * react-native-audio-recorder-player 사용
 */

import { Platform, PermissionsAndroid } from 'react-native';

// 타입 정의
interface AudioRecorderPlayer {
  startRecorder: (path?: string) => Promise<string>;
  stopRecorder: () => Promise<string>;
  addRecordBackListener: (callback: (data: any) => void) => void;
  removeRecordBackListener: () => void;
}

/**
 * 오디오 녹음 매니저
 */
class AudioRecorderManager {
  private audioRecorderPlayer: AudioRecorderPlayer | null = null;
  private isRecording: boolean = false;
  private recordingPath: string | null = null;

  /**
   * 녹음 권한 요청 (Android)
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        if (
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else {
          console.warn('권한이 거부되었습니다');
          return false;
        }
      } catch (err) {
        console.warn('권한 요청 오류:', err);
        return false;
      }
    }
    // iOS는 자동으로 권한 요청
    return true;
  }

  /**
   * 녹음 시작
   */
  async startRecording(): Promise<boolean> {
    try {
      // 권한 확인
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('녹음 권한이 필요합니다');
      }

      // 라이브러리 동적 로드
      if (!this.audioRecorderPlayer) {
        const AudioRecorderPlayerModule = require('react-native-audio-recorder-player');
        this.audioRecorderPlayer = new AudioRecorderPlayerModule.default();
      }

      // 녹음 경로 설정
      const path = Platform.select({
        ios: 'recording.m4a',
        android: 'sdcard/recording.mp4', // Android는 mp4 확장자 사용
      });

      // 녹음 시작
      const uri = await this.audioRecorderPlayer!.startRecorder(path);
      this.recordingPath = uri;
      this.isRecording = true;

      console.log('녹음 시작:', uri);
      return true;
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 녹음 중지 및 파일 경로 반환
   */
  async stopRecording(): Promise<{ uri: string; name: string } | null> {
    try {
      if (!this.audioRecorderPlayer || !this.isRecording) {
        console.warn('녹음 중이 아닙니다');
        return null;
      }

      const result = await this.audioRecorderPlayer.stopRecorder();
      this.audioRecorderPlayer.removeRecordBackListener();
      this.isRecording = false;

      console.log('녹음 중지:', result);

      if (result && this.recordingPath) {
        const fileName = Platform.select({
          ios: 'recording.m4a',
          android: 'recording.mp4',
        }) || 'recording.m4a';

        return {
          uri: Platform.OS === 'ios' ? result : `file://${result}`,
          name: fileName,
        };
      }

      return null;
    } catch (error) {
      console.error('녹음 중지 실패:', error);
      this.isRecording = false;
      return null;
    }
  }

  /**
   * 녹음 상태 확인
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * 녹음 진행 상황 리스너 추가
   */
  addRecordingListener(callback: (data: any) => void): void {
    if (this.audioRecorderPlayer) {
      this.audioRecorderPlayer.addRecordBackListener(callback);
    }
  }

  /**
   * 정리
   */
  cleanup(): void {
    if (this.audioRecorderPlayer) {
      this.audioRecorderPlayer.removeRecordBackListener();
    }
    this.isRecording = false;
    this.recordingPath = null;
  }
}

// 싱글톤 인스턴스
export const audioRecorder = new AudioRecorderManager();
export default audioRecorder;
