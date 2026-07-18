import { Sidebar } from "@/components/explorer/Sidebar";
import { ExplorerHeader } from "@/components/explorer/ExplorerHeader";
import { ExplorerStats } from "@/components/explorer/ExplorerStats";
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
              <NewProjectModal />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-[14px] mb-[22px]">
            <ExplorerStats />
          </div>

          <FilterPills />
          <ProjectsTable />
        </div>
      </div>
    </div>
  );
};

export default ExplorerPage;
