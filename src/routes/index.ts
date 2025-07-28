import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue'; // Adjust path if needed
import SwiperWindow from '../components/SwiperWindow.vue'; // Adjust path if needed

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/swiper',
    name: 'Swiper',
    component: SwiperWindow,
  },
  // Add other routes as needed
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;