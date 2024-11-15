import { createRouter, createWebHistory } from 'vue-router';
import Login from "@/views/LoginView.vue";
import Home from "@/views/HomeView.vue";
import Students from "@/views/StudentsView.vue";
import Recruitments from '@/views/RecruitmentsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
	{
		path: "/",
		name: "home",
		component: Home,
	},
	{
		path: "/students",
		name: "students",
		component: Students,
	},
	{
		path: "/recruitments",
		name: "recruitments",
		component: Recruitments
	}
  ],
});

export default router;
