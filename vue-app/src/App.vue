<template>
  <div id="single-spa-application:@test/vue-app" :class="'theme-' + currentTheme">
    <div class="vue-layout">
      <a href="#vue-main-content" class="skip-link">Skip to content</a>

      <header class="mobile-header">
        <button
          type="button"
          class="menu-toggle"
          @click="isMenuOpen = !isMenuOpen"
          :aria-expanded="isMenuOpen"
          aria-controls="vue-sidebar"
          aria-label="Toggle Menu"
        >
          ☰
        </button>
        <div class="mobile-title">Vue Dashboard</div>
      </header>

      <div class="container">
        <aside
          id="vue-sidebar"
          class="sidebar"
          :class="{ open: isMenuOpen }"
          :aria-hidden="!isMenuOpen && isMobile"
        >
          <nav aria-label="Vue Navigation">
            <ul class="menu-list">
              <li>
                <button type="button" class="menu-item" @click="navigate('/react')">
                  React Home
                </button>
              </li>
              <li>
                <button type="button" class="menu-item active" @click="navigate('/vue')" aria-current="page">
                  Vue Feature
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <div
          v-if="isMenuOpen"
          class="overlay"
          role="presentation"
          @click="isMenuOpen = false"
        ></div>

        <main id="vue-main-content" class="content">
          <section class="feature-top" role="search" aria-label="Search banking dashboard">
            <button type="button" @click="toggleTheme" aria-label="Toggle Vue search theme">Toggle Vue Search Theme</button>
            <button type="button" @click="fetchSearchData" :disabled="isLoading" class="refresh-btn" aria-label="Refresh search data">
              {{ isLoading ? 'Loading...' : 'Refresh Data' }}
            </button>
            <smart-search
              ref="vueSearchRef"
              :theme="currentTheme"
              placeholder="Search users and posts..."
              @search="onSearch"
              @select="onSelect"
              @clear="onClear"
            ></smart-search>
          </section>

          <!-- Loading and Error States -->
          <div v-if="isLoading" class="status-message loading">
            Loading data from JSONPlaceholder API...
          </div>
          <div v-else-if="error" class="status-message error" role="alert" aria-live="assertive">
            Error loading data: {{ error }}
            <button type="button" @click="fetchSearchData" class="retry-btn">Retry</button>
          </div>
          <div v-else-if="searchData.length === 0" class="status-message info">
            No search data available
          </div>

          <section class="grid-section">
            <div class="grid-container" role="list">
              <div
                v-for="n in 16"
                :key="n"
                class="grid-block"
                role="listitem"
              >
                Vue Block {{ n }}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { navigateToUrl } from "single-spa";

const isMenuOpen = ref(false);
const vueSearchRef = ref(null);
const currentTheme = ref("light");
const isMobile = ref(window.innerWidth <= 1024);
const searchData = ref([]);
const isLoading = ref(false);
const error = ref(null);

const fetchSearchData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const usersResponse = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!usersResponse.ok) {
      throw new Error(`Users API error: ${usersResponse.status}`);
    }
    const users = await usersResponse.json();

    const postsResponse = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=15');
    if (!postsResponse.ok) {
      throw new Error(`Posts API error: ${postsResponse.status}`);
    }
    const posts = await postsResponse.json();

    const userData = users.map(user => ({
      id: user.id,
      label: `${user.name} (${user.username}) - ${user.email}`,
      type: 'Users'
    }));
    
    const postData = posts.map(post => ({
      id: `post-${post.id}`,
      label: post.title,
      type: 'Posts'
    }));
    
    const combinedData = [...userData, ...postData];
    searchData.value = combinedData;

    if (vueSearchRef.value) {
      vueSearchRef.value.setData(combinedData);
    }
    
  } catch (err) {
    console.error('Failed to fetch search data:', err);
    error.value = err.message;
    
    const sampleData = [
      { id: 1, label: "Account 123456789", type: "Accounts" },
      { id: 2, label: "Transaction #987654", type: "Transactions" },
      { id: 3, label: "Customer John Doe", type: "Customers" },
      { id: 4, label: "Account 987654321", type: "Accounts" },
      { id: 5, label: "Transaction #123456", type: "Transactions" },
      { id: 6, label: "Customer Jane Smith", type: "Customers" },
      { id: 7, label: "Account 555666777", type: "Accounts" },
      { id: 8, label: "Transaction #789012", type: "Transactions" },
      { id: 9, label: "Customer Bob Johnson", type: "Customers" },
      { id: 10, label: "Account 111222333", type: "Accounts" },
    ];
    
    searchData.value = sampleData;
    if (vueSearchRef.value) {
      vueSearchRef.value.setData(sampleData);
    }
  } finally {
    isLoading.value = false;
  }
};


const navigate = (path) => {
  navigateToUrl(path);
  isMenuOpen.value = false;
};

const updateBreakpoint = () => {
  isMobile.value = window.innerWidth <= 1024;
};

const handleEsc = (e) => {
  if (e.key === "Escape") isMenuOpen.value = false;
};

onMounted(() => {
  updateBreakpoint();
  fetchSearchData();
  if (isMobile.value) {
    isMenuOpen.value = false;
  }
  
  window.addEventListener("resize", updateBreakpoint);
  window.addEventListener("keydown", handleEsc);
});

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === "light" ? "dark" : "light";
};

const onSearch = (e) => console.log("Vue Search Log:", e.detail);
const onSelect = (e) => console.log("Vue Select Log:", e.detail);
const onClear = () => console.log("Vue Clear Log");

onUnmounted(() => {
  window.removeEventListener("resize", updateBreakpoint);
  window.removeEventListener("keydown", handleEsc);
});
</script>

<style scoped>

.vue-layout {
  width: 100%;
  height: 100%;
}

.container {
  display: grid;
  grid-template-columns: 200px 1fr;
  min-height: 100vh;
}

.content {
  padding: 20px;
  overflow-y: auto;
}

.feature-top {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.feature-top button {
  padding: 10px 20px;
  background: #41b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.feature-top button:hover:not(:disabled) {
  background: #35495e;
}

.feature-top button:focus-visible,
.menu-toggle:focus-visible,
.menu-item:focus-visible,
.retry-btn:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

.feature-top button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.theme-light .feature-top button {
  background: #41b883;
  color: white;
}

.theme-dark .feature-top button {
  background: #2563eb;
  color: white;
}

.theme-dark .feature-top button:hover:not(:disabled) {
  background: #1d4ed8;
}

.refresh-btn {
  background: #007bff !important;
}

.theme-dark .refresh-btn {
  background: #3b82f6 !important;
}

.theme-dark .retry-btn {
  background: #ef4444;
}

.status-message {
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-weight: 500;
}

.theme-light .status-message.loading {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.theme-dark .status-message.loading {
  background: #1e293b;
  color: #bfdbfe;
  border: 1px solid #60a5fa;
}

.theme-light .status-message.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.theme-dark .status-message.error {
  background: #7f1d1d;
  color: #f8d7da;
  border: 1px solid #fca5a5;
}

.theme-light .status-message.info {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #ce93d8;
}

.theme-dark .status-message.info {
  background: #312e81;
  color: #c7d2fe;
  border: 1px solid #a5b4fc;
}

.status-message.loading {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.status-message.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-message.info {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #ce93d8;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  margin-left: auto;
}

.retry-btn:hover {
  background: #d32f2f;
}

.grid-section {
  width: 100%;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar {
  background: #41b883;
  color: #35495e;
  padding: 20px;
  transition: transform 0.3s ease;
}

.menu-item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 15px;
  cursor: pointer;
  font-weight: bold;
  color: #35495e;
}

.menu-item:hover {
  background: rgba(53, 73, 94, 0.1);
}

.menu-item.active {
  background: #35495e;
  color: white;
  border-radius: 4px;
}

.theme-light .grid-block {
  background: #f0f0f0;
  border-color: #41b883;
  color: #111827;
}

.theme-dark .grid-block {
  background: #111827;
  border-color: #334155;
  color: #e2e8f0;
}

.theme-dark .content {
  background: #0f172a;
  color: #e2e8f0;
}

.theme-dark .sidebar {
  background: #0f172a;
  color: #cbd5e1;
}

.theme-dark .menu-item:hover {
  background: rgba(255,255,255,0.08);
}

.theme-dark .menu-item.active {
  background: #2563eb;
  color: white;
}

.theme-dark .mobile-header {
  background: #0f172a;
}

.theme-dark .menu-toggle,
.theme-dark .mobile-title {
  color: #cbd5e1;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding-top: 20px;
}

.grid-block {
  background: #f0f0f0;
  border: 1px solid #41b883;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.mobile-header {
  display: none;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #35495e;
}

.mobile-title {
  margin-left: auto;
  font-weight: bold;
  color: #35495e;
}

.overlay {
  display: none;
}

@media (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    bottom: 0;
    width: 250px;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .overlay {
    display: block;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }
  .mobile-header {
    display: flex;
    padding: 15px;
    background: #41b883;
    align-items: center;
    height: 60px;
  }
  .content {
    padding: 15px;
  }
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  .feature-top {
    flex-direction: column;
    align-items: stretch;
  }
  .feature-top button {
    width: 100%;
  }
  .status-message.error {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .retry-btn {
    margin-left: 0;
    align-self: flex-end;
  }
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #35495e;
  color: white;
  padding: 8px;
  z-index: 1000;
}
.skip-link:focus {
  top: 0;
}
</style>
