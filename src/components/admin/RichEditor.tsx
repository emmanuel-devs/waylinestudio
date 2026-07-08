import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/content";
import { useEffect } from "react";

type Props = { value: string; onChange: (html: string) => void };

export function RichEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. loading existing doc)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  async function insertImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `body/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        contentType: file.type,
      });
      if (error) return alert("Upload failed");
      const url = mediaUrl(path);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    };
    input.click();
  }

  function addLink() {
    const url = window.prompt("URL");
    if (!url || !editor) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="border border-hairline rounded">
      <div className="flex flex-wrap gap-1 border-b border-hairline p-2 bg-surface">
        <Button type="button" size="sm" variant={editor.isActive("bold") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()}>B</Button>
        <Button type="button" size="sm" variant={editor.isActive("italic") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()}><i>i</i></Button>
        <Button type="button" size="sm" variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
        <Button type="button" size="sm" variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Button>
        <Button type="button" size="sm" variant={editor.isActive("bulletList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</Button>
        <Button type="button" size="sm" variant={editor.isActive("orderedList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</Button>
        <Button type="button" size="sm" variant={editor.isActive("blockquote") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</Button>
        <Button type="button" size="sm" variant="ghost" onClick={addLink}>Link</Button>
        <Button type="button" size="sm" variant="ghost" onClick={insertImage}>Image</Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
