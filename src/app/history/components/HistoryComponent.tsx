"use client";
import { CommonCalendar } from "@/components/common/CommonCalendar";
import { CommonTable } from "@/components/common/CommonTable";
import { SearchInput } from "@/components/common/SearchInput";
import { historyService } from "@/services/historyService";
import { useEffect, useState, useRef } from "react";
import { CalendarDays, Filter } from "lucide-react";
import dayjs from "dayjs";

const HistoryComponent = () => {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const fetchHistory = async () => {
    try {
      const data = await historyService.getHistory();
      setHistoryData(data || []);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
    if (startDate || endDate) {
      if (!item.created_at) return false;
      
      // Clean up format like "15th Jun, 11:44:15" -> "15 Jun, 11:44:15"
      let cleanDateStr = String(item.created_at);
      cleanDateStr = cleanDateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");
      
      const year = startDate ? startDate.year() : dayjs().year();
      const parsedDate = dayjs(`${cleanDateStr}, ${year}`);
      
      if (parsedDate.isValid()) {
        if (startDate && parsedDate.isBefore(startDate.startOf("day"))) {
          return false;
        }
        if (endDate && parsedDate.isAfter(endDate.endOf("day"))) {
          return false;
        }
      } else {
        const directParsed = dayjs(item.created_at);
        if (directParsed.isValid()) {
          if (startDate && directParsed.isBefore(startDate.startOf("day"))) {
            return false;
          }
          if (endDate && directParsed.isAfter(endDate.endOf("day"))) {
            return false;
          }
        }
      }
    }

    return true;
  });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b border-neutral-300 mb-4 rounded-2xl bg-white p-3">
        <div className="flex justify-between items-center mb-4">
          <div className="w-72">
            <SearchInput
              placeholder="Search Request IDs..."
              className="text-xs font-normal text-[#737373]"
              containerClassName="rounded-md border-neutral-200 shadow-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 relative" ref={calendarRef}>
            {/* Start Date Box */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center justify-between gap-2 px-3 py-1.5 h-8 bg-white border border-neutral-200 rounded-md text-xs font-normal text-neutral-800 shadow-xs hover:bg-neutral-50 transition-colors min-w-[105px]"
            >
              <span>{startDate ? startDate.format("DD/MM/YYYY") : "Start Date"}</span>
              <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
            </button>

            {/* End Date Box */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center justify-between gap-2 px-3 py-1.5 h-8 bg-white border border-neutral-200 rounded-md text-xs font-normal text-neutral-800 shadow-xs hover:bg-neutral-50 transition-colors min-w-[105px]"
            >
              <span>{endDate ? endDate.format("DD/MM/YYYY") : "End Date"}</span>
              <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
            </button>

            {/* Filter Action Icon */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center justify-center p-2 h-8 w-8 bg-white border border-neutral-200 rounded-md text-neutral-500 shadow-xs hover:bg-neutral-50 transition-colors"
            >
              <Filter className="h-3.5 w-3.5" />
            </button>

            {/* CommonCalendar Popup wrapper */}
            {isOpen && (
              <div className="absolute right-0 top-[calc(100%+4px)] z-50">
                <CommonCalendar
                  range
                  inline
                  showActionButtons
                  value={startDate && endDate ? [startDate.toDate(), endDate.toDate()] : null}
                  onApply={(val: any) => {
                    if (Array.isArray(val) && val[0] && val[1]) {
                      setStartDate(dayjs(val[0]));
                      setEndDate(dayjs(val[1]));
                      setIsOpen(false);
                    }
                  }}
                  onCancel={() => {
                    setIsOpen(false);
                  }}
                  popupClassName="shadow-xl"
                />
              </div>
            )}
          </div>
        </div>

        <CommonTable
          data={filteredData}
          columns={[
            {
              key: "id",
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
  );
};

export default HistoryComponent;

