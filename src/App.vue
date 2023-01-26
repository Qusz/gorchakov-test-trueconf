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
        ref="lift"
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
  ref, 
  provide, 
  computed, 
  watchEffect, 
  onMounted, 
  watch,
  reactive, 
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
  targetPosition: 0,
  nextFloor: null,
  movingDirection: null,
  operationTime: 0,
  liftStatus: 'idle',
  floorCalled: {},
});

const liftAnimations = computed(() => {
  return {
    bottom: status.value.targetPosition,
    transition: `bottom ${status.value.operationTime}s linear`
  }
});

const queue = ref(new Queue());
const isMounted = ref(false);

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
  status.value.targetPosition = `${(targetFloor - 1) * floorHeight}px`;
}

const handleCall = (targetFloor) => {
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

const handleTransition = (e) => {
  switch(true) {
    case e.propertyName === 'bottom':
      status.value.liftStatus = 'recharge';
      break;
    case e.animationName === 'blink-eb80ee3d':
      complete();
      break;
  }
}

const changeFloorStatus = (floor, value) => {
  // To prevent status change if the lift is already on the floor
  if (value === true && floor === status.value.currentFloor) return;
  status.value.floorCalled[floor] = value;
}

const complete = () => {
  queue.value.deleteFromQueue(status.value.nextFloor);

  status.value.nextFloor = null;
  status.value.movingDirection = null;

  status.value.liftStatus = 'idle';
  status.value.operationTime = null;
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

watchEffect(() => {
  if (!isMounted.value) return;
  handleQueue();
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
    Object.assign(queue.value, JSON.parse(storedQueue));
  }

  if (status.value.liftStatus === 'active') {
    status.value.currentFloor = status.value.nextFloor;
    status.value.liftStatus = 'recharge';
  }

  isMounted.value = true;
});

const queueIterator = function* (arr) {
  for (let i = 0; i < arr.length; i++) {
    yield arr[i];
  }
}

provide('status', status.value);


</script>

<style></style>