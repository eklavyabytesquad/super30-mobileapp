import { supabase } from './supabase';

// Blog post utilities
export const blogUtils = {
  // Fetch all blog posts
  async getAllBlogPosts() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error.message };
    }
  },

  // Fetch blog posts by user
  async getBlogPostsByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error.message };
    }
  },

  // Create a new blog post
  async createBlogPost(blogData) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([blogData])
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update blog post
  async updateBlogPost(postId, blogData, userId) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(blogData)
        .eq('id', postId)
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Delete blog post
  async deleteBlogPost(postId, userId) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get single blog post
  async getBlogPost(postId) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Format date for display
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Validate JSON string
  isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Truncate text
  truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
};