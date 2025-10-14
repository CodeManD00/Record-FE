import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  Share,
  Animated,
  TouchableWithoutFeedback,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ticket, UpdateTicketData } from '../types/ticket';
import { useAtom } from 'jotai';
import {
  deleteTicketAtom,
  updateTicketAtom,
  TicketStatus,
  TICKET_STATUS_LABELS,
  getTicketByIdAtom,
  ticketsAtom,
} from '../atoms';
import { TicketDetailModalProps } from '../types/componentProps';
import PrivacySelectionModal from './PrivacySelectionModal';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '../styles/designSystem';

const { width } = Dimensions.get('window');

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  visible,
  ticket: propTicket,
  onClose,
  isMine = true,
}) => {
  const [, deleteTicket] = useAtom(deleteTicketAtom);
  const [, updateTicket] = useAtom(updateTicketAtom);
  const [getTicketById] = useAtom(getTicketByIdAtom);
  const [allTickets] = useAtom(ticketsAtom);

  const ticket = propTicket ? getTicketById(propTicket.id) || propTicket : null;
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState<Partial<UpdateTicketData>>(
    {},
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

  const genreOptions = [
    { label: '밴드', value: '밴드' },
    { label: '연극/뮤지컬', value: '연극/뮤지컬' },
  ];

  // Scroll 관련 state
  const scrollY = useRef(new Animated.Value(0)).current;
  const [currentScale, setCurrentScale] = useState(1);
  const [cardHeight, setCardHeight] = useState(0);

  // scale 계산
  const scale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.65],
    extrapolate: 'clamp',
  });

  const headerHeight = 200;
  const translateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -((1 - 0.65) * cardHeight) / 2 + headerHeight / 2],
    extrapolate: 'clamp',
  });

  // scrollY 값 추적해서 currentScale 업데이트
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      const newScale = 1 - (1 - 0.65) * (value / 150);
      setCurrentScale(newScale);
    });
    return () => scrollY.removeListener(listenerId);
  }, []);

  // flip 이벤트
  const handleCardTap = () => {
    if (isEditing) return;
    if (currentScale < 0.99) return; // 축소 상태에서는 뒤집기 막기
    setIsFlipped(!isFlipped);
  };

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      const newScale = 1 - (1 - 0.65) * (value / 150);
      setCurrentScale(newScale);
    });
    return () => scrollY.removeListener(listenerId);
  }, []);

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;
  const detailsAnimation = useRef(new Animated.Value(1)).current;

  if (!ticket) return null;

  const getStatusColor = (status: TicketStatus) =>
    status === TicketStatus.PUBLIC ? '#d7fffcff' : '#FF6B6B';

  // 카드 자동 회전 (isEditing 또는 isFlipped 상태에 따라 자동 뒤집힘/복귀)
  useEffect(() => {
    const toValue = isEditing || isFlipped ? 1 : 0;
    Animated.timing(flipAnimation, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [isEditing, isFlipped]);

  // 모달 열릴 때 탭 하여 후기 보기 힌트 표시
  useEffect(() => {
    if (visible) {
      hintOpacity.setValue(1);
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: true,
      }).start();
      setIsEditing(false);
      setIsFlipped(false);
      setEditedTicket({});
      setShowDatePicker(false);
      setShowTimePicker(false);
      setShowDropdown(false);
      setShowGenreModal(false);
      setShowPrivacyModal(false);
      setIsDetailsExpanded(true);
      detailsAnimation.setValue(1);
    }
  }, [visible]);

  // 디테일 섹션 아코디언 애니메이션
  useEffect(() => {
    Animated.timing(detailsAnimation, {
      toValue: isDetailsExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDetailsExpanded]);

  const toggleDetails = () => {
    setIsDetailsExpanded(!isDetailsExpanded);
  };

  // 티켓 공유 handle 함수
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${ticket.title}\n ${ticket.artist}\n ${
          ticket.place
        }\n ${ticket.performedAt.toLocaleDateString('ko-KR')}`,
        title: `${ticket.title} 티켓`,
      });
    } catch {
      Alert.alert('공유 실패', '티켓을 공유할 수 없습니다.');
    }
  };

  // 티켓 수정 handle 함수
  const handleEdit = () => {
    if (!ticket) return;
    setIsEditing(true);
    setShowDropdown(false);
    setEditedTicket({
      title: ticket.title,
      artist: ticket.artist,
      place: ticket.place,
      performedAt: ticket.performedAt,
      review: ticket.review
        ? {
            reviewText: ticket.review.reviewText,
            createdAt: ticket.review.createdAt,
          }
        : undefined,
    });
  };

  // 티켓 수정 함수
  const handleSaveEdit = async () => {
    if (!ticket || !editedTicket) return;

    const title =
      editedTicket.title !== undefined ? editedTicket.title : ticket.title;
    const genre =
      editedTicket.genre !== undefined ? editedTicket.genre : ticket.genre;

    if (!title?.trim()) {
      Alert.alert('오류', '제목은 필수입니다.');
      return;
    }

    try {
      const result = updateTicket(ticket.id, editedTicket);
      if (result?.success) {
        setIsEditing(false);
        setEditedTicket({});
        setShowDropdown(false);
        Alert.alert('완료', '티켓이 수정되었습니다.', [
          {
            text: '확인',
            onPress: () => onClose(),
          },
        ]);
      } else {
        Alert.alert(
          '오류',
          result?.error?.message || '티켓 수정에 실패했습니다.',
        );
      }
    } catch (error) {
      Alert.alert('오류', '티켓 수정 중 오류가 발생했습니다.');
    }
  };
  // 티켓 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTicket({});
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowDropdown(false);
  };
  // 티켓 날짜 수정
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentTime = editedTicket.performedAt || ticket.performedAt;
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(currentTime.getHours());
      newDateTime.setMinutes(currentTime.getMinutes());
      setEditedTicket(prev => ({ ...prev, performedAt: newDateTime }));
    }
  };
  // 티켓 시간 수정
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = editedTicket.performedAt || ticket.performedAt;
      const newDateTime = new Date(currentDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setEditedTicket(prev => ({ ...prev, performedAt: newDateTime }));
    }
  };

  // 티켓 삭제 함수
  const handleDelete = () => {
    Alert.alert(
      '티켓 삭제',
      `"${ticket.title}" 티켓을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            const result = deleteTicket(ticket.id);
            if (result.success) {
              onClose();
              Alert.alert('완료', '티켓이 삭제되었습니다.');
            } else {
              Alert.alert(
                '오류',
                result.error?.message || '티켓 삭제에 실패했습니다.',
              );
            }
          },
        },
      ],
    );
    setShowDropdown(false);
  };

  const handlePrivacySelect = (newStatus: TicketStatus) => {
    const result = updateTicket(ticket.id, { status: newStatus });
    if (result?.success) {
      Alert.alert(
        '완료',
        `후기가 성공적으로 "${TICKET_STATUS_LABELS[newStatus]}"로 변경되었습니다.`,
      );
    } else {
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    }
    setShowPrivacyModal(false);
  };

  // 후기 공개 범위 함수
  const handleTogglePrivacy = () => {
    setShowPrivacyModal(true);
    setShowDropdown(false);
  };

  const handleAddToPhoto = () => {
    Alert.alert('알림', '사진 앨범 저장 기능은 구현 예정입니다.');
    setShowDropdown(false);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

  // n회차 관람 뱃지를 위한 로직
  const viewCount = allTickets.filter(t => t.title === ticket.title).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (isEditing) {
                  handleCancelEdit();
                } else {
                  onClose();
                }
              }}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.headerActions}>
              {isEditing && isMine ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSaveEdit}
                  >
                    <Text
                      style={[styles.actionButtonText, styles.saveButtonText]}
                    >
                      ✓
                    </Text>
                  </TouchableOpacity>
                </>
              ) : isMine ? (
                <>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShare}
                  >
                    <Text style={styles.actionButtonText}>↗</Text>
                  </TouchableOpacity>
                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={e => {
                        e.stopPropagation(); // 드롭다운을 열 때 외부 터치 이벤트 방지
                        setShowDropdown(!showDropdown);
                      }}
                    >
                      <Text style={styles.actionButtonText}>⋯</Text>
                    </TouchableOpacity>
                    {showDropdown && (
                      <View style={styles.dropdown}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={handleEdit}
                        >
                          <Text style={styles.dropdownText}>티켓 편집하기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={handleTogglePrivacy}
                        >
                          <Text style={styles.dropdownText}>
                            후기 공개범위 변경
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={handleAddToPhoto}
                        >
                          <Text style={styles.dropdownText}>
                            사진 앨범에 저장
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            styles.dropdownItemDanger,
                          ]}
                          onPress={handleDelete}
                        >
                          <Text
                            style={[
                              styles.dropdownText,
                              styles.dropdownTextDanger,
                            ]}
                          >
                            내 티켓 삭제하기
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                >
                  <Text style={styles.actionButtonText}>↗</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 카드 - ScrollView 밖 */}
          <Animated.ScrollView
            style={styles.content}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
          >
            <View style={styles.posterContainer}>
              {/* Animated.View 적용: scale + translateY */}
              <Animated.View
                style={[
                  styles.posterAnimatedWrapper,
                  {
                    transform: [{ translateY }, { scale }],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (showDropdown) {
                      setShowDropdown(false);
                    } else {
                      handleCardTap();
                    }
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.flipContainer}>
                    <Animated.View
                      style={[
                        styles.flipCard,
                        styles.flipCardFront,
                        frontAnimatedStyle,
                      ]}
                    >
                      <Image
                        source={{
                          uri:
                            ticket.images?.[0] ||
                            'https://via.placeholder.com/400x500?text=No+Image',
                        }}
                        style={styles.posterImage}
                      />
                      <Animated.View
                        style={[styles.tapHint, { opacity: hintOpacity }]}
                      >
                        <Text style={styles.tapHintText}>탭하여 후기 보기</Text>
                      </Animated.View>
                    </Animated.View>

                    <Animated.View
                      style={[
                        styles.flipCard,
                        styles.flipCardBack,
                        backAnimatedStyle,
                      ]}
                    >
                      {/* 후기 */}
                      <View style={styles.reviewCardContent}>
                        <Text style={styles.reviewCardTitle}>관람 후기</Text>
                        <ScrollView
                          style={styles.reviewScrollView}
                          contentContainerStyle={styles.reviewScrollContent}
                          showsVerticalScrollIndicator
                          nestedScrollEnabled
                        >
                          {isEditing ? (
                            <TextInput
                              style={styles.reviewInput}
                              value={
                                editedTicket.review?.reviewText ??
                                ticket.review?.reviewText ??
                                ''
                              }
                              onChangeText={text =>
                                setEditedTicket(prev => ({
                                  ...prev,
                                  review: {
                                    reviewText: text,
                                    createdAt:
                                      prev.review?.createdAt ?? new Date(),
                                    updatedAt: new Date(),
                                  },
                                }))
                              }
                              placeholder="관람 후기를 입력하세요"
                              multiline
                              textAlignVertical="top"
                            />
                          ) : (
                            <Text style={styles.reviewText}>
                              {ticket.review?.reviewText ?? '후기가 없습니다.'}
                            </Text>
                          )}
                        </ScrollView>
                      </View>

                      <Animated.View
                        style={[styles.tapHint, { opacity: hintOpacity }]}
                      >
                        <Text style={styles.tapHintText}>탭하여 티켓 보기</Text>
                      </Animated.View>
                    </Animated.View>

                    {/* n회차 관람 뱃지 */}
                    {viewCount >= 1 && !isEditing && (
                      <View style={styles.viewCountBadge}>
                        <Text style={styles.viewCountText}>
                          {viewCount}회차 관람
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* 제목 */}
              <View style={styles.titleSection}>
                {isEditing ? (
                  <TextInput
                    style={styles.titleInput}
                    value={editedTicket.title ?? ticket.title}
                    onChangeText={text =>
                      setEditedTicket(prev => ({ ...prev, title: text }))
                    }
                    multiline
                    textAlign="center"
                  />
                ) : (
                  <Text style={[styles.title]}>
                    {ticket.title}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.detailsSection}>
              {/* 아코디언 헤더 */}
              <TouchableOpacity
                style={styles.detailsHeader}
                onPress={toggleDetails}
                activeOpacity={0.7}
              >
                <Text style={styles.detailsHeaderText}>공연 정보</Text>
                <Animated.Text
                  style={[
                    styles.detailsChevron,
                    {
                      transform: [
                        {
                          rotate: detailsAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  ∨
                </Animated.Text>
              </TouchableOpacity>

              {/* 아코디언 컨텐츠 */}
              <Animated.View
                style={[
                  styles.detailsContent,
                  {
                    maxHeight: detailsAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 500],
                    }),
                    opacity: detailsAnimation,
                  },
                ]}
              >
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>일시</Text>
                  {isEditing ? (
                    <View style={styles.dateTimeEditContainer}>
                      <TouchableOpacity
                        style={styles.dateEditButton}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text style={styles.dateEditText}>
                          {(
                            editedTicket.performedAt ?? ticket.performedAt
                          ).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.timeEditButton}
                        onPress={() => setShowTimePicker(true)}
                      >
                        <Text style={styles.timeEditText}>
                          {(
                            editedTicket.performedAt ?? ticket.performedAt
                          ).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.detailValue}>
                      {ticket.performedAt.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}{' '}
                      {ticket.performedAt.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                  )}
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>장소</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.detailInput}
                      value={editedTicket.place ?? ticket.place}
                      onChangeText={text =>
                        setEditedTicket(prev => ({ ...prev, place: text }))
                      }
                      placeholder="공연 장소"
                    />
                  ) : (
                    <Text style={styles.detailValue}>{ticket.place}</Text>
                  )}
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>출연</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.detailInput}
                      value={editedTicket.artist ?? ticket.artist}
                      onChangeText={text =>
                        setEditedTicket(prev => ({ ...prev, artist: text }))
                      }
                      placeholder="출연진"
                    />
                  ) : (
                    <Text style={styles.detailValue}>{ticket.artist}</Text>
                  )}
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>장르</Text>
                  {isEditing ? (
                    <TouchableOpacity
                      style={styles.genreSelector}
                      onPress={() => setShowGenreModal(true)}
                    >
                      <Text style={styles.genreSelectorText}>
                        {editedTicket.genre ?? ticket.genre ?? '밴드'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.detailValue}>{ticket.genre}</Text>
                  )}
                </View>
              </Animated.View>
            </View>
          </Animated.ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={editedTicket.performedAt ?? ticket.performedAt}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={editedTicket.performedAt ?? ticket.performedAt}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {/* Privacy Selection Modal */}
      <PrivacySelectionModal
        visible={showPrivacyModal}
        currentStatus={ticket.status}
        onClose={() => setShowPrivacyModal(false)}
        onSelect={handlePrivacySelect}
      />

      {/* Genre Selection Modal */}
      <Modal
        visible={showGenreModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenreModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowGenreModal(false)}>
          <View style={styles.genreModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.genreModalContent}>
                <Text style={styles.genreModalTitle}>장르 선택</Text>
                {genreOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genreOption,
                      (editedTicket.genre ?? ticket.genre) === option.value &&
                        styles.genreOptionSelected,
                    ]}
                    onPress={() => {
                      setEditedTicket(prev => ({
                        ...prev,
                        genre: option.value,
                      }));
                      setShowGenreModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.genreOptionText,
                        (editedTicket.genre ?? ticket.genre) === option.value &&
                          styles.genreOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.systemBackground },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.systemBackground,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.secondarySystemBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.label,
    fontWeight: Typography.headline.fontWeight,
  },
  headerActions: { flexDirection: 'row', gap: Spacing.md },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.secondarySystemBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionButtonText: {
    fontSize: 18,
    color: Colors.label,
    fontWeight: Typography.headline.fontWeight,
  },
  saveButton: { backgroundColor: Colors.primary },
  saveButtonText: { color: Colors.white },

  content: { flex: 1, backgroundColor: Colors.systemBackground },

  posterContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    backgroundColor: Colors.systemBackground,
  },

  // wrapper for animated transform
  posterAnimatedWrapper: {
    alignItems: 'center',
  },

  flipContainer: {
    width: width * 0.85,
    aspectRatio: 0.8,
    borderColor: Colors.separator,
    borderWidth: 0.5,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  flipCard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: Colors.systemBackground,
  },
  flipCardFront: { backgroundColor: Colors.systemBackground },
  flipCardBack: { backgroundColor: Colors.systemBackground },
  posterImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  // 탭 하여 후기보기
  tapHint: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapHintText: {
    ...Typography.caption1,
    color: Colors.white,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },

  reviewCardContent: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.systemBackground,
  },
  reviewCardTitle: {
    ...Typography.headline,
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  reviewScrollView: {
    flex: 1,
    maxHeight: 350,
    width: '100%',
    alignSelf: 'center',
  },
  reviewScrollContent: {
    flexGrow: 1,
  },
  reviewText: {
    ...Typography.body,
    color: Colors.label,
    textAlign: 'left',
  },

  titleSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xs,
    width: '100%',
    paddingHorizontal: Spacing.screenPadding,
  },
  title: {
    ...Typography.title3,
    fontWeight: '500',
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: 28,
  },

  // 다회차 관람 뱃지
  viewCountBadge: {
    position: 'absolute',
    top: 16, // 카드 위쪽에서 띄울 거리
    right: 16, // 오른쪽 끝 기준
    backgroundColor: Colors.systemGray5,
    borderRadius: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    zIndex: 10,
  },
  viewCountText: {
    ...Typography.caption1,
    fontWeight: '600',
    color: Colors.secondaryLabel,
  },

  // 공연 정보
  detailsSection: {
    backgroundColor: Colors.systemBackground,
    paddingHorizontal: 28,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.systemGray5,
  },
  detailsHeaderText: {
    ...Typography.headline,
    color: Colors.label,
  },
  detailsChevron: {
    ...Typography.title2,
    color: Colors.secondaryLabel,
  },

  detailsContent: {
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.systemGray5,
  },
  detailLabel: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    marginLeft: Spacing.sm,
    marginRight: Spacing.lg,
  },
  detailValue: {
    ...Typography.subheadline,
    color: Colors.label,
    fontWeight: '500',
    flex: 1,
  },

  // 편집 모드 스타일
  titleInput: {
    ...Typography.title3,
    fontWeight: '500',
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: 28,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  
  detailInput: {
    ...Typography.subheadline,
    color: Colors.label,
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  dateTimeEditContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dateEditButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  timeEditButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  dateEditText: {
    ...Typography.subheadline,
    color: Colors.label,
    fontWeight: '500',
  },
  timeEditText: {
    ...Typography.subheadline,
    color: Colors.label,
    fontWeight: '500',
  },


  reviewInput: {
    ...Typography.body,
    color: Colors.label,
    textAlign: 'left',
    minHeight: 350,
    borderWidth: 0,
    padding: 0,
    backgroundColor: 'transparent',
  },

  // 드롭다운 메뉴 스타일
  dropdownContainer: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.lg,
    minWidth: 180,
    ...Shadows.large,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.systemGray5,
  },
  dropdownItemDanger: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    ...Typography.subheadline,
    color: Colors.label,
    fontWeight: '500',
  },
  dropdownTextDanger: {
    color: Colors.systemRed,
  },

  // 장르 선택 스타일
  genreSelector: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  genreSelectorText: {
    ...Typography.subheadline,
    color: Colors.label,
    fontWeight: '500',
  },

  // 장르 모달 스타일
  genreModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreModalContent: {
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: width * 0.7,
    maxWidth: 300,
  },
  genreModalTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  genreOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.secondarySystemBackground,
  },
  genreOptionSelected: {
    backgroundColor: Colors.primary,
  },
  genreOptionText: {
    ...Typography.callout,
    color: Colors.label,
    textAlign: 'center',
    fontWeight: '500',
  },
  genreOptionTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default TicketDetailModal;
