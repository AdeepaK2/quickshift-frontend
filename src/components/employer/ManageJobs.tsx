export default function ManageJobs() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#03045E]">Manage Jobs</h1>
          <p className="text-gray-600 mt-2">Create, edit, and manage your job postings</p>
        </div>
        <button className="px-6 py-3 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-colors font-medium">
          Post New Job
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-8">
          <div className="space-y-6">
            {/* Sample job listings */}
            {[
              { title: "Event Staff Needed", location: "Colombo", type: "Part-time", rate: "LKR 2,000/hour", applications: 8, status: "Active" },
              { title: "Marketing Assistant", location: "Kandy", type: "Full-time", rate: "LKR 35,000/month", applications: 12, status: "Active" },
              { title: "Delivery Driver", location: "Galle", type: "Contract", rate: "LKR 1,500/hour", applications: 5, status: "Closed" }
            ].map((job, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-[#03045E]">{job.title}</h3>
                    <p className="text-gray-600 mt-2">{job.location} • {job.type} • {job.rate}</p>
                    <p className="text-sm text-gray-500 mt-2">Posted 2 days ago</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                      job.status === 'Active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {job.status}
                    </span>
                    <button className="text-[#0077B6] hover:text-[#00B4D8] font-medium">Edit</button>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-6 text-gray-600">
                  <span>{job.applications} Applications</span>
                  <span>•</span>
                  <span>3 Interviews</span>
                  <span>•</span>
                  <span>1 Hired</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
