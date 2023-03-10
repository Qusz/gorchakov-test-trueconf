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
        :style="liftAnimations" 
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
  writeToLocalStorage, 
  readFromLocalStorage 
} from '@/utils/localStorage.js';
import Queue from '@/utils/queueHandling.js';
import queueIterator from '@/utils/generator.js'

import { 
  ref, 
  provide, 
  computed, 
  watchEffect, 
  onMounted,
  readonly  
} from 'vue';

/* ================
  Base variables
================ */

// Set the amount of floors
const amountOfFloors = 5;
const floors = Array.from({length: amountOfFloors}, (_, index) => index + 1).reverse();
// Floor height in px
const floorHeight = 200;

/* ================
  Reactive data
================ */

const status = ref({
  currentFloor: 1,
  targetPosition: 0,
  nextFloor: null,
  movingDirection: null,
  operationTime: 0,
  liftStatus: 'idle',
  floorCalled: {},
});

// To apply animation styles to Lift
const liftAnimations = computed(() => {
  return {
    bottom: status.value.targetPosition,
    transition: `bottom ${status.value.operationTime}s linear`
  }
});

// Queue handler
const queue = ref(new Queue());
// Mounted flag
const isMounted = ref(false);

/* ================
  Hooks
================ */

watchEffect(() => {
  // To make sure onMounted logic runs first
  if (!isMounted.value) return;

  handleQueue();

  writeToLocalStorage('status', status.value);
  writeToLocalStorage('queue', queue.value);
});

onMounted(() => {
  // Set initial floorCalled values
  if (Object.keys(status.value.floorCalled).length === 0) {
    for (let i = 0; i < amountOfFloors; i++) {
      status.value.floorCalled[i + 1] = false;
    }
  }
  
  handleLocalStorage();
  handlePageRefresh();

  isMounted.value = true;
});

/* ================
  Functions
================ */

const moveLift = (currentFloor, targetFloor) => {
  // Floor difference always must be positive
  const floorDifference = Math.abs(targetFloor - currentFloor);
  // 1 floor per second
  status.value.operationTime = floorDifference;
  // Lift positioning
  status.value.targetPosition = `${(targetFloor - 1) * floorHeight}px`;
}

const changeFloorStatus = (floor, value) => {
  // To prevent status change if Lift is already on the floor
  if (value === true && floor === status.value.currentFloor) return;
  status.value.floorCalled[floor] = value;
}

const jobComplete = () => {
  queue.value.deleteFromQueue(status.value.nextFloor);

  status.value.nextFloor = null;
  status.value.movingDirection = null;
  status.value.operationTime = null;

  status.value.liftStatus = 'idle';
  changeFloorStatus(status.value.currentFloor, false);
}

const handleQueue = () => {
  if (!queue.value.queueIsEmpty() && status.value.liftStatus === 'idle') {
    const gen = queueIterator(queue.value.queue);
    const next = gen.next();

    if (!next.done) {
      handleCall(next.value);
    }
  }
}

const handleCall = (targetFloor) => {
  // Check if Lift is already on the called floor
  if (targetFloor === status.value.currentFloor) {
    queue.value.deleteFromQueue(targetFloor);
    return;
  };

  status.value.nextFloor = targetFloor;
  status.value.liftStatus = 'active';
  status.value.movingDirection = targetFloor > status.value.currentFloor 
    ? 'up' : 'down';

  moveLift(status.value.currentFloor, targetFloor);
  status.value.currentFloor = status.value.nextFloor;
}

const handleLocalStorage = () => {
  const storedStatus = readFromLocalStorage('status');
  if (storedStatus) {
    Object.assign(status.value, JSON.parse(storedStatus));
  }
  
  const storedQueue = readFromLocalStorage('queue');
  if (storedQueue) {
    Object.assign(queue.value, JSON.parse(storedQueue));
  }
}

const handlePageRefresh = () => {
  if (status.value.liftStatus === 'active') {
    status.value.currentFloor = status.value.nextFloor;
    status.value.liftStatus = 'recharge';
  }
}

const handleTransition = (e) => {
  // To match event animationName hashed by the browser
  const blinkAnimationName = /blink/;

  switch(true) {
    case e.propertyName === 'bottom':
      status.value.liftStatus = 'recharge';
      break;
    case blinkAnimationName.test(e.animationName):
      jobComplete();
      break;
  }
}

provide('status', readonly(status.value));

</script>

<style></style>