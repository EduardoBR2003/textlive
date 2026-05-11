import React from 'react';
import { SessionPermission } from '@/types/session';

interface PermissionsPanelProps {
  permission: SessionPermission;
  deviceLimit: number;
  deviceCount: number;
  onPermissionChange: (permission: SessionPermission) => void;
  onDeviceLimitChange: (limit: number) => void;
  className?: string;
}

export function PermissionsPanel({
  permission,
  deviceLimit,
  deviceCount,
  onPermissionChange,
  onDeviceLimitChange,
  className,
}: PermissionsPanelProps) {
  return (
    <div className={`space-y-md ${className || ''}`}>
      <div className="space-y-4">
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          Controle de Acesso
        </p>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="permission"
              className="text-primary focus:ring-primary h-4 w-4 border-outline"
              checked={permission === SessionPermission.VIEW}
              onChange={() => onPermissionChange(SessionPermission.VIEW)}
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Somente visualizar
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="permission"
              className="text-primary focus:ring-primary h-4 w-4 border-outline"
              checked={permission === SessionPermission.EDIT}
              onChange={() => onPermissionChange(SessionPermission.EDIT)}
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Editar
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Limite de dispositivos
          </span>
          <div className="flex items-center bg-surface-container rounded-lg border border-outline-variant overflow-hidden">
            <button
              onClick={() =>
                deviceLimit > 1 && onDeviceLimitChange(deviceLimit - 1)
              }
              disabled={deviceLimit <= 1}
              className="px-2 py-1 hover:bg-surface-container-high transition-colors text-on-surface-variant disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <input
              className="w-8 bg-transparent border-none text-center font-label-md text-label-md p-0 focus:ring-0"
              readOnly
              type="text"
              value={deviceLimit}
            />
            <button
              onClick={() =>
                deviceLimit < 20 && onDeviceLimitChange(deviceLimit + 1)
              }
              disabled={deviceLimit >= 20}
              className="px-2 py-1 hover:bg-surface-container-high transition-colors text-primary disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          {deviceCount} de {deviceLimit} dispositivos conectados
        </p>
      </div>
    </div>
  );
}
