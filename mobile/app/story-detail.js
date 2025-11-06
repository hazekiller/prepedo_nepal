// app/story-detail.js (UPDATED)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import { COLORS } from './config/colors';
import { API_ENDPOINTS } from './config/api';

const { width } = Dimensions.get('window');

export default function StoryDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [story, setStory] = useState(null);
  const [relatedStories, setRelatedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoryDetail();
    fetchRelatedStories();
  }, [id]);

  const fetchStoryDetail = async () => {
    try {
      // Replace with actual API endpoint
      const response = await fetch(`${API_ENDPOINTS.stories}/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setStory(data.data);
        
        // Track view count
        await fetch(`${API_ENDPOINTS.stories}/${id}/view`, {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Fetch story detail error:', error);
      // Fallback to demo data
      setStory({
        id: id,
        title: 'The Self Emerging Statue of Kali',
        featured_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
        content: `The sacred grounds of Pashupatinath Temple in Kathmandu, Nepal, harbor one of the most enigmatic and spiritually significant sculptures in Hindu tradition - the self-emerging statue of Bhuvaneshwari Kali, also known as Mahadev or Vrikshalika. This ancient statue, whose origins trace back to the 1st century BCE, is revered as a religious icon that embodies a profound symbol of cosmic transformation and the eternal cycle of time.

**Historical Origins and Archaeological Significance**

The statue of Bhuvaneshwari was erected during the reign of the Kirat dynasty, one of Nepal's most ancient ruling families who governed the Kathmandu Valley from approximately the 9th century BCE. Archaeological excavations by Indian teams have confirmed ancient structures in the Pashupatinath complex dating back to the 2nd century BCE, with discoveries of lion sculptures and terracotta figures supports this theory that the statue's construction falls somewhere in between the 2nd and 1st century BC.

**The Legend of the Self-Emerging Deity**

According to prominent narratives from Hindu Puranic traditions and local Kirat mythology, the statue is believed to be self-emerging - gradually rising from the ground over centuries. This phenomenon is considered a divine manifestation, symbolizing the eternal presence of the deity.

**Mythological Origins**

The legend continues with Vrikshalika, a devotee who encountered Lord Shiva at the sacred grounds of Pashupatinath. When Shiva sensed Vrikshalika's deep meditation and devotion, he graciously bestowed his garland upon her, marking her as blessed.

**Buddhist Connection**

The site also holds significance in Buddhist tradition, with connections to ancient meditation practices and sacred relics. The convergence of Hindu and Buddhist traditions at this location represents the rich spiritual tapestry of Nepal's religious heritage.`,
        location: 'Pashupatinath Temple, Kathmandu',
        views: 1250,
        published_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedStories = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.stories);
      const data = await response.json();
      
      if (data.success) {
        // Get published stories excluding current one
        const related = data.data
          .filter(s => s.is_published && s.id !== parseInt(id))
          .slice(0, 4);
        setRelatedStories(related);
      }
    } catch (error) {
      console.error('Fetch related stories error:', error);
      // Fallback to demo data
      setRelatedStories([
        {
          id: 101,
          title: 'The Tale of Himalayan Yeti',
          featured_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        },
        {
          id: 102,
          title: 'The Shadows of Khyak',
          featured_image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400',
        },
        {
          id: 103,
          title: "Durbar Square's Tale",
          featured_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400',
        },
        {
          id: 104,
          title: 'Ancient Temple Mysteries',
          featured_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        },
      ]);
    }
  };

  const handleNavigate = (route) => {
    const routeMap = {
      'Home': '/',
      'Stories': '/stories',
      'GuideBooking': '/guide-booking',
      'Contact': '/contact',
    };
    router.push(routeMap[route] || '/');
  };

  const handleRelatedStoryPress = (relatedStory) => {
    router.push({
      pathname: '/story-detail',
      params: { id: relatedStory.id }
    });
  };

  const handleExploreMore = () => {
    router.push('/stories');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar activeRoute="STORIES" onNavigate={handleNavigate} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff88" />
          <Text style={styles.loadingText}>Loading story...</Text>
        </View>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.container}>
        <Navbar activeRoute="STORIES" onNavigate={handleNavigate} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Story not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/stories')}
          >
            <Text style={styles.backButtonText}>← Back to Stories</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar activeRoute="STORIES" onNavigate={handleNavigate} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {story.featured_image && (
          <Image
            source={{ uri: story.featured_image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title}>{story.title}</Text>
          
          {/* Meta Info */}
          <View style={styles.metaContainer}>
            {story.location && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>{story.location}</Text>
              </View>
            )}
            
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>👁️</Text>
              <Text style={styles.metaText}>{story.views || 0} views</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>
                {new Date(story.published_at || story.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Story Content */}
          <Text style={styles.content}>{story.content}</Text>
        </View>

        {/* Related Stories Section */}
        {relatedStories.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Stories</Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedGrid}
            >
              {relatedStories.map((relatedStory) => (
                <TouchableOpacity
                  key={relatedStory.id}
                  style={styles.relatedCard}
                  onPress={() => handleRelatedStoryPress(relatedStory)}
                  activeOpacity={0.8}
                >
                  <View style={styles.relatedImageContainer}>
                    {relatedStory.featured_image ? (
                      <Image
                        source={{ uri: relatedStory.featured_image }}
                        style={styles.relatedImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.relatedPlaceholder}>
                        <Text style={styles.relatedPlaceholderText}>📖</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.relatedCardTitle} numberOfLines={2}>
                    {relatedStory.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.exploreButton}
              onPress={handleExploreMore}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreButtonText}>EXPLORE MORE</Text>
            </TouchableOpacity>
          </View>
        )}

        <Footer onNavigate={handleNavigate} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#888',
  },
  errorText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: '600',
  },
  heroImage: {
    width: '100%',
    height: width > 768 ? 500 : 300,
    backgroundColor: '#1a1a1a',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: width > 768 ? 42 : 32,
    fontWeight: '900',
    color: '#00ff88',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    lineHeight: width > 768 ? 50 : 38,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#888',
  },
  divider: {
    height: 2,
    backgroundColor: '#00ff88',
    marginBottom: 30,
    opacity: 0.3,
  },
  content: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 28,
    marginBottom: 20,
  },
  relatedSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    borderTopWidth: 2,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
  },
  relatedTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 2,
  },
  relatedGrid: {
    paddingHorizontal: 10,
    gap: 20,
    marginBottom: 40,
  },
  relatedCard: {
    width: 200,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  relatedImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#00ff88',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    marginBottom: 15,
  },
  relatedImage: {
    width: '100%',
    height: '100%',
  },
  relatedPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  relatedPlaceholderText: {
    fontSize: 48,
  },
  relatedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 18,
  },
  exploreButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    alignSelf: 'center',
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 2,
  },
});