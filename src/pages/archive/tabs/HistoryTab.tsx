import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ticket } from '../../../types/ticket';
import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '../../../styles/designSystem';
import TicketDetailModal from '../../../components/TicketDetailModal';

interface HistoryTabProps {
  tickets: Ticket[];
  navigation: any;
}

type FilterType = 'all' | 'recent' | 'thisMonth' | 'thisYear';

const HistoryTab: React.FC<HistoryTabProps> = ({ tickets, navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 날짜별 필터링 함수 (performedAt 기준)
  const getFilteredTickets = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (selectedFilter) {
      case 'recent':
        // 최근 7일
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tickets.filter(ticket => {
          const ticketDate = ticket.performedAt ? new Date(ticket.performedAt) : new Date();
          return ticketDate >= sevenDaysAgo;
        });
      
      case 'thisMonth':
        return tickets.filter(ticket => {
          const ticketDate = ticket.performedAt ? new Date(ticket.performedAt) : new Date();
          return ticketDate.getMonth() === currentMonth && ticketDate.getFullYear() === currentYear;
        });
      
      case 'thisYear':
        return tickets.filter(ticket => {
          const ticketDate = ticket.performedAt ? new Date(ticket.performedAt) : new Date();
          return ticketDate.getFullYear() === currentYear;
        });
      
      default:
        return tickets;
    }
  };

  // performedAt 기준으로 정렬 (최신순)
  const filteredTickets = getFilteredTickets().sort((a, b) => {
    const dateA = a.performedAt ? new Date(a.performedAt).getTime() : 0;
    const dateB = b.performedAt ? new Date(b.performedAt).getTime() : 0;
    return dateB - dateA;
  });

  const filterOptions = [
    { key: 'all' as FilterType, label: '전체', count: tickets.length },
    { key: 'recent' as FilterType, label: '최근 7일', count: tickets.filter(ticket => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const ticketDate = ticket.performedAt ? new Date(ticket.performedAt) : new Date();
      return ticketDate >= sevenDaysAgo;
    }).length },
    { key: 'thisMonth' as FilterType, label: '이번 달', count: tickets.filter(ticket => {
      const ticketDate = ticket.performedAt ? new Date(ticket.performedAt) : new Date();
      const now = new Date();
      return ticketDate.getMonth() === now.getMonth() && ticketDate.getFullYear() === now.getFullYear();
    }).length },
    { key: 'thisYear' as FilterType, label: '올해', count: tickets.filter(ticket => {
      const ticketDate = ticket.performedAt ? new Date(ticket.performedAt) : new Date();
      return ticketDate.getFullYear() === new Date().getFullYear();
    }).length },
  ];

  const formatDate = (date?: Date | string) => {
    if (!date) return '날짜 없음';
    const dateObj = date instanceof Date ? date : new Date(date);
    return `${dateObj.getFullYear()}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getDate().toString().padStart(2, '0')}`;
  };

  const handleTicketPress = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTicket(null);
  };

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity 
      style={styles.ticketItem}
      onPress={() => handleTicketPress(item)}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={1}>
          {item.title || '제목 없음'}
        </Text>
      </View>
      <Text style={styles.ticketLocation} numberOfLines={1}>
        @{item.venue || '장소 없음'}
      </Text>
      <Text style={styles.ticketTime}>
        {item.performedAt ? new Date(item.performedAt).toLocaleDateString('ko-KR') : '날짜 없음'}
      </Text>
      {item.review && (
        <Text style={styles.ticketReview} numberOfLines={2}>
          💭 {item.review.reviewText}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterContent}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterTab,
                selectedFilter === option.key && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === option.key && styles.filterTabTextActive,
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.filterTabCount,
                  selectedFilter === option.key && styles.filterTabCountActive,
                ]}
              >
                {selectedFilter === option.key ? filteredTickets.length : option.count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tickets List */}
      <View style={styles.content}>
        {filteredTickets.length > 0 ? (
          <FlatList
            data={filteredTickets}
            renderItem={renderTicketItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>히스토리가 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'all' 
                ? '아직 등록된 티켓이 없습니다'
                : '선택한 기간에 등록된 티켓이 없습니다'
              }
            </Text>
          </View>
        )}
      </View>

      {/* 티켓 상세 모달 */}
      {selectedTicket && (
        <TicketDetailModal
          visible={modalVisible}
          ticket={selectedTicket}
          onClose={handleCloseModal}
          isMine={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
  },
  filterContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  filterTab: {
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xxl,
    marginHorizontal: Spacing.xs,
    backgroundColor: Colors.tertiarySystemBackground,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 36,
    flex: 1,
    justifyContent: 'center',
    marginVertical: Spacing.xs,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    opacity: 0.7,
  },
  filterTabText: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,

  },
  filterTabTextActive: {
    ...Typography.footnote,
    color: Colors.systemBackground,
    fontWeight: Typography.headline.fontWeight,
  },
  filterTabCount: {
    ...Typography.caption2,
    color: Colors.secondaryLabel,
    backgroundColor: Colors.systemBackground,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
    minWidth: Layout.minTouchTarget / 2,
    textAlign: 'center',
  },
  filterTabCountActive: {
    ...Typography.caption2,
    color: Colors.primary,
    backgroundColor: Colors.systemBackground,
  },
  content: {
    flex: 1,
    paddingVertical: Spacing.xs,
  },
  listContent: {
    paddingVertical: Spacing.screenPadding,
    gap: Spacing.sm,
  },

  ticketItem: {
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  ticketTitle: {
    ...Typography.title3,
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  ticketLocation: {
    ...Typography.callout,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs / 2,
    marginHorizontal: Spacing.xs,
  },
  ticketTime: {
    ...Typography.callout,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.xs,
  },
  ticketReview: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    backgroundColor: Colors.tertiarySystemBackground,
    padding: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.headline,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HistoryTab;

