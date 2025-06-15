<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-gray-300 dark:bg-bg-accent-dark rounded-lg p-6 w-96">
      <h2 class="text-xl text-zinc-800 dark:text-f14-font-dark mb-4">Добавить участника</h2>
      <input
        v-model="newMemberEmail"
        type="email"
        placeholder="Введите email пользователя"
        class="w-full text-black p-2 border border-gray-300 rounded-md mb-4"
      />
      <div class="flex justify-end">
        <button
          @click="closeModal"
          class="mr-2 text-gray-500 hover:text-gray-700"
        >
          Отмена
        </button>
        <button
          @click="addMember"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Добавить</span>
          <span v-else>Отправка...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { useRoute } from "vue-router";

const route = useRoute();
const isOpen = ref(false);
const newMemberEmail = ref("");
const isLoading = ref(false);
const emit = defineEmits(["close", "memberAdded"]);

const openModal = () => {
  isOpen.value = true;
};

const closeModal = () => {
  isOpen.value = false;
  newMemberEmail.value = "";
  emit("close");
};

const addMember = async () => {
  if (newMemberEmail.value.trim() !== "") {
    try {
      isLoading.value = true;
      const orgId = route.params.orgId as string;
      if (!orgId) {
        throw new Error("Organization ID is missing");
      }

      await supabaseHelper.inviteMember(newMemberEmail.value, orgId);
      
      // Emit success event to parent
      emit("memberAdded", {
        email: newMemberEmail.value,
        message: `Приглашение отправлено на ${newMemberEmail.value}`
      });
      
      // Close modal after short delay
      setTimeout(() => {
        closeModal();
      }, 500);
    } catch (error) {
      console.error("Ошибка при добавлении участника:", error);
      // You could also emit an error event here if needed
    } finally {
      isLoading.value = false;
    }
  }
};

defineExpose({
  openModal,
  closeModal,
});
</script>