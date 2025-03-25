<template>
  <div
    class="p-5 border border-gray-700 rounded-lg max-w-xl mx-auto flex flex-col"
  >
    <h2 class="text-xl font-bold mb-4 text-center">
      <code class="bg-bg-accent-dark text-white rounded-md px-2 py-1">{{
        projectId
      }}</code>
    </h2>
    <div class="flex-1 overflow-y-auto space-y-4 p-4">
      <div
        v-if="comments.length === 0"
        class="no-comments text-gray-500 text-center p-5"
      >
        Чат пуст. Начните обсуждение...
      </div>
      <CommentCard
        v-else
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
      />
    </div>
    <div class="flex gap-2 mt-4">
      <textarea
        v-model="newComment"
        @keyup.enter="addComment"
        placeholder="Введите ваш комментарий..."
        class="w-[95%] p-2 border border-gray-600 rounded-md bg-gray-800 text-white resize-none overflow-auto h-20"
      ></textarea>
      <button
        @click="addComment"
        class="p-2 text-white rounded-full hover:text-blue-500"
      >
        <i class="fa-solid fa-arrow-up"></i>
      </button>
    </div>
    <Notification :notifications="notifications" @close="removeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { generateId } from "../../../shared/lib/generateId";
import type { Comment } from "../../../entities/comment/types";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { user } from "../../../shared/lib/auth";
import CommentCard from "../ui/CommentCard.vue";
import Notification from "../../notification/ui/Notification.vue";

const props = defineProps<{
  projectId: string | null;
}>();

const comments = ref<Comment[]>([]);
const newComment = ref<string>("");
const notifications = ref<
  Array<{ id: string; message: string; type: "success" | "error" }>
>([]);

const loadComments = async () => {
  if (!props.projectId) return;

  try {
    comments.value = await supabaseHelper.fetchCommentsFromProject(
      props.projectId
    );
  } catch (err) {
    console.error("Failed to load comments:", err);
  }
};

watch(
  () => props.projectId,
  (newVal) => {
    if (newVal) {
      loadComments();
    } else {
      comments.value = [];
    }
  },
  { immediate: true }
);

const addComment = async () => {
  if (newComment.value.trim() === "") {
    addNotification("Комментарий не может быть пустым.", "error");
    return;
  }

  const cid = generateId();
  const userId = await supabaseHelper.getUserId(user.value.email);
  if (newComment.value.trim() !== "" && props.projectId) {
    const comment: Comment = {
      id: cid,
      createdAt: new Date(),
      userId: userId,
      comment: newComment.value,
      projectId: props.projectId,
    };

    try {
      await supabaseHelper.addComment(comment);
      comments.value.push(comment);
      newComment.value = "";
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  }
};

const addNotification = (message: string, type: "success" | "error") => {
  const id = generateId();
  notifications.value.push({ id, message, type });
  setTimeout(() => removeNotification(id), 3000); // Automatically remove notification after 3 seconds
};

const removeNotification = (id: string) => {
  notifications.value = notifications.value.filter(
    (notification) => notification.id !== id
  );
};
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
