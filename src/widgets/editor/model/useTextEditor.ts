import { useEditor } from '@tiptap/vue-3';
import StarterKit from "@tiptap/starter-kit";
import Link from '@tiptap/extension-link';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Blockquote from '@tiptap/extension-blockquote';

export interface TextEditorActions {
    editor: ReturnType<typeof useEditor>;
    toggleBold: () => void;
    toggleItalic: () => void;
    toggleUnderline: () => void;
    toggleStrike: () => void;
    toggleLink: () => void;
    toggleBulletList: () => void;
    toggleOrderedList: () => void;
    toggleBlockquote: () => void;
  }

export function useTextEditor(initialContent: string) {
    const editor = useEditor({
        content: initialContent,
        extensions: [
            StarterKit,
            Link.configure({
                HTMLAttributes: {
                    class: "text-blue-500 underline",
                },
            }),
            Bold,
            Italic,
            Underline,
            Strike,
            BulletList,
            OrderedList,
            Blockquote,
        ],
    });

    const toggleBold = () => editor.value?.chain().focus().toggleBold().run();
    const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run();
    const toggleUnderline = () => editor.value?.chain().focus().toggleUnderline().run();
    const toggleStrike = () => editor.value?.chain().focus().toggleStrike().run();
    const toggleLink = () => {
        const url = window.prompt("Введите URL: ");
        if (url) {
            editor.value?.chain().focus().toggleLink({ href: url }).run();
        }
    };
    const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run();
    const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run();
    const toggleBlockquote= () => editor.value?.chain().focus().toggleBlockquote().run();

    return {
        editor,
        toggleBold,
        toggleItalic,
        toggleUnderline,
        toggleStrike,
        toggleLink,
        toggleBulletList,
        toggleOrderedList,
        toggleBlockquote,
    }
}