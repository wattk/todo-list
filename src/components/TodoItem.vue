<template>
  <b-list-group-item
    class="d-flex justify-content-between"
    :style="nodePadding"
  >
    <label class="p-2 d-flex align-items-center">
      <input type="checkbox" :checked="item.isDone" @click="onCheck()" />
      <span class="todo-content p-1" v-show="isShow">{{ item.content }}</span>
      <input
        type="text"
        class="input-edit"
        :value="item.content"
        v-show="!isShow"
        @keyup.enter="onUpdate()"
      />
    </label>
    <div class="d-flex align-items-center">
      <span class="todo-date p-1" v-show="isShow"></span>
      <b-button
        size="sm"
        class="m-1"
        variant="outline-secondary"
        @click="checkEdit()"
        >edit</b-button
      >
      <b-button size="sm" variant="outline-secondary" @click="onDelete()"
        >delete</b-button
      >
    </div>
  </b-list-group-item>
  <!-- children에 요소가 있으면 다시 한 번 todo-item을 호출 -->
  <div v-if="hasChildren">
    <todo-item
      v-for="(child, idx) in item.children"
      :key="idx"
      :class="{ completed: child.isDone }"
      :list="child.children"
      :item="child"
      :isEdit="isEdit"
      :checkId="checkId"
      @todo-delete="deleteTodo"
      @parent-check-change="changeParent"
      @todo-show="showTodo"
    >
    </todo-item>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, PropType } from "vue";
import { Todo } from "@/api/types";

const props = defineProps({
  list: {
    type: Array as PropType<Todo[]>,
    required: true,
  },
  item: {
    type: Object as PropType<Todo>,
    required: true,
  },
  isEdit: {
    type: Boolean,
    required: true,
  },
  checkId: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(["parent-check-change", "todo-delete", "todo-show"]);

const nodePadding = computed(() => {
  return {
    "padding-left": `${props.item.depth + 0.5}em`,
  };
});

const hasChildren = computed(() => {
  const { children } = props.item;
  return children && children.length > 0;
});

const isShow = computed(() => {
  return !props.isEdit || props.item.id !== props.checkId;
});

const changeParent = (item: Todo, isDone: boolean) => {
  item.isDone = isDone;
  let isEqual = true;
  for (let i = 0; i < props.list.length; i++) {
    let ele = props.list[i];
    if (ele.isDone !== item.isDone) {
      isEqual = false;
      break;
    }
  }

  if (isEqual) {
    emits("parent-check-change", props.item, item.isDone);
  } else {
    emits("parent-check-change", props.item, false);
  }
};

const changeChildren = (item: Todo) => {
  item.children.forEach((ele) => {
    ele.isDone = item.isDone;
    if (ele.children) {
      changeChildren(ele);
    }
  });
};

const onCheck = () => {
  if (props.item.children) {
    changeChildren(props.item);
  }

  if (props.item.depth !== 0) {
    emits("parent-check-change", props.item, !props.item.isDone);
  }
};

const deleteTodo = (id: string) => {
  let deleteCheck = confirm("삭제하시겠습니까?");

  if (deleteCheck) {
    let idx = props.list.findIndex((ele) => ele.id === id);
    console.log(idx);
    // props.list.splice(idx, 1);
  }
};

const onDelete = () => {
  emits("todo-delete", props.item.id);
};

const showTodo = (checkId: string) => {
  emits("todo-show", checkId);
};

const checkEdit = () => {
  emits("todo-show", props.item.id);
};

const onUpdate = () => {
  // props.item.content = e.target.value;
  emits("todo-show", "");
};
</script>
<style scoped>
#todo-list div.completed label {
  color: gray;
  text-decoration: line-through;
}
.todo-date {
  font-size: 0.8em;
  color: darkgray;
}
</style>
