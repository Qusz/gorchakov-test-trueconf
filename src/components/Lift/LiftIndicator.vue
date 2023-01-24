<template>
  <div class="lift-indicator">
    <div class="lift-indicator__wrapper">
      <div
        v-show="movingDirection === 'up'" 
        class="lift-indicator__direction"
      >
        &#x2191;
      </div>
      <div
        v-show="movingDirection === 'down'" 
        class="lift-indicator__direction"
      >
        &#x2193;
      </div>
      <div class="lift__indicator__target">
        {{ nextFloor }}
      </div>
    </div>
  </div>
</template>

<script setup>

import { inject } from 'vue';

const nextFloor = inject('nextFloor');
const movingDirection = inject('movingDirection');

</script>

<style lang="scss" scoped>

@use '@/styles/base' as *;

  .lift-indicator {
    width: 50px;
    height: 30px;
    padding: 5px;

    background-color: $clr-black;
    color: $clr-white;
    border-radius: 5px;

      &__wrapper {
        display: flex;
        gap: 2px;
        align-items: center;
        justify-content: center;
      }
  }

</style>