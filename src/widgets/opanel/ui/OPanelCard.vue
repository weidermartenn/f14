<template>
  <div
    @click="handleOrg"
    class="w-full flex items-center bg-bg-dark hover:bg-zinc-900 cursor-pointer p-4 rounded-md duration-150"
    :class="{ 'bg-bg-accent-darker border-l-4 border-blue-500': isSelected }"
  >
    <div class="flex flex-col">
      <span class="text-lg">{{ org.name }}</span>
      <span class="text-sm text-gray-300">{{ org.members_count }} {{ pluralize(org.members_count, ['участник', 'участника', 'участников']) }}</span>
      <span class="text-sm text-gray-300">
        Лидер: {{ leaderEmail }}<span v-if="isCurrentUserLeader" class="text-teal-700"> (Вы)</span>
      </span>
      <div class="flex gap-2 mt-2">
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

const props = defineProps<{
  org: Orgs;
  isSelected?: boolean;
}>();

const emit = defineEmits(['select']);

const allMemberEmails = ref<{ [key: string]: string }>({});
const memberColors = ref<{ [key: string]: string }>({});
const leaderEmail = ref("");

const isCurrentUserLeader = computed(() => {
  return leaderEmail.value === user.value.email;
});

const handleOrg = () => {
  emit('select', props.org);
};

const getContrastColor = (hexColor: string): string => {
  if (!hexColor) return "#FFFFFF";
  hexColor = hexColor.replace("#", "");
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
};

onMounted(async () => {
  try {
    const leaderEmailResponse = await supabaseHelper.getUserEmail(props.org.leaderId);
    allMemberEmails.value[props.org.leaderId] = leaderEmailResponse;
    leaderEmail.value = leaderEmailResponse;

    for (const memberId of props.org.membersIds) {
      const email = await supabaseHelper.getUserEmail(memberId);
      allMemberEmails.value[memberId] = email;
    }

    for (const memberId of props.org.membersIds) {
      const color = await supabaseHelper.getUserColor(memberId);
      memberColors.value[memberId] = color;
    }
  } catch (error) {
    console.error("Ошибка при получении почты пользователей:", error);
  }
});

function pluralize(
  count: number,
  words: [string, string, string]
): string {
  if (count % 10 === 1 && count % 100 !== 11) return words[0];
  if (count % 10 >= 1 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return words[1];
  return words[2];
}
</script>