<template>
  <div
    class="comment-card border border-gray-200 rounded-lg p-4 mb-2 bg-zinc-900"
  >
    <div class="flex justify-between">
      <p class="comment-id text-gray-500">{{ username }}</p>
      <div v-if="isCurrentUser" class="flex gap-4">
        <button
          @click="startEditing"
          class="hover:text-gray-300 hover:bg-gray-600 px-1 rounded duration-150"
        >
          <i class="fa-solid fa-edit"></i>
        </button>
        <button
          @click="deleteComment"
          class="hover:text-gray-300 hover:bg-gray-600 px-1 rounded duration-150"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>

    <div v-if="isEditing" class="comment-edit-container mt-2">
      <textarea
        v-model="editedComment"
        class="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
        rows="3"
      ></textarea>
      <div class="flex justify-end gap-2 mt-2">
        <button
          @click="cancelEditing"
          class="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Отмена
        </button>
        <button
          @click="saveComment"
          class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Сохранить
        </button>
      </div>
    </div>
    <div v-else class="comment-text-container relative">
      <p
        ref="commentText"
        :class="['comment-text text-gray-300', { 'line-clamp-3': !isExpanded }]"
        v-html="formatCommentText(comment.comment)"
      ></p>
      <button
        v-if="isOverflow"
        @click="toggleExpand"
        class="hover:underline text-blue-500"
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
import { defineProps, ref, onMounted, nextTick, computed, onUnmounted } from "vue";
import type { Comment } from "../../../entities/comment/types";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { user } from "../../../shared/lib/auth";

const props = defineProps<{
  comment: Comment;
}>();

const emit = defineEmits(["commentDeleted", "commentUpdated"]);

const username = ref<string>("");
const isExpanded = ref<boolean>(false);
const isOverflow = ref<boolean>(false);
const commentText = ref<HTMLElement | null>(null);
const isEditing = ref(false);
const editedComment = ref("");
const currentUserId = ref("");

const isCurrentUser = computed(() => {
  return currentUserId.value === props.comment.userId;
});

const fetchUsername = async () => {
  try {
    const email = await supabaseHelper.getUserEmail(props.comment.userId);
    username.value = email.split("@")[0];
  } catch (error) {
    console.error("Failed to fetch username:", error);
    username.value = "Anonymous";
  }
};

const formatCommentText = (text: string) => {
  return text.replace(
    /@([\w-]+)/g,
    '<span class="mention bg-blue-500/20 text-blue-400 px-1 rounded">@$1</span>'
  );
};

const fetchCurrentUserId = async () => {
  try {
    if (user.value?.email) {
      currentUserId.value = await supabaseHelper.getUserId(user.value.email);
    }
  } catch (error) {
    console.error("Failed to fetch current user ID:", error);
  }
};

const formatTimestamp = (timestamp: Date) => {
  const date = new Date(timestamp);
  
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow' // Для UTC+3
  }).format(date);
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const checkOverflow = () => {
  if (commentText.value) {
    isOverflow.value =
      commentText.value.scrollHeight > commentText.value.clientHeight;
  }
};

const startEditing = () => {
  editedComment.value = props.comment.comment;
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
};

const saveComment = async () => {
  try {
    const updatedComment = {
      ...props.comment,
      comment: editedComment.value,
    };
    await supabaseHelper.editComment(updatedComment);
    emit("commentUpdated", updatedComment);
    isEditing.value = false;
  } catch (error) {
    console.error("Failed to update comment:", error);
  }
};

const deleteComment = async () => {
  try {
    await supabaseHelper.deleteComment(props.comment.id);
    emit("commentDeleted", props.comment.id);
  } catch (error) {
    console.error("Failed to delete comment:", error);
  }
};

onMounted(async () => {
  await fetchUsername();
  await fetchCurrentUserId();
  await nextTick();
  checkOverflow();
  
  // Добавляем обработчик изменения размера окна
  window.addEventListener('resize', checkOverflow);
});

// Не забудьте удалить обработчик при уничтожении компонента
onUnmounted(() => {
  window.removeEventListener('resize', checkOverflow);
});
</script>

<style>
/* Обновленные стили для текста комментария */
.comment-text {
  white-space: pre-wrap; /* Сохраняем переносы строк */
  word-wrap: break-word; /* Переносим длинные слова */
  overflow-wrap: break-word; /* Альтернатива для word-wrap */
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  white-space: pre-wrap; /* Добавляем для сохранения переносов */
}

.mention {
  background-color: rgba(59, 130, 246, 0.2);
  padding: 0 2px;
  border-radius: 3px;
  color: #3b82f6;
  display: inline; /* Убедимся, что упоминания отображаются правильно */
}
</style>
