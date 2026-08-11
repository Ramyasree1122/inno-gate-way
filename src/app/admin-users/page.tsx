"use client";
import React, { useEffect } from "react";
import { CommonTable } from "@/components/common/CommonTable";
import { CommonModal } from "@/components/common/CommonModal";
import { adminUsersService, AdminUser } from "@/services/adminUsersService";
import { SearchInput } from "@/components/common/SearchInput";
import dayjs from "dayjs";
import { UserPlus, Power, Eye, EyeOff } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = React.useState(false);
  const [newAdminForm, setNewAdminForm] = React.useState({
    fullName: "",
    email: "",
    password: "",
  });

  const fetchUsers = async (query?: string) => {
    try {
      const data = query && query.trim()
        ? await adminUsersService.searchAdminUsers(query)
        : await adminUsersService.getAdminUsers();

      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchAdmins = async (query?: string) => {
    setLoading(true);
    await fetchUsers(query);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAdmins(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newAdminForm.fullName.trim() || !newAdminForm.email.trim() || !newAdminForm.password.trim()) {
      return;
    }

    try {
      setIsCreatingAdmin(true);

      await adminUsersService.createAdmin({
        email: newAdminForm.email.trim(),
        password: newAdminForm.password,
        full_name: newAdminForm.fullName.trim(),
      });

      await fetchUsers();
      setIsCreateAdminModalOpen(false);
      setNewAdminForm({ fullName: "", email: "", password: "" });
      setShowPassword(false);
    } catch (error) {
      console.error("Error creating admin user:", error);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <CommonModal
        isOpen={isCreateAdminModalOpen}
        onClose={() => {
          setIsCreateAdminModalOpen(false);
          setNewAdminForm({ fullName: "", email: "", password: "" });
          setShowPassword(false);
        }}
        title="Create Admin"
        className="max-w-[460px] rounded-xl border border-neutral-100"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-900">
              Full name
            </label>
            <input
              type="text"
              value={newAdminForm.fullName}
              onChange={(e) =>
                setNewAdminForm((current) => ({
                  ...current,
                  fullName: e.target.value,
                }))
              }
              placeholder="Alex Adam"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 shadow-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-900">
              Email
            </label>
            <input
              type="email"
              value={newAdminForm.email}
              onChange={(e) =>
                setNewAdminForm((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
              placeholder="alex@gmail.com"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 shadow-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-900">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newAdminForm.password}
                onChange={(e) =>
                  setNewAdminForm((current) => ({
                    ...current,
                    password: e.target.value,
                  }))
                }
                placeholder="Enter password"
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 pr-10 text-sm text-neutral-900 placeholder:text-neutral-500 shadow-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 cursor-pointer border-none bg-transparent p-0"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isCreatingAdmin ||
              !newAdminForm.fullName.trim() ||
              !newAdminForm.email.trim() ||
              !newAdminForm.password.trim()
            }
            className={`w-full py-2.5 rounded-md font-semibold text-sm transition-colors mt-2 ${
              !isCreatingAdmin &&
              newAdminForm.fullName.trim() &&
              newAdminForm.email.trim() &&
              newAdminForm.password.trim()
                ? "bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-white cursor-pointer shadow-sm"
                : "bg-[#D4D4D4] text-white cursor-not-allowed"
            }`}
          >
            {isCreatingAdmin ? "Creating..." : "Create"}
          </button>
        </form>
      </CommonModal>

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
          <button
            onClick={() => setIsCreateAdminModalOpen(true)}
            className="flex items-center gap-2 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-neutral-900 text-sm font-medium px-4 py-2 rounded-md transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-neutral-700" />
            Create Admin
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-sm text-neutral-500">Loading...</div>
        ) : (
          <div className="flex-1 overflow-auto rounded-lg border border-neutral-200">
            <CommonTable
              data={users}
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
