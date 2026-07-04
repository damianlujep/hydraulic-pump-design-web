import Link from "next/link";
import { ArrowRightIcon, PumpIcon } from "@/components/icons";
import { PROJECTS } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";

const GRID_COLS = "grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_150px_132px_100px]";

export function ProjectsTable() {
  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="text-[13px]">
        <div className={`grid ${GRID_COLS} bg-surface-2`}>
          <div className="p-[11px_16px] text-[10.5px] tracking-[.06em] uppercase text-text-faint font-semibold">
            Nombre del Proyecto
          </div>
          <div className="p-[11px_16px] text-[10.5px] tracking-[.06em] uppercase text-text-faint font-semibold">
            Campo / Bloque
          </div>
          <div className="p-[11px_16px] text-[10.5px] tracking-[.06em] uppercase text-text-faint font-semibold">
            Estado de Sincronización
          </div>
          <div className="p-[11px_16px] text-[10.5px] tracking-[.06em] uppercase text-text-faint font-semibold">
            Última Modificación
          </div>
          <div className="p-[11px_16px]" />
        </div>

        {PROJECTS.map((project) => (
          <div
            key={project.name}
            className={`grid ${GRID_COLS} items-center border-t border-border hover:bg-surface-2`}
          >
            <div className="p-[13px_16px]">
              <div className="flex items-center gap-3">
                <div className="w-[34px] h-[34px] rounded-lg bg-surface-3 border border-border flex items-center justify-center text-primary flex-none">
                  <PumpIcon size={16} strokeWidth={1.9} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[13px] tracking-[-.01em]">{project.name}</div>
                  <div className="text-[11px] text-text-faint font-mono mt-px">
                    {project.well} · {project.type}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-[13px_16px] text-text-dim text-[12.5px]">{project.campo}</div>
            <div className="p-[13px_16px]">
              <StatusBadge isCloud={project.isCloud} />
            </div>
            <div className="p-[13px_16px] text-text-dim text-xs font-mono">{project.modified}</div>
            <div className="p-[13px_16px] text-right">
              <Link
                href="/workspace"
                className="inline-flex items-center gap-[6px] px-[15px] py-[7px] rounded-lg border border-border-strong text-text text-[12.5px] font-semibold hover:border-primary hover:text-primary hover:bg-primary-soft"
              >
                Abrir
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
