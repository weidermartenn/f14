<template>
  <div class="text-editor border border-gray-700 rounded-lg p-4 bg-gray-800">
    <!--Панель инструментов-->
    <div v-if="editor" class="toolbar flex gap-2 mb-4">
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'bg-blue-500': editor.isActive('bold') }"
        class="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
      >
        <i class="fa-solid fa-bold"></i>
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'bg-blue-500': editor.isActive('italic') }"
        class="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
      >
        <i class="fa-solid fa-italic"></i>
      </button>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-blue-500': editor.isActive('bulletList') }"
        class="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
      >
        <i class="fa-solid fa-list"></i>
      </button>
    </div>

    <!--Редактор-->
    <editor-content :editor="editor" class="editor-content min-h-[150px] p-2 text-white outline-none focus:border-blue-500"/>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";

const editor = useEditor({
  content: "",
  extensions: [StarterKit],
});
</script>

<style scoped></style>
