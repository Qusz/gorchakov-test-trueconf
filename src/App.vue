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
  ref, 
  provide, 
  computed, 
  watchEffect, 
  onMounted, 
  watch,
  reactive 
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

const status = ref({
  currentFloor: 1,
  currentPosition: 0,
  nextFloor: null,
  movingDirection: null,
  operationTime: 0,
  liftStatus: 'idle',
  floorCalled: {},
});

const queue = ref(new Queue());

const lift = computed(() => {
  return {
    bottom: status.value.currentPosition,
    transition: `bottom ${status.value.operationTime}s linear`
  }
});

onMounted(() => {
  // Set initial floorCalled values
  if (Object.keys(status.value.floorCalled).length === 0) {
    for (let i = 0; i < amountOfFloors; i++) {
      status.value.floorCalled[i + 1] = false;
    }
  }

  const storedStatus = localStorage.getItem('status');
  if (storedStatus) {
    Object.assign(status.value, JSON.parse(storedStatus));
  }

  const storedQueue = localStorage.getItem('queue');
  if (storedQueue) {
    Object.assign(status.value, JSON.parse(storedQueue));
  }
});

watchEffect(() => {
  if (!queue.value.queueIsEmpty() && status.value.liftStatus === 'idle') {
    const iterator = queue.value.queue.values();
    const next = iterator.next();

    if (!next.done) {
      handleCall(next.value);
    }
  }
});

watch(status.value, (newVal, oldVal) => {
  localStorage.setItem('status', JSON.stringify(newVal));
}, {deep: true});

watch(queue.value, (newVal, oldVal) => {
  localStorage.setItem('queue', JSON.stringify(newVal));
}, {deep: true});

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
    queue.value.deleteFromQueue(targetFloor);
    return;
  };

  status.value.liftStatus = 'active';
  status.value.movingDirection = targetFloor > status.value.currentFloor 
    ? 'up' : 'down';
  status.value.nextFloor = targetFloor;

  moveLift(status.value.currentFloor, targetFloor);
  changeFloorStatus(status.value.currentFloor, false);
  status.value.currentFloor = status.value.nextFloor;
}

const handleTransition = (e) => {
  switch(true) {
    case e.propertyName === 'bottom':
      status.value.liftStatus = 'recharge';
      break;
    case e.animationName === 'blink-eb80ee3d':
      changeFloorStatus(status.value.currentFloor, false);
      status.value.nextFloor = null;
      status.value.movingDirection = null;
      queue.value.deleteFromQueue(status.value.currentFloor);
      status.value.liftStatus = 'idle';      
      break;
  }
}

const changeFloorStatus = (floor, value) => {
  // To prevent status change if the lift is already on the floor
  if (value === true && floor === status.value.currentFloor) return;
  status.value.floorCalled[floor] = value;
}

provide('status', status.value);


</script>

<style></style>