<template>
  <div
    @click="handleOrg"
    class="w-full flex items-center bg-bg-dark hover:bg-zinc-900 cursor-pointer p-4 rounded-md"
  >
    <div class="flex flex-col">
      <span class="text-lg">{{ org.name }}</span>
      <span class="text-sm text-gray-300">
        Лидер: {{ leaderEmail }}<span v-if="isCurrentUserLeader" class="text-teal-700"> (Вы)</span>
      </span>
      <div class="flex gap-2 mt-2">
        <!-- Кружки для всех участников, включая лидера -->
        <div
          v-for="(email, id) in allMemberEmails"
          :key="id"
          class="w-8 h-8 flex items-center justify-center rounded-full"
          :style="{ backgroundColor: memberColors[id], color: getContrastColor(memberColors[id]) }"
          :title="email"
        >
          {{ email.charAt(0).toUpperCase() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, computed } from "vue";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { user } from "../../../shared/lib/auth";
import type { Orgs } from "../../../entities/org/types";
import { useRouter } from "vue-router";

const props = defineProps<{
  org: Orgs;
}>();

const allMemberEmails = ref<{ [key: string]: string }>({});
const memberColors = ref<{ [key: string]: string }>({});
const leaderEmail = ref("");

const isCurrentUserLeader = computed(() => {
  return leaderEmail.value === user.value.email;
});

const router = useRouter();

const handleOrg = () => {
  router.push({
    name: "projects",
    params: { orgId: props.org.id },
  });
};

const getContrastColor = (hexColor: string): string => {
  if (!hexColor) return "#FFFFFF"; // Default to white if hexColor is not defined

  // Удаляем символ #, если он есть
  hexColor = hexColor.replace("#", "");

  // Преобразуем HEX в RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  // Вычисляем яркость
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Возвращаем черный или белый цвет в зависимости от яркости
  return brightness > 128 ? "#000000" : "#FFFFFF";
};

onMounted(async () => {
  try {
    // Получение почты лидера
    const leaderEmailResponse = await supabaseHelper.getUserEmail(props.org.leaderId);
    allMemberEmails.value[props.org.leaderId] = leaderEmailResponse;
    leaderEmail.value = leaderEmailResponse;

    // Получение почты всех участников
    for (const memberId of props.org.membersIds) {
      const email = await supabaseHelper.getUserEmail(memberId);
      allMemberEmails.value[memberId] = email;
    }

    // Получение цвета всех участников
    for (const memberId of props.org.membersIds) {
      const color = await supabaseHelper.getUserColor(memberId);
      memberColors.value[memberId] = color;
    }
  } catch (error) {
    console.error("Ошибка при получении почты пользователей:", error);
  }
});
</script>

<style scoped>
/* Дополнительные стили, если нужно */
</style>
