import prisma from './services/db';

const SAMPLE_PROBLEMS = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice.',
    difficulty: 'EASY',
    category: 'Arrays',
    constraints: JSON.stringify([
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ]),
    examples: JSON.stringify([
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' }
    ]),
    testCases: JSON.stringify([
      { input: '2 7 11 15 9', expectedOutput: '0 1' },
      { input: '3 2 4 6', expectedOutput: '1 2' },
      { input: '3 3 6', expectedOutput: '0 1' },
      { input: '-1 0 1 2 -1 -4', expectedOutput: '0 1' },
      { input: '2 5 5 11 9', expectedOutput: '0 4' }
    ]),
    sampleSolution: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    tags: 'hash-map,array,two-pointer'
  },
  {
    title: 'Balanced Binary Search Tree',
    description: 'Given the root of a binary search tree, return a balanced binary search tree with the same node values. A binary search tree is balanced if the depth of the two subtrees of every node never differs by more than 1.',
    difficulty: 'MEDIUM',
    category: 'Trees',
    constraints: JSON.stringify([
      '1 <= nodes <= 10^4',
      '1 <= node.val <= 10^5'
    ]),
    examples: JSON.stringify([
      { input: 'root = [1,null,2,null,3,null,4]', output: '[2,1,3,null,null,null,4]' },
      { input: 'root = [2,1,3]', output: '[2,1,3]' }
    ]),
    testCases: JSON.stringify([
      { input: '1 null 2 null 3 null 4', expectedOutput: '2 1 3 null null null 4' },
      { input: '2 1 3', expectedOutput: '2 1 3' }
    ]),
    sampleSolution: `function balanceBST(root: TreeNode | null): TreeNode | null {
  const nodes: TreeNode[] = [];
  inorder(root, nodes);
  return build(nodes, 0, nodes.length - 1);
}

function inorder(node: TreeNode | null, nodes: TreeNode[]) {
  if (!node) return;
  inorder(node.left, nodes);
  nodes.push(node);
  inorder(node.right, nodes);
}

function build(nodes: TreeNode[], start: number, end: number): TreeNode | null {
  if (start > end) return null;
  const mid = Math.floor((start + end) / 2);
  const node = nodes[mid];
  node.left = build(nodes, start, mid - 1);
  node.right = build(nodes, mid + 1, end);
  return node;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    tags: 'binary-search-tree,dfs,recursion'
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'MEDIUM',
    category: 'Strings',
    constraints: JSON.stringify([
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ]),
    examples: JSON.stringify([
      { input: 's = "abcabcbb"', output: '3' },
      { input: 's = "bbbbb"', output: '1' },
      { input: 's = "pwwkew"', output: '3' }
    ]),
    testCases: JSON.stringify([
      { input: 'abcabcbb', expectedOutput: '3' },
      { input: 'bbbbb', expectedOutput: '1' },
      { input: 'pwwkew', expectedOutput: '3' },
      { input: '', expectedOutput: '0' },
      { input: 'au', expectedOutput: '2' },
      { input: 'dvdf', expectedOutput: '3' }
    ]),
    sampleSolution: `function lengthOfLongestSubstring(s: string): number {
  const charIndex = new Map<string, number>();
  let maxLength = 0;
  let start = 0;
  
  for (let i = 0; i < s.length; i++) {
    if (charIndex.has(s[i])) {
      start = Math.max(start, charIndex.get(s[i])! + 1);
    }
    charIndex.set(s[i], i);
    maxLength = Math.max(maxLength, i - start + 1);
  }
  
  return maxLength;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(m, n))',
    tags: 'sliding-window,hash-map,string'
  },
  {
    title: 'Merge K Sorted Lists',
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    difficulty: 'HARD',
    category: 'Linked Lists',
    constraints: JSON.stringify([
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500',
      '-10^4 <= lists[i][j] <= 10^4'
    ]),
    examples: JSON.stringify([
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,1,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' }
    ]),
    testCases: JSON.stringify([
      { input: '1 4 5 1 3 4 2 6', expectedOutput: '1 1 2 1 3 4 4 5 6' },
      { input: '', expectedOutput: '' }
    ]),
    sampleSolution: `function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
  if (!lists || lists.length === 0) return null;
  return mergeHelper(lists, 0, lists.length - 1);
}

function mergeHelper(lists: (ListNode | null)[], left: number, right: number): ListNode | null {
  if (left === right) return lists[left];
  if (left > right) return null;
  const mid = Math.floor((left + right) / 2);
  return mergeTwoLists(mergeHelper(lists, left, mid), mergeHelper(lists, mid + 1, right));
}

function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let current = dummy;
  while (l1 && l2) {
    if (l1.val < l2.val) {
      current.next = l1;
      l1 = l1.next;
    } else {
      current.next = l2;
      l2 = l2.next;
    }
    current = current.next;
  }
  current.next = l1 || l2;
  return dummy.next;
}`,
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(log k)',
    tags: 'linked-list,merge,divide-and-conquer'
  }
];

async function seed() {
  try {
    console.log('🌱 Seeding database with coding problems...');
    
    for (const problem of SAMPLE_PROBLEMS) {
      await prisma.codingProblem.create({
        data: problem
      });
      console.log(`✅ Created problem: ${problem.title}`);
    }
    
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
