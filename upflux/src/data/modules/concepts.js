/**
 * Concept module content keyed by URL slug.
 * Used by ConceptModule page to display learning material.
 */
export const concepts = {
  // ── Data Structures & Algorithms ──────────────────────────────────
  "arrays-basics": {
    title: "Arrays Basics",
    explanation:
      "Arrays store multiple values inside a single variable. Each value is accessed using an index starting from 0. Arrays are one of the most fundamental data structures used in programming.",
    keyIdea:
      "Array elements are stored in contiguous memory which allows fast O(1) access by index.",
    example:
      "Example: [10, 20, 30]. Accessing index 1 returns 20. Inserting at the end is O(1) amortized, but inserting at the beginning is O(n).",
    practice:
      "Practice array traversal, searching, updating values, and two-pointer techniques.",
  },

  "stack": {
    title: "Stack",
    explanation:
      "A stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle. Elements are added and removed from the same end, called the top.",
    keyIdea:
      "The last element inserted is the first element removed.",
    example:
      "Operations: push() adds to top, pop() removes from top, peek() views top. Think of a stack of plates.",
    practice:
      "Practice parentheses checking, expression evaluation, and recursion-based problems.",
  },

  "queue": {
    title: "Queue",
    explanation:
      "A queue is a linear data structure that follows the First-In-First-Out (FIFO) principle. Elements are added at the rear and removed from the front.",
    keyIdea:
      "The first element inserted is the first element removed.",
    example:
      "Operations: enqueue() adds to rear, dequeue() removes from front. Think of a line at a ticket counter.",
    practice:
      "Practice BFS traversal, scheduling problems, and circular queue implementations.",
  },

  "linked-list": {
    title: "Linked List",
    explanation:
      "Linked lists store elements as nodes connected by pointers. Unlike arrays, elements are not stored in contiguous memory. Each node holds data and a reference to the next node.",
    keyIdea:
      "Each node contains data and a reference (pointer) to the next node, forming a chain.",
    example:
      "Singly linked: 10 → 20 → 30 → null. Doubly linked lists also have a pointer to the previous node.",
    practice:
      "Practice insertion, deletion, reversal, cycle detection, and merging sorted lists.",
  },

  "binary-search": {
    title: "Binary Search",
    explanation:
      "Binary search finds elements in a sorted array by repeatedly dividing the search space in half. It is significantly faster than linear search for large datasets.",
    keyIdea:
      "Compare with the middle element and eliminate half the array each step, achieving O(log n) time.",
    example:
      "Searching 25 in [10, 15, 20, 25, 30]: mid=20 → go right → mid=25 → found!",
    practice:
      "Practice problems with sorted arrays, rotated arrays, and search-space reduction.",
  },

  "sorting-algorithms": {
    title: "Sorting Algorithms",
    explanation:
      "Sorting arranges elements in a specific order. Common algorithms include Bubble Sort O(n²), Merge Sort O(n log n), and Quick Sort O(n log n) average.",
    keyIdea:
      "Divide-and-conquer sorts (merge, quick) outperform simple sorts (bubble, selection) on large inputs.",
    example:
      "Merge Sort: split [38, 27, 43, 3] → [38,27] [43,3] → [27,38] [3,43] → merge → [3, 27, 38, 43].",
    practice:
      "Practice implementing merge sort, quick sort, and understanding when to use each algorithm.",
  },

  "recursion": {
    title: "Recursion",
    explanation:
      "Recursion is a technique where a function calls itself to solve smaller sub-problems until it reaches a base case. It uses the call stack to remember each invocation.",
    keyIdea:
      "Every recursive solution needs a base case (stopping condition) and a recursive case that moves toward it.",
    example:
      "Factorial: fact(5) = 5 × fact(4) = 5 × 4 × fact(3) … = 120. Base case: fact(0) = 1.",
    practice:
      "Practice factorial, Fibonacci, Tower of Hanoi, and tree/graph traversal problems.",
  },

  "binary-tree": {
    title: "Binary Tree",
    explanation:
      "A binary tree is a hierarchical data structure where each node has at most two children (left and right). It is the foundation for BSTs, heaps, and more.",
    keyIdea:
      "Traversal orders: Inorder (left-root-right), Preorder (root-left-right), Postorder (left-right-root).",
    example:
      "A BST with root 10, left 5, right 15. Inorder traversal gives sorted output: 5, 10, 15.",
    practice:
      "Practice tree traversals, height calculation, level-order traversal, and subtree checks.",
  },

  "heap": {
    title: "Heap",
    explanation:
      "A heap is a complete binary tree that satisfies the heap property. In a max-heap the parent is always larger than its children; in a min-heap, smaller.",
    keyIdea:
      "Heaps enable O(log n) insertion and extraction of the min/max element, powering priority queues.",
    example:
      "Min-heap: [1, 3, 5, 7, 9]. Extracting min returns 1 and re-heapifies the remaining elements.",
    practice:
      "Practice heapify, heap sort, and priority queue problems like finding the kth largest element.",
  },

  "hash-table": {
    title: "Hash Table",
    explanation:
      "Hash tables map keys to values using a hash function that computes an index into an array of buckets. They provide near-constant time lookup.",
    keyIdea:
      "A good hash function distributes keys uniformly; collisions are handled via chaining or open addressing.",
    example:
      "Storing {\"name\": \"Alice\"}: hash(\"name\") → index 3 → store at bucket 3. Lookup is O(1) average.",
    practice:
      "Practice frequency counting, two-sum problems, and designing hash functions.",
  },

  "graphs": {
    title: "Graphs",
    explanation:
      "A graph is a collection of vertices (nodes) connected by edges. Graphs can be directed or undirected, weighted or unweighted.",
    keyIdea:
      "Graphs are represented using adjacency lists (space-efficient) or adjacency matrices (fast edge lookup).",
    example:
      "Social network: each person is a node, friendships are edges. Adjacency list: {A: [B,C], B: [A], C: [A]}.",
    practice:
      "Practice graph representation, connected components, and shortest path problems.",
  },

  "dfs-bfs": {
    title: "DFS & BFS",
    explanation:
      "Depth-First Search (DFS) explores as deep as possible before backtracking. Breadth-First Search (BFS) explores all neighbors at the current depth first.",
    keyIdea:
      "DFS uses a stack (or recursion); BFS uses a queue. BFS finds shortest path in unweighted graphs.",
    example:
      "Graph: A→B, A→C, B→D. DFS from A: A,B,D,C. BFS from A: A,B,C,D.",
    practice:
      "Practice maze solving, shortest path in unweighted graphs, and cycle detection.",
  },

  "dynamic-programming": {
    title: "Dynamic Programming",
    explanation:
      "Dynamic programming solves complex problems by breaking them into overlapping sub-problems and storing results to avoid redundant computation.",
    keyIdea:
      "Two approaches: top-down (memoization with recursion) and bottom-up (tabulation with iteration).",
    example:
      "Fibonacci with DP: fib(5) stores fib(3), fib(4) so they are not recomputed. O(n) instead of O(2^n).",
    practice:
      "Practice 0/1 knapsack, longest common subsequence, coin change, and grid path problems.",
  },

  "avl-tree": {
    title: "AVL Tree",
    explanation:
      "An AVL tree is a self-balancing Binary Search Tree where the height difference between left and right subtrees of any node is at most 1.",
    keyIdea:
      "After insertion or deletion, rotations (LL, RR, LR, RL) restore balance, keeping operations O(log n).",
    example:
      "Inserting 30, 20, 10 into a BST causes a right-right imbalance. A single left rotation at 30 fixes it.",
    practice:
      "Practice identifying imbalance types, performing rotations, and comparing with Red-Black trees.",
  },

  "trie": {
    title: "Trie",
    explanation:
      "A trie (prefix tree) is a tree-like structure used for efficient storage and retrieval of strings. Each edge represents a character.",
    keyIdea:
      "Common prefixes share the same path, enabling O(L) search where L is the length of the word.",
    example:
      "Storing 'cat', 'car', 'card': root→c→a→t, root→c→a→r, root→c→a→r→d. Prefix 'ca' matches all three.",
    practice:
      "Practice autocomplete, word search, and longest common prefix problems.",
  },

  "topological-sort": {
    title: "Topological Sort",
    explanation:
      "Topological sort produces a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge u→v, u comes before v.",
    keyIdea:
      "Used for dependency resolution. Implemented via DFS (reverse post-order) or Kahn's algorithm (BFS with in-degree).",
    example:
      "Tasks: A→B, A→C, B→D, C→D. Valid order: A, B, C, D or A, C, B, D.",
    practice:
      "Practice course scheduling, build systems, and detecting cycles in directed graphs.",
  },

  // ── OOPS ──────────────────────────────────────────────────────────
  "classes-objects": {
    title: "Classes & Objects",
    explanation:
      "A class is a blueprint for creating objects. An object is an instance of a class that holds state (attributes) and behavior (methods).",
    keyIdea:
      "Classes encapsulate data and functions together, forming the basis of object-oriented design.",
    example:
      "class Car { constructor(brand) { this.brand = brand; } } const myCar = new Car('Toyota');",
    practice:
      "Practice creating classes, instantiating objects, and using constructors.",
  },

  "encapsulation": {
    title: "Encapsulation",
    explanation:
      "Encapsulation bundles data and the methods that operate on it within a single unit (class), restricting direct access to some components.",
    keyIdea:
      "Use access modifiers (private, protected, public) and getters/setters to control data access.",
    example:
      "A BankAccount class hides the balance field as private and exposes deposit() and getBalance() methods.",
    practice:
      "Practice designing classes with proper access control and data validation in setters.",
  },

  "inheritance": {
    title: "Inheritance",
    explanation:
      "Inheritance allows a class (child) to acquire properties and methods from another class (parent), promoting code reuse.",
    keyIdea:
      "Child classes extend parent classes and can override methods to provide specialized behavior.",
    example:
      "class Animal { speak() {} } class Dog extends Animal { speak() { return 'Woof'; } }",
    practice:
      "Practice single inheritance, method overriding, and understanding the prototype chain.",
  },

  "polymorphism": {
    title: "Polymorphism",
    explanation:
      "Polymorphism allows objects of different classes to be treated through the same interface. The same method name can behave differently depending on the object.",
    keyIdea:
      "Compile-time polymorphism (overloading) vs. runtime polymorphism (overriding).",
    example:
      "A draw() method on Shape is overridden by Circle and Rectangle to draw different shapes.",
    practice:
      "Practice method overriding, interface implementation, and understanding virtual methods.",
  },

  "abstraction": {
    title: "Abstraction",
    explanation:
      "Abstraction hides complex implementation details and exposes only the essential features to the user.",
    keyIdea:
      "Abstract classes and interfaces define contracts without revealing internal workings.",
    example:
      "An abstract class Vehicle with an abstract method start(). Car and Bike provide their own implementations.",
    practice:
      "Practice designing abstract classes, interfaces, and understanding when to use each.",
  },

  "solid-principles": {
    title: "SOLID Principles",
    explanation:
      "SOLID is a set of five design principles for writing maintainable, scalable OOP code: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.",
    keyIdea:
      "Each class should have one reason to change, be open for extension but closed for modification.",
    example:
      "SRP: A UserService handles user logic, while EmailService handles email — not one class for both.",
    practice:
      "Practice refactoring code to follow each SOLID principle and identifying violations.",
  },

  "design-patterns": {
    title: "Design Patterns",
    explanation:
      "Design patterns are reusable solutions to common software design problems. They are categorized as Creational, Structural, and Behavioral.",
    keyIdea:
      "Patterns like Singleton, Factory, Observer, and Strategy solve recurring design challenges.",
    example:
      "Singleton: class DB { static instance; static getInstance() { if (!DB.instance) DB.instance = new DB(); return DB.instance; } }",
    practice:
      "Practice implementing Singleton, Factory, Observer, and Strategy patterns.",
  },

  // ── Operating Systems ─────────────────────────────────────────────
  "os-basics": {
    title: "OS Basics",
    explanation:
      "An operating system manages hardware resources and provides services for application programs. The kernel is the core component that handles CPU, memory, and I/O.",
    keyIdea:
      "The OS acts as an intermediary between user applications and hardware through system calls.",
    example:
      "When you open a file, your program makes a system call (e.g., open()) that the kernel handles.",
    practice:
      "Practice understanding process states, system call flow, and kernel vs user mode.",
  },

  "process-scheduling": {
    title: "Process Scheduling",
    explanation:
      "The CPU scheduler selects which process runs next. Common algorithms: FCFS, Shortest Job First (SJF), Round Robin, and Priority Scheduling.",
    keyIdea:
      "Scheduling aims to maximize CPU utilization and minimize waiting time and turnaround time.",
    example:
      "Round Robin with quantum=4: P1(5ms), P2(3ms) → P1 runs 4ms, P2 runs 3ms, P1 runs 1ms.",
    practice:
      "Practice calculating waiting time and turnaround time for different scheduling algorithms.",
  },

  "memory-management": {
    title: "Memory Management",
    explanation:
      "Memory management handles allocation and deallocation of memory for processes. Techniques include paging, segmentation, and virtual memory.",
    keyIdea:
      "Virtual memory allows processes to use more memory than physically available by using disk as an extension.",
    example:
      "Paging: a 16KB process on a system with 4KB page frames uses 4 pages mapped via a page table.",
    practice:
      "Practice page replacement algorithms (FIFO, LRU, Optimal) and calculating page faults.",
  },

  "process-synchronization": {
    title: "Process Synchronization",
    explanation:
      "When multiple processes access shared resources, synchronization prevents race conditions. Tools include mutexes, semaphores, and monitors.",
    keyIdea:
      "The critical section problem is solved by ensuring mutual exclusion, progress, and bounded waiting.",
    example:
      "Producer-Consumer: a semaphore tracks empty/full buffer slots so producer waits when buffer is full.",
    practice:
      "Practice the dining philosophers, readers-writers, and producer-consumer problems.",
  },

  "deadlock": {
    title: "Deadlock",
    explanation:
      "Deadlock occurs when two or more processes are waiting indefinitely for resources held by each other. Four conditions must hold simultaneously: mutual exclusion, hold and wait, no preemption, circular wait.",
    keyIdea:
      "Prevent deadlock by breaking at least one of the four necessary conditions.",
    example:
      "P1 holds R1 and waits for R2; P2 holds R2 and waits for R1 — both are stuck forever.",
    practice:
      "Practice Banker's algorithm, resource allocation graphs, and deadlock detection.",
  },

  // ── DBMS ──────────────────────────────────────────────────────────
  "dbms-basics": {
    title: "DBMS Basics",
    explanation:
      "A Database Management System organizes, stores, and retrieves data efficiently. Key concepts include data models (relational, NoSQL), schemas, and ACID properties.",
    keyIdea:
      "DBMS provides data independence, concurrent access, and recovery from failures.",
    example:
      "A relational DBMS stores data in tables with rows and columns, accessed via SQL queries.",
    practice:
      "Practice identifying database models, understanding schemas, and ACID guarantees.",
  },

  "er-model": {
    title: "ER Model",
    explanation:
      "The Entity-Relationship model represents data as entities (objects), attributes (properties), and relationships (associations) in a visual diagram.",
    keyIdea:
      "ER diagrams help design databases before implementation by mapping real-world relationships.",
    example:
      "Entities: Student, Course. Relationship: Enrolls. Attributes: Student(ID, Name), Course(Code, Title).",
    practice:
      "Practice drawing ER diagrams, identifying cardinality (1:1, 1:N, M:N), and converting to tables.",
  },

  "sql": {
    title: "SQL",
    explanation:
      "SQL (Structured Query Language) is used to create, read, update, and delete data in relational databases. Key operations include SELECT, JOIN, GROUP BY, and subqueries.",
    keyIdea:
      "JOINs combine rows from multiple tables based on related columns; subqueries nest queries inside queries.",
    example:
      "SELECT s.name, c.title FROM students s JOIN enrollments e ON s.id = e.student_id JOIN courses c ON e.course_id = c.id;",
    practice:
      "Practice writing complex queries with JOINs, aggregations, and nested subqueries.",
  },

  "normalization": {
    title: "Normalization",
    explanation:
      "Normalization organizes database tables to reduce redundancy and dependency. Normal forms (1NF, 2NF, 3NF, BCNF) progressively eliminate anomalies.",
    keyIdea:
      "Each normal form addresses specific types of redundancy: partial dependencies (2NF), transitive dependencies (3NF).",
    example:
      "A table with (StudentID, CourseID, CourseName) violates 2NF because CourseName depends only on CourseID.",
    practice:
      "Practice decomposing tables into higher normal forms and identifying functional dependencies.",
  },

  "indexing": {
    title: "Indexing",
    explanation:
      "Indexing creates data structures (B-tree, hash index) that speed up data retrieval at the cost of additional storage and slower writes.",
    keyIdea:
      "B-tree indexes support range queries; hash indexes provide O(1) exact-match lookups.",
    example:
      "Creating an index on the 'email' column: SELECT * FROM users WHERE email='a@b.com' uses the index instead of scanning all rows.",
    practice:
      "Practice choosing appropriate index types, understanding trade-offs, and query optimization.",
  },

  "acid-properties": {
    title: "ACID Properties",
    explanation:
      "ACID ensures reliable database transactions: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don't interfere), Durability (committed data persists).",
    keyIdea:
      "ACID properties guarantee that database transactions are processed reliably even during failures.",
    example:
      "A bank transfer: debit $100 from A and credit $100 to B. Atomicity ensures both happen or neither does.",
    practice:
      "Practice identifying ACID violations in scenarios and understanding isolation levels.",
  },

  // ── Python Core ───────────────────────────────────────────────────
  "python-basics": {
    title: "Python Basics",
    explanation:
      "Python is a high-level, interpreted language known for its readability. Core concepts include variables, data types (int, float, str, bool), operators, and control flow (if/elif/else, for, while).",
    keyIdea:
      "Python uses dynamic typing and indentation-based scoping instead of braces.",
    example:
      "x = 10; if x > 5: print('big') else: print('small'). Lists: nums = [1,2,3]; for n in nums: print(n)",
    practice:
      "Practice variable assignment, type conversion, loops, and conditional logic.",
  },

  "functions-modules": {
    title: "Functions & Modules",
    explanation:
      "Functions are reusable blocks of code defined with def. Modules are .py files that group related functions. Use import to bring modules into scope.",
    keyIdea:
      "Functions have parameters, return values, and their own local scope. *args and **kwargs allow flexible arguments.",
    example:
      "def greet(name): return f'Hello {name}'. import math; math.sqrt(16) → 4.0",
    practice:
      "Practice writing functions with default parameters, returning values, and creating modules.",
  },

  "python-data-structures": {
    title: "Data Structures in Python",
    explanation:
      "Python provides built-in data structures: lists (ordered, mutable), tuples (ordered, immutable), sets (unordered, unique), and dictionaries (key-value pairs).",
    keyIdea:
      "Choose the right structure: lists for ordered collections, sets for uniqueness, dicts for key-based lookup.",
    example:
      "List: [1,2,3]. Tuple: (1,2,3). Set: {1,2,3}. Dict: {'a':1, 'b':2}. Dict lookup is O(1).",
    practice:
      "Practice list slicing, set operations, dictionary comprehension, and nested structures.",
  },

  "lambda-map": {
    title: "Lambda & Map",
    explanation:
      "Lambda creates small anonymous functions inline. map() applies a function to every item in an iterable. filter() selects items matching a condition.",
    keyIdea:
      "Functional tools (map, filter, reduce) enable concise data transformations without explicit loops.",
    example:
      "double = lambda x: x*2. list(map(double, [1,2,3])) → [2,4,6]. list(filter(lambda x: x>1, [1,2,3])) → [2,3].",
    practice:
      "Practice combining lambda with map, filter, and reduce for data processing tasks.",
  },

  "list-comprehension": {
    title: "List Comprehension",
    explanation:
      "List comprehensions provide a concise way to create lists by combining a for-loop and optional condition in a single expression.",
    keyIdea:
      "Syntax: [expression for item in iterable if condition]. Faster and more readable than equivalent loops.",
    example:
      "squares = [x**2 for x in range(5)] → [0,1,4,9,16]. evens = [x for x in range(10) if x%2==0].",
    practice:
      "Practice nested comprehensions, dict comprehensions, and set comprehensions.",
  },

  "exception-handling": {
    title: "Exception Handling",
    explanation:
      "Exception handling uses try/except blocks to catch and handle runtime errors gracefully instead of crashing the program.",
    keyIdea:
      "try executes code that might fail; except catches specific exceptions; finally always runs for cleanup.",
    example:
      "try: result = 10/0 except ZeroDivisionError: print('Cannot divide by zero') finally: print('Done').",
    practice:
      "Practice catching specific exceptions, raising custom exceptions, and using else/finally blocks.",
  },

  "file-handling": {
    title: "File Handling",
    explanation:
      "Python reads and writes files using the open() function with modes like 'r' (read), 'w' (write), 'a' (append). The with statement ensures proper cleanup.",
    keyIdea:
      "Always use 'with open(...)' as a context manager to automatically close files after use.",
    example:
      "with open('data.txt', 'r') as f: content = f.read(). with open('out.txt', 'w') as f: f.write('Hello').",
    practice:
      "Practice reading CSV files, writing JSON, and handling file-not-found errors.",
  },

  "generators": {
    title: "Generators",
    explanation:
      "Generators are functions that yield values one at a time using the yield keyword, enabling lazy evaluation without loading everything into memory.",
    keyIdea:
      "Generators produce items on demand, making them memory-efficient for large or infinite sequences.",
    example:
      "def count_up(n): i=0; while i<n: yield i; i+=1. list(count_up(3)) → [0,1,2].",
    practice:
      "Practice creating generators, generator expressions, and chaining generators for pipelines.",
  },

  "decorators": {
    title: "Decorators",
    explanation:
      "Decorators are functions that wrap another function to extend its behavior without modifying its code. They use the @decorator syntax.",
    keyIdea:
      "A decorator takes a function as input, adds functionality, and returns a new function.",
    example:
      "def log(func): def wrapper(*a): print('calling'); return func(*a); return wrapper. @log def add(x,y): return x+y.",
    practice:
      "Practice writing decorators for logging, timing, authentication, and using functools.wraps.",
  },

  // ── Machine Learning ──────────────────────────────────────────────
  "ml-basics": {
    title: "ML Basics",
    explanation:
      "Machine Learning is a subset of AI where systems learn patterns from data instead of being explicitly programmed. Types: supervised, unsupervised, reinforcement learning.",
    keyIdea:
      "ML models learn from training data, then generalize to make predictions on unseen data.",
    example:
      "Training a spam classifier: feed labeled emails (spam/not spam), the model learns patterns, then predicts new emails.",
    practice:
      "Practice understanding bias-variance tradeoff, train/test splits, and evaluation metrics.",
  },

  "supervised-learning": {
    title: "Supervised Learning",
    explanation:
      "Supervised learning uses labeled data (input-output pairs) to train models. Regression predicts continuous values; classification predicts categories.",
    keyIdea:
      "The model minimizes error between predictions and true labels during training.",
    example:
      "Linear Regression: predict house price from size. Logistic Regression: classify email as spam or not.",
    practice:
      "Practice linear regression, logistic regression, decision trees, and evaluating with accuracy/MSE.",
  },

  "unsupervised-learning": {
    title: "Unsupervised Learning",
    explanation:
      "Unsupervised learning finds patterns in unlabeled data. Clustering groups similar data points; dimensionality reduction simplifies high-dimensional data.",
    keyIdea:
      "No labels are provided — the algorithm discovers hidden structure in the data.",
    example:
      "K-Means clustering: group customers into segments based on purchase behavior without predefined categories.",
    practice:
      "Practice K-Means, hierarchical clustering, and PCA for dimensionality reduction.",
  },
};
