import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutDetailsScreen() {
  const { workoutData } = useLocalSearchParams();

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!workoutData) return;

    try {
      setData(JSON.parse(workoutData));
    } catch (error) {
      console.log('Details parse error:', error);
    }
  }, [workoutData]);

  /*
    FORMAT HELPERS
  */

  const formatDate = dateStr => {
    const date = new Date(dateStr);

    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    if (hours === 0) hours = 12;

    const time = `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;

    return `${day} ${month} ${year} · ${time}`;
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const formatVolume = vol => {
    if (!vol && vol !== 0) return '0';
    return Number(vol).toLocaleString();
  };

  const getSetTypeLabel = set => {
    if (set.setType === 'warmup') return 'W';
    if (set.setType === 'drop') return 'D';
    return 'N';
  };

  const getSetTypeStyle = set => {
    if (set.setType === 'warmup') return styles.typeWarmup;
    if (set.setType === 'drop') return styles.typeDrop;
    return styles.typeNormal;
  };

  /*
    BUILD EXERCISE ENTRIES
  */

  const exerciseEntries = [];

  if (data?.workoutExercises && data?.setsData) {
    data.workoutExercises.forEach(exercise => {
      const exId = exercise.exerciseId;
      const sets = data.setsData[exId] || [];

      exerciseEntries.push({
        ...exercise,
        exerciseId: exId,
        sets,
      });
    });
  }

  /*
    RESOLVE SKIPPED EXERCISE NAMES
  */

  const skippedItems =
    data?.skippedExercises?.map(skippedId => {
      const found = data?.workoutExercises?.find(
        ex => ex.exerciseId === skippedId
      );

      return {
        id: skippedId,
        name: found?.name || skippedId,
      };
    }) || [];

  const hasSkipped = skippedItems.length > 0;

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>
          Loading details...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Workout Details
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* WORKOUT NAME SECTION */}

      <View style={styles.nameSection}>
        <Text style={styles.workoutName}>
          {(data.workoutName || 'WORKOUT').toUpperCase()}
        </Text>

        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              data.isCustom
                ? styles.badgeCustom
                : styles.badgeRecommended,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                data.isCustom
                  ? styles.badgeTextCustom
                  : styles.badgeTextRecommended,
              ]}
            >
              {data.isCustom ? 'CUSTOM' : 'RECOMMENDED'}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color="#555555"
          />

          <Text style={styles.dateText}>
            {formatDate(data.date)}
          </Text>
        </View>
      </View>

      {/* TOTAL WORKOUT TIME */}

      <View style={styles.timeCard}>
        <Text style={styles.timeLabel}>
          TOTAL WORKOUT TIME
        </Text>

        <Text style={styles.timeValue}>
          {formatTime(data.duration || 0)}
        </Text>
      </View>

      {/* STATS */}

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {data.totalSets || 0}
          </Text>

          <Text style={styles.statLabel}>
            TOTAL SETS
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {data.totalReps || 0}
          </Text>

          <Text style={styles.statLabel}>
            TOTAL REPS
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatVolume(data.totalVolume || 0)}
          </Text>

          <Text style={styles.statLabel}>
            KG VOLUME
          </Text>
        </View>
      </View>

      {/* EXERCISES */}

      <Text style={styles.sectionTitle}>
        EXERCISES
      </Text>

      {exerciseEntries.map(
        (exercise, index) => {
          const exTime =
            (data.exerciseTimes &&
              data.exerciseTimes[
                exercise.exerciseId
              ]) ||
            0;

          const exName =
            exercise.name ||
            exercise.exerciseId;

          return (
            <View
              key={exercise.exerciseId}
              style={[
                styles.exerciseCard,
                index ===
                  exerciseEntries.length -
                    1 &&
                  styles.lastCard,
              ]}
            >
              {/* EXERCISE NAME */}

              <Text style={styles.exerciseName}>
                {exName.toUpperCase()}
              </Text>

              {/* EXERCISE TIME */}

              <View style={styles.exerciseTimeRow}>
                <Ionicons
                  name="time-outline"
                  size={13}
                  color="#555555"
                />

                <Text style={styles.exerciseTimeLabel}>
                  EXERCISE TIME
                </Text>

                <Text style={styles.exerciseTimeValue}>
                  {formatTime(exTime)}
                </Text>
              </View>

              {/* SETS TABLE */}

              <View style={styles.setsTable}>
                {/* TABLE HEADER */}

                <View style={styles.tableHeader}>
                  <Text
                    style={[
                      styles.tableHeaderCell,
                      styles.colSet,
                    ]}
                  >
                    SET
                  </Text>

                  <Text
                    style={[
                      styles.tableHeaderCell,
                      styles.colType,
                    ]}
                  >
                    TYPE
                  </Text>

                  <Text
                    style={[
                      styles.tableHeaderCell,
                      styles.colWeight,
                    ]}
                  >
                    WEIGHT
                  </Text>

                  <Text
                    style={[
                      styles.tableHeaderCell,
                      styles.colReps,
                    ]}
                  >
                    REPS
                  </Text>

                  <Text
                    style={[
                      styles.tableHeaderCell,
                      styles.colStatus,
                    ]}
                  >
                    STATUS
                  </Text>
                </View>

                {/* SET ROWS */}

                {exercise.sets.map(
                  (set, sIndex) => {
                    const setLabel =
                      getSetTypeLabel(
                        set
                      );
                    const labelStyle =
                      getSetTypeStyle(
                        set
                      );

                    const weightDisplay =
                      set.weight
                        ? `${set.weight} kg`
                        : '—';

                    const repsDisplay =
                      set.reps != null
                        ? String(
                            set.reps
                          )
                        : '—';

                    return (
                      <View
                        key={
                          set.id ||
                          sIndex
                        }
                        style={[
                          styles.tableRow,
                          set.completed &&
                            styles.tableRowDone,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tableCell,
                            styles.colSet,
                            styles.setNum,
                          ]}
                        >
                          {sIndex + 1}
                        </Text>

                        <View
                          style={[
                            styles.tableCell,
                            styles.colType,
                          ]}
                        >
                          <View
                            style={[
                              styles.typeBadge,
                              labelStyle,
                            ]}
                          >
                            <Text
                              style={[
                                styles.typeBadgeText,
                                labelStyle,
                              ]}
                            >
                              {setLabel}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={[
                            styles.tableCell,
                            styles.colWeight,
                            styles.mono,
                          ]}
                        >
                          {weightDisplay}
                        </Text>

                        <Text
                          style={[
                            styles.tableCell,
                            styles.colReps,
                            styles.mono,
                          ]}
                        >
                          {repsDisplay}
                        </Text>

                        <View
                          style={[
                            styles.tableCell,
                            styles.colStatus,
                          ]}
                        >
                          {set.completed ? (
                            <Ionicons
                              name="checkmark"
                              size={
                                16
                              }
                              color="#FFFFFF"
                            />
                          ) : (
                            <Text
                              style={
                                styles.statusPending
                              }
                            >
                              —
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  }
                )}

                {exercise.sets.length ===
                  0 && (
                  <View style={styles.noSetsRow}>
                    <Text style={styles.noSetsText}>
                      No sets recorded
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        }
      )}

      {/* SKIPPED EXERCISES */}

      {hasSkipped && (
        <View style={styles.skippedSection}>
          <View style={styles.skippedHeader}>
            <Ionicons
              name="play-skip-forward"
              size={15}
              color="#666666"
            />

            <Text style={styles.skippedTitle}>
              SKIPPED EXERCISES
            </Text>
          </View>

          {skippedItems.map(
            (item, i) => (
              <View
                key={item.id}
                style={styles.skippedItem}
              >
                <View style={styles.skippedDot} />

                <Text style={styles.skippedName}>
                  {item.name}
                </Text>
              </View>
            )
          )}
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
    paddingTop: 55,
    paddingBottom: 60,
  },

  center: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  headerSpacer: {
    width: 42,
  },

  /* NAME SECTION */

  nameSection: {
    marginBottom: 20,
  },

  workoutName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  badgeRow: {
    flexDirection: 'row',
    marginTop: 12,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },

  badgeRecommended: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#333333',
  },

  badgeCustom: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#444444',
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  badgeTextRecommended: {
    color: '#888888',
  },

  badgeTextCustom: {
    color: '#AAAAAA',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
  },

  dateText: {
    color: '#555555',
    fontSize: 12,
    fontWeight: '500',
  },

  /* TIME CARD */

  timeCard: {
    backgroundColor: '#151515',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },

  timeLabel: {
    color: '#555555',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  timeValue: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '700',
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },

  /* STATS CARD */

  statsCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#252525',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#252525',
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  statLabel: {
    color: '#555555',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.8,
  },

  /* SECTION TITLE */

  sectionTitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
  },

  /* EXERCISE CARD */

  exerciseCard: {
    backgroundColor: '#151515',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#252525',
  },

  lastCard: {
    marginBottom: 0,
  },

  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  exerciseTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#252525',
    alignSelf: 'flex-start',
  },

  exerciseTimeLabel: {
    color: '#555555',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  exerciseTimeValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* SETS TABLE */

  setsTable: {
    marginTop: 14,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252525',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1C',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },

  tableHeaderCell: {
    color: '#555555',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  colSet: {
    width: 36,
  },

  colType: {
    width: 52,
  },

  colWeight: {
    flex: 1,
  },

  colReps: {
    flex: 1,
    textAlign: 'right',
  },

  colStatus: {
    width: 44,
    textAlign: 'center',
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1C',
  },

  tableRowDone: {
    backgroundColor: '#111111',
  },

  tableCell: {
    color: '#FFFFFF',
    fontSize: 13,
  },

  setNum: {
    color: '#555555',
    fontSize: 12,
    fontWeight: '600',
  },

  mono: {
    fontVariant: ['tabular-nums'],
  },

  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },

  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  typeNormal: {
    backgroundColor: '#252525',
    color: '#FFFFFF',
  },

  typeWarmup: {
    backgroundColor: '#1C1C1C',
    color: '#888888',
    borderWidth: 1,
    borderColor: '#333333',
  },

  typeDrop: {
    backgroundColor: '#1A1010',
    color: '#AA6666',
    borderWidth: 1,
    borderColor: '#3A2020',
  },

  statusPending: {
    color: '#333333',
    fontSize: 16,
  },

  noSetsRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  noSetsText: {
    color: '#444444',
    fontSize: 12,
  },

  /* SKIPPED EXERCISES */

  skippedSection: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#252525',
  },

  skippedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },

  skippedTitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  skippedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1C',
  },

  skippedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#444444',
  },

  skippedName: {
    color: '#777777',
    fontSize: 13,
    fontWeight: '500',
  },

  bottomPad: {
    height: 30,
  },
});
