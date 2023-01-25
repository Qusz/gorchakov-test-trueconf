<template>
  <main class="main">
    <div class="floors">
      <Floor
        v-for="floor, index in floors" :key="index"
        :floorNumber="floor"
        :floorStatus="status.floorCalled[floor]" 
        @call="queue.addToQueue(floor); changeFloorStatus(floor, true)"
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

import { reactive, provide, computed, watchEffect, onMounted } from 'vue';

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

const status = reactive({
  currentFloor: 1,
  currentPosition: 0,
  nextFloor: null,
  movingDirection: null,
  operationTime: 0,
  liftStatus: 'idle',
  floorCalled: {}
});

const queue = reactive(new Queue());

const lift = computed(() => {
  return {
    bottom: status.currentPosition,
    transition: `bottom ${status.operationTime}s linear`
  }
});

onMounted(() => {
  // Set initial floorCalled values
  for (let i = 0; i < amountOfFloors; i++) {
    status.floorCalled[i + 1] = false;
  }
});

watchEffect(() => {
  if (!queue.queueIsEmpty() && status.liftStatus === 'idle') {
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
  status.operationTime = floorDifference;
  // Lift positioning
  status.currentPosition = `${(targetFloor - 1) * floorHeight}px`;
}

const handleCall = (targetFloor) => {
  if (targetFloor === status.currentFloor) {
    queue.deleteFromQueue(targetFloor);
    return;
  };

  status.liftStatus = 'active';
  status.movingDirection = targetFloor > status.currentFloor 
    ? 'up' : 'down';
  status.nextFloor = targetFloor;

  moveLift(status.currentFloor, targetFloor);
}

const handleTransition = (e) => {
  switch(true) {
    case e.propertyName === 'bottom':
      status.liftStatus = 'recharge';
      break;
    case e.animationName === 'blink-eb80ee3d':
      status.currentFloor = status.nextFloor;
      status.nextFloor = null;
      status.movingDirection = null;
      queue.deleteFromQueue(status.currentFloor);
      changeFloorStatus(status.currentFloor, false); 
      status.liftStatus = 'idle';      
      break;
  }
}

const changeFloorStatus = (key, value) => {
  status.floorCalled[key] = value;
}

provide('status', status);


</script>

<style></style>