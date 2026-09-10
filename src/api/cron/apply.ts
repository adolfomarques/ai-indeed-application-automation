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

    function getNextWeekDates() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilWed = (3 - dayOfWeek + 7) % 7 || 7;
        const nextWed = new Date(today);
        nextWed.setDate(today.getDate() + daysUntilWed);
        const daysUntilFri = (5 - dayOfWeek + 7) % 7 || 7;
        const nextFri = new Date(today);
        nextFri.setDate(today.getDate() + daysUntilFri);
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeRange = '5PM to 9PM PH time';
        const wednesday = `${nextWed.toLocaleDateString('en-US', options)} ${timeRange}`;
        const friday = `${nextFri.toLocaleDateString('en-US', options)} ${timeRange}`;
        return { wednesday, friday };
    }

    const resumeTextBlock = resume?.text ? `\nYour resume text content (paste as fallback if file upload fails):\n${resume.text}` : '';
    const resumeInstruction = uploadedResumeFileName
        ? `
RESUME FILE AVAILABLE:
Your resume has been uploaded to the session sandbox at: /workspace/${uploadedResumeFileName}
When you encounter a job application that requires a resume upload:
1. Click the "Upload Resume" or file input button on the form
2. Use the file dialog to navigate to /workspace/${uploadedResumeFileName}
3. Select the file and wait for it to upload
4. Confirm the upload was successful before proceeding${resumeTextBlock}`
        : `
IMPORTANT - RESUME UPLOAD UNAVAILABLE:
No resume file was uploaded. If a job application requires a resume upload, you should skip that job and move on.`;

    const baseInstructions = `
CRITICAL - CLOUDFLARE VERIFICATION HANDLING:
1. DO NOT click buttons immediately on "Additional Verification Required"
2. WAIT 15-30 seconds for the page to process automatically
3. If you see a checkbox "Verify you are human", wait 5 seconds then click it ONCE, wait 15-30s
4. NEVER rapidly click or interact with Cloudflare pages - slow and patient is key

HUMAN-LIKE BROWSING BEHAVIOR:
- Scroll down pages slowly as a human would
- Add small random pauses (1-3 seconds) between actions

STEP 1: VERIFY LOGIN STATUS
- Go to https://www.indeed.com and check if you're logged in. If not, log in with Google.
- Deal with Cloudflare using the steps above if needed.

APPLICATION INFORMATION:
- 3 years of AI/ML Experience
- 4 years of Software Engineering Experience
- Able to start working immediately
- Able to work remotely
- Able to work full-time/part-time
- Only available on ${getNextWeekDates().wednesday} and ${getNextWeekDates().friday}
`;

    const jobList = jobs.map((job, idx) => `
JOB ${idx + 1}:
Title: ${job.title}
Company: ${job.company}
Target URL: ${job.jobUrl}
`).join('\n');

    const jobTaskPrompt = `
${baseInstructions}

STEP 2: APPLY TO THESE JOBS IN SEQUENCE
You must apply to the following ${jobs.length} jobs one by one.
Do not skip any job unless the page is completely broken.

${jobList}

For EACH job in the list above:
1. Navigate directly to the Target URL.
2. Wait for page to fully load (wait 3-5 seconds).
3. Look for and click the "Apply" or "Apply now" button.
4. Fill out any required application fields using autofill where available.
5. If file upload is required, use the resume file if available.
6. Submit the application and wait for confirmation.
7. Once confirmed, move on to the next job in the list.

${resumeInstruction}

When you have finished all jobs, end the task.
    `;

    console.log(`📋 Creating a single mega-task for ${jobs.length} jobs on session ${sessionId}...`);
    
    const task = await client.tasks.createTask({
        task: jobTaskPrompt,
        sessionId: sessionId,
    });
    
    console.log(`   ✅ Queued mega-task ${task.id} for all ${jobs.length} jobs`);

    console.log(`\n✅ Task successfully queued to Browser-Use Cloud!`);
    console.log(`🔗 Watch live session at: https://cloud.browser-use.com/thread/${sessionId}`);

    const taskInfo = {
        taskIds: [task.id],
        sessionId: sessionId,
        liveUrl: session.liveUrl || null,
        viewUrl: `https://cloud.browser-use.com/thread/${sessionId}`,
        jobCount: jobs.length,
        jobs: jobs.map(job => ({
            title: job.title,
            company: job.company,
            url: job.jobUrl
        }))
    };

    if (waitForCompletion) {
        console.log(`\n⏳ Waiting for the application task to complete...`);
        console.log(`💡 This will take several minutes. Watch progress at the URL above.`);
        
        try {
            console.log(`⏳ Waiting for task ${task.id}...`);
            const result = await task.complete();
            console.log(`✅ Task completed.`);

            console.log(`\n🛑 Stopping session ${sessionId}...`);
            await client.sessions.updateSession({
                session_id: sessionId,
                action: 'stop'
            });
            console.log(`✅ Session stopped successfully.`);

            return { ...taskInfo, results: [result.output], liveUrl: session.liveUrl || null };
        } catch (error) {
            console.log(`\n🛑 Error occurred, stopping session ${sessionId}...`);
            await client.sessions.updateSession({
                session_id: sessionId,
                action: 'stop'
            });
            throw error;
        }
    } else {
        console.log(`\n🚀 Task is running in the cloud session.`);
        console.log(`💡 Watch the progress live at: https://cloud.browser-use.com/thread/${sessionId}`);
        return taskInfo;
    }
}

export default applyToJobs;

// Main execution when run directly
const isMainModule = typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('apply.ts');
if (isMainModule) {
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
