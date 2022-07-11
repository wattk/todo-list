<template>
  <h4 class="text-center">
    I have <span class="text-primary"></span> things to do
  </h4>
  <b-container class="w-50">
    <b-input-group>
      <b-form-select v-model="selectedId" id="select-category">
        <b-form-select-option value="0">category</b-form-select-option>
        <b-form-select-option
          v-for="{ id, content, indent } in categoryList"
          :key="id"
          :value="id"
        >
          {{ indent }}{{ content }}
        </b-form-select-option>
      </b-form-select>
      <div id="autocomplete">
        <b-form-input
          id="new-todo-input"
          placeholder="Type what you have to do"
          ref="input"
          @keyup.enter="onSubmit"
          @focus="isTyped = true"
          @blur="isTyped = false"
          v-model="content"
        >
        </b-form-input>
        <!-- <ul id="auto-list" v-show="isFocus">
          <li v-for="item in searchList" :key="item">
            {{ item.indent }}{{ item.content }}
          </li>
        </ul> -->
      </div>
    </b-input-group>

    <b-list-group id="todo-list">
      <todo-item
        v-for="(item, idx) in sortedList"
        :key="idx"
        :class="{ completed: item.isDone }"
        :list="item.children"
        :item="item"
        :isEdit="isEdit"
        :checkId="checkId"
        @todo-delete="deleteTodo"
        @todo-show="showTodo"
      >
      </todo-item>
    </b-list-group>

    <div id="todo-footer" class="m-3 text-center">
      <b-button-group size="sm" class="m-2">
        <b-button @click="filter = 'all'">All</b-button>
        <b-button @click="filter = 'notYet'">Not Yet</b-button>
        <b-button @click="filter = 'done'">Done</b-button>
      </b-button-group>
    </div>
  </b-container>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, watch, computed, defineExpose } from "vue";
import { Todo, Category } from "@/api/types";
import TodoItem from "@/components/TodoItem.vue";

const todoList = ref([] as Todo[]);
const content = ref("");
const selectedId = ref("");
const findingItem = ref({} as Todo);
const filter = ref("all");
const isEdit = ref(false);
const checkId = ref("");
const isTyped = ref(false);

onBeforeMount(() => {
  const storedTodos = localStorage.getItem("todoList");
  if (storedTodos) todoList.value = JSON.parse(storedTodos);
});

watch(
  todoList,
  () => {
    localStorage.setItem("todoList", JSON.stringify(todoList.value));
  },
  { deep: true }
);

const sortedList = computed(() => {
  let list: Todo[] = [];
  switch (filter.value) {
    case "all":
      list = todoList.value;
      break;
    case "notYet":
      list = todoList.value.filter((ele: Todo) => ele.isDone === false);
      break;
    case "done":
      list = todoList.value.filter((ele: Todo) => ele.isDone === true);
      break;
  }
  return list;
});

const categoryList = computed(() => {
  const categoryList: Category[] = [];

  const makeCategory = (list: Todo[]) => {
    list.map((item) => {
      let ele = {
        id: item.id,
        content: item.content,
        indent: Array(item.depth).fill("\xa0\xa0").join(""),
      };

      categoryList.push(ele);
      if (item.children.length !== 0) {
        makeCategory(item.children);
      }
    });
  };

  makeCategory(todoList.value);

  return categoryList;
});

const findItem = (list: Todo[], id: string): void => {
  for (let i = 0; i < list.length; i++) {
    let item = list[i];

    if (item.id === id) {
      findingItem.value = item;
      return;
    }

    if (item.children) findItem(item.children, id);
  }
};

const deleteTodo = (id: string) => {
  let deleteCheck = confirm("삭제하시겠습니까?");
  if (deleteCheck) {
    let idx = todoList.value.findIndex((ele: Todo) => ele.id === id);
    todoList.value.splice(idx, 1);
  }
};

const showTodo = (id: string) => {
  isEdit.value = id === "" ? false : true;
  checkId.value = id;
};

const onSubmit = () => {
  if (content.value.trim().length === 0) return;

  if (selectedId.value === "") {
    todoList.value.push({
      id: "td" + Date.now(),
      content: content.value,
      date: new Date(),
      isDone: false,
      depth: 0,
      children: [],
    });
  } else {
    findItem(todoList.value, selectedId.value);

    findingItem.value.children.push({
      id: "td" + Date.now(),
      content: content.value,
      date: new Date(),
      isDone: false,
      depth: findingItem.value.depth + 1,
      children: [],
    });

    findingItem.value = {} as Todo;
  }

  content.value = "";
  selectedId.value = "";
};

defineExpose({
  sortedList,
  categoryList,
  findItem,
  deleteTodo,
  showTodo,
  onSubmit,
});
</script>
<style scoped>
#todo-container {
  margin-bottom: 2rem;
}
#autocomplete {
  width: 70%;
  /* height: 3em; */
}
#select-category {
  border: 1px solid #ced4da;
  border-radius: 0.25rem 0 0 0.25rem;
  padding: 0.65rem 0.75rem;
  width: 30%;
  height: 3em;
}
#new-todo-input {
  border: 1px solid #ced4da;
  border-radius: 0 0.25rem 0.25rem 0;
  padding: 0.65rem 0.75rem;
  width: 100%;
  height: 3em;
}
#auto-list {
  z-index: 999;
  position: absolute;
  width: 70%;
  padding-left: 0;
  cursor: pointer;
}
#auto-list li {
  position: relative;
  margin: 0;
  border: 1px solid #f2f2f0;
  border-radius: 0;
}
#todo-list {
  margin-top: 1em;
}
</style>
