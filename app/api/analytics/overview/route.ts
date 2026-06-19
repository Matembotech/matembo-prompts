import { NextResponse } from "next/server";
import { analyticsClient, GA4_PROPERTY_ID } from "@/lib/analytics";

export async function GET() {
  if (!GA4_PROPERTY_ID) {
    return NextResponse.json(
      { success: false, error: "Missing GA4_PROPERTY_ID configuration" },
      { status: 500 }
    );
  }

  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: "7daysAgo",
          endDate: "today",
        },
      ],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
      ],
      dimensions: [
        { name: "date" },
      ],
      keepEmptyRows: true, // Ensures missing days are still returned as 0
    });

    if (!response.rows) {
      return NextResponse.json({ success: true, data: { totals: {}, trend: [] } });
    }

    // Format the response into a clean structure
    const trend = response.rows.map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      activeUsers: parseInt(row.metricValues?.[0]?.value || "0", 10),
      newUsers: parseInt(row.metricValues?.[1]?.value || "0", 10),
      sessions: parseInt(row.metricValues?.[2]?.value || "0", 10),
    }));

    // Sort chronologically (GA4 returns date string in YYYYMMDD format)
    trend.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate aggregated totals over the 7 days
    const totals = trend.reduce(
      (acc, day) => {
        acc.activeUsers += day.activeUsers;
        acc.newUsers += day.newUsers;
        acc.sessions += day.sessions;
        return acc;
      },
      { activeUsers: 0, newUsers: 0, sessions: 0 }
    );

    return NextResponse.json(
      { success: true, data: { totals, trend } },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Analytics] Error fetching overview data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve analytics data" },
      { status: 500 }
    );
  }
}
