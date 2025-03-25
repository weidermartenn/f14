<template>
    <div class="comment-card border border-gray-200 rounded-lg p-4 mb-2 bg-zinc-900">
      <p class="comment-id text-gray-500">{{ username }}</p>
      <div class="comment-text-container relative">
        <p
          ref="commentText"
          :class="['comment-text text-gray-300', { 'line-clamp-3': !isExpanded }]"
        >
          {{ comment.comment }}
        </p>
        <button
          v-if="isOverflow"
          @click="toggleExpand"
          class="hover:underline "
        >
          {{ isExpanded ? "Свернуть" : "Развернуть" }}
        </button>
      </div>
      <span class="comment-timestamp text-sm text-gray-600">{{
        formatTimestamp(comment.createdAt)
      }}</span>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, ref, onMounted, nextTick } from "vue";
  import type { Comment } from "../../../entities/comment/types";
  import { supabaseHelper } from "../../../shared/api/sbHelper";
  
  const props = defineProps<{
    comment: Comment;
  }>();
  
  const username = ref<string>("");
  const isExpanded = ref<boolean>(false);
  const isOverflow = ref<boolean>(false);
  const commentText = ref<HTMLElement | null>(null);
  
  const fetchUsername = async () => {
    try {
      const email = await supabaseHelper.getUserEmail(props.comment.userId);
      username.value = email.split("@")[0];
    } catch (error) {
      console.error("Failed to fetch username:", error);
      username.value = "Anonymous";
    }
  };
  
  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
  };
  
  const checkOverflow = () => {
    if (commentText.value) {
      isOverflow.value = commentText.value.scrollHeight > commentText.value.clientHeight;
    }
  };
  
  onMounted(async () => {
    await fetchUsername();
    await nextTick(); // Ensure the DOM is updated
    checkOverflow();
  });
  </script>
  
  <style scoped>
  .comment-text {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    box-orient: vertical;
    word-wrap: break-word; /* Ensure text wraps within the container */
  }
  
  .line-clamp-3 {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
  </style>
  