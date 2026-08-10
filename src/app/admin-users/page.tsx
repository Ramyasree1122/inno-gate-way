"use client";
import React, { useEffect } from "react";
import { CommonTable } from "@/components/common/CommonTable";
import { adminUsersService, AdminUser } from "@/services/adminUsersService";
import { SearchInput } from "@/components/common/SearchInput";
import dayjs from "dayjs";
import { UserPlus, Power } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const fetchUsers = async () => {
    try {
      const data = await adminUsersService.getAdminUsers();
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col">

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm flex-1 flex flex-col overflow-hidden p-4 md:p-6">
        <div className="flex justify-between items-center w-full mb-6">
          <div className="w-[320px]">
            <SearchInput
              placeholder="Search Admins..."
              className="text-sm font-normal text-neutral-500"
              containerClassName="rounded-md border-[#E5E5E5] shadow-xs h-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-neutral-900 text-sm font-medium px-4 py-2 rounded-md transition-colors cursor-pointer">
            <UserPlus className="w-4 h-4 text-neutral-700" />
            Create Admin
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-sm text-neutral-500">Loading...</div>
        ) : (
          <div className="flex-1 overflow-auto rounded-lg border border-neutral-200">
            <CommonTable
              data={filteredUsers}
              columns={[
                { 
                  key: "full_name", 
                  title: "Name",
                  render: (row) => <span className="font-semibold text-neutral-900 capitalize">{row.full_name.replace(".", " ")}</span>
                },
                { 
                  key: "email", 
                  title: "Email",
                  render: (row) => {
                    const emailStr = row.email.replace(/\[([^\]]+)\]\(mailto:[^)]+\)/, '$1');
                    return <span className="text-neutral-800">{emailStr}</span>;
                  }
                },
                { 
                  key: "role", 
                  title: "Role",
                  render: (row) => <span className="text-neutral-800">{row.role}</span>
                },
                {
                  key: "is_active",
                  title: "Status",
                  render: (row) =>
                    row.is_active ? (
                      <span className="bg-[#BBF7D0] text-[#166534] px-3 py-1 rounded-md text-xs font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="bg-[#F5F5F5] text-[#171717] px-3 py-1 rounded-md text-xs font-semibold">
                        Inactive
                      </span>
                    ),
                },
                { 
                  key: "created_at", 
                  title: "Created",
                  render: (row) => <span className="text-neutral-800">{dayjs(row.created_at).format("D/M/YYYY")}</span>
                },
                {
                  key: "actions",
                  title: "Actions",
                  render: (row) => 
                    row.role === 'super_admin' ? (
                      <span className="text-neutral-900 text-sm">Current User</span>
                    ) : (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-md shadow-xs hover:bg-neutral-50 text-neutral-900 text-sm font-medium">
                        <Power className="w-3.5 h-3.5 text-neutral-600" />
                        Disable
                      </button>
                    )
                }
              ]}
              headerClassName="text-neutral-500 text-sm font-medium bg-transparent border-b border-neutral-200 h-12"
              bodyClassName="text-sm text-neutral-900 font-normal h-14 border-b border-neutral-100"
              className="border-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
