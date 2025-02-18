<script setup lang="ts">
import { ref, watch } from 'vue'
import { supabase } from '../../../shared/api/supabaseClient'

interface Props {
  path?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 8
})

const emit = defineEmits<{
  (e: 'upload'): void
  (e: 'update:path', path: string): void
}>()

const uploading = ref(false)
const src = ref('')
const files = ref<FileList | null>(null)

const downloadImage = async (path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('avatars')
      .download(path)

    if (error) throw error
    if (!data) return

    src.value = URL.createObjectURL(data)
  } catch (error) {
    console.error('Error downloading image:', error)
  }
}

const uploadAvatar = async (evt: Event) => {
  const target = evt.target as HTMLInputElement
  files.value = target.files

  try {
    uploading.value = true
    
    if (!files.value || files.value.length === 0) {
      throw new Error('Please select an image to upload')
    }

    const file = files.value[0]
    const fileExt = file.name.split('.').pop()
    const filePath = `${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    emit('update:path', filePath)
    emit('upload')
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Upload failed')
  } finally {
    uploading.value = false
  }
}

watch(
  () => props.path,
  (newPath) => {
    if (newPath) downloadImage(newPath)
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="relative">
      <img
        v-if="src"
        :src="src"
        alt="Avatar"
        class="rounded-full object-cover border-4 border-gray-200"
        :style="{
          width: `${size}em`,
          height: `${size}em`,
          minWidth: `${size}em`,
        }"
      />
      <div
        v-else
        class="rounded-full bg-gray-200 border-4 border-gray-200"
        :style="{
          width: `${size}em`,
          height: `${size}em`,
        }"
      />

      <label
        class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-pointer"
        :class="{ 'opacity-50': uploading }"
      >
        <span class="text-white text-sm font-medium">
          {{ uploading ? 'Uploading...' : 'Change' }}
        </span>
        <input
          type="file"
          accept="image/*"
          class="hidden"
          @change="uploadAvatar"
          :disabled="uploading"
        />
      </label>
    </div>
  </div>
</template>