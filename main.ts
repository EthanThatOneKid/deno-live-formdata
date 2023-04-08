import { serve, serveFile } from "./deps.ts";

const sockets = new Set<WebSocket>();

serve(handle);

async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url);

  switch (url.pathname) {
    case "/": {
      return await handleIndex(request);
    }

    case "/form": {
      return await serveFile(request, "./form.html");
    }

    case "/ws": {
      return await handleWS(request);
    }

    default: {
      return new Response("Not found", { status: 404 });
    }
  }
}

async function handleIndex(request: Request): Promise<Response> {
  switch (request.method) {
    case "GET": {
      return serveFile(request, "./index.html");
    }

    case "POST": {
      const unsafeHTML = unsafeHTMLFromFormData(await request.formData());
      for (const socket of sockets) {
        socket.send(makePayload(unsafeHTML));
      }

      return new Response("Successfully submitted form data", {
        headers: new Headers([
          ["content-type", "text/plain"],
          ["access-control-allow-origin", "*"],
        ]),
      });
    }

    default: {
      return new Response("Not found", { status: 404 });
    }
  }
}

function unsafeHTMLFromFormData(formData: FormData): string {
  let html = "";

  for (const [name, value] of formData) {
    html += `<li>${name}: ${value}</li>`;
  }

  return html;
}

function handleWS(request: Request): Response {
  const isValid = request.headers.get("upgrade")?.toLowerCase() === "websocket";
  if (!isValid) {
    return new Response(
      "Must be a websocket request. Pass 'websocket' in the 'Upgrade' header.",
    );
  }

  const upgraded = Deno.upgradeWebSocket(request);
  upgraded.socket.onopen = (event: Event) => {
    console.log("socket opened:", event);
  };

  upgraded.socket.onmessage = (event: MessageEvent) => {
    console.log("socket message:", event.data);
    upgraded.socket.send(new Date().toString());
  };

  upgraded.socket.onerror = (event: Event | ErrorEvent) => {
    if (event instanceof ErrorEvent) {
      console.log("socket errored:", event.message);
      return;
    }

    console.log("socket errored:", event);
  };

  upgraded.socket.onclose = (event: CloseEvent) => {
    console.log("socket closed:", event);
    sockets.delete(upgraded.socket);
  };

  sockets.add(upgraded.socket);
  return upgraded.response;
}

function makePayload(html: string): string {
  return JSON.stringify({ html });
}
