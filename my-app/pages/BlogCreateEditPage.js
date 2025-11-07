import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../utils/auth_context';
import { supabase } from '../utils/supabase';

export default function BlogCreateEditPage({ post, onNavigateBack, onSave }) {
  const { user } = useAuth();
  const [title, setTitle] = useState(post?.title || '');
  const [subTitle, setSubTitle] = useState(post?.sub_title || '');
  const [description, setDescription] = useState(post?.description || '');
  const [imageBase64, setImageBase64] = useState(post?.image_base64 || '');
  const [reference, setReference] = useState(
    post?.reference ? JSON.stringify(post.reference, null, 2) : ''
  );
  const [loading, setLoading] = useState(false);
  const isEditing = !!post;

  useEffect(() => {
    // Request permission to access media library
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Sorry, we need camera roll permissions to upload images!'
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImageBase64(result.assets[0].base64);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => setImageBase64(''),
          style: 'destructive',
        },
      ]
    );
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    
    // Validate JSON reference if provided
    if (reference.trim()) {
      try {
        JSON.parse(reference);
      } catch (error) {
        Alert.alert('Error', 'Reference must be valid JSON format');
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const blogData = {
        title: title.trim(),
        sub_title: subTitle.trim() || null,
        description: description.trim(),
        image_base64: imageBase64 || null,
        reference: reference.trim() ? JSON.parse(reference) : null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (isEditing) {
        // Update existing post
        result = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', post.id)
          .eq('user_id', user.id);
      } else {
        // Create new post
        blogData.user_id = user.id;
        result = await supabase
          .from('blog_posts')
          .insert([blogData]);
      }

      if (result.error) throw result.error;

      Alert.alert(
        'Success',
        `Blog post ${isEditing ? 'updated' : 'created'} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSave) onSave();
              onNavigateBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} blog post: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Post' : 'Create Post'}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter blog post title"
                value={title}
                onChangeText={setTitle}
                editable={!loading}
                maxLength={200}
              />
            </View>

            {/* Sub Title Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sub Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter sub title (optional)"
                value={subTitle}
                onChangeText={setSubTitle}
                editable={!loading}
                maxLength={200}
              />
            </View>

            {/* Image Section */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Image</Text>
              {imageBase64 ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
                    style={styles.selectedImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={pickImage}
                      disabled={loading}
                    >
                      <Text style={styles.changeImageButtonText}>Change Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={removeImage}
                      disabled={loading}
                    >
                      <Text style={styles.removeImageButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImage}
                  disabled={loading}
                >
                  <Text style={styles.addImageButtonText}>+ Add Image</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your blog post content here..."
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={10}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            {/* Reference Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>References (JSON format)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder='{"source": "example.com", "author": "John Doe"}'
                value={reference}
                onChangeText={setReference}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
              <Text style={styles.helperText}>
                Optional: Add references in JSON format
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    marginBottom: 10,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  changeImageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changeImageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeImageButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeImageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addImageButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});