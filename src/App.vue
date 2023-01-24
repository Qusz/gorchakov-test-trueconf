<template>
  <main class="main">
    <div class="floors">
      <Floor
        v-for="floor, index in floors" :key="index"
        :floorNumber="floor"
      >
      </Floor>
    </div>
    <Lift></Lift>
  </main>
</template>

<script setup>

import Floor from '@/components/Floor/Floor.vue';
import Lift from '@/components/Lift/Lift.vue';

const floors = Array.from({length: 5}, (_, index) => index + 1).reverse();


</script>

<style></style>