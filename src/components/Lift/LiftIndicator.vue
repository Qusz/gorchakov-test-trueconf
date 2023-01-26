<template>
  <div class="lift-indicator">
    <div class="lift-indicator__wrapper">
      <div
        v-show="status.movingDirection === 'up'" 
        class="lift-indicator__direction"
      >
        &#x2191;
      </div>
      <div
        v-show="status.movingDirection === 'down'" 
        class="lift-indicator__direction"
      >
        &#x2193;
      </div>
      <div class="lift__indicator__target">
        {{ status.nextFloor }}
      </div>
    </div>
  </div>
</template>

<script setup>

import { inject } from 'vue';

const status = inject('status');

</script>

<style lang="scss" scoped>
  @use '@/styles/components/Lift/LiftIndicator.scss';
</style>