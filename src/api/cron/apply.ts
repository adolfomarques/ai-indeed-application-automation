import { BrowserUseClient } from "browser-use-sdk";

interface ResumeData {
    base64?: string;
    fileName?: string;
    text?: string;
}

async function uploadResumeToSession(client: BrowserUseClient, sessionId: string, resume: ResumeData): Promise<string | null> {
    if (!resume.base64) return null;

    const buffer = Buffer.from(resume.base64, "base64");
    const fileName = resume.fileName || "resume.pdf";

    try {
        console.log(`📤 Requesting presigned upload URL for resume...`);
        const uploadUrlResponse = await client.files.browserSessionUploadFilePresignedUrl({
            session_id: sessionId,
            body: {
                fileName: fileName,
                contentType: "application/pdf",
                sizeBytes: buffer.length,
            },
        });

        const { url, fields } = uploadUrlResponse;

        // Build multipart form data for the presigned URL
        const formData = new FormData();
        for (const [key, value] of Object.entries(fields)) {
            formData.append(key, value);
        }
        formData.append("file", new Blob([buffer], { type: "application/pdf" }), fileName);

        console.log(`📤 Uploading resume to session sandbox...`);
        const uploadRes = await fetch(url, {
            method: "POST",
            body: formData,
        });

        if (!uploadRes.ok) {
            const text = await uploadRes.text();
            console.error(`❌ Resume upload failed: ${text}`);
            return null;
        }

        console.log(`✅ Resume uploaded successfully to session!`);
        return fileName;
    } catch (err) {
        console.error(`❌ Failed to upload resume: ${err}`);
        return null;
    }
}

async function applyToJobs(jobs: any[], waitForCompletion = false, resume?: ResumeData, overrideApiKey?: string, overrideProfileId?: string) {
    console.log(`\n🚀 Starting job application process for ${jobs.length} job(s)...\n`);

    const BROWSER_USE_API_KEY = overrideApiKey || process.env.BROWSER_USE_API_KEY;
    const BROWSER_PROFILE_ID = overrideProfileId || process.env.BROWSER_PROFILE_ID;

    if (!BROWSER_USE_API_KEY) {
        throw new Error('BROWSER_USE_API_KEY environment variable is not set');
    }
    if (!BROWSER_PROFILE_ID) {
        throw new Error('BROWSER_PROFILE_ID environment variable is not set');
    }

    const client = new BrowserUseClient({
        apiKey: BROWSER_USE_API_KEY,
    });

    console.log(`🔑 Using browser profile: ${BROWSER_PROFILE_ID}`);
    console.log(`💡 This profile has Indeed cookies, so you should already be logged in!\n`);

    // Create a session with the browser profile and residential proxy
    console.log(`🆕 Creating session with browser profile and residential proxy...`);
    const session = await client.sessions.createSession({
        profileId: BROWSER_PROFILE_ID,
        persistMemory: true,
        proxyCountryCode: "us",
    });
    const sessionId = session.id;
    console.log(`✅ Session created: ${sessionId}`);
    if (session.liveUrl) {
        console.log(`🔗 Live URL: ${session.liveUrl}`);
    }

    // Upload resume to session sandbox if available
    let uploadedResumeFileName: string | null = null;
    if (resume) {
        uploadedResumeFileName = await uploadResumeToSession(client, sessionId, resume);
    }

    // Build task for applying to jobs (skip login since we have cookies)
    const jobUrls = jobs.map(job => job.jobUrl);
    const jobList = jobUrls.map((url, idx) => `${idx + 1}. ${url}`).join('\n');


    function getNextWeekDates() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 3 = Wednesday, 5 = Friday

        // Calculate days until next Wednesday (day 3)
        const daysUntilWed = (3 - dayOfWeek + 7) % 7 || 7; // If today is Wed, get next Wed
        const nextWed = new Date(today);
        nextWed.setDate(today.getDate() + daysUntilWed);

        // Calculate days until next Friday (day 5)
        const daysUntilFri = (5 - dayOfWeek + 7) % 7 || 7; // If today is Fri, get next Fri
        const nextFri = new Date(today);
        nextFri.setDate(today.getDate() + daysUntilFri);

        // Format dates nicely (e.g., "Wednesday, January 29, 2026")
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeRange = '5PM to 9PM PH time';

        const wednesday = `${nextWed.toLocaleDateString('en-US', options)} ${timeRange}`;
        const friday = `${nextFri.toLocaleDateString('en-US', options)} ${timeRange}`;
        return { wednesday, friday };
    }
    const resumeTextBlock = resume?.text
        ? `\nYour resume text content (paste as fallback if file upload fails):\n${resume.text}`
        : '';
    const resumeInstruction = uploadedResumeFileName
        ? `
RESUME FILE AVAILABLE:
Your resume has been uploaded to the session sandbox at: /workspace/${uploadedResumeFileName}
When you encounter a job application that requires a resume upload:
1. Click the "Upload Resume" or file input button on the form
2. Use the file dialog to navigate to /workspace/${uploadedResumeFileName}
3. Select the file and wait for it to upload
4. Confirm the upload was successful before proceeding${resumeTextBlock}
`
        : `
IMPORTANT - RESUME UPLOAD UNAVAILABLE:
No resume file was uploaded. If a job application requires a resume upload, you should skip that job and move on.
`;

    const comprehensiveTask = `
You need to apply to multiple jobs on Indeed. You should already be logged in via saved cookies.

CRITICAL - CLOUDFLARE VERIFICATION HANDLING:
When you see "Additional Verification Required" or any Cloudflare challenge page:
1. DO NOT click any buttons immediately
2. WAIT 15-30 seconds for the page to process automatically
3. If you see a checkbox like "Verify you are human", wait 5 seconds then click it ONCE
4. After clicking, wait another 15-30 seconds for verification to complete
5. If the page shows "Return home" button, wait first - only click it if verification completed
6. If stuck on Cloudflare for more than 60 seconds, try refreshing the page ONCE
7. If still blocked after refresh, skip this job and move to the next one
8. NEVER rapidly click or interact with Cloudflare pages - slow and patient is key

HUMAN-LIKE BROWSING BEHAVIOR:
- Move the mouse naturally and slowly between elements
- Wait 2-3 seconds between page loads
- Scroll down pages slowly as a human would
- Don't navigate too quickly between pages
- Add small random pauses (1-3 seconds) between actions

STEP 1: VERIFY LOGIN STATUS
- Go to https://www.indeed.com
- Wait for any Cloudflare verification to complete (up to 30 seconds)
- If blocked by Cloudflare, follow the handling steps above
- Check if you're already logged in (look for your account name or profile icon)
- If you see you're logged in, proceed to applying for jobs
- If NOT logged in, go to login page and sign in with Google

STEP 2: APPLY TO EACH JOB
Apply to the following ${jobs.length} job(s) one by one:

${jobList}

For each job:
1. Navigate to the job URL
2. Wait for page to fully load (wait 3-5 seconds)
3. If Cloudflare appears, follow the CLOUDFLARE HANDLING steps above patiently
4. Once on the job page, scroll down slowly to read the job details
5. Look for and click the "Apply" or "Apply now" button
6. Fill out any required application fields using autofill where available
7. If file upload is required (resume, cover letter), use the resume file if available (see RESUME FILE AVAILABLE section below)
8. If the form is simple (no file uploads), submit the application
9. Wait for confirmation that application was submitted
10. Wait 3-5 seconds before moving to the next job

${resumeInstruction}

IMPORTANT:
- BE PATIENT with Cloudflare - rushing causes more blocks
- If a job keeps getting blocked by Cloudflare after 2 attempts, skip it and move on
- Stay logged in throughout the entire process
- Complete as many ${jobs.length} applications as possible
- Report the status of each job application (submitted, skipped, blocked by Cloudflare, error)
- Don't apply to jobs in the home page. Only apply to the specific jobs you are given.

APPLICATION INFORMATION:
Use the following information if needed to apply to the job.
- 3 years of AI/ML Experience
- 4 years of Software Engineering Experience
- Able to start working immediately
- Able to work remotely
- Able to work full-time/part-time
- Only available on ${getNextWeekDates().wednesday} and ${getNextWeekDates().friday}
`;
    console.log(`📋 Creating task to apply to ${jobs.length} jobs...`);

    const task = await client.tasks.createTask({
        task: comprehensiveTask,
        sessionId: sessionId,
    });

    console.log(`\n✅ Task created successfully!`);
    console.log(`📋 Task ID: ${task.id}`);
    console.log(`🔗 Watch live session at: https://cloud.browser-use.com/thread/${task.sessionId}`);
    console.log(`\n📝 Jobs to be applied:`);
    jobs.forEach((job, idx) => {
        console.log(`   ${idx + 1}. ${job.title} at ${job.company}`);
        console.log(`      URL: ${job.jobUrl}`);
    });

    const taskInfo = {
        taskId: task.id,
        sessionId: sessionId,
        liveUrl: session.liveUrl || null,
        viewUrl: `https://cloud.browser-use.com/thread/${task.sessionId}`,
        jobCount: jobs.length,
        jobs: jobs.map(job => ({
            title: job.title,
            company: job.company,
            url: job.jobUrl
        }))
    };

    if (waitForCompletion) {
        console.log(`\n⏳ Waiting for all applications to complete...`);
        console.log(`💡 This may take several minutes. Watch progress at the URL above.`);

        try {
            const result = await task.complete();
            console.log(`\n✅ All tasks completed!`);
            console.log(`📊 Result:`, result.output);

            // Always stop the session after completion to avoid charges
            console.log(`\n🛑 Stopping session ${sessionId}...`);
            await client.sessions.updateSession({
                session_id: sessionId,
                action: 'stop'
            });
            console.log(`✅ Session stopped successfully.`);

            console.log(`\n${'='.repeat(60)}\n`);
            return { ...taskInfo, result: result.output, liveUrl: session.liveUrl || null };
        } catch (error) {
            // Stop session even on error
            console.log(`\n🛑 Error occurred, stopping session ${sessionId}...`);
            await client.sessions.updateSession({
                session_id: sessionId,
                action: 'stop'
            });
            throw error;
        }
    } else {
        console.log(`\n🚀 Task started! The browser will apply to all jobs.`);
        console.log(`💡 Watch the progress live at: https://cloud.browser-use.com/thread/${task.id}`);
        console.log(`\n⚠️  Remember to stop the session when done to avoid charges:`);
        console.log(`   Session ID: ${sessionId}`);

        console.log(`\n${'='.repeat(60)}\n`);
        return taskInfo;
    }
}

export default applyToJobs;

// Main execution when run directly
if (require.main === module) {
    import('dotenv').then(dotenv => {
        dotenv.config();

        // Import dependencies
        return Promise.all([
            import('./scrape'),
            import('./ai')
        ]);
    }).then(([{ scrapeJobMatrix }, { aiProcessJobs }]) => {
        console.log('🚀 Starting full job application workflow...\n');

        // Run the full workflow
        return scrapeJobMatrix(1).then(jobs => {
            console.log(`✅ Scraped ${jobs.length} jobs\n`);
            return aiProcessJobs(jobs);
        }).then(aiFilteredJobs => {
            console.log(`✅ AI filtered to ${aiFilteredJobs.length} matching jobs\n`);

            if (aiFilteredJobs.length === 0) {
                console.log('❌ No jobs matched user preferences');
                return;
            }

            const jobsToApply = aiFilteredJobs.map(item => item.job);
            return applyToJobs(jobsToApply, true);
        }).then(results => {
            console.log('\n✅ Workflow completed!');
            console.log('📊 Results:', results);
        });
    }).catch(error => {
        console.error('\n❌ Error in workflow:', error);
        process.exit(1);
    });
}
