import type { Route } from "./+types/profile";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { User, Mail, Phone, MapPin, Edit } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profile - TailAdmin" },
    { name: "description", content: "User Profile" },
  ];
}

export default function Profile() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account information and preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <div className="px-6 pb-6 -mt-16">
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-4">
                <div className="h-32 w-32 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 flex items-center justify-center text-4xl font-bold text-blue-600">
                  JD
                </div>
                <div className="pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    John Doe
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Administrator
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    john.doe@example.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-gray-900 dark:text-white">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Location
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    San Francisco, CA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security
                  </p>
                </div>
                <button className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive email updates
                  </p>
                </div>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Enabled
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

