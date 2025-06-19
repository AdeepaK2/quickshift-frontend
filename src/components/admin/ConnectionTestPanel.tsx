"use client";

import { useState } from "react";
import { testConnection, TestResult } from "@/lib/test-connection";
import Button from "@/components/ui/button";

export function ConnectionTestPanel() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const runConnectionTest = async () => {
    setIsTestingConnection(true);
    try {
      const results = await testConnection();
      setTestResults(results);
    } catch (error) {
      console.error("Connection test failed:", error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? "✅" : "❌";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Backend Connection Test
          </h3>          <p className="text-sm text-gray-500">
            Test connection to:{" "}
            https://quickshift-9qjun.ondigitalocean.app
          </p>
        </div>
        <Button
          onClick={runConnectionTest}
          disabled={isTestingConnection}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isTestingConnection ? "Testing..." : "Test Connection"}
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Test Results:</h4>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {getStatusIcon(result.success)}
                  </span>
                  <span className="font-medium">{result.endpoint}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {result.timing}ms
                  </span>
                  {result.success ? (
                    <span className="text-sm text-green-600">
                      {/* Safely display item count for array or object-with-data */}
                      {Array.isArray(result.data)
                        ? `${result.data.length} items`
                        : result.data && typeof result.data === "object" &&
                          Array.isArray((result.data as { data?: unknown[] }).data)
                        ? `${((result.data as { data?: unknown[] }).data?.length ?? 0)} items`
                        : "OK"}
                    </span>
                  ) : (
                    <span className="text-sm text-red-600 max-w-xs truncate">
                      {result.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900">Summary:</span>
              <span className="text-blue-700">
                {testResults.filter((r) => r.success).length} /{" "}
                {testResults.length} passed
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
