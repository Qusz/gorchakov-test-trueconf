<template>
  <main class="main">
    <div class="floors">
      <Floor
        v-for="floor, index in floors" :key="index"
        :floorNumber="floor"
        @call="queue.addToQueue(floor)"
      >
      </Floor>
      <Lift
        @transitionend="handleTransition"
        @animationend="handleTransition" 
        :style="lift" 
        :class="[
          'floors__lift',
          { 'blink': status.liftStatus === 'recharge' }
        ]" 
      ></Lift>
    </div>
  </main>
</template>

<script setup>

import Floor from '@/components/Floor/Floor.vue';
import Lift from '@/components/Lift/Lift.vue';

import { ref, reactive, provide, computed, watchEffect } from 'vue';

class Queue {
  constructor() {
    this.queue = reactive(new Set());
  }

  addToQueue(item) {
    if (this.queue.has(item)) return;
    this.queue.add(item);
  }

  deleteFromQueue(item) {
    this.queue.delete(item);
  }

  queueIsEmpty() {
    return this.queue.size === 0;
  }
}

// Set the amount of floors
const amountOfFloors = 5;
const floors = Array.from({length: amountOfFloors}, (_, index) => index + 1).reverse();
// Floor height in px
const floorHeight = 200;

const status = ref({
  currentFloor: 1,
  currentPosition: 0,
  nextFloor: null,
  movingDirection: null,
  operationTime: 0,
  liftStatus: 'idle',
});

const queue = reactive(new Queue());

const lift = computed(() => {
  return {
    bottom: status.value.currentPosition,
    transition: `bottom ${status.value.operationTime}s linear`
  }
});

watchEffect(() => {
  if (!queue.queueIsEmpty() && status.value.liftStatus === 'idle') {
    const iterator = queue.queue.values();
    const next = iterator.next();

    if (!next.done) {
      handleCall(next.value);
    }
  }
});

/* =============
  Functions
============= */

const moveLift = (currentFloor, targetFloor) => {
  // Floor difference always must be positive
  const floorDifference = Math.abs(targetFloor - currentFloor);
  // 1 floor per second
  status.value.operationTime = floorDifference;
  // Lift positioning
  status.value.currentPosition = `${(targetFloor - 1) * floorHeight}px`;
}

const handleCall = (targetFloor) => {
  if (targetFloor === status.value.currentFloor) {
    queue.deleteFromQueue(targetFloor);
    return;
  };

  status.value.liftStatus = 'active';
  status.value.movingDirection = targetFloor > status.value.currentFloor 
    ? 'up' : 'down';
  status.value.nextFloor = targetFloor;

  moveLift(status.value.currentFloor, targetFloor);
}

const handleTransition = (e) => {
  switch(true) {
    case e.propertyName === 'bottom':
      status.value.liftStatus = 'recharge';
      break;
    case e.animationName === 'blink-eb80ee3d':
      status.value.currentFloor = status.value.nextFloor;
      status.value.nextFloor = null;
      queue.deleteFromQueue(status.value.currentFloor); 
      status.value.liftStatus = 'idle';      
      break;
  }
}

provide('nextFloor', status.value.nextFloor);
provide('movingDirection', status.value.movingDirection);
provide('liftStatus', status.value.liftStatus);


</script>

<style></style>