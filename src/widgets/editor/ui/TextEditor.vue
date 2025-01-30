<template>
  <div class="flex flex-col gap-6">
    <div
      class="bg-bg-dark ml-2 rounded-lg p-2 flex justify-between gap-4 px-4 text-gray-300"
    >
      <div class="flex gap-4">
        <!--Bold-->
        <button @click="toggleBold" class="">
          <span class="fa-solid fa-bold"></span>
        </button>
        <!--Italic-->
        <button @click="toggleItalic">
          <span class="fa-solid fa-italic"></span>
        </button>
        <!--Underline-->
        <button @click="toggleUnderline">
          <span class="fa-solid fa-underline"></span>
        </button>
        <!--Strikethrough-->
        <button @click="toggleStrike">
          <span class="fa-solid fa-strikethrough"></span>
        </button>
        <!--Link-->
        <button @click="toggleLink">
          <span class="fa-solid fa-link"></span>
        </button>
      </div>
      <div class="flex gap-4">
        <!--Bulleted List-->
        <button @click="toggleBulletList">
          <span class="fa-solid fa-list-ul"></span>
        </button>
        <!--Numbered List-->
        <button @click="toggleOrderedList">
          <span class="fa-solid fa-list-ol"></span>
        </button>
        <!--Quote-->
        <button @click="toggleBlockquote">
          <span class="fa-solid fa-quote-left"></span>
        </button>
      </div>
    </div>
    <div
      class="bg-bg-dark h-96 ml-2 rounded-lg p-2 flex justify-between gap-4 px-4 text-gray-300 overflow-y-auto max-h-[600px]"
    >
      <div class="w-full h-full">
        <editor-content :editor="editor" class="h-full max-w-[600px] break-words" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditorContent } from "@tiptap/vue-3";
import { useTextEditor } from "../model/useTextEditor";

const {
  editor,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrike,
  toggleLink,
  toggleBulletList,
  toggleOrderedList,
  toggleBlockquote,
} = useTextEditor();
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

:deep(.tiptap ul),
:deep(.tiptap ol) {
  padding-left: 1.5rem;
}

:deep(.tiptap blockquote) {
  border-left: 3px solid #ccc;
  padding-left: 1rem;
  margin: 0;
  color: #666;
}
</style>
