<template>
  <div class="flex flex-col h-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
    <!-- Заголовок чата -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Чат проекта
      </h3>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ comments.length }} сообщений
      </div>
    </div>

    <!-- Список комментариев -->
    <div class="flex-1 min-h-0 overflow-y-scroll max-h-[400px]">
      <div
        ref="commentsList"
        class="h-full pr-2 space-y-3"
      >
        <div
          v-if="comments.length === 0"
          class="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
        >
          <i class="fas fa-comments text-4xl mb-2"></i>
          <p>Чат пуст. Начните обсуждение...</p>
        </div>

        <template v-for="comment in comments" :key="comment.id">
          <CommentCard
            :comment="comment"
            :isLeader="isLeader"
            @commentDeleted="handleCommentDeleted"
            @commentUpdated="handleCommentUpdated"
            :class="{ 'ml-auto': isCurrentUser(comment.userId) }"
          />
        </template>
      </div>
    </div>

    <!-- Поле ввода нового комментария -->
    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="relative flex items-end gap-2">
        <div class="flex-1 relative">
          <textarea
            v-model="newComment"
            @keyup.enter.exact="addComment"
            @input="checkForMention"
            placeholder="Напишите сообщение..."
            class="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="1"
            maxlength="250"
            style="min-height: 44px; max-height: 120px"
          ></textarea>

          <!-- Счетчик символов -->
          <div
            class="absolute bottom-2 right-2 text-xs px-1.5 py-0.5 rounded"
            :class="{
              'text-gray-500': remainingChars > 20,
              'text-yellow-800': remainingChars <= 20 && remainingChars > 0,
              'text-red-800': remainingChars === 0,
            }"
          >
            {{ remainingChars }}/250
          </div>
        </div>

        <!-- Кнопка отправки -->
        <button
          @click="addComment"
          class="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="newComment.trim() === ''"
        >
          <i class="fas fa-paper-plane"></i>
        </button>

        <!-- Выпадающий список упоминаний -->
        <div
          v-if="showMentionDropdown && filteredMembers.length > 0"
          class="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
        >
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
            @click="insertMention(member)"
          >
            <div
              class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs"
            >
              {{ member.email[0].toUpperCase() }}
            </div>
            <span>{{ member.email.split("@")[0] }}</span>
          </div>
        </div>
      </div>

      <!-- Подсказка -->
      <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 flex flex-col">
        <span>Нажмите @ чтобы упомянуть участника</span>
        <span>Нажмите Enter чтобы отправить комментарий</span>
      </div>
    </div>

    <Notification :notifications="notifications" @close="removeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick, onUpdated } from "vue";
import { useRoute } from "vue-router";
import { generateId } from "../../../shared/lib/generateId";
import type { Comment } from "../../../entities/comment/types";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { user } from "../../../shared/lib/auth";
import Notification from "../../notification/ui/Notification.vue";
import { supabase } from "../../../shared/api/supabaseClient";
import CommentCard from "./CommentCard.vue";

const props = defineProps<{
  projectId: string | null;
}>();

const MAX_COMMENT_LENGTH = 250;

const members = ref<any[]>([]);
const showMentionDropdown = ref(false);
const mentionQuery = ref("");
const commentsList = ref<HTMLElement | null>(null);

const route = useRoute();
const isLeader = ref(false);

const remainingChars = computed(() => {
  return MAX_COMMENT_LENGTH - newComment.value.length;
});

// Автоматический скролл вниз при обновлении комментариев
onUpdated(() => {
  nextTick(() => {
    if (commentsList.value) {
      commentsList.value.scrollTop = commentsList.value.scrollHeight;
    }
  });
});

const checkIfLeader = async () => {
  try {
    const orgId = route.params.orgId as string;
    const leaderId = await supabaseHelper.fetchOrgLeader(orgId);
    const currentUserEmail = user.value?.email;
    if (currentUserEmail) {
      const currentUserId = await supabaseHelper.getUserId(currentUserEmail);
      isLeader.value = currentUserId === leaderId;
    }
  } catch (error) {
    console.error("Error checking leader status:", error);
  }
};

const filteredMembers = computed(() => {
  return members.value.filter(
    (member) =>
      member.email.toLowerCase().includes(mentionQuery.value.toLowerCase()) ||
      member.email
        .split("@")[0]
        .toLowerCase()
        .includes(mentionQuery.value.toLowerCase())
  );
});

const comments = ref<Comment[]>([]);
const newComment = ref<string>("");
const notifications = ref<
  Array<{ id: string; message: string; type: "success" | "error" }>
>([]);

const fetchMembers = async () => {
  if (!props.projectId) return;

  try {
    const project = await supabaseHelper.fetchProject(props.projectId);
    if (project && project.orgId) {
      const emails = await supabaseHelper.fetchOrgMembers(project.orgId);
      members.value = await Promise.all(
        emails.map(async (email: string) => {
          const userId = await supabaseHelper.getUserId(email);
          return { email, id: userId };
        })
      );
    }
  } catch (error) {
    console.error("Error fetching members:", error);
  }
};

const checkForMention = (e: Event) => {
  const textarea = e.target as HTMLTextAreaElement;
  const text = textarea.value;
  const cursorPos = textarea.selectionStart;
  const textBeforeCursor = text.substring(0, cursorPos);

  const lastAtPos = textBeforeCursor.lastIndexOf("@");

  const isIsolatedAt =
    lastAtPos >= 0 &&
    (cursorPos === lastAtPos + 1 ||
      /[\s]/.test(textBeforeCursor[lastAtPos - 1]));

  if (isIsolatedAt) {
    mentionQuery.value = textBeforeCursor.substring(lastAtPos + 1);
    showMentionDropdown.value = true;

    const textareaRect = textarea.getBoundingClientRect();
    const dropdown = document.querySelector(".mention-dropdown") as HTMLElement;
    if (dropdown) {
      dropdown.style.left = `${textareaRect.left}px`;
      dropdown.style.bottom = `${window.innerHeight - textareaRect.top}px`;
    }
  } else {
    showMentionDropdown.value = false;
  }
};

const insertMention = (member: any) => {
  const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
  const text = textarea.value;
  const cursorPos = textarea.selectionStart;
  const textBeforeCursor = text.substring(0, cursorPos);
  const lastAtPos = textBeforeCursor.lastIndexOf("@");

  if (lastAtPos >= 0) {
    const username = member.email.split("@")[0];
    const newText =
      text.substring(0, lastAtPos) +
      `@${username}` +
      text.substring(cursorPos);

    newComment.value = newText;
    textarea.focus();
    textarea.selectionStart = lastAtPos + username.length + 1;
    textarea.selectionEnd = lastAtPos + username.length + 1;
  }

  showMentionDropdown.value = false;
};

const sendNotification = async (
  comment: Comment,
  mentionedUserIds: string[] = []
) => {
  try {
    const project = await supabaseHelper.fetchProject(comment.projectId);
    if (!project) return;

    const notificationsToInsert = <any>[];
    const currentTime = new Date().toISOString();

    const allMembers = members.value.filter(
      (member) => member.id !== comment.userId
    );
    const allMemberIds = allMembers.map((member) => member.id);

    mentionedUserIds.forEach((userId) => {
      notificationsToInsert.push({
        id: generateId(),
        userId: userId,
        title: `Вас упомянули в проекте ${project.name}`,
        content:
          comment.comment.length > 50
            ? `${comment.comment.substring(0, 50)}...`
            : comment.comment,
        type: "mention",
        projectId: project.id,
        commentId: comment.id,
        read: false,
        createdAt: currentTime,
      });
    });

    allMemberIds.forEach((userId) => {
      if (!mentionedUserIds.includes(userId)) {
        notificationsToInsert.push({
          id: generateId(),
          userId: userId,
          title: `Новое сообщение в проекте ${project.name}`,
          content:
            comment.comment.length > 50
              ? `${comment.comment.substring(0, 50)}...`
              : comment.comment,
          type: "comment",
          projectId: project.id,
          commentId: comment.id,
          read: false,
          createdAt: currentTime,
        });
      }
    });

    if (notificationsToInsert.length > 0) {
      const { error } = await supabase
        .from("notifications")
        .insert(notificationsToInsert);

      if (error) throw error;
    }
  } catch (error) {
    console.error("Ошибка при отправке уведомлений:", error);
  }
};

const handleCommentDeleted = (commentId: string) => {
  comments.value = comments.value.filter((comment) => comment.id !== commentId);
  addNotification("Комментарий удалён", "success");
};

const handleCommentUpdated = (updatedComment: Comment) => {
  const index = comments.value.findIndex((c) => c.id === updatedComment.id);
  if (index !== -1) {
    comments.value[index] = updatedComment;
    addNotification("Комментарий обновлён", "success");
  }
};

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
      fetchMembers();
    } else {
      comments.value = [];
    }
  },
  { immediate: true }
);

onMounted(() => {
  fetchMembers();
  loadComments();
  checkIfLeader();
});

const addComment = async () => {
  if (newComment.value.trim() === "") {
    addNotification("Комментарий не может быть пустым.", "error");
    return;
  }

  if (newComment.value.length > MAX_COMMENT_LENGTH) {
    addNotification(
      `Комментарий не может превышать ${MAX_COMMENT_LENGTH} символов.`,
      "error"
    );
    return;
  }

  const cid = generateId();
  const userId = await supabaseHelper.getUserId(user.value.email);

  if (newComment.value.trim() !== "" && props.projectId) {
    try {
      const mentions = [...newComment.value.matchAll(/@(\w+)/g)];
      const mentionedUserIds = [];
      for (const m of mentions) {
        const username = m[1].toLowerCase();
        const member = members.value.find(
          (mem) => mem.email.split("@")[0].toLowerCase() === username
        );
        if (member) mentionedUserIds.push(member.id);
      }

      const comment: Comment = {
        id: cid,
        createdAt: new Date(),
        userId: userId,
        comment: newComment.value,
        projectId: props.projectId,
      };

      await supabaseHelper.addComment(comment);
      comments.value.push(comment);
      newComment.value = "";

      await sendNotification(comment, mentionedUserIds);

      addNotification("Комментарий добавлен", "success");
    } catch (err) {
      console.error("Ошибка при добавлении комментария:", err);
      addNotification("Ошибка при добавлении комментария", "error");
    }
  }
};

const addNotification = (message: string, type: "success" | "error") => {
  const id = generateId();
  notifications.value.push({ id, message, type });
  setTimeout(() => removeNotification(id), 3000);
};

const removeNotification = (id: string) => {
  notifications.value = notifications.value.filter(
    (notification) => notification.id !== id
  );
};

const isCurrentUser = (userId: string) => {
  return userId === user.value?.id;
};
</script>

<style>
/* Кастомные стили для скроллбара */
.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark .comments-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.dark .comments-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark .comments-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
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
