import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ticket } from '../types/ticket';
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  Typography,
} from '../styles/designSystem';

interface CustomCalendarProps {
  selectedDate: string;
  tickets: Ticket[];
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange?: (month: { dateString: string }) => void;
}

// Configure calendar locale
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  tickets,
  onDayPress,
  onMonthChange,
}) => {
  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Mark dates with events
  const markedDates: { [key: string]: any } = tickets.reduce((acc, ticket) => {
    const date = formatDate(new Date(ticket.performedAt));
    return {
      ...acc,
      [date]: {
        marked: true,
        dotColor: Colors.primary,
        selected: date === selectedDate,
        selectedColor: Colors.primary,
      },
    };
  }, {} as { [key: string]: any });

  return (
    <View style={styles.calendarContainer}>
      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: Colors.primary,
          },
        }}
        theme={{
          backgroundColor: Colors.systemBackground,
          calendarBackground: Colors.systemBackground,
          textSectionTitleColor: Colors.label,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: Colors.systemBackground,
          todayTextColor: Colors.primary,
          dayTextColor: Colors.label,
          textDisabledColor: Colors.secondaryLabel,
          dotColor: Colors.primary,
          selectedDotColor: Colors.systemBackground,
          arrowColor: Colors.label,
          monthTextColor: Colors.label,
          textDayFontWeight: '400',
          textMonthFontWeight: '400',
          textDayHeaderFontWeight: '400',
          textDayFontSize: Typography.body.fontSize,
          textMonthFontSize: Typography.headline.fontSize,
          textDayHeaderFontSize: Typography.footnote.fontSize,
        }}
        style={styles.calendar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xxxl,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.systemGray5,
  },
  calendar: {
    borderRadius: BorderRadius.lg,
  },
});

export default CustomCalendar;