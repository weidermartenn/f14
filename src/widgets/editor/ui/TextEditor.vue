<template>
  <div class="flex flex-col gap-6">
    <div
      class="bg-bg-dark ml-2 rounded-lg p-2 flex flex-wrap justify-between gap-4 px-4 text-gray-300"
    >
      <div class="flex flex-wrap gap-4">
        <!-- Bold -->
        <button
          @click="toggleBold"
          :class="[
            'px-2 rounded-sm hover:bg-gray-500 duration-150',
            editor?.isActive('bold') ? 'bg-slate-700' : 'bg-transparent',
          ]"
        >
          <span class="fa-solid fa-bold"></span>
        </button>
        <!-- Italic -->
        <button
          @click="toggleItalic"
          :class="[
            'px-2 rounded-sm hover:bg-gray-500 duration-150',
            editor?.isActive('italic') ? 'bg-slate-700' : 'bg-transparent',
          ]"
        >
          <span class="fa-solid fa-italic"></span>
        </button>
        <!-- Underline -->
        <button
          @click="toggleUnderline"
          :class="[
            'px-2 rounded-sm hover:bg-gray-500 duration-150',
            editor?.isActive('underline') ? 'bg-slate-700' : 'bg-transparent',
          ]"
        >
          <span class="fa-solid fa-underline"></span>
        </button>
        <!-- Strikethrough -->
        <button
          @click="toggleStrike"
          :class="[
            'px-2 rounded-sm hover:bg-gray-500 duration-150',
            editor?.isActive('strike') ? 'bg-slate-700' : 'bg-transparent',
          ]"
        >
          <span class="fa-solid fa-strikethrough"></span>
        </button>
        <!-- Link -->
        <button
          @click="toggleLink"
          :class="[
            'px-2 rounded-sm hover:bg-gray-500 duration-150',
            editor?.isActive('link') ? 'bg-slate-700' : 'bg-transparent',
          ]"
        >
          <span class="fa-solid fa-link"></span>
        </button>
      </div>
      <div class="flex flex-wrap gap-4">
        <!-- Bulleted List -->
        <button
          @click="toggleBulletList"
          :class="[
            'px-2 rounded-sm hover:bg-gray-500 duration-150',
            editor?.isActive('bulletList') ? 'bg-slate-700' : 'bg-transparent',
          ]"
        >
          <span class="fa-solid fa-list-ul"></span>
        </button>
        <!-- Numbered List -->
        <button
          @click="toggleOrderedList"
          :class="[
            'px-2 rounded-sm hover:bg-gray-500 duration-150',
            editor?.isActive('orderedList') ? 'bg-slate-700' : 'bg-transparent',
          ]"
        >
          <span class="fa-solid fa-list-ol"></span>
        </button>
        <!-- Quote -->
        <button
          @click="toggleBlockquote"
          :class="[
            'px-2 rounded-sm hover:bg-gray-500 duration-150',
            editor?.isActive('blockquote') ? 'bg-slate-700' : 'bg-transparent',
          ]"
        >
          <span class="fa-solid fa-quote-left"></span>
        </button>
      </div>
    </div>
    <div
      class="bg-bg-dark h-96 ml-2 rounded-lg p-2 flex justify-between gap-4 px-4 text-gray-300 overflow-y-auto max-h-[600px]"
    >
      <div class="w-full h-full">
        <editor-content :editor="editor" class="h-full w-full max-w-[95%] break-words" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditorContent } from "@tiptap/vue-3";
import { useTextEditor, type TextEditorActions } from "../model/useTextEditor";
import { watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(["update:modelValue"]);

const { 
  editor,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrike,
  toggleLink,
  toggleBulletList,
  toggleOrderedList,
  toggleBlockquote
} = useTextEditor(props.modelValue || '');

watch(() => editor.value?.getHTML(), (newValue) => {
  emit("update:modelValue", newValue || '');
})

</script>

<style scoped>
/* Стили для редактора */
:deep(.tiptap) {
  padding: 1rem;
  height: 100%;
  outline: none;
}

:deep(.tiptap p) {
  margin: 0;
}

:deep(.tiptap a) {
  color: #3b82f6;
  text-decoration: underline;
}

/* Стили для маркированных списков */
:deep(.tiptap ul) {
  padding-left: 1.5rem;
  list-style-type: disc; /* Маркеры в виде точек */
}

/* Стили для нумерованных списков */
:deep(.tiptap ol) {
  padding-left: 1.5rem;
  list-style-type: decimal; /* Нумерация */
}

/* Стили для цитат */
:deep(.tiptap blockquote) {
  border-left: 3px solid #ccc;
  padding-left: 1rem;
  margin: 0;
  color: #666;
}

/* Убедимся, что текст в списках виден */
:deep(.tiptap li) {
  color: inherit; /* Наследует цвет текста */
}

:deep(.tiptap p:first-child:empty::before) {
  content: "Введите описание задачи...";
  color: #6b7280;
  float: left;
}
</style>