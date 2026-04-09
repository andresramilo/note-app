import { ReactNode } from 'react';

type Mark = { type: string };

type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: Mark[];
};

function applyMarks(text: string, marks: Mark[] = []): ReactNode {
  let node: ReactNode = text;
  for (const mark of marks) {
    if (mark.type === 'bold') node = <strong>{node}</strong>;
    else if (mark.type === 'italic') node = <em>{node}</em>;
    else if (mark.type === 'code')
      node = (
        <code className='rounded bg-neutral-100 px-1 py-0.5 font-mono text-sm text-neutral-800'>
          {node}
        </code>
      );
  }
  return node;
}

function renderNode(node: TipTapNode, index: number): ReactNode {
  switch (node.type) {
    case 'doc':
      return <div key={index}>{node.content?.map((child, i) => renderNode(child, i))}</div>;

    case 'paragraph':
      return (
        <p key={index} className='mb-4 leading-7 text-neutral-800 last:mb-0'>
          {node.content?.map((child, i) => renderNode(child, i)) ?? <br />}
        </p>
      );

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      const children = node.content?.map((child, i) => renderNode(child, i));
      const classes: Record<number, string> = {
        1: 'mb-4 mt-6 text-3xl font-bold text-neutral-900',
        2: 'mb-3 mt-5 text-2xl font-semibold text-neutral-900',
        3: 'mb-2 mt-4 text-xl font-semibold text-neutral-900',
      };
      const cls = classes[level] ?? classes[1];
      if (level === 1)
        return (
          <h1 key={index} className={cls}>
            {children}
          </h1>
        );
      if (level === 2)
        return (
          <h2 key={index} className={cls}>
            {children}
          </h2>
        );
      return (
        <h3 key={index} className={cls}>
          {children}
        </h3>
      );
    }

    case 'text':
      return <span key={index}>{applyMarks(node.text ?? '', node.marks)}</span>;

    case 'bulletList':
      return (
        <ul key={index} className='mb-4 list-disc pl-6'>
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      );

    case 'listItem':
      return (
        <li key={index} className='mb-1 text-neutral-800'>
          {node.content?.map((child, i) => renderNode(child, i))}
        </li>
      );

    case 'codeBlock':
      return (
        <pre
          key={index}
          className='mb-4 overflow-x-auto rounded-lg bg-neutral-900 p-4 font-mono text-sm text-neutral-100'
        >
          <code>{node.content?.map((child) => child.text).join('')}</code>
        </pre>
      );

    case 'horizontalRule':
      return <hr key={index} className='my-6 border-neutral-200' />;

    default:
      return null;
  }
}

type Props = {
  contentJson: string;
};

export function NoteViewer({ contentJson }: Props) {
  let doc: TipTapNode;
  try {
    doc = JSON.parse(contentJson) as TipTapNode;
  } catch {
    return <p className='text-red-500'>Failed to parse note content.</p>;
  }

  return <div className='mx-auto max-w-2xl'>{renderNode(doc, 0)}</div>;
}
