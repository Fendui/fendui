<script setup lang="ts">
import { ref } from 'vue';
import Toggle from './components/Toggle/index.vue';
import DelayedToggle from './components/DelayedToggle/index.vue';
import Group from './components/Group/index.vue';
import Hover from './components/Hover/index.vue';
import Focus from './components/Focus/index.vue';
import LongPress from './components/LongPress/index.vue';
import Click from './components/Click/index.vue';
import Collapsible from './components/Collapsible/index.vue';
import Intersection from './components/Intersection/index.vue';
import Img from './components/Img/index.vue';
import Switch from './components/Switch/index.vue';
import Overlay from './components/Overlay/index.vue';

const toggled = ref(false)
const delayedToggle = ref(false)
const group = ref([])
const focus = ref(false)
const hover = ref(false)
</script>

<template>
  <div>
    <Toggle tag="section" #default="{ toggle }" v-model="toggled">
      <div @click="toggle">
        {{ toggled || 'false' }}
      </div>
    </Toggle>

    <DelayedToggle v-model="delayedToggle" #default="{ on, off, toggle, waiting }" delay="2000">
      <div class="box" @mouseenter="on" @mouseleave="off" @click="toggle">
        {{ delayedToggle }}
      </div>

      <div>
        wait: {{ waiting }}
      </div>

      <div>
        {{ delayedToggle }}
      </div>
    </DelayedToggle>

    <Group v-model="group" #default="{ add, isActive, remove }" allow-repeated multiple>
      <div>
        {{ group }}
      </div>

      <button v-for="i in 5" :key="i" @click="add({ foo: i })" style="background-color: blue;">
        {{ isActive({ foo: i }) }}
      </button>

      <button v-for="i in 5" :key="i" @click="remove({ foo: i })" style="background-color: red;">
        {{ isActive({ foo: i }) }}
      </button>
    </Group>

    <Hover v-model="hover" #default="{ events }">
      <div class="box" v-on="events">
        Hover me
      </div>

      <div>
        {{ hover }}
      </div>
    </Hover>

    <Focus v-model="focus">
      <div tabindex="0">
        {{ focus }}
      </div>
    </Focus>

    <LongPress #default="{ active, willChange, events }">
      <div class="box" v-on="events">
        Longpress
      </div>

      <div>
        active: {{ active }}
        will-change: {{ willChange }}
      </div>
    </LongPress>

    <Click #default="{ active }" :range="200">
      <div class="box">
        Click:
        {{ active }}
      </div>
    </Click>

    <Group #default="{ isActive, toggle }">
      <template v-for="i in 3" :key="i">
        <button @click="toggle(i)">
          Collapse {{ isActive(i) }}
        </button>


        <Collapsible :open="isActive(i)">
          <div class="box" @click="toggle(i)">
            {{ i }}

            <div v-for="ii in 2 * i">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Itaque quae placeat quos tenetur voluptatibus
              obcaecati consequatur qui eaque, veritatis reiciendis, impedit consectetur laboriosam id, quis molestias
              nesciunt ipsa deleniti rerum!
            </div>
          </div>
        </Collapsible>
      </template>
    </Group>
  </div>

  <Intersection #default="{ isIntersecting, ratio }" :threshold-step="300">
    <div style="height: 500px;margin-top: 500px;margin-bottom: 500px;" class="box">
      {{ ratio }}

      <div class="box" :style="{ opacity: ratio }">
        HELLO
      </div>
    </div>
  </Intersection>

  <Img load-effect="fade" height="200" src="https://picsum.photos/500/500" alt="Hello">
  <template #prepend="{ loading, loaded, error }">
    <div style="margin-top: 100px">
      loading: {{ loading }}
      loaded: {{ loaded }}
      error: {{ error }}
    </div>
  </template>
  </Img>

  <div>
    <Switch track-class="tracks" thumb-class="thumb">
      <template #prepend="{ id }">
        <label :for="id">
          Toggle
        </label>
      </template>
    </Switch>
  </div>

  <div id="tt">

  </div>

  <Overlay class="dj" closeOnClickOutside :delay-active="{
    enter: 16, leave: 800
  }" custom-transition z-index-offset="10">
    <template #activator="{ active, toggle, attrs }">
      <button v-bind="attrs" @click.stop="toggle">
        Overlay: {{ active }}
      </button>
    </template>

    <template #default="{ close, transitionEvents, delayedActive }">
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;">
        <UiTransition>
          <div v-if="delayedActive" @click="close"
            style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgb(0,0,0,0.5)"></div>
        </UiTransition>

        <UiTransition v-on="transitionEvents" :config="['slideY', 'fade']">
          <div v-if="delayedActive" tabindex="0" style="position:relative;z-index: 1;background-color: aliceblue;">
            <div>
              Hello world
            </div>

            <div>
              Hii
            </div>

            <Overlay closeOnClickOutside>
              <template #activator="inner">
                <button @click.stop="inner.toggle">
                  foo
                </button>
              </template>

              <div>
                Hello world
              </div>
            </Overlay>
          </div>
        </UiTransition>
      </div>
    </template>
  </Overlay>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.box {
  background-color: red;
  min-height: 100px;
  color: white;
}

.tracks {
  background-color: black !important;
}
</style>
