import { CatalogIcon, DocsIcon, HistoryIcon, PumpIcon, SettingsIcon } from "@/components/icons";

export const Sidebar = () => {
  return (
    <aside className="w-[238px] flex-none bg-surface border-r border-border flex flex-col">
      <div className="flex items-center gap-[11px] p-[17px_18px_15px] border-b border-border">
        <div className="w-[34px] h-[34px] rounded-[9px] bg-primary flex items-center justify-center text-primary-fg shadow-[0_3px_10px_var(--primary-ring)]">
          <PumpIcon size={18} />
        </div>
        <div>
          <div className="text-[13.5px] font-bold tracking-[-.01em]">HydraPump</div>
          <div className="text-[10px] text-text-faint font-mono tracking-[.06em]">DESIGN SUITE · v4.2</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-[3px] p-[13px_10px]">
        <div className="p-[6px_10px_4px] text-[10px] tracking-[.11em] uppercase text-text-faint font-semibold">
          Espacio de trabajo
        </div>
        <a className="flex items-center gap-[11px] p-[9px_11px] rounded-[8px] text-[13px] font-semibold text-text bg-primary-soft shadow-[inset_0_0_0_1px_var(--primary-ring)] cursor-pointer">
          <PumpIcon size={16} strokeWidth={1.9} />
          Explorador de Proyectos
        </a>
        <a className="flex items-center gap-[11px] p-[9px_11px] rounded-[8px] text-[13px] font-medium text-text-dim cursor-pointer hover:bg-surface-2 hover:text-text">
          <CatalogIcon size={16} />
          Catálogo de Bombas
        </a>
        <a className="flex items-center gap-[11px] p-[9px_11px] rounded-[8px] text-[13px] font-medium text-text-dim cursor-pointer hover:bg-surface-2 hover:text-text">
          <HistoryIcon size={16} />
          Historial de Simulaciones
        </a>
        <div className="p-[14px_10px_4px] text-[10px] tracking-[.11em] uppercase text-text-faint font-semibold">
          Recursos
        </div>
        <a className="flex items-center gap-[11px] p-[9px_11px] rounded-[8px] text-[13px] font-medium text-text-dim cursor-pointer hover:bg-surface-2 hover:text-text">
          <DocsIcon size={16} />
          Documentación técnica
        </a>
        <a className="flex items-center gap-[11px] p-[9px_11px] rounded-[8px] text-[13px] font-medium text-text-dim cursor-pointer hover:bg-surface-2 hover:text-text">
          <SettingsIcon size={16} />
          Configuración
        </a>
      </nav>

      <div className="m-[10px] p-[11px_12px] rounded-[10px] bg-surface-2 border border-border">
        <div className="flex items-center gap-[7px] text-[11px] font-semibold text-green">
          <span className="w-[7px] h-[7px] rounded-full bg-green shadow-[0_0_0_3px_var(--green-soft)]" />
          Nube conectada
        </div>
        <div className="mt-1 text-[10.5px] text-text-faint font-mono">Última sinc. 14:02 · 12 pozos</div>
      </div>
    </aside>
  );
};
