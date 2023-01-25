<template>
  <div class="floor">
    <div class="floor__wrapper">
      <div class="floor__shaft"></div>
      <div class="floor__room">
        <div class="floor__room-number">
          {{ floorNumber }}
        </div>
        <div class="floor__room-button">
          <FloorCallButton
            :class="{'is-active': status.liftStatus !== 'idle' } "
            @click="$emit('call')"
          ></FloorCallButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { defineProps, inject } from 'vue';
import FloorCallButton from './FloorCallButton.vue';

const props = defineProps({
  floorNumber: Number
});

const status = inject('status');

</script>

<style lang="scss" scoped>
  @use '@/styles/components/Floor.scss' as *;
</style>