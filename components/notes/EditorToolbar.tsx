'use client';

import type { Editor } from '@tiptap/react';

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type='button'
      title={title}
      aria-pressed={isActive}
      disabled={disabled}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        isActive ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-100'
      }`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className='mx-1 h-5 w-px bg-neutral-200' aria-hidden />;
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div
      role='toolbar'
      aria-label='Text formatting'
      className='flex flex-wrap items-center gap-0.5 border-b border-neutral-200 p-1.5'
    >
      {/* Text style */}
      <ToolbarButton
        title='Bold (Ctrl+B)'
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        title='Italic (Ctrl+I)'
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>

      <Separator />

      {/* Headings */}
      <ToolbarButton
        title='Heading 1'
        isActive={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        title='Heading 2'
        isActive={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title='Heading 3'
        isActive={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        title='Paragraph'
        isActive={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        ¶
      </ToolbarButton>

      <Separator />

      {/* Lists */}
      <ToolbarButton
        title='Bullet list'
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        ≡
      </ToolbarButton>

      <Separator />

      {/* Code */}
      <ToolbarButton
        title='Inline code'
        isActive={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        {'<>'}
      </ToolbarButton>
      <ToolbarButton
        title='Code block'
        isActive={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {'{ }'}
      </ToolbarButton>

      <Separator />

      {/* Block elements */}
      <ToolbarButton
        title='Horizontal rule'
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        —
      </ToolbarButton>
    </div>
  );
}
