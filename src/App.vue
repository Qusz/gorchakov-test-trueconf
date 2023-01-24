<template>
  <main class="main">
    <div class="floors">
      <Floor
        :floorNumber="5"
      >
      </Floor>
    </div>
    <Lift></Lift>
  </main>
</template>

<script setup>

import Floor from '@/components/Floor/Floor.vue';
import Lift from '@/components/Lift/Lift.vue';


</script>

<style></style>