export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/admin' || path === '/admin/') {
      return env.ASSETS.fetch(new URL('/admin.html', request.url), request);
    }

    try {
      return await env.ASSETS.fetch(request);
    } catch {
      return env.ASSETS.fetch(new URL('/index.html', request.url), request);
    }
  },
};
