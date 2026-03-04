/**
 * Unit-based curriculum for Study Planner.
 * Each topic: { name, description, url } — internal Lunar Lumina study module links.
 */
export const studyCurriculum = [
  {
    id: "dsa",
    category: "Data Structures & Algorithms",
    topics: [
      { name: "Arrays & Basics", description: "Foundational arrays, time complexity, and basic operations. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=arrays-basics" },
      { name: "Stack", description: "LIFO structure, push/pop operations, and applications. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=stack" },
      { name: "Queue", description: "FIFO structure, enqueue/dequeue, and queue variants. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=queue" },
      { name: "Linked List", description: "Singly and doubly linked lists, traversal, and operations. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=linked-list" },
      { name: "Binary Search", description: "Divide-and-conquer search in sorted arrays. Review the Binary Search concept in the Lunar Lumina study module.", url: "/study-planner?concept=binary-search" },
      { name: "Sorting Algorithms", description: "Bubble, merge, quick sort, and time complexities. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=sorting-algorithms" },
      { name: "Recursion", description: "Base case, recursive calls, and stack usage. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=recursion" },
      { name: "Binary Tree", description: "Tree structure, traversals (inorder, preorder, postorder). Review this in the Lunar Lumina study module.", url: "/study-planner?concept=binary-tree" },
      { name: "Heap", description: "Heap property, heapify, and priority queues. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=heap" },
      { name: "Hash Table", description: "Hashing, collision handling, and O(1) lookup. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=hash-table" },
      { name: "Graphs", description: "Graph representation, adjacency list/matrix. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=graphs" },
      { name: "DFS & BFS", description: "Depth-first and breadth-first graph traversal. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=dfs-bfs" },
      { name: "Dynamic Programming", description: "Memoization, tabulation, and classic DP problems. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=dynamic-programming" },
      { name: "AVL Tree", description: "Self-balancing BST, rotations. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=avl-tree" },
      { name: "Trie", description: "Prefix tree for string operations. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=trie" },
      { name: "Topological Sort", description: "Ordering DAG vertices for dependencies. Review this in the Lunar Lumina study module.", url: "/study-planner?concept=topological-sort" },
    ],
  },
  {
    id: "oops",
    category: "OOPS",
    topics: [
      { name: "Classes & Objects", description: "Defining classes, instantiating objects. Review this in the Lunar Lumina Learning Module.", url: "/study-planner?concept=classes-objects" },
      { name: "Encapsulation", description: "Data hiding, access modifiers, getters/setters. Review this in the Lunar Lumina Learning Module.", url: "/study-planner?concept=encapsulation" },
      { name: "Inheritance", description: "Code reuse, parent-child relationships. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=inheritance" },
      { name: "Polymorphism", description: "Compile-time and runtime polymorphism. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=polymorphism" },
      { name: "Abstraction", description: "Abstract classes and interfaces. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=abstraction" },
      { name: "SOLID Principles", description: "Design principles for maintainable code. Review this in the Lunar Lumina Learning Module.", url: "/study-planner?concept=solid-principles" },
      { name: "Design Patterns", description: "Singleton, Factory, Observer, and more. Review this in the Lunar Lumina Learning Module.", url: "/study-planner?concept=design-patterns" },
    ],
  },
  {
    id: "os",
    category: "Operating Systems",
    topics: [
      { name: "OS Basics", description: "Kernel, processes, and system calls. Review this in the Lunar Lumina Learning Module.", url: "/study-planner?concept=os-basics" },
      { name: "Process Scheduling", description: "CPU scheduling algorithms: FCFS, SJF, Round Robin. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=process-scheduling" },
      { name: "Memory Management", description: "Paging, segmentation, virtual memory. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=memory-management" },
      { name: "Process Synchronization", description: "Critical sections, mutex, semaphores. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=process-synchronization" },
      { name: "Deadlock", description: "Deadlock conditions, prevention, avoidance. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=deadlock" },
    ],
  },
  {
    id: "dbms",
    category: "DBMS",
    topics: [
      { name: "DBMS Basics", description: "Database models, ACID properties. Review this in the Lunar Lumina Learning Module.", url: "/study-planner?concept=dbms-basics" },
      { name: "ER Model", description: "Entities, relationships, and ER diagrams. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=er-model" },
      { name: "SQL", description: "SELECT, JOIN, subqueries, and aggregations. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=sql" },
      { name: "Normalization", description: "1NF, 2NF, 3NF, BCNF. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=normalization" },
      { name: "Indexing", description: "B-tree, hash index, and query optimization. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=indexing" },
      { name: "ACID Properties", description: "Atomicity, consistency, isolation, durability. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=acid-properties" },
    ],
  },
  {
    id: "python",
    category: "Python Core",
    topics: [
      { name: "Python Basics", description: "Variables, data types, and control flow. Review this in the Lunar Lumina Learning Module.", url: "/study-planner?concept=python-basics" },
      { name: "Functions & Modules", description: "Defining functions, scope, and imports. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=functions-modules" },
      { name: "Data Structures in Python", description: "Lists, tuples, sets, dictionaries. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=python-data-structures" },
      { name: "Lambda & Map", description: "Anonymous functions and functional tools. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=lambda-map" },
      { name: "List Comprehension", description: "Concise list creation and filtering. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=list-comprehension" },
      { name: "Exception Handling", description: "try/except, raising exceptions. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=exception-handling" },
      { name: "File Handling", description: "Reading and writing files. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=file-handling" },
      { name: "Generators", description: "yield, lazy evaluation. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=generators" },
      { name: "Decorators", description: "Function decorators and wrappers. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=decorators" },
    ],
  },
  {
    id: "ml",
    category: "Machine Learning",
    topics: [
      { name: "ML Basics", description: "Introduction to machine learning concepts. Review this in the Lunar Lumina Learning Module.", url: "/study-planner?concept=ml-basics" },
      { name: "Supervised Learning", description: "Regression and classification. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=supervised-learning" },
      { name: "Unsupervised Learning", description: "Clustering and dimensionality reduction. Review the concept in the Lunar Lumina study section.", url: "/study-planner?concept=unsupervised-learning" },
    ],
  },
];

/** Map quiz topic names to curriculum category ids */
export const topicToCategory = {
  "Data Structures": "dsa",
  OOPS: "oops",
  Python: "python",
  DBMS: "dbms",
  "Operating Systems": "os",
  "Machine Learning": "ml",
  Custom: "dsa",
};
