<template>
  <main class="main">
    <div class="floors">
      <Floor
        v-for="floor, index in floors" :key="index"
        :floorNumber="floor"
      >
      </Floor>
      <Lift class="floors__lift"></Lift>
    </div>
  </main>
</template>

<script setup>

import Floor from '@/components/Floor/Floor.vue';
import Lift from '@/components/Lift/Lift.vue';

import { ref } from 'vue';

//* Set the amount of floors
const floors = Array.from({length: 5}, (_, index) => index + 1).reverse();

const status = ref({
  currentFloor: null,
  nextFloor: null,
  movingDirection: null,
  liftStatus: null,
});

const queue = new Set();

</script>

<style></style>