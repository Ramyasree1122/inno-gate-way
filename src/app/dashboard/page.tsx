import React from "react";
import DashboardSummaryCards from "./components/DashboardSummaryCards";
import TokenConsumptionChart from "./components/TokenConsumptionChart";
import LatencyAndErrorsChart from "./components/LatencyAndErrorsChart";
import TopTokenConsumers from "./components/TopTokenConsumers";
import { ApiKeyComponent } from "@/app/keymanagement/components/ApiKeyComponent";
import TokensByModel from "./components/TokensByModel";
import AvailableModels from "./components/AvailableModels";

export default function DashboardPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <DashboardSummaryCards />
      <TokenConsumptionChart />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LatencyAndErrorsChart />
        </div>
        <div className="lg:col-span-1 h-[400px]">
          <TopTokenConsumers />
        </div>
      </div>
      <ApiKeyComponent 
        title="Latest API Keys"
        containerClassName="bg-white rounded-xl p-6 border border-neutral-200 mt-6 shadow-sm"
      />
      <AvailableModels />
      <TokensByModel />
    </div>
  );
}
