<template>
  <div class="mt-40 flex items-center justify-center p-4 gap-6">
    <div class="col-span-1 w-60 h-60 flex flex-col items-center bg-bg-accent-dark rounded-md">
      <div class="relative w-32 h-32 mt-6 rounded-full overflow-hidden border-4 border-gray-700">
        <Avatar 
          :path="user.avatar_url" 
          @update:path="handlePathUpdate"
          :size="10"
          @upload="handleUploadComplete"
        />
      </div>
      <span class="text-gray-300 text-sm text-center px-4 mt-4">Нажмите на фото, чтобы изменить аватар</span>
    </div>
    <div class="col-span-1 w-[24rem] h-72 flex flex-col bg-bg-accent-dark rounded-md">
      <!-- Раскомментируйте форму, когда будете готовы -->
      <!-- <div class="relative mt-6 px-4 py-2">
          <Input placeholder="Имя пользователя" v-model="user.name"/>
          <Input disabled :placeholder="user.email" v-model="user.email"/>
          <div class="flex justify-center">
            <Button class="mt-6" variant="primary">Сохранить</Button>
          </div>
          <div class="mt-10">
              <span class="text-gray-600">Дата создания: {{ formatDate(user.created_at) }}</span>
          </div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar } from "@/widgets/avatar/";
import { user } from "@/shared/lib/auth";
import { updateUserAvatar, getAvatarUrl } from "@/pages/projects/model/sbHelper";

const handlePathUpdate = async (newPath: string) => {
  if (!user.value) return;
  
  try {
    // Обновляем путь к аватару в базе данных
    await updateUserAvatar(user.value.id, newPath);
    
    // Обновляем локальное состояние пользователя
    user.value.avatar_url = getAvatarUrl(newPath);
  } catch (err) {
    console.error("Ошибка при обновлении аватара:", err);
  }
};

const handleUploadComplete = () => {
  console.log("Аватар успешно загружен");
};

const formatDate = (dateString: Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>