import { serve, serveFile } from "./deps.ts";

serve(handle);

async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  switch (url.pathname) {
    case "/": {
      switch (request.method) {
        case "GET": {
          return serveFile(request, "./index.html");
        }
        case "POST": {
          const body = await request.text();
          return new Response(body);
        }
      }
    }

    // 
    case "/ws": {
      const { socket, response } = Deno.upgradeWebSocket(request);
      socket.onopen = () => console.log("socket opened");



  // const upgrade = request.headers.get("upgrade") || "";
  // if (upgrade.toLowerCase() != "websocket") {
  //   return new Response("request isn't trying to upgrade to websocket.");
  // }
  // const { socket, response } = Deno.upgradeWebSocket(request);
  // socket.onopen = () => console.log("socket opened");
  // socket.onmessage = (e) => {
  //   console.log("socket message:", e.data);
  //   socket.send(new Date().toString());
  // };
  // socket.onerror = (e) => console.log("socket errored:", e.message);
  // socket.onclose = () => console.log("socket closed");
  // return response;
}
