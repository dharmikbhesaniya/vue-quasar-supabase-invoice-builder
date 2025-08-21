<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useTodosStore } from "stores/todos";

const todosStore = useTodosStore();
const newTodo = ref("");

onMounted(() => {
  todosStore.fetchTodos();
});

const addTodo = async () => {
  if (newTodo.value.trim() === "") return;
  await todosStore.addTodo(newTodo.value);
  newTodo.value = "";
};
</script>

<template>
  <div class="q-pa-md">
    <q-input v-model="newTodo" label="New Todo" @keyup.enter="addTodo" />
    <q-btn label="Add" color="primary" @click="addTodo" class="q-mt-sm" />

    <q-list bordered class="q-mt-md">
      <q-item
        v-for="todo in todosStore.todos"
        :key="todo.id"
        clickable
        @click="todosStore.toggleDone(todo.id, todo.done)"
      >
        <q-item-section>
          <q-item-label :class="{ 'text-strike': todo.done }">
            {{ todo.title }}
          </q-item-label>
          <q-item-label caption>
            {{ new Date(todo.created_at).toLocaleString() }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            icon="delete"
            color="negative"
            @click.stop="todosStore.deleteTodo(todo.id)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>
.text-strike {
  text-decoration: line-through;
}
</style>
