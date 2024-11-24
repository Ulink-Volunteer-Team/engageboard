<template>
	<div class="about">
		<h1>This is an about page</h1>
	</div>
</template>

<style>
@media (min-width: 1024px) {
	.about {
		min-height: 100vh;
		display: flex;
		align-items: center;
		animation: fade-in 0.3s ease-in;
	}
}

@keyframes fade-in {
	0% {
		opacity: 0;
	}

	30% {
		opacity: 0;
	}

	100% {
		overflow: 1;
	}
}
</style>
