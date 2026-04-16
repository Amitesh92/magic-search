import { registerApplication, start } from "single-spa";

registerApplication({
  name: "@test/react-app",
  app: () => System.import("@test/react-app"),
  activeWhen: ["/react"], // Or (location) => location.pathname === '/'
});

registerApplication({
  name: "@test/vue-app",
  app: () => System.import("@test/vue-app"),
  activeWhen: ["/vue"],
});

start({
  urlRerouteOnly: true,
});
