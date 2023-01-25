<template>
  <main class="main">
    <div class="floors">
      <Floor
        v-for="floor, index in floors" :key="index"
        :floorNumber="floor"
        @call="queue.addToQueue(floor)"
      >
      </Floor>
      <Lift :style="lift" class="floors__lift" @transitionend="handleTransition"></Lift>
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
    this.queue.add(item);
    // console.log(this.queue);
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
// Lift recharge timer in ms
const rechargeTimer = 1000;

const status = ref({
  currentFloor: 1,
  currentPosition: 0,
  nextFloor: null,
  movingDirection: null,
  operationTime: 0,
  liftStatus: 'idle',
});

// const queue = ref(null);
// queue.value = new Queue();

const queue = reactive(new Queue());


const lift = computed(() => {
  return {
    bottom: status.value.currentPosition,
    transition: `bottom ${status.value.operationTime}s linear`
  }
});

watchEffect(() => {
  if (status.value.liftStatus === 'active') {
    activeTimeout();
  }

  //! Сюда добавить условие, что очередь пустая (или нет)
  if (status.value.liftStatus === 'recharge') {
    rechargeTimeout();
  }

  if (!queue.queueIsEmpty() && status.value.liftStatus === 'idle') {
    // console.log('move')
    const iterator = queue.queue.values();
    const next = iterator.next();

    // console.log(next.value);

    if (!next.done) {
      handleCall(next.value);
      queue.queue.delete(next.value); 
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
  // queue.value.add(targetFloor);

  // if (status.value.liftStatus !== 'idle') return;

  status.value.liftStatus = 'active';
  status.value.movingDirection = targetFloor > status.value.currentFloor 
    ? 'up' : 'down';
  status.value.nextFloor = targetFloor;

  status.value.nextFloor = targetFloor;
  moveLift(status.value.currentFloor, targetFloor);

  // console.log(status.value.operationTime);
  // console.log(status.value.liftStatus);
}

const handleTransition = (e) => {
  switch(true) {
    case e.propertyName === 'bottom':
      console.log('bottom');
      break;
    case e.propertyName === 'opacity':
      console.log('opacity');
  }
}

const activeTimeout = () => {
  setTimeout(() => {
    status.value.liftStatus = 'recharge';
    status.value.currentFloor = status.value.nextFloor;
    console.log(status.value.liftStatus);
  }, status.value.operationTime * 1000);
}

const rechargeTimeout = () => {
  setTimeout(() => {
    status.value.liftStatus = 'idle';
    console.log(status.value.liftStatus);
  }, rechargeTimer);
}

provide('nextFloor', status.value.nextFloor);
provide('movingDirection', status.value.movingDirection);
provide('liftStatus', status.value.liftStatus);


</script>

<style></style>