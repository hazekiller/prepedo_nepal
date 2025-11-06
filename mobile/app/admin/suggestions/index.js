// app/(admin)/suggestions/index.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { COLORS } from '../../config/colors';
import { API_ENDPOINTS } from '../../config/api';

export default function SuggestionsManagementPage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.suggestionsAll, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Fetch suggestions error:', error);
      Alert.alert('Error', 'Failed to fetch suggestions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (id, newStatus, notes = '') => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.suggestionStatus(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: newStatus,
          admin_notes: notes 
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Status updated successfully');
        setModalVisible(false);
        setAdminNotes('');
        fetchSuggestions();
      } else {
        Alert.alert('Error', data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const showStatusOptions = (item) => {
    const statuses = ['pending', 'reviewing', 'approved', 'rejected'];
    Alert.alert(
      'Update Status',
      `Current: ${item.status}`,
      statuses.map((status) => ({
        text: status.charAt(0).toUpperCase() + status.slice(1),
        onPress: () => {
          if (status === 'rejected' || status === 'approved') {
            setSelectedSuggestion(item);
            setAdminNotes(item.admin_notes || '');
            setModalVisible(true);
          } else {
            updateStatus(item.id, status);
          }
        },
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const handleSubmitWithNotes = () => {
    if (selectedSuggestion) {
      const newStatus = adminNotes.toLowerCase().includes('reject') ? 'rejected' : 'approved';
      updateStatus(selectedSuggestion.id, newStatus, adminNotes);
    }
  };

  const viewDetails = (item) => {
    setSelectedSuggestion(item);
    setAdminNotes(item.admin_notes || '');
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      reviewing: '#3b82f6',
      approved: '#10b981',
      rejected: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => viewDetails(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
          onPress={() => showStatusOptions(item)}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </TouchableOpacity>
      </View>

      {item.location && (
        <Text style={styles.location}>📍 {item.location}</Text>
      )}

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.submitterInfo}>
        <Text style={styles.submitter}>
          👤 {item.submitted_by_name || 'Anonymous'}
        </Text>
        {item.submitted_by_email && (
          <Text style={styles.email}>📧 {item.submitted_by_email}</Text>
        )}
      </View>

      <Text style={styles.date}>
        📅 {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Story Suggestions ({suggestions.length})</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSuggestion}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchSuggestions();
            }}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No suggestions yet</Text>
          </View>
        }
      />

      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Suggestion Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedSuggestion && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Title:</Text>
                    <Text style={styles.detailValue}>{selectedSuggestion.title}</Text>
                  </View>

                  {selectedSuggestion.location && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailValue}>{selectedSuggestion.location}</Text>
                    </View>
                  )}

                  {selectedSuggestion.description && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailValue}>{selectedSuggestion.description}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submitted By:</Text>
                    <Text style={styles.detailValue}>
                      {selectedSuggestion.submitted_by_name || 'Anonymous'}
                    </Text>
                  </View>

                  {selectedSuggestion.submitted_by_email && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailValue}>{selectedSuggestion.submitted_by_email}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(selectedSuggestion.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{selectedSuggestion.status}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Admin Notes:</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="Add notes about this suggestion..."
                      placeholderTextColor={COLORS.textSecondary}
                      value={adminNotes}
                      onChangeText={setAdminNotes}
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => updateStatus(selectedSuggestion.id, 'approved', adminNotes)}
                    >
                      <Text style={styles.actionButtonText}>✓ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => updateStatus(selectedSuggestion.id, 'rejected', adminNotes)}
                    >
                      <Text style={styles.actionButtonText}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.updateStatusButton}
                    onPress={() => {
                      setModalVisible(false);
                      showStatusOptions(selectedSuggestion);
                    }}
                  >
                    <Text style={styles.updateStatusButtonText}>Change Status</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  submitterInfo: {
    marginBottom: 8,
  },
  submitter: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateStatusButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateStatusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});