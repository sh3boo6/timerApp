<template>
    <div class="flex flex-col min-h-screen px-6">
        <Header />
        <div class="flex-1 flex flex-col lg:flex-row gap-4 text-sm">
            <div class="w-64 pe-5 self-start">
                <NewTimer />
            </div>
            <TimerList />
        </div>
        <Footer />
    </div>
</template>

<script setup>
    import Header from '../components/Header.vue';
    import Footer from '../components/Footer.vue';
    import NewTimer from '../components/NewTimer.vue';
    import TimerList from '../components/TimerList.vue';
</script>