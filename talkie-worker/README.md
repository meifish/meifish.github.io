# Talkie speech-to-text proxy

This small Cloudflare Worker keeps the OpenAI key off the public test page at
https://meifish.github.io/talkie/. The page sends the recording here along with
a passcode. The worker checks the passcode and adds the OpenAI key, then passes
OpenAI's answer back to the page.

## One-time setup (about 5 minutes, all in the browser)

1. **Cap your OpenAI spending first.** At platform.openai.com, open Settings >
   Limits and set a monthly budget (for example US$10). Then create a key under
   API keys. A separate project just for Talkie is a good idea.
2. **Create the worker.** Sign up free at dash.cloudflare.com. Open Workers &
   Pages, choose Create > Create Worker, name it `talkie-stt` and click Deploy.
3. **Paste the code.** Click Edit code, replace everything with the contents of
   `worker.js` in this folder, and click Deploy.
4. **Add the settings.** Open the worker's Settings > Variables and Secrets and
   add these three:
   - `OPENAI_API_KEY`: type **Secret**, value is your OpenAI key
   - `PASSCODE`: type **Secret**, value is any code you'll give testers
   - `ALLOWED_ORIGIN`: type **Text**, value is `https://meifish.github.io`
5. **Connect the page.** Copy the worker's address (it looks like
   `https://talkie-stt.<your-name>.workers.dev`). Put it in `PROXY_URL` near
   the top of the script in `talkie/index.html`.

## What protects your credit

- Only pages on `ALLOWED_ORIGIN` are accepted, which stops other websites from
  using the worker.
- Every request must carry the passcode. Change `PASSCODE` in Cloudflare at any
  time to shut out everyone who has the old one.
- Only the three transcription models are allowed, and each recording is capped
  at 10 MB.
- The OpenAI monthly budget is the final backstop.

The origin check can be faked by a script, so the passcode and the budget do the
real work.
