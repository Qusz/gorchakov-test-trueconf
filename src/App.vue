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

import { 
  reactive, 
  provide, 
  computed, 
  watchEffect, 
  onMounted, 
  watch 
} from 'vue';

class Queue {
  constructor() {
    this.queue = reactive([]);
  }

  addToQueue(item) {
    if (this.queue.includes(item)) return;
    this.queue.push(item);
  }

  deleteFromQueue(item) {
    const itemIndex = this.queue.indexOf(item);
    this.queue.splice(itemIndex, 1)
  }

  queueIsEmpty() {
    return this.queue.length === 0;
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
  floorCalled: {},
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
  if (Object.keys(status.floorCalled).length === 0) {
    for (let i = 0; i < amountOfFloors; i++) {
      status.floorCalled[i + 1] = false;
    }
  }

  const storedStatus = localStorage.getItem('status');
  if (storedStatus) {
    Object.assign(status, JSON.parse(storedStatus));
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

watch(status, (newVal, oldVal) => {
  localStorage.setItem('status', JSON.stringify(newVal));
}, {deep: true});

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
  changeFloorStatus(status.currentFloor, false);
  status.currentFloor = status.nextFloor;
}

const handleTransition = (e) => {
  switch(true) {
    case e.propertyName === 'bottom':
      status.liftStatus = 'recharge';
      break;
    case e.animationName === 'blink-eb80ee3d':
      changeFloorStatus(status.currentFloor, false);
      status.nextFloor = null;
      status.movingDirection = null;
      queue.deleteFromQueue(status.currentFloor);
      status.liftStatus = 'idle';      
      break;
  }
}

const changeFloorStatus = (floor, value) => {
  // To prevent status change if the lift is already on the floor
  if (value === true && floor === status.currentFloor) return;
  status.floorCalled[floor] = value;
}

provide('status', status);


</script>

<style></style>