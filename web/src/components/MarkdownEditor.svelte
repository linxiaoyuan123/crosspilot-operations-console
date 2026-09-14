<script lang="ts">
  import { onMount } from 'svelte';
  import { basicSetup } from 'codemirror';
  import { markdown } from '@codemirror/lang-markdown';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { EditorState } from '@codemirror/state';
  import { EditorView, keymap } from '@codemirror/view';
  import { defaultKeymap, historyKeymap } from '@codemirror/commands';
  import {
    Bold,
    Code2,
    Eye,
    Heading2,
    ImagePlus,
    Italic,
    Link,
    List,
    ListOrdered,
    Quote,
    Table2
  } from 'lucide-svelte';

  export let value = '';
  export let preview = '';
  export let onchange: (value: string) => void = () => {};
  export let onupload: (file: File) => Promise<void> = async () => {};
  export let onpreview: () => void = () => {};

  let host: HTMLDivElement;
  let view: EditorView;

  function insert(before: string, after = '', placeholder = '文本') {
    if (!view) return;
    const selection = view.state.selection.main;
    const selected = view.state.sliceDoc(selection.from, selection.to) || placeholder;
    const text = `${before}${selected}${after}`;
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text },
      selection: { anchor: selection.from + before.length, head: selection.from + before.length + selected.length }
    });
    view.focus();
  }

  function prefix(prefixValue: string) {
    if (!view) return;
    const selection = view.state.selection.main;
    const line = view.state.doc.lineAt(selection.from);
    const selected = view.state.sliceDoc(line.from, selection.to) || '文本';
    const formatted = selected
      .split('\n')
      .map((row) => `${prefixValue}${row}`)
      .join('\n');
    view.dispatch({ changes: { from: line.from, to: selection.to, insert: formatted } });
    view.focus();
  }

  async function handleFiles(files: FileList | File[] | null) {
    const file = files?.[0];
    if (file) await onupload(file);
  }

  onMount(() => {
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        markdown(),
        ...(document.documentElement.dataset.theme === 'dark' ? [oneDark] : []),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            value = update.state.doc.toString();
            onchange(value);
          }
        }),
        EditorView.domEventHandlers({
          paste: (_event, editorView) => {
            const files = (_event as ClipboardEvent).clipboardData?.files;
            if (files?.length) {
              void handleFiles(files);
              return true;
            }
            return false;
          },
          drop: (event) => {
            const files = (event as DragEvent).dataTransfer?.files;
            if (files?.length) {
              event.preventDefault();
              void handleFiles(files);
              return true;
            }
            return false;
          }
        })
      ]
    });
    view = new EditorView({ state, parent: host });
    return () => view.destroy();
  });
</script>

<section class="editor">
  <header class="toolbar">
    <div class="tools">
      <button type="button" title="二级标题" aria-label="二级标题" onclick={() => prefix('## ')}><Heading2 size={15} /></button>
      <button type="button" title="粗体" aria-label="粗体" onclick={() => insert('**', '**')}><Bold size={15} /></button>
      <button type="button" title="斜体" aria-label="斜体" onclick={() => insert('*', '*')}><Italic size={15} /></button>
      <button type="button" title="无序列表" aria-label="无序列表" onclick={() => prefix('- ')}><List size={15} /></button>
      <button type="button" title="有序列表" aria-label="有序列表" onclick={() => prefix('1. ')}><ListOrdered size={15} /></button>
      <button type="button" title="引用" aria-label="引用" onclick={() => prefix('> ')}><Quote size={15} /></button>
      <button type="button" title="链接" aria-label="链接" onclick={() => insert('[', '](https://example.com)', '链接文字')}><Link size={15} /></button>
      <button type="button" title="代码块" aria-label="代码块" onclick={() => insert('\n```\n', '\n```\n', '代码')}><Code2 size={15} /></button>
      <button type="button" title="表格" aria-label="表格" onclick={() => insert('\n| 字段 | 说明 |\n| --- | --- |\n| 示例 | 内容 |\n')}><Table2 size={15} /></button>
    </div>
    <div class="tools">
      <label class="upload" title="上传正文图片">
        <ImagePlus size={15} />
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onchange={(event) => handleFiles((event.currentTarget as HTMLInputElement).files)} />
      </label>
      <button type="button" class="preview-button" onclick={onpreview}><Eye size={14} />刷新预览</button>
    </div>
  </header>
  <div class="editor-grid">
    <div class="codemirror cp-scroll" bind:this={host}></div>
    <div class="preview markdown-body cp-scroll">{@html preview || '<p class="placeholder">Markdown 预览会显示在这里。</p>'}</div>
  </div>
</section>

<style>
  .editor {
    border: 1px solid var(--cp-line);
    border-radius: 8px;
    overflow: hidden;
  }

  .toolbar {
    align-items: center;
    background: var(--cp-surface-muted);
    border-bottom: 1px solid var(--cp-line);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: space-between;
    min-height: 44px;
    padding: 6px;
  }

  .tools {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tools button,
  .upload {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--cp-text-soft);
    cursor: pointer;
    display: inline-flex;
    height: 31px;
    justify-content: center;
    width: 31px;
  }

  .tools button:hover,
  .upload:hover {
    background: var(--cp-accent-soft);
    border-color: color-mix(in srgb, var(--cp-accent) 22%, transparent);
    color: var(--cp-accent);
  }

  .upload input {
    display: none;
  }

  .preview-button {
    align-items: center;
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 6px;
    color: var(--cp-text);
    cursor: pointer;
    display: inline-flex;
    font-size: 9px;
    gap: 6px;
    min-height: 31px;
    padding: 5px 9px;
  }

  .editor-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 520px;
  }

  .codemirror,
  .preview {
    height: 520px;
    max-height: 68vh;
    overflow: auto;
  }

  .preview {
    border-left: 1px solid var(--cp-line);
    padding: 16px;
  }

  .preview :global(.placeholder) {
    color: var(--cp-text-muted);
  }

  .codemirror :global(.cm-editor) {
    height: 100%;
    outline: 0;
  }

  .codemirror :global(.cm-scroller) {
    font-family: "Cascadia Code", Consolas, monospace;
    font-size: 13px;
    line-height: 1.7;
  }

  @media (max-width: 840px) {
    .editor-grid {
      grid-template-columns: 1fr;
    }

    .preview {
      border-left: 0;
      border-top: 1px solid var(--cp-line);
    }
  }
</style>
