<template>
  <div
    class="comment-card w-full rounded-xl p-4 transition-all duration-200"
    :class="{
      'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50': isCurrentUser,
      'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700': !isCurrentUser
    }"
  >
    <!-- Заголовок комментария -->
    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
          :class="isCurrentUser ? 'bg-blue-600' : 'bg-gray-600'">
          {{ username[0] }}
        </div>
        <div>
          <p class="font-medium text-gray-900 dark:text-gray-100">{{ username }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ formattedTime }}</p>
        </div>
      </div>
      
      <div v-if="isCurrentUser" class="flex gap-1">
        <button
          @click="startEditing"
          class="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
          title="Редактировать"
        >
          <i class="fas fa-edit text-sm"></i>
        </button>
        <button
          @click="deleteComment"
          class="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          title="Удалить"
        >
          <i class="fas fa-trash-alt text-sm"></i>
        </button>
      </div>
    </div>

    <!-- Редактирование комментария -->
    <div v-if="isEditing" class="mt-3">
      <textarea
        v-model="editedComment"
        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        rows="3"
        maxlength="250"
        autofocus
      ></textarea>
      <div class="flex justify-end gap-2 mt-2">
        <button
          @click="cancelEditing"
          class="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Отмена
        </button>
        <button
          @click="saveComment"
          class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          :disabled="editedComment.trim() === ''"
          :class="{'opacity-50 cursor-not-allowed': editedComment.trim() === ''}"
        >
          Сохранить
        </button>
      </div>
    </div>
    
    <!-- Содержимое комментария -->
    <div v-else class="comment-content mt-2">
      <div
        ref="commentText"
        class="comment-text text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words"
        :class="{'line-clamp-3': !isExpanded && shouldShowToggle}"
        v-html="formatCommentText(comment.comment)"
      ></div>
      
      <!-- Кнопка развернуть/свернуть -->
      <button
        v-if="shouldShowToggle"
        @click="toggleExpand"
        class="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-1 transition-colors duration-200 flex items-center gap-1"
      >
        <i class="fas" :class="isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        {{ isExpanded ? 'Свернуть' : 'Развернуть' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, nextTick, computed } from "vue";
import type { Comment } from "../../../entities/comment/types";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { user } from "../../../shared/lib/auth";

const props = defineProps<{
  comment: Comment;
  isLeader: boolean;
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
  return currentUserId.value === props.comment.userId || props.isLeader;
});

const shouldShowToggle = computed(() => {
  return isOverflow.value && props.comment.comment.length > 100;
});

const formattedTime = computed(() => {
  const date = new Date(props.comment.createdAt);
  // Убедимся, что время корректно (учитываем локальное время)
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
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

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const checkOverflow = async () => {
  await nextTick();
  if (commentText.value) {
    // Проверяем, превышает ли высота содержимого высоту элемента
    isOverflow.value = commentText.value.scrollHeight > commentText.value.clientHeight;
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
  if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) return;
  
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
  await checkOverflow();
});

// Добавляем обработчик ресайза
window.addEventListener('resize', checkOverflow);
</script>

<style scoped>
.comment-card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.comment-text {
  line-height: 1.5;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mention {
  background-color: rgba(59, 130, 246, 0.2);
  padding: 0 2px;
  border-radius: 3px;
  color: #3b82f6;
  font-weight: 500;
  transition: all 0.2s;
}

.mention:hover {
  background-color: rgba(59, 130, 246, 0.3);
  text-decoration: none;
}
</style>