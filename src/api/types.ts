export interface Todo {
  id: String;
  content: String;
  date: Date;
  isDone: boolean;
  depth: number;
  children: Todo[];
}

export interface Category {
  id: String;
  content: String;
  indent: String;
}
