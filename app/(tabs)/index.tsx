import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getData } from '@/utils/storage';
import { recommendedWeeklySplit } from '@/utils/workout';

const muscleMap = {
  Push: 'Chest · Shoulders · Triceps',
  Pull: 'Back · Biceps',
  Legs: 'Quads · Hamstrings · Glutes · Calves',
  Rest: 'Recovery',
};

const MUSCLES_BY_NAME = {
  Push: ['Chest', 'Shoulders', 'Triceps'],
  Pull: ['Back', 'Biceps'],
  Legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Rest: [],
};

export default function HomeScreen() {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getData('workoutHistory').then(data => setHistory(data || []));
    }, [])
  );

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', {
    weekday: 'long',
  });

  const todayPlan = recommendedWeeklySplit.find(
    d => d.day === dayName
  );
  const isRestDay = !todayPlan?.workoutId;

  const recentWorkout = history[0];

  const formatDate = dateStr => {
    const d = new Date(dateStr);
    const todayDate = new Date();
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday =
      d.toDateString() === todayDate.toDateString();
    const isYesterday =
      d.toDateString() === yesterday.toDateString();

    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
    ];

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = seconds => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(
      s
    ).padStart(2, '0')}`;
  };

  const formatVolume = vol => {
    if (!vol && vol !== 0) return '0';
    return Number(vol).toLocaleString();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>Home</Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="barbell"
            size={20}
            color="#FFFFFF"
          />
        </View>
      </View>

      {/* TODAY'S WORKOUT */}

      <Text style={styles.sectionLabel}>
        TODAY{`'`}S WORKOUT
      </Text>

      {isRestDay ? (
        <View style={styles.restCard}>
          <View style={styles.restIconWrap}>
            <Ionicons
              name="moon-outline"
              size={28}
              color="#555555"
            />
          </View>

          <Text style={styles.restDayText}>REST DAY</Text>
          <Text style={styles.restDayName}>
            {dayName}
          </Text>
          <Text style={styles.restSubText}>
            Recovery is part of the workout.
          </Text>
        </View>
      ) : (
        <Pressable
          style={styles.todayCard}
          onPress={() =>
            todayPlan.workoutId &&
            router.push({
              pathname: '/day-workout',
              params: {
                workoutId: todayPlan.workoutId,
                day: todayPlan.day,
                workoutName: todayPlan.name,
              },
            })
          }
        >
          <View style={styles.todayLeft}>
            <Text style={styles.todayDay}>
              {todayPlan.day.toUpperCase()}
            </Text>

            <Text style={styles.todayName}>
              {todayPlan.name.toUpperCase()}
            </Text>

            <Text style={styles.todayMuscles}>
              {muscleMap[todayPlan.name] || ''}
            </Text>
          </View>

          <View style={styles.todayRight}>
            <View style={styles.playCircle}>
                <Ionicons
                  name="play"
                  size={18}
                  color="#000000"
                />
            </View>
          </View>
        </Pressable>
      )}

      {false && (
        <View style={styles.ongoingSection}>
          <Text style={styles.sectionLabel}>ONGOING WORKOUT</Text>
          <Pressable
            style={styles.ongoingCard}
            onPress={() =>
              router.push({
                pathname: '/active-workout',
                params: {
                  workoutId: activeSession.workoutId,
                  startedAt: activeSession.startedAt,
                },
              })
            }
          >
            <View>
              <Text style={styles.ongoingName}>
                {(activeSession.workout?.name || 'WORKOUT').toUpperCase()}
              </Text>
              <Text style={styles.ongoingMeta}>
                UNFINISHED · {formatDuration(activeSession.workoutTime || 0)} active
              </Text>
            </View>
            <View style={styles.ongoingActions}>
              <Pressable
                style={styles.discardButton}
                accessibilityLabel="Discard ongoing workout"
                onPress={event => {
                  event.stopPropagation();
                  discardOngoingWorkout();
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#DD7777" />
              </Pressable>
              <View style={styles.ongoingResume}>
                <Ionicons name="play" size={15} color="#000000" />
                <Text style={styles.ongoingResumeText}>RESUME</Text>
              </View>
            </View>
          </Pressable>
        </View>
      )}

      {/* RECENT WORKOUT */}

      {recentWorkout && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionLabel}>
            RECENT WORKOUT
          </Text>

          <Pressable
            style={styles.recentCard}
            onPress={() =>
              router.push({
                pathname: '/workout-details',
                params: {
                  workoutData: JSON.stringify(
                    recentWorkout
                  ),
                },
              })
            }
          >
            <View style={styles.recentTop}>
              <View style={styles.recentLeft}>
                <Text style={styles.recentName}>
                  {(recentWorkout.workoutName || 'WORKOUT').toUpperCase()}
                </Text>

                <View style={styles.recentBadgeRow}>
                  <View
                    style={[
                      styles.recentBadge,
                      recentWorkout.isCustom
                        ? styles.recentBadgeCustom
                        : styles.recentBadgeRec,
                    ]}
                  >
                    <Text
                      style={[
                        styles.recentBadgeText,
                        recentWorkout.isCustom
                          ? styles.recentBadgeTextCustom
                          : styles.recentBadgeTextRec,
                      ]}
                    >
                      {recentWorkout.isCustom
                        ? 'CUSTOM'
                        : 'RECOMMENDED'}
                    </Text>
                  </View>

                  <Text style={styles.recentDate}>
                    {formatDate(recentWorkout.date)}
                  </Text>
                </View>
              </View>

              <View style={styles.recentDuration}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#555555"
                />
                <Text style={styles.recentDurationText}>
                  {formatTime(
                    recentWorkout.duration || 0
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.recentDivider} />

            <View style={styles.recentStats}>
              <View style={styles.recentStat}>
                <Text style={styles.recentStatVal}>
                  {recentWorkout.totalSets || 0}
                </Text>
                <Text style={styles.recentStatLbl}>
                  SETS
                </Text>
              </View>

              <View style={styles.recentStatDivider} />

              <View style={styles.recentStat}>
                <Text style={styles.recentStatVal}>
                  {recentWorkout.totalReps || 0}
                </Text>
                <Text style={styles.recentStatLbl}>
                  REPS
                </Text>
              </View>

              <View style={styles.recentStatDivider} />

              <View style={styles.recentStat}>
                <Text
                  style={[
                    styles.recentStatVal,
                    styles.recentStatVol,
                  ]}
                >
                  {formatVolume(
                    recentWorkout.totalVolume || 0
                  )}
                </Text>
                <Text style={styles.recentStatLbl}>
                  KG VOLUME
                </Text>
              </View>
            </View>

            <View style={styles.recentChevron}>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#333333"
              />
            </View>
          </Pressable>
        </View>
      )}

      {/* ACTIVITY FEED */}

      {history.length > 1 && (
        <View style={styles.activitySection}>
          <Text style={styles.sectionLabel}>
            RECENT ACTIVITY
          </Text>

          {history.slice(1, 5).map(item => (
            <Pressable
              key={item.id}
              style={styles.activityCard}
              onPress={() =>
                router.push({
                  pathname: '/workout-details',
                  params: {
                    workoutData: JSON.stringify(
                      item
                    ),
                  },
                })
              }
            >
              <View style={styles.activityLeft}>
                <View
                  style={[
                    styles.activityDot,
                    item.isCustom &&
                      styles.activityDotCustom,
                  ]}
                />

                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>
                    {(
                      item.workoutName ||
                      'WORKOUT'
                    ).toUpperCase()}
                  </Text>

                  <Text style={styles.activityMeta}>
                    {formatDate(item.date)} ·{' '}
                    {formatTime(item.duration || 0)}
                  </Text>
                </View>
              </View>

              <View style={styles.activityRight}>
                <Text style={styles.activitySets}>
                  {item.totalSets || 0} sets
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color="#333333"
                />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* EMPTY STATE */}

      {history.length === 0 && (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons
              name="barbell-outline"
              size={34}
              color="#333333"
            />
          </View>

          <Text style={styles.emptyTitle}>
            NO WORKOUTS YET
          </Text>
          <Text style={styles.emptyText}>
            Complete your first workout{'\n'}
            to see your progress here.
          </Text>
        </View>
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },

  greeting: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '500',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 3,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionLabel: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  /* TODAY'S WORKOUT */

  todayCard: {
    backgroundColor: '#151515',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
    marginBottom: 28,
  },

  todayLeft: {
    flex: 1,
    paddingRight: 16,
  },

  todayDay: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  todayName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  todayMuscles: {
    color: '#666666',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },

  todayRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  ongoingSection: {
    marginBottom: 28,
  },

  ongoingCard: {
    alignItems: 'center',
    backgroundColor: '#151515',
    borderColor: '#496B53',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },

  ongoingName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  ongoingMeta: {
    color: '#8DCF9E',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 5,
  },

  ongoingResume: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },

  ongoingActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  discardButton: {
    alignItems: 'center',
    borderColor: '#5A2A2A',
    borderRadius: 9,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },

  ongoingResumeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },

  /* REST DAY */

  restCard: {
    backgroundColor: '#151515',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
    marginBottom: 28,
  },

  restIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  restDayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  restDayName: {
    color: '#555555',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 5,
  },

  restSubText: {
    color: '#555555',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },

  /* RECENT WORKOUT */

  recentSection: {
    marginBottom: 24,
  },

  recentCard: {
    backgroundColor: '#151515',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#252525',
  },

  recentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  recentLeft: {
    flex: 1,
    paddingRight: 12,
  },

  recentName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  recentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },

  recentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },

  recentBadgeRec: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#333333',
  },

  recentBadgeCustom: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#444444',
  },

  recentBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  recentBadgeTextRec: {
    color: '#888888',
  },

  recentBadgeTextCustom: {
    color: '#AAAAAA',
  },

  recentDate: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '500',
  },

  recentDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#252525',
  },

  recentDurationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  recentDivider: {
    height: 1,
    backgroundColor: '#252525',
    marginTop: 14,
    marginBottom: 14,
  },

  recentStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  recentStat: {
    flex: 1,
    alignItems: 'center',
  },

  recentStatDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#252525',
  },

  recentStatVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  recentStatVol: {
    fontSize: 13,
  },

  recentStatLbl: {
    color: '#555555',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.8,
  },

  recentChevron: {
    position: 'absolute',
    right: 14,
    bottom: 16,
  },

  /* ACTIVITY FEED */

  activitySection: {
    marginBottom: 20,
  },

  activityCard: {
    backgroundColor: '#151515',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555555',
    marginRight: 12,
  },

  activityDotCustom: {
    backgroundColor: '#777777',
  },

  activityInfo: {
    flex: 1,
  },

  activityName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  activityMeta: {
    color: '#555555',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },

  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  activitySets: {
    color: '#555555',
    fontSize: 12,
    fontWeight: '600',
  },

  /* EMPTY STATE */

  emptyCard: {
    backgroundColor: '#151515',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
    marginTop: 10,
  },

  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  emptyText: {
    color: '#555555',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },

  bottomPad: {
    height: 20,
  },
});
