
const jobspy = require("ts-jobspy");
const scrapeJobs = typeof jobspy.default === 'function' ? jobspy.default : jobspy.scrapeJobs;

async function test() {
    console.log("Testing LinkedIn scrape for Canada...");
    try {
        const jobs = await scrapeJobs({
            siteName: ["linkedin"],
            searchTerm: "Software Engineer",
            location: "Canada",
            resultsWanted: 2,
        });
        console.log(`Found ${jobs.length} jobs.`);
        jobs.forEach(j => {
            console.log(`- ${j.title} at ${j.company} (${j.location})`);
        });
    } catch (e) {
        console.error("Test failed:", e.message);
    }
}

test();
