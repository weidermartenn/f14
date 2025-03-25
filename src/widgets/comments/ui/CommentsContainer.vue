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
        @commentDeleted="handleCommentDeleted"
        @commentUpdated="handleCommentUpdated"
      />
    </div>
    <div class="flex gap-2 mt-4">
      <textarea
        v-model="newComment"
        @keyup.enter="addComment"
        @input="checkForMention"
        placeholder="Введите ваш комментарий..."
        class="w-[95%] p-2 border border-gray-600 rounded-md bg-gray-800 text-white resize-none overflow-auto h-20"
      ></textarea>
      <button
        @click="addComment"
        class="p-2 text-white rounded-full hover:text-blue-500"
      >
        <i class="fa-solid fa-arrow-up"></i>
      </button>
      <!-- Mention dropdown -->
      <div
        v-if="showMentionDropdown && filteredMembers.length > 0"
        class="mention-dropdown absolute w-48 bg-bg-accent-dark border border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
      >
        <div
          v-for="member in filteredMembers"
          :key="member.id"
          class="p-2 hover:bg-gray-700 cursor-pointer"
          @click="insertMention(member)"
        >
          {{ member.email.split("@")[0] }}
        </div>
      </div>
    </div>
    <Notification :notifications="notifications" @close="removeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { generateId } from "../../../shared/lib/generateId";
import type { Comment } from "../../../entities/comment/types";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { user } from "../../../shared/lib/auth";
import CommentCard from "../ui/CommentCard.vue";
import Notification from "../../notification/ui/Notification.vue";
import { supabase } from "../../../shared/api/supabaseClient";

const props = defineProps<{
  projectId: string | null;
}>();

const members = ref<any[]>([]);
const showMentionDropdown = ref(false);
const mentionQuery = ref("");

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
      // Получаем emails участников организации
      const emails = await supabaseHelper.fetchOrgMembers(project.orgId);

      // Преобразуем emails в массив объектов {email, id}
      members.value = await Promise.all(
        emails.map(async (email: string) => {
          const userId = await supabaseHelper.getUserId(email);
          return { email, id: userId };
        })
      );

      console.log("Fetched members:", members.value); // Для отладки
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

  // Проверяем, что @ не является частью email или другого слова
  const isIsolatedAt =
    lastAtPos >= 0 &&
    (cursorPos === lastAtPos + 1 ||
      /[\s]/.test(textBeforeCursor[lastAtPos - 1]));

  if (isIsolatedAt) {
    mentionQuery.value = textBeforeCursor.substring(lastAtPos + 1);
    showMentionDropdown.value = true;

    // Позиционируем dropdown рядом с курсором
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
      `@${username}` +  // Не добавляем запятую автоматически
      text.substring(cursorPos);
      
    newComment.value = newText;
    textarea.focus();
    textarea.selectionStart = lastAtPos + username.length + 1;
    textarea.selectionEnd = lastAtPos + username.length + 1;
  }

  showMentionDropdown.value = false;
};

const sendNotification = async (comment: Comment, mentionedUserIds: string[] = []) => {
  try {
    const project = await supabaseHelper.fetchProject(comment.projectId);
    if (!project) return;

    const notificationsToInsert = <any>[];
    const currentTime = new Date().toISOString();

    // Получаем всех участников проекта, кроме автора комментария
    const allMembers = members.value.filter(member => member.id !== comment.userId);
    const allMemberIds = allMembers.map(member => member.id);

    // Для упомянутых пользователей
    mentionedUserIds.forEach(userId => {
      notificationsToInsert.push({
        id: generateId(),
        userId: userId,
        title: `Вас упомянули в проекте ${project.name}`,
        content: comment.comment.length > 50 
          ? `${comment.comment.substring(0, 50)}...` 
          : comment.comment,
        type: "mention",
        projectId: project.id,
        commentId: comment.id,
        read: false,
        createdAt: currentTime
      });
    });

    // Для всех остальных участников проекта (обычные уведомления)
    allMemberIds.forEach(userId => {
      // Пропускаем тех, кто уже получил уведомление об упоминании
      if (!mentionedUserIds.includes(userId)) {
        notificationsToInsert.push({
          id: generateId(),
          userId: userId,
          title: `Новое сообщение в проекте ${project.name}`,
          content: comment.comment.length > 50 
            ? `${comment.comment.substring(0, 50)}...` 
            : comment.comment,
          type: "comment",
          projectId: project.id,
          commentId: comment.id,
          read: false,
          createdAt: currentTime
        });
      }
    });

    // Вставка уведомлений
    if (notificationsToInsert.length > 0) {
      const { error } = await supabase
        .from("notifications")
        .insert(notificationsToInsert);
      
      if (error) throw error;
      console.log("Уведомления созданы:", notificationsToInsert);
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
});

const addComment = async () => {
  if (newComment.value.trim() === "") {
    addNotification("Комментарий не может быть пустым.", "error");
    return;
  }

  const cid = generateId();
  const userId = await supabaseHelper.getUserId(user.value.email);
  
  if (newComment.value.trim() !== "" && props.projectId) {
    try {
      // Находим все упоминания в тексте
      const mentions = [...newComment.value.matchAll(/@(\w+)/g)];
      
      // Получаем ID упомянутых пользователей
      const mentionedUserIds = [];
      for (const m of mentions) {
        const username = m[1].toLowerCase();
        const member = members.value.find(
          mem => mem.email.split("@")[0].toLowerCase() === username
        );
        if (member) mentionedUserIds.push(member.id);
      }

      // Создаем комментарий
      const comment: Comment = {
        id: cid,
        createdAt: new Date(),
        userId: userId,
        comment: newComment.value,
        projectId: props.projectId,
      };

      // Добавляем комментарий в базу
      await supabaseHelper.addComment(comment);
      comments.value.push(comment);
      newComment.value = "";

      // Отправляем уведомления
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
  setTimeout(() => removeNotification(id), 3000); // Automatically remove notification after 3 seconds
};

const removeNotification = (id: string) => {
  notifications.value = notifications.value.filter(
    (notification) => notification.id !== id
  );
};
</script>

<style scoped>
.mention-dropdown {
  transform: translateY(-100%);
  margin-bottom: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #4b5563;
}

.mention-dropdown div {
  transition: background-color 0.2s;
  padding: 8px 12px;
}

.mention-dropdown div:hover {
  background-color: #4b5563;
}

.mention {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  padding: 0 2px;
  border-radius: 3px;
  font-weight: 500;
}

.mention:hover {
  text-decoration: underline;
  cursor: pointer;
}

/* Стиль для выделенных упоминаний */
.highlighted-mention {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  padding: 0 2px;
  border-radius: 3px;
}
</style>
