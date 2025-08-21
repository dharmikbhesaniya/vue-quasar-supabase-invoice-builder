import { defineStore } from "pinia";
import { supabase } from "boot/supabase";
import { ref } from "vue";

export interface Todo {
  id: number;
  title: string;
  done: boolean;
  created_at: string;
}

export const useTodosStore = defineStore("todos", () => {
  const todos = ref<Todo[]>([]);
  const loading = ref(false);

  async function fetchTodos() {
    loading.value = true;
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });
    loading.value = false;
    if (error) throw error;
    todos.value = data || [];
  }

  async function addTodo(title: string) {
    const { data, error } = await supabase
      .from("todos")
      .insert({ title })
      .select();
    if (error) throw error;
    if (data) todos.value.unshift(data[0]);
  }

  async function toggleDone(id: number, currentDone: boolean) {
    const { error } = await supabase
      .from("todos")
      .update({ done: !currentDone })
      .eq("id", id);
    if (error) throw error;
    const todo = todos.value.find((t) => t.id === id);
    if (todo) todo.done = !currentDone;
  }

  async function deleteTodo(id: number) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) throw error;
    todos.value = todos.value.filter((t) => t.id !== id);
  }

  return {
    todos,
    loading,
    fetchTodos,
    addTodo,
    toggleDone,
    deleteTodo,
  };
});
