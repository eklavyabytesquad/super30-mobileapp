import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { useAuth } from '../utils/auth_context';
import { supabase } from '../utils/supabase';
import { blogUtils } from '../utils/blog_utils';
import { API_CONFIG, apiCall } from '../utils/api_config';

export default function BlogListPage({ onNavigateToCreateEdit, onNavigateBack }) {
  const { user } = useAuth();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summarizing, setSummarizing] = useState({});
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch blog posts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBlogPosts();
    setRefreshing(false);
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this blog post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('blog_posts')
                .delete()
                .eq('id', postId)
                .eq('user_id', user.id);

              if (error) throw error;
              
              Alert.alert('Success', 'Blog post deleted successfully!');
              fetchBlogPosts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete blog post: ' + error.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSummarizeText = async (postId, text) => {
    setSummarizing(prev => ({ ...prev, [postId]: true }));
    
    console.log('🚀 Starting summarization for post:', postId);
    console.log('📝 Text to summarize:', text.substring(0, 100) + '...');
    console.log('🌐 API URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROCESS_TEXT}`);
    
    const result = await apiCall(API_CONFIG.ENDPOINTS.PROCESS_TEXT, {
      text: text,
      sentences_count: 2
    });
    
    if (result.success) {
      console.log('✅ API Response:', result.data);
      
      if (result.data.success && result.data.data && result.data.data.summary) {
        setSummaries(prev => ({ 
          ...prev, 
          [postId]: result.data.data.summary 
        }));
        console.log('✨ Summary saved successfully!');
      } else {
        console.error('❌ Invalid response format:', result.data);
        Alert.alert('Error', 'Failed to generate summary - Invalid response format');
      }
    } else {
      console.error('❌ API Error:', result.error);
      Alert.alert(
        'Connection Error', 
        `Failed to connect to summarization service.\n\n${result.error}\n\nTroubleshooting:\n• Ensure API server is running on ${API_CONFIG.BASE_URL}\n• Check if your phone and computer are on the same Wi-Fi network\n• Try restarting the API server`
      );
    }
    
    setSummarizing(prev => ({ ...prev, [postId]: false }));
  };

  const toggleSummary = (postId) => {
    if (summaries[postId]) {
      // Remove summary if it exists
      setSummaries(prev => {
        const newSummaries = { ...prev };
        delete newSummaries[postId];
        return newSummaries;
      });
    }
  };



  const renderBlogPost = (post) => (
    <View key={post.id} style={styles.postCard}>
      {post.image_base64 && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${post.image_base64}` }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{post.title}</Text>
        
        {post.sub_title && (
          <Text style={styles.postSubTitle}>{post.sub_title}</Text>
        )}
        
        <Text style={styles.postDescription} numberOfLines={summaries[post.id] ? null : 3}>
          {post.description}
        </Text>

        {/* Summarization Section */}
        <View style={styles.summarySection}>
          <TouchableOpacity
            style={styles.summarizeButton}
            onPress={() => {
              if (summaries[post.id]) {
                toggleSummary(post.id);
              } else {
                handleSummarizeText(post.id, post.description);
              }
            }}
            disabled={summarizing[post.id]}
          >
            {summarizing[post.id] ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.summarizeButtonText}>
                {summaries[post.id] ? '✕ Hide Summary' : '📝 Summarize'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Display Summary */}
        {summaries[post.id] && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>📋 Summary:</Text>
            <Text style={styles.summaryText}>{summaries[post.id]}</Text>
          </View>
        )}
        
        <View style={styles.postMeta}>
          <Text style={styles.postDate}>{blogUtils.formatDate(post.created_at)}</Text>
          {post.updated_at !== post.created_at && (
            <Text style={styles.updatedText}>Updated</Text>
          )}
        </View>

        {post.reference && (
          <View style={styles.referenceContainer}>
            <Text style={styles.referenceLabel}>References:</Text>
            <Text style={styles.referenceText} numberOfLines={2}>
              {JSON.stringify(post.reference)}
            </Text>
          </View>
        )}

        {/* Show edit/delete buttons only for the user's own posts */}
        {post.user_id === user.id && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onNavigateToCreateEdit(post)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePost(post.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading blog posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blog Posts</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => onNavigateToCreateEdit(null)}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {blogPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Blog Posts Yet</Text>
            <Text style={styles.emptyText}>
              Start sharing your thoughts by creating your first blog post!
            </Text>
            <TouchableOpacity
              style={styles.emptyCreateButton}
              onPress={() => onNavigateToCreateEdit(null)}
            >
              <Text style={styles.emptyCreateButtonText}>Create First Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.postsContainer}>
            {blogPosts.map(renderBlogPost)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  postsContainer: {
    padding: 15,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postContent: {
    padding: 15,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  postSubTitle: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  updatedText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 10,
    fontWeight: '500',
  },
  referenceContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  referenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyCreateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyCreateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summarySection: {
    marginBottom: 10,
  },
  summarizeButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarizeButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#e8f4f8',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});