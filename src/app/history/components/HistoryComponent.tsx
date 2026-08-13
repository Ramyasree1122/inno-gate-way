"use client";
import { CommonCalendar } from "@/components/common/CommonCalendar";
import { CommonTable } from "@/components/common/CommonTable";
import { SearchInput } from "@/components/common/SearchInput";
import { historyService } from "@/services/historyService";
import { useEffect, useState, useRef } from "react";
import { Funnel, LoaderIcon } from "lucide-react";
import dayjs from "dayjs";
import { CommonModal } from "@/components/common/CommonModal";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";
import { axiosInstance } from "@/lib/axios";

interface Model {
  id: string;
  display_name?: string;
}

interface Provider {
  id?: string;
  name?: string;
  models?: Model[];
}

const HistoryComponent = () => {
  const [historyData, setHistoryData] = useState<any[]>([]);
  //loader state
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Consolidated Filter states
  interface FilterState {
    startDate: dayjs.Dayjs | null;
    endDate: dayjs.Dayjs | null;
    selectedModels: string[];
  }

  const [filters, setFilters] = useState<FilterState>({
    startDate: null,
    endDate: null,
    selectedModels: [],
  });

  const [tempFilters, setTempFilters] = useState<FilterState>({
    startDate: null,
    endDate: null,
    selectedModels: [],
  });

  const [providers, setProviders] = useState<Provider[]>([]);

  const fetchHistory = async (currentFilters?: FilterState) => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (currentFilters) {
        if (currentFilters.startDate) {
          params.start_date = currentFilters.startDate
            .startOf("day")
            .toISOString();
        }
        if (currentFilters.endDate) {
          params.end_date = currentFilters.endDate.endOf("day").toISOString();
        }
        if (currentFilters.selectedModels.length > 0) {
          params.model = currentFilters.selectedModels;
        }
      }
      const data = await historyService.getHistory(params);
      setHistoryData(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openFilterModal = () => {
    setTempFilters(filters);
    setIsFilterModalOpen(true);
  };

  const handleToggleModel = (modelId: string) => {
    setTempFilters((prev) => ({
      ...prev,
      selectedModels: prev.selectedModels.includes(modelId)
        ? prev.selectedModels.filter((id) => id !== modelId)
        : [...prev.selectedModels, modelId],
    }));
  };

  const handleApply = async () => {
    setIsFilterModalOpen(false);
    setFilters(tempFilters);
    await fetchHistory(tempFilters);
  };

  const handleCancel = () => {
    setIsFilterModalOpen(false);
  };

  const handleReset = () => {
    setTempFilters({
      startDate: null,
      endDate: null,
      selectedModels: [],
    });
  };

  useEffect(() => {
    if (!isFilterModalOpen) return;

    const fetchProviders = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROVIDERS);
        setProviders(response?.data);
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };
    fetchProviders();
  }, [isFilterModalOpen]);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsFilterModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredData = historyData.filter((item) => {
    // 1. Search filter
    if (searchQuery) {
      const id = String(item.id || "").toLowerCase();
      if (!id.includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    // 2. Date range filter
    if (filters.startDate || filters.endDate) {
      if (!item.created_at) return false;

      // Clean up format like "15th Jun, 11:44:15" -> "15 Jun, 11:44:15"
      let cleanDateStr = String(item.created_at);
      cleanDateStr = cleanDateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");

      const year = filters.startDate
        ? filters.startDate.year()
        : dayjs().year();
      const parsedDate = dayjs(`${cleanDateStr}, ${year}`);

      if (parsedDate.isValid()) {
        if (
          filters.startDate &&
          parsedDate.isBefore(filters.startDate.startOf("day"))
        ) {
          return false;
        }
        if (
          filters.endDate &&
          parsedDate.isAfter(filters.endDate.endOf("day"))
        ) {
          return false;
        }
      } else {
        const directParsed = dayjs(item.created_at);
        if (directParsed.isValid()) {
          if (
            filters.startDate &&
            directParsed.isBefore(filters.startDate.startOf("day"))
          ) {
            return false;
          }
          if (
            filters.endDate &&
            directParsed.isAfter(filters.endDate.endOf("day"))
          ) {
            return false;
          }
        }
      }
    }

    // 3. Model filter
    if (filters.selectedModels.length > 0) {
      if (!item.model || !filters.selectedModels.includes(item.model)) {
        return false;
      }
    }

    return true;
  });

  const isStartDateChanged =
    (tempFilters.startDate === null) !== (filters.startDate === null) ||
    (tempFilters.startDate !== null &&
      filters.startDate !== null &&
      !tempFilters.startDate.isSame(filters.startDate, "day"));

  const isEndDateChanged =
    (tempFilters.endDate === null) !== (filters.endDate === null) ||
    (tempFilters.endDate !== null &&
      filters.endDate !== null &&
      !tempFilters.endDate.isSame(filters.endDate, "day"));

  const isModelsChanged =
    tempFilters.selectedModels.length !== filters.selectedModels.length ||
    tempFilters.selectedModels.some(
      (model) => !filters.selectedModels.includes(model),
    ) ||
    filters.selectedModels.some(
      (model) => !tempFilters.selectedModels.includes(model),
    );

  const hasChanges = !!(
    isStartDateChanged ||
    isEndDateChanged ||
    isModelsChanged
  );

  const isResetDisabled =
    tempFilters.startDate === null &&
    tempFilters.endDate === null &&
    tempFilters.selectedModels.length === 0;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b border-neutral-300 mb-4 rounded-2xl bg-white p-3">
        <div className="flex justify-between items-center mb-4">
          <div className="w-72">
            <SearchInput
              placeholder="Search Request IDs..."
              className="text-xs font-normal text-neutral-500"
              containerClassName="rounded-md border-neutral-200 shadow-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 relative" ref={calendarRef}>
            {/* Filter Action Icon */}
            <button
              onClick={openFilterModal}
              className="flex items-center justify-center p-2 bg-neutral-100  rounded-md text-neutral-950 font-normal text-sm shadow-xs hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Filters
              <Funnel className="h-3.5 w-3.5 ms-2" />
            </button>

            {isFilterModalOpen && (
              <CommonModal
                isOpen={isFilterModalOpen}
                title="Filters"
                showCloseIcon={true}
                className="max-w-[360px] rounded-md overflow-visible"
                onClose={handleCancel}
              >
                {/* Filter content */}
                <CommonCalendar
                  range
                  value={
                    tempFilters.startDate && tempFilters.endDate
                      ? [
                          tempFilters.startDate.toDate(),
                          tempFilters.endDate.toDate(),
                        ]
                      : null
                  }
                  onChange={(val: any) => {
                    if (val === null) {
                      setTempFilters((prev) => ({
                        ...prev,
                        startDate: null,
                        endDate: null,
                      }));
                    } else if (Array.isArray(val) && val[0] && val[1]) {
                      setTempFilters((prev) => ({
                        ...prev,
                        startDate: dayjs(val[0]),
                        endDate: dayjs(val[1]),
                      }));
                    }
                  }}
                  showActionButtons={true}
                  placeholder="Select Date Range"
                  inputClassName="h-11 bg-white rounded-lg border border-neutral-200 shadow-sm text-neutral-800 text-sm font-medium px-3 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />

                <div className="mt-4">
                  <label className="text-base font-medium text-neutral-950 mb-4">
                    Select Model
                  </label>
                  <div className="flex flex-col gap-3">
                    {providers?.map((provider) =>
                      provider?.models?.map((model) => {
                        const isChecked = tempFilters.selectedModels.includes(
                          model.id,
                        );
                        return (
                          <div
                            key={model.id}
                            className="flex w-full items-center gap-2 py-1 select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleModel(model.id)}
                              className="h-5 w-5 cursor-pointer rounded-md border-neutral-300 accent-neutral-950 shadow-xs"
                            />

                            <span className="text-sm font-medium text-neutral-800">
                              {model.display_name || model.id}
                            </span>
                          </div>
                        );
                      }),
                    )}
                  </div>
                </div>

                {/**buttons */}
                <div className="border-t border-neutral-100 my-3" />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isResetDisabled}
                    className={cn(
                      "text-violet-600 hover:text-violet-700 font-medium text-xs transition-colors focus:outline-none",
                      isResetDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer",
                    )}
                  >
                    Reset
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-md bg-neutral-100 hover:bg-neutral-200 px-4 py-2 text-xs font-medium  text-neutral-900 transition-colors cursor-pointer focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={!hasChanges}
                      className={cn(
                        "rounded-md px-4 py-2 text-xs font-medium text-white transition-all focus:outline-none",
                        hasChanges
                          ? "bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] hover:opacity-90 cursor-pointer"
                          : "bg-neutral-900 opacity-50 cursor-not-allowed",
                      )}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </CommonModal>
            )}
          </div>
        </div>

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
              <LoaderIcon className="w-8 h-8 animate-spin text-neutral-900" />
            </div>
          )}
          <CommonTable
            data={filteredData}
            columns={[
              {
                key: "request_id",
                title: "Request ID",
              },
              {
                key: "created_at",
                title: "Time",
              },
              {
                key: "model",
                title: "Model",
              },
              {
                key: "status_code",
                title: "Status",
              },
              {
                key: "latency_ms",
                title: "Latency",
              },
              {
                key: "total_tokens",
                title: "Tokens",
              },
              {
                key: "optimizer_saved_tokens",
                title: "Saved",
              },
            ]}
            headerClassName="text-neutral-500 text-sm font-medium"
            bodyClassName="text-sm text-neutral-950 font-normal py-3"
            emptyMessage="No history available."
            className="border-neutral-300 rounded-md shadow-xs"
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryComponent;
