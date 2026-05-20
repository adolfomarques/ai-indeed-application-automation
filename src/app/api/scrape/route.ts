import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // Extend timeout to 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      countries = ["USA"],
      searchTerms = ["software engineer"],
      resultsPerSearch = 10,
      jobSites = ["indeed"],
      hoursOld = 0,
      location = "",
    } = body;

    console.log("Scrape request received with:", { countries, searchTerms, resultsPerSearch, jobSites, hoursOld, location });

    const jobspy = await import("ts-jobspy");
    const scrapeJobs = typeof jobspy.default === 'function' ? jobspy.default : (jobspy as any).scrapeJobs;

    if (!scrapeJobs) {
      throw new Error("Could not find scrapeJobs function in ts-jobspy");
    }

    // Validate sites
    const validSites = ['indeed', 'linkedin', 'glassdoor', 'google', 'zip_recruiter', 'bayt', 'naukri', 'bdjobs'];
    const selectedSites = (jobSites as string[]).filter((s: string) => validSites.includes(s));
    
    if (selectedSites.length === 0) {
      throw new Error("No valid job sites selected");
    }

    // Run all searches in parallel for maximum speed
    const searchTasks = [];
    for (const countryName of countries) {
      for (const term of searchTerms) {
        searchTasks.push((async () => {
          try {
            // Use specific location if provided, otherwise fallback to country name
            const finalLocation = location || countryName;
            
            console.log(`Starting search for "${term}" in ${finalLocation} (Country: ${countryName}) on [${selectedSites.join(', ')}]...`);
            
            const options: Record<string, unknown> = {
              siteName: selectedSites,
              searchTerm: term,
              location: finalLocation,
              resultsWanted: resultsPerSearch,
              countryIndeed: countryName,
              linkedinFetchDescription: true,
            };

            // Only add hoursOld if it's a positive number (0 = no limit)
            if (hoursOld && hoursOld > 0) {
              options.hoursOld = hoursOld;
            }

            const jobs = await scrapeJobs(options);
            
            return (jobs || []).map((job: any) => ({
              ...job,
              id: job.id || `${term}-${countryName}-${Math.random().toString(36).slice(2, 8)}`,
              isRemote: job.isRemote || false,
              site: job.site || selectedSites[0],
            }));
          } catch (error) {
            console.error(`Error scraping ${term} in ${countryName}:`, error);
            return [];
          }
        })());
      }
    }

    const allResults = await Promise.all(searchTasks);
    const flattenedJobs = allResults.flat();

    // Deduplicate and clean
    const uniqueJobs = Array.from(new Map(flattenedJobs.map((j: any) => [j.id, j])).values());

    console.log(`Scrape complete. Found ${uniqueJobs.length} unique jobs across ${selectedSites.join(', ')}.`);

    return NextResponse.json({ 
      success: true, 
      jobs: uniqueJobs, 
      count: uniqueJobs.length,
      sites: selectedSites,
    });

  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
