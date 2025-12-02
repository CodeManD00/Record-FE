import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { ticketsAtom } from '../../atoms';
import { fetchMyTicketsAtom, myTicketsAtom } from '../../atoms/ticketsAtomsApi';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Ticket } from '../../types/ticket';
import { isPlaceholderTicket } from '../../utils/isPlaceholder';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import ModalHeader from '../../components/ModalHeader';
import HistoryTab from './tabs/HistoryTab';
import SearchTab from './tabs/SearchTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import YearInReviewTab from './tabs/YearInReviewTab';

interface PerformanceArchivePageProps {
  navigation: any;
}

type ArchiveTab = 'history' | 'search' | 'analytics' | 'yearInReview';

const PerformanceArchivePage: React.FC<PerformanceArchivePageProps> = ({ navigation }) => {
  const [tickets] = useAtom(ticketsAtom);
  const [apiTickets] = useAtom(myTicketsAtom);
  const [, fetchMyTickets] = useAtom(fetchMyTicketsAtom);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('history');

  // 백엔드 API에서 티켓 데이터 가져오기
  useFocusEffect(
    useCallback(() => {
      fetchMyTickets(true);
    }, [fetchMyTickets])
  );

  // API 티켓이 있으면 우선 사용, 없으면 로컬 티켓 사용
  const displayTickets = apiTickets.length > 0 ? apiTickets : tickets;
  const realTickets = displayTickets.filter(ticket => !isPlaceholderTicket(ticket));

  const tabs = [
    { key: 'history' as ArchiveTab, label: '히스토리' },
    { key: 'search' as ArchiveTab, label: '검색' },
    { key: 'analytics' as ArchiveTab, label: '분석' },
    { key: 'yearInReview' as ArchiveTab, label: '연말 결산' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return <HistoryTab tickets={realTickets} navigation={navigation} />;
      case 'search':
        return <SearchTab tickets={realTickets} navigation={navigation} />;
      case 'analytics':
        return <AnalyticsTab navigation={navigation} />;
      case 'yearInReview':
        return <YearInReviewTab navigation={navigation} />;
      default:
        return <HistoryTab tickets={realTickets} navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ModalHeader
        title="공연 아카이브"
        onBack={() => navigation.goBack()}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabContent}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondarySystemBackground,
  },
  tabContainer: {
    backgroundColor: Colors.systemBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
    paddingVertical: 4,
  },
  tabContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.tertiarySystemBackground,
    height: 24,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.subheadline,
    fontSize: 15,
    color: Colors.secondaryLabel,
    fontWeight: '500',
  },
  tabTextActive: {
    ...Typography.subheadline,
    fontSize: 15,
    color: Colors.systemBackground,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});

export default PerformanceArchivePage;

