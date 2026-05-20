import asyncio
import os
import sys
import json
import random
from playwright.async_api import async_playwright
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import SecretStr

async def solve_form_step_with_ai(page, llm, user_context):
    """Universal form solver that identifies any interactive element."""
    try:
        await asyncio.sleep(4)
        
        # 1. Aggressive Scroll
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
        await asyncio.sleep(1)
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(1)

        # 2. Universal Field Radar
        # We look for anything that can be filled or selected
        fields = await page.evaluate('''() => {
            const results = [];
            const allElements = document.querySelectorAll('input, textarea, select, [role="textbox"], [role="combobox"]');
            
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0) {
                    // Find text nearby
                    let label = "";
                    let container = el.parentElement;
                    for(let i=0; i<4; i++) {
                        if(container) {
                            label += container.innerText + " ";
                            container = container.parentElement;
                        }
                    }
                    results.push({
                        id: el.id || '',
                        name: el.name || '',
                        placeholder: el.placeholder || '',
                        ariaLabel: el.getAttribute('aria-label') || '',
                        context: label.substring(0, 300).replace(/\\n/g, ' ').trim(),
                        type: el.type || el.getAttribute('role') || 'text'
                    });
                }
            });
            return results;
        }''')

        if fields:
            print(f"Agent Status: AI found {len(fields)} possible questions. Answering...", flush=True)
            prompt = f"Resume: {user_context}\nQuestions found on page: {json.dumps(fields)}\nTask: Provide answers for each. Respond ONLY with a JSON array: [{{'id': '...', 'name': '...', 'value': '...'}}]"
            
            res = await llm.ainvoke(prompt)
            try:
                raw_text = res.content.replace('```json', '').replace('```', '').strip()
                answers = json.loads(raw_text)
                for ans in answers:
                    val = str(ans.get('value', ''))
                    # Try finding by ID, then Name, then Aria Label
                    selectors = []
                    if ans.get('id'): selectors.append(f"#{ans['id']}")
                    if ans.get('name'): selectors.append(f"[name='{ans['name']}']")
                    
                    for sel in selectors:
                        loc = page.locator(sel).first
                        if await loc.count() > 0:
                            print(f"Agent Status: Filling field with value: {val}", flush=True)
                            await loc.scroll_into_view_if_needed()
                            # Visual highlight for the user
                            await loc.evaluate("el => el.style.border = '3px solid red'")
                            await loc.click()
                            await loc.fill("")
                            await page.keyboard.type(val, delay=40)
                            break
            except: pass

        # 3. Navigation
        nav_selectors = [
            'button:has-text("Continue")', 'button:has-text("Next")', 
            'button:has-text("Review")', 'button:has-text("Submit")',
            '[data-testid="continue-button"]', 'button[type="submit"]'
        ]

        for sel in nav_selectors:
            btn = page.locator(sel).first
            if await btn.count() > 0 and await btn.is_visible() and await btn.is_enabled():
                print(f"Agent Status: Clicking Next/Continue...", flush=True)
                await btn.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                await btn.click(force=True)
                return False
        
        return True
    except Exception as e:
        print(f"Agent Status: Error - {str(e)}", flush=True)
        return True

async def apply_to_job(page, url, user_context, llm):
    print(f"Agent Status: Navigating to {url}...", flush=True)
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(5)
        
        # Select resume first if screen exists
        resume = page.locator('[data-testid="resume-card"], [data-testid="resume-card-default"]').first
        if await resume.count() > 0:
            print("Agent Status: Selecting resume card...", flush=True)
            await resume.click(force=True)
            await asyncio.sleep(2)

        apply_btn = page.locator('button.ia-IndeedApplyButton, #indeedApplyButton, button:has-text("Apply now")').first
        if await apply_btn.count() > 0:
            await apply_btn.click()
            for i in range(15):
                print(f"Agent Status: Step {i+1}...", flush=True)
                done = await solve_form_step_with_ai(page, llm, user_context)
                await asyncio.sleep(4)
                if done: break
    except Exception as e:
        print(f"Agent Status: Failed - {str(e)}", flush=True)

async def main():
    try:
        input_data = json.load(sys.stdin)
        job_urls = input_data.get('urls', [])
        user_context = input_data.get('user_context', '')
        gemini_key = input_data.get('gemini_key')
        llm = ChatGoogleGenerativeAI(model='gemini-1.5-flash', google_api_key=SecretStr(gemini_key))
        async with async_playwright() as p:
            user_data_dir = os.path.expanduser("~/Library/Application Support/Google/Chrome/Default")
            browser = await p.chromium.launch_persistent_context(
                user_data_dir=user_data_dir, channel="chrome", headless=False,
                args=["--disable-blink-features=AutomationControlled"], no_viewport=True
            )
            page = browser.pages[0] if browser.pages else await browser.new_page()
            for url in job_urls:
                await apply_to_job(page, url, user_context, llm)
                await asyncio.sleep(random.uniform(5, 10))
            await browser.close()
            print("Agent Status: Finished.", flush=True)
    except Exception as e:
        print(f"Agent Status: Fatal - {str(e)}", flush=True)

if __name__ == '__main__':
    asyncio.run(main())
