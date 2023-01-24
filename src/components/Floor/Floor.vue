<template>
  <div class="floor">
    <div class="floor__wrapper">
      <div class="floor__shaft"></div>
      <div class="floor__room">
        <div class="floor__room-number">
          {{ floorNumber }}
        </div>
        <div class="floor__room-button">
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { defineProps } from 'vue';

const props = defineProps({
  floorNumber: String
});

</script>

<style lang="scss" scoped>
  @use '@/styles/components/Floor.scss' as *;
</style>