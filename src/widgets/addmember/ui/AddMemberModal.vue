<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-bg-accent-dark rounded-lg p-6 w-96">
      <h2 class="text-xl mb-4">Добавить участника</h2>
      <input
        v-model="newMemberEmail"
        type="email"
        placeholder="Введите email участника"
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
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        >
          Добавить
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
      const orgId = route.params.orgId as string;
      if (!orgId) {
        throw new Error("Organization ID is missing");
      }

      await supabaseHelper.inviteMember(newMemberEmail.value, orgId);
      emit("memberAdded", newMemberEmail.value);
    } catch (error) {
      console.error("Ошибка при добавлении участника:", error);
    }
  }
};

defineExpose({
  openModal,
  closeModal, 
});
</script>
