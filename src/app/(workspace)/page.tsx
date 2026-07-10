import { DownloadIcon } from "@/components/icons";
import { Sidebar } from "@/components/explorer/Sidebar";
import { ExplorerHeader } from "@/components/explorer/ExplorerHeader";
import { StatCard } from "@/components/explorer/StatCard";
import { ActiveProjectsStat } from "@/components/explorer/ActiveProjectsStat";
import { FilterPills } from "@/components/explorer/FilterPills";
import { ProjectsTable } from "@/components/explorer/ProjectsTable";
import { NewProjectModal } from "@/components/explorer/NewProjectModal";

const ExplorerPage = () => {
  return (
    <div className="flex h-full animate-fade">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <ExplorerHeader />

        <div className="flex-1 overflow-y-auto p-[26px_30px_40px]">
          <div className="flex items-end justify-between gap-5 mb-5">
            <div>
              <h1 className="m-0 text-[23px] font-bold tracking-[-.022em]">Panel de Proyectos</h1>
              <p className="mt-[6px] text-[13px] text-text-dim">
                Diseño y rediseño de sistemas de bombeo hidráulico — Jet &amp; Pistón
              </p>
            </div>
            <div className="flex items-center gap-[10px]">
              <button
                title="Importar datos desde archivo"
                className="inline-flex items-center gap-[9px] px-4 py-[11px] rounded-[10px] bg-surface-2 text-text border border-border text-[13.5px] font-semibold cursor-pointer hover:border-border-strong"
              >
                <DownloadIcon size={16} />
                Importar Datos
              </button>
              <NewProjectModal />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-[14px] mb-[22px]">
            <ActiveProjectsStat />
            <StatCard label="Pozos en diseño" value="11" />
            <StatCard label="Simulaciones (mes)" value="187" />
            <StatCard label="Sincronizados" value="92%" accent />
          </div>

          <FilterPills />
          <ProjectsTable />
        </div>
      </div>
    </div>
  );
};

export default ExplorerPage;
