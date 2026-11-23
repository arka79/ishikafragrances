export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/admin' || path === '/admin/') {
      if (!env.ASSETS) {
        return new Response(
          'ASSETS binding not configured. Add it in wrangler.jsonc or the Cloudflare dashboard.',
          { status: 500 }
        );
      }
      const res = await env.ASSETS.fetch(new URL('/admin.html', request.url));
      const html = await res.text();
      return new Response(html, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    if (!env.ASSETS) {
      return new Response(
        'ASSETS binding not configured. Add it in wrangler.jsonc or the Cloudflare dashboard.',
        { status: 500 }
      );
    }

    try {
      return await env.ASSETS.fetch(request);
    } catch {
      return env.ASSETS.fetch(new URL('/index.html', request.url));
    }
  },
};
