"use client";
import type { Job, Schedule, PipelineState } from "@/lib/store";
import ScheduleManager from "./ScheduleManager";

interface Props {
  schedules: Schedule[];
  jobs: Job[];
  onAdd: (s: Schedule) => void;
  onUpdate: (s: Schedule) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRunNow: (id: string) => void;
  onExport: (id: string) => void;
  onExportRun: (scheduleId: string, runId: string) => void;
  pipeline: PipelineState;
}

export default function SchedulesPage({ schedules, jobs, onAdd, onUpdate, onToggle, onDelete, onRunNow, onExport, onExportRun, pipeline }: Props) {
  const isRunning = !["idle", "completed", "error"].includes(pipeline.status);

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2>Schedules</h2>
            <p>Automate your job search pipeline on a schedule</p>
          </div>
        </div>
      </div>

      <div className="page-body">
<ScheduleManager
          schedules={schedules}
          jobs={jobs}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onToggle={onToggle}
          onDelete={onDelete}
          onRunNow={onRunNow}
          onExport={onExport}
          onExportRun={onExportRun}
          isRunning={isRunning}
        />
      </div>
    </>
  );
}