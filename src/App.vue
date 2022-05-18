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
import Sheet from './components/Sheet/index.vue';
import Toast from './components/Toast/index.vue';
import autofocus from './framework/directives/autofocus';
import Countdown from './components/Countdown/index.vue';
// import Countdown_ from "./utils/countdown"

// window.Countdown = Countdown_

const toggled = ref(false)
const delayedToggle = ref(false)
const group = ref([])
const focus = ref(false)
const hover = ref(false)
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "app",
  directives: {
    autofocus
  }
})
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

  <Intersection #default="{ isIntersecting, ratio }" :threshold-length="300">
    <div style="height: 500px;margin-top: 500px;margin-bottom: 500px;" class="box">
      {{ ratio }}

      <div class="box" :style="{ opacity: ratio }">
        HELLO
      </div>
    </div>
  </Intersection>

  <Img load-effect="fade" height="200" src="https://picsum.photos/500/500" alt="Hello">
  <template #prepend="{ loading, loaded, error, refresh }">
    <div style="margin-top: 100px" @click="refresh">
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


  <Overlay closeOnClickOutside z-index-offset="10" always-render custom-transition>
    <template #activator="{ active, toggle, attrs }">
      <button v-bind="attrs" @click.stop="toggle">
        Overlay: {{ active }}
      </button>
    </template>

    <template #default="{ close, transitionEvents, active }">
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;">
        <UiTransition appear>
          <div v-if="active" @click="close"
            style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgb(0,0,0,0.5)"></div>
        </UiTransition>

        <UiTransition appear v-on="transitionEvents" :config="['slideY', 'fade']">
          <div v-if="active" tabindex="0" style="position:relative;background-color: aliceblue;">
            <div>
              Hello world
            </div>

            <div>
              Hii
            </div>

            <Overlay closeOnClickOutside>
              <template #activator="inner">
                <button v-autofocus @click.stop="inner.toggle">
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

  <Sheet from="bottom" snap-mandatory>
    <template #activator="{ active, toggle, attrs }">
      <button v-bind="attrs" @click="toggle">
        Sheet {{ active }}
      </button>
    </template>

    <template #prepend="{ ratio, active }">
      <UiTransition :config="{ enter: 'fade', leave: `fade(0, ${ratio})` }">
        <div v-if="active" style="background-color: rgb(0,0,0,0.6); inset:0; position:fixed; pointer-events: none;"
          :style="{ opacity: ratio }">
        </div>
      </UiTransition>
    </template>

    <template #default="{ transitionEvents, active }">
      <UiTransition v-on="transitionEvents" :config="['slideY(100)', 'fade']">
        <div v-if="active" style="background: white; height:90vh;">
          Hello world
        </div>
      </UiTransition>
    </template>
  </Sheet>

  <Toast duration="15s">
    <template #activator="{ active, toggle }">
      <button @click="toggle">
        Toast: {{ active }}
      </button>
    </template>

    <template #default="{ hover, countdown }">
      <div>
        TOAST! {{ hover }} {{ countdown }}

        <div style="background:red;width:100vw;height:2px; margin: 1rem 0;transform-origin: left;" :style="{
          transform: `scale3d(${Math.abs(countdown.value - 1)},1,1)`
        }"></div>
      </div>
    </template>
  </Toast>

  <Countdown duration="1s" #default="{ value, start, pause, stop, restart, touched, step }">
    <div>
      {{ touched ? step(0, 200).toFixed(2) : 0 }}
    </div>

    <button @click="start">
      start
    </button>

    <button @click="pause">
      pause
    </button>

    <button @click="stop">
      stop
    </button>

    <button @click="restart">
      restart
    </button>
  </Countdown>
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
