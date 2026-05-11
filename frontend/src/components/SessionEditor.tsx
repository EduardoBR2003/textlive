import React, { useRef, useEffect } from 'react';
import { SessionPermission } from '@/types/session';

interface SessionEditorProps {
  content: string;
  permission: SessionPermission;
  isOwner: boolean;
  onChange: (content: string) => void;
}

export function SessionEditor({
  content,
  permission,
  isOwner,
  onChange,
}: SessionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canEdit = isOwner && permission === SessionPermission.EDIT;

  useEffect(() => {
    if (textareaRef.current && content !== textareaRef.current.value) {
      const cursorPos = textareaRef.current.selectionStart;
      textareaRef.current.value = content;
      textareaRef.current.selectionStart = cursorPos;
      textareaRef.current.selectionEnd = cursorPos;
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!canEdit) return;
    onChange(e.target.value);
  };

  return (
    <main className="flex-1 h-full overflow-y-auto bg-surface-dim/30 relative">
      <div className="max-w-container-max mx-auto h-full p-4 md:p-lg flex flex-col items-center">
        <div className="w-full max-w-[800px] h-full min-h-[400px] bg-surface rounded-xl shadow-sm border border-outline-variant p-lg md:p-xl flex flex-col relative">
          {!canEdit && (
            <div className="absolute top-md right-md z-10 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                visibility
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Somente visualização
              </span>
            </div>
          )}
          <textarea
            ref={textareaRef}
            autoFocus
            className="w-full flex-1 resize-none bg-transparent border-none focus:ring-0 p-0 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 leading-relaxed outline-none"
            placeholder={
              canEdit
                ? 'Digite ou cole seu texto aqui...'
                : 'Aguardando o dono da sessão...'
            }
            defaultValue={content}
            onChange={handleChange}
            readOnly={!canEdit}
          />
        </div>
      </div>
    </main>
  );
}
