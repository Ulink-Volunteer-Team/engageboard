import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import("@/views/LoginView.vue"),
    },
	{
		path: "/",
		name: "home",
		component: () => import("@/views/HomeView.vue"),
	},
	{
		path: "/students",
		name: "students",
		component: () => import("@/views/StudentsView.vue"),
	},
	{
		path: "/recruitments",
		name: "recruitments",
		component: () => import("@/views/RecruitmentsView.vue"),
	},
  ],
});

export default router;
