export default function ApplicantsManagement() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#03045E]">Applicants Management</h1>
        <p className="text-gray-600 mt-2">Review and manage job applications</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#03045E]">Recent Applications</h3>
            <div className="flex space-x-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent">
                <option>All Jobs</option>
                <option>Event Staff Needed</option>
                <option>Marketing Assistant</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent">
                <option>All Status</option>
                <option>Pending</option>
                <option>Reviewed</option>
                <option>Hired</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { name: "John Doe", job: "Event Staff Needed", appliedDate: "2 days ago", status: "Pending", rating: "4.8" },
              { name: "Jane Smith", job: "Marketing Assistant", appliedDate: "1 day ago", status: "Reviewed", rating: "4.9" },
              { name: "Mike Johnson", job: "Delivery Driver", appliedDate: "3 days ago", status: "Hired", rating: "4.7" },
              { name: "Sarah Wilson", job: "Event Staff Needed", appliedDate: "1 day ago", status: "Pending", rating: "4.6" }
            ].map((applicant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-[#03045E]">{applicant.name}</h4>
                    <p className="text-gray-600 mt-1">Applied for: {applicant.job}</p>
                    <p className="text-sm text-gray-500 mt-1">Applied {applicant.appliedDate}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-600">Rating: </span>
                      <span className="text-sm font-semibold text-[#0077B6] ml-1">{applicant.rating}</span>
                      <span className="text-blue-400 ml-1">★</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      applicant.status === 'Pending' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      applicant.status === 'Reviewed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      applicant.status === 'Hired' ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {applicant.status}
                    </span>
                    <button className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-colors text-sm">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
