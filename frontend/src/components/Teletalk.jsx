const Teletalk = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Teletalk</h1>
      <p className="text-gray-600 mb-6">Manage Teletalk services and data.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800">Active Users</h2>
          <p className="text-2xl font-bold text-green-600 mt-2">19,876</p>
          <p className="text-sm text-gray-500 mt-1">+6% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800">Revenue</h2>
          <p className="text-2xl font-bold text-blue-600 mt-2">$123,456</p>
          <p className="text-sm text-gray-500 mt-1">+5% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800">Data Usage</h2>
          <p className="text-2xl font-bold text-purple-600 mt-2">543 GB</p>
          <p className="text-sm text-gray-500 mt-1">Daily average</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800">Support Tickets</h2>
          <p className="text-2xl font-bold text-red-600 mt-2">8</p>
          <p className="text-sm text-gray-500 mt-1">Open tickets</p>
        </div>
      </div>
    </div>
  );
};

export default Teletalk;