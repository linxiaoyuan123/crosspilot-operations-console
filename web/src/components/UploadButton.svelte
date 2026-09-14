<script lang="ts">
  import { Upload } from 'lucide-svelte';

  export let label = '上传图片';
  export let accept = 'image/png,image/jpeg,image/webp,image/gif,image/avif';
  export let disabled = false;
  export let onupload: (file: File) => void | Promise<void> = () => {};

  async function handleChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) await onupload(file);
    input.value = '';
  }
</script>

<label class="upload-button" class:disabled>
  <Upload size={13} aria-hidden="true" />
  <span>{label}</span>
  <input type="file" {accept} {disabled} onchange={handleChange} />
</label>

<style>
  .upload-button {
    align-items: center;
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 7px;
    color: var(--cp-text);
    cursor: pointer;
    display: inline-flex;
    font-size: 10px;
    font-weight: 760;
    gap: 6px;
    justify-content: center;
    min-height: 34px;
    padding: 7px 11px;
  }

  .upload-button:hover {
    background: var(--cp-accent-soft);
    border-color: color-mix(in srgb, var(--cp-accent) 28%, transparent);
    color: var(--cp-accent);
  }

  .upload-button.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .upload-button input {
    display: none;
  }
</style>
