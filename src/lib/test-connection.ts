/**
 * Backend Connection Test Utility
 * Use this to test your backend API connections
 */

import { employersApi, undergraduatesApi, gigsApi, analyticsApi } from "./api";

export interface TestResult {
  endpoint: string;
  success: boolean;
  data?: any;
  error?: string;
  timing: number;
}

export class ConnectionTester {
  private results: TestResult[] = [];

  async testEndpoint(
    name: string,
    apiCall: () => Promise<any>
  ): Promise<TestResult> {
    const startTime = Date.now();
    try {
      console.log(`Testing ${name}...`);
      const result = await apiCall();
      const timing = Date.now() - startTime;

      const testResult: TestResult = {
        endpoint: name,
        success: true,
        data: result,
        timing,
      };

      this.results.push(testResult);
      console.log(`✅ ${name} - ${timing}ms`);
      return testResult;
    } catch (error) {
      const timing = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      const testResult: TestResult = {
        endpoint: name,
        success: false,
        error: errorMessage,
        timing,
      };

      this.results.push(testResult);
      console.log(`❌ ${name} - ${errorMessage} (${timing}ms)`);
      return testResult;
    }
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log("🚀 Starting Backend Connection Tests...");
    console.log("=".repeat(50));

    // Test all endpoints
    await this.testEndpoint("Employers API", () => employersApi.getAll());
    await this.testEndpoint("Users API", () => undergraduatesApi.getAll());
    await this.testEndpoint("Gigs API", () => gigsApi.getAll());
    await this.testEndpoint("Analytics API", () =>
      analyticsApi.getDashboardStats()
    );

    // Print summary
    this.printSummary();
    return this.results;
  }

  private printSummary(): void {
    console.log("\n" + "=".repeat(50));
    console.log("📊 Test Results Summary");
    console.log("=".repeat(50));

    const successful = this.results.filter((r) => r.success);
    const failed = this.results.filter((r) => !r.success);

    console.log(`✅ Successful: ${successful.length}/${this.results.length}`);
    console.log(`❌ Failed: ${failed.length}/${this.results.length}`);

    if (failed.length > 0) {
      console.log("\n❌ Failed Endpoints:");
      failed.forEach((result) => {
        console.log(`  - ${result.endpoint}: ${result.error}`);
      });
    }

    if (successful.length > 0) {
      console.log("\n✅ Successful Endpoints:");
      successful.forEach((result) => {
        const dataCount = result.data?.data?.length || result.data?.length || 0;
        console.log(
          `  - ${result.endpoint}: ${result.timing}ms (${dataCount} items)`
        );
      });
    }

    // Recommendations
    console.log("\n💡 Recommendations:");
    if (failed.length === this.results.length) {
      console.log(
        "  - Make sure your backend server is running on the configured port"
      );
      console.log("  - Check CORS configuration on your backend");
      console.log("  - Verify API endpoints match your backend routes");
    } else if (failed.length > 0) {
      console.log(
        "  - Some endpoints failed - check individual error messages above"
      );
    } else {
      console.log(
        "  - All tests passed! Your backend integration is working correctly"
      );
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  clear(): void {
    this.results = [];
  }
}

// Export convenience function
export const testConnection = async (): Promise<TestResult[]> => {
  const tester = new ConnectionTester();
  return await tester.runAllTests();
};

// Browser console helper
if (typeof window !== "undefined") {
  (window as any).testBackendConnection = testConnection;
  console.log(
    "💡 Run 'testBackendConnection()' in console to test your backend connection"
  );
}
