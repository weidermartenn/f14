<template>
  <div class="relative">
    <i
      class="fa-solid fa-bell text-xl text-gray-800 dark:text-gray-300 cursor-pointer hover:text-gray-600 dark:hover:text-white"
      @click="toggleNotifications"
    ></i>
    <div
      v-if="unreadCount > 0"
      class="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
    >
      {{ unreadCount > 9 ? "9+" : unreadCount }}
    </div>

    <div
      v-if="showNotifications"
      class="absolute right-0 mt-2 w-64 bg-gray-200 dark:bg-bg-accent-dark rounded-lg shadow-lg z-50 border border-gray-700"
    >
      <div class="p-2 max-h-64 overflow-y-auto">
        <div
          v-for="notification in sortedNotifications"
          :key="notification.id"
          class="p-2 border-b border-gray-300 bg-gray-200 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-800 cursor-pointer"
          @click="markAsRead(notification)"
          :class="{ 'bg-gray-800/50': !notification.read }"
        >
          <p class="text-sm font-medium">{{ notification.title }}</p>
          <p class="text-xs text-zinc-900 dark:text-gray-400">{{ notification.content }}</p>
          <p class="text-xs text-gray-500 mt-1">
            {{ formatTime(notification.createdAt) }}
          </p>
        </div>
        <p v-if="notifications.length === 0" class="text-sm text-zinc-900 dark:text-gray-400 p-2">
          Нет новых уведомлений
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
import { supabase } from "../../../shared/api/supabaseClient";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { user } from "../../../shared/lib/auth";

const notifications = ref<any[]>([]);
const showNotifications = ref(false);
const unreadCount = ref(0);
const notificationChannel = ref<any>(null);

// Сортируем уведомления - непрочитанные сначала
const sortedNotifications = computed(() => {
  return [...notifications.value].sort((a, b) =>
    a.read === b.read ? 0 : a.read ? 1 : -1
  );
});

const fetchNotifications = async () => {
  if (!user.value) return;

  const userId = await supabaseHelper.getUserId(user.value.email);
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("userId", userId);
      

    if (error) throw error;

    notifications.value = data || [];
    unreadCount.value = data.filter((n) => !n.read).length;  
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};

const markAsRead = async (notification: any) => {
  if (notification.read) return;

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notification.id);

    if (error) throw error;

    notification.read = true;
    unreadCount.value = notifications.value.filter((n) => !n.read).length;
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  // При открытии помечаем все как прочитанные
  if (showNotifications.value) {
    notifications.value.forEach((n) => {
      if (!n.read) markAsRead(n);
    });
  }
};

// Realtime подписка
const setupRealtime = () => {
  if (notificationChannel.value) {
    supabase.removeChannel(notificationChannel.value);
  }

  if (user.value) {
    notificationChannel.value = supabase
      .channel(`notifications:${user.value.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `userId=eq.${user.value.id}`,
        },
        (payload) => {
          console.log("Realtime update:", payload);
          fetchNotifications();
        }
      )
      .subscribe();
  }
};

onMounted(async () => {
  await fetchNotifications();
  setupRealtime();
});

watch(user, (newUser) => {
  if (newUser) {
    fetchNotifications();
    setupRealtime();
  }
});

// Отписываемся при размонтировании
onUnmounted(() => {
  if (notificationChannel.value) {
    supabase.removeChannel(notificationChannel.value);
  }
});
</script>

<style scoped>
.notification-item {
  transition: background-color 0.2s ease;
}

.notification-item.unread {
  background-color: rgba(59, 130, 246, 0.1);
}
</style>
