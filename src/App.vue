<template>
  <main class="main">
    <div class="floors">
      <Floor
        v-for="floor, index in floors" :key="index"
        :floorNumber="floor"
        @call="moveLift(1, 3)"
      >
      </Floor>
      <Lift :style="lift" class="floors__lift"></Lift>
    </div>
  </main>
</template>

<script setup>

import Floor from '@/components/Floor/Floor.vue';
import Lift from '@/components/Lift/Lift.vue';

import { ref, provide } from 'vue';

//* Set the amount of floors
const floors = Array.from({length: 5}, (_, index) => index + 1).reverse();

const lift = ref({
  transform: 'translateY(0px)'
});

const status = ref({
  currentFloor: 1,
  nextFloor: null,
  movingDirection: null,
  liftStatus: 'idle',
});

const queue = new Set();

const moveLift = (currentFloor, targetFloor) => {
  // Set floor height in px
  const floorHeight = 200;

  const floorDifference = targetFloor - currentFloor;
  const distance = floorDifference * floorHeight;

  // 1 floor per second
  lift.value.transition = `transform ${floorDifference}s linear`;
  lift.value.transform = `translateY(-${distance}px)`;
}

provide('nextFloor', status.value.nextFloor);
provide('movingDirection', status.value.movingDirection);
provide('liftStatus', status.value.liftStatus);


</script>

<style></style>