import { h, createApp } from 'vue';
import singleSpaVue from 'single-spa-vue';
import '../../shared/SmartSearch.js';
import App from './App.vue';

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App);
    },
  },

  handleInstance: (app) => {
    app.config.globalProperties.$appName = 'vue-app';
    app.config.compilerOptions.isCustomElement = (tag) => tag === 'smart-search';
  },
  containerSelector: '#single-spa-application:@test/vue-app', 
});

export const { bootstrap, mount, unmount } = vueLifecycles;