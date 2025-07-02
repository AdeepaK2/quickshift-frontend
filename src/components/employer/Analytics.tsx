export default function Analytics() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#03045E]">Analytics & Reports</h1>
        <p className="text-gray-600 mt-2">Track your hiring performance and job posting analytics</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Hiring Overview */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-[#03045E] mb-6">Hiring Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Applications This Month</span>
              <span className="text-2xl font-bold text-[#0077B6]">47</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Interviews Conducted</span>
              <span className="text-2xl font-bold text-[#0077B6]">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Successful Hires</span>
              <span className="text-2xl font-bold text-[#0077B6]">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="text-2xl font-bold text-green-600">17%</span>
            </div>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-[#03045E] mb-6">Cost Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Spent This Month</span>
              <span className="text-2xl font-bold text-[#0077B6]">LKR 65,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Cost per Hire</span>
              <span className="text-2xl font-bold text-[#0077B6]">LKR 8,125</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Job Posting Fees</span>
              <span className="text-2xl font-bold text-[#0077B6]">LKR 15,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Worker Payments</span>
              <span className="text-2xl font-bold text-[#0077B6]">LKR 50,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Performance */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h3 className="text-xl font-semibold text-[#03045E] mb-6">Job Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Job Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Applications</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Views</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Conversion</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { title: "Event Staff Needed", applications: 18, views: 245, conversion: "7.3%", status: "Active" },
                { title: "Marketing Assistant", applications: 12, views: 189, conversion: "6.3%", status: "Active" },
                { title: "Delivery Driver", applications: 24, views: 356, conversion: "6.7%", status: "Closed" },
                { title: "Customer Service Rep", applications: 8, views: 123, conversion: "6.5%", status: "Active" }
              ].map((job, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{job.title}</td>
                  <td className="py-3 px-4">{job.applications}</td>
                  <td className="py-3 px-4">{job.views}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${parseFloat(job.conversion) > 6.5 ? 'text-green-600' : 'text-orange-600'}`}>
                      {job.conversion}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-xl font-semibold text-[#03045E] mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0077B6] hover:bg-gray-50 transition-colors">
            <span className="text-gray-600">Export Monthly Report</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0077B6] hover:bg-gray-50 transition-colors">
            <span className="text-gray-600">Download Analytics</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0077B6] hover:bg-gray-50 transition-colors">
            <span className="text-gray-600">Schedule Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
