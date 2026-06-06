import { CategoryId } from './categories'

export interface ComparisonRow {
  feature: string
  values: string[]
}

export interface Comparison {
  title: string
  headers: string[]
  similarities?: string[]
  rows: ComparisonRow[]
}

export interface CategoryComparisons {
  categoryId: CategoryId
  comparisons: Comparison[]
}

export const COMPARISONS: CategoryComparisons[] = [
  {
    categoryId: 'Operating System',
    comparisons: [
      {
        title: 'System Program vs. Application Program',
        headers: ['Feature', 'System Program', 'Application Program'],
        rows: [
          {
            feature: 'Definition',
            values: [
              'Associated with the OS but not necessarily part of the kernel',
              'all programs not associated with the operating system as MS word, excel',
            ],
          },

          {
            feature: 'Purpose',
            values: ['Supports system operation and management', 'Performs tasks for end users'],
          },
          {
            feature: 'Examples',
            values: [
              'Shell, Antivirus, Firewall, Disk Utilities',
              'MS Word, Web Browsers, Video Games',
            ],
          },
        ],
      },
      {
        title: 'Bootstrap vs. Kernel vs. Shell',
        headers: ['Component', 'Description'],
        rows: [
          {
            feature: 'Bootstrap',
            values: [
              'Small program that runs when the computer powers up, initializes hardware, and loads the kernel into memory',
            ],
          },
          {
            feature: 'Kernel',
            values: [
              'The core program always running; manages CPU, memory, and hardware resources',
            ],
          },
          {
            feature: 'Shell',
            values: ['User interface that interprets commands and communicates with the kernel'],
          },
        ],
      },
      {
        title: 'Batch Systems vs. Interactive Systems',
        headers: ['Feature', 'Batch System', 'Interactive System'],
        rows: [
          { feature: 'User Interaction', values: ['No direct interaction', 'Direct interaction'] },
          {
            feature: 'Response Time',
            values: ['Delayed response', 'Fast response (Time-Sharing)'],
          },
          {
            feature: 'Suitable Tasks',
            values: ['Payroll, Billing, Repetitive Jobs', 'Debugging, General Computing'],
          },
        ],
      },
      {
        title: 'Hard Real-Time vs. Soft Real-Time Systems',
        headers: ['Feature', 'Hard Real-Time', 'Soft Real-Time'],
        rows: [
          {
            feature: 'Deadline Requirement',
            values: [
              'Strict deadlines must always be met',
              'Some deadline variation is acceptable',
            ],
          },
          {
            feature: 'Response Variation (Jitter)',
            values: ['Not allowed', 'Limited jitter allowed'],
          },
          {
            feature: 'Example Usage',
            values: ['Airbags, Medical Devices', 'Multimedia, Online Streaming'],
          },
        ],
      },
      {
        title: 'Processor vs. CPU vs. Core',
        headers: ['Component', 'Description'],
        rows: [
          { feature: 'Processor (Chip)', values: ['Physical chip installed on the motherboard'] },
          {
            feature: 'CPU',
            values: ['Processing unit inside the processor that executes instructions'],
          },
          {
            feature: 'Core',
            values: ['Smallest execution unit capable of independently running instructions'],
          },
        ],
      },
      {
        title: 'Symmetric (SMP) vs. Asymmetric (AMP) Multiprocessing',
        headers: ['Feature', 'SMP', 'AMP'],
        rows: [
          {
            feature: 'Control',
            values: ['All CPUs are equal and cooperate', 'Master CPU controls subordinate CPUs'],
          },
          {
            feature: 'OS Copy',
            values: ['All CPUs run the same OS copy', 'Master manages task assignment'],
          },
          {
            feature: 'Decision Making',
            values: ['Independent decisions', 'Centralized decisions'],
          },
        ],
      },
      {
        title: 'Multiprogramming vs. Multitasking Systems',
        similarities: ['Multiple programs are loaded into memory simultaneously.'],
        headers: ['Feature', 'Multiprogramming', 'Multitasking'],
        rows: [
          {
            feature: 'CPU Switching',
            values: ['Occurs when a process waits for I/O', 'Occurs when time quantum expires'],
          },
          { feature: 'Control', values: ['Cooperative', 'Preemptive'] },
          { feature: 'Goal', values: ['Maximize CPU utilization', 'Improve responsiveness'] },
        ],
      },
      {
        title: 'Bit vs. Byte vs. Qubit',
        headers: ['Unit', 'Description'],
        rows: [
          { feature: 'Bit', values: ['Smallest storage unit (0 or 1)'] },
          { feature: 'Byte', values: ['8 bits; smallest chunk most CPUs can move'] },
          {
            feature: 'Qubit',
            values: ['Quantum bit that can be 0, 1, or both simultaneously (Superposition)'],
          },
        ],
      },
      {
        title: 'Registers vs. Cache',
        headers: ['Feature', 'Registers', 'Cache'],
        rows: [
          { feature: 'Location', values: ['Inside CPU', 'Inside or very close to CPU'] },
          { feature: 'Size', values: ['Very small (Bytes)', 'Small (KB–MB)'] },
          {
            feature: 'Speed',
            values: ['Fastest memory', 'Faster than RAM but slower than registers'],
          },
          {
            feature: 'Function',
            values: ['Holds currently processed data', 'Stores frequently used data'],
          },
          { feature: 'Volatility', values: ['Volatile', 'Volatile'] },
        ],
      },
      {
        title: 'HDD vs. SSD',
        headers: ['Feature', 'HDD', 'SSD'],
        rows: [
          { feature: 'Speed', values: ['Slow', 'Very Fast'] },
          { feature: 'Moving Parts', values: ['Spinning disks', 'No moving parts'] },
          { feature: 'Price', values: ['Cheaper', 'More expensive'] },
          { feature: 'Durability', values: ['Less durable', 'More durable'] },
          { feature: 'Storage Structure', values: ['Tracks and sectors', 'Pages and blocks'] },
        ],
      },
      {
        title: 'Protection vs. Security',
        headers: ['Feature', 'Protection', 'Security'],
        rows: [
          {
            feature: 'Purpose',
            values: ['Controls access to resources', 'Defends against threats and attackers'],
          },
          {
            feature: 'Focus',
            values: ['Internal users/processes', 'External threats and unauthorized access'],
          },
        ],
      },
      {
        title: 'Program vs. Process',
        headers: ['Feature', 'Program', 'Process'],
        rows: [
          {
            feature: 'Definition',
            values: ['Passive executable file on disk', 'Active program in execution'],
          },
          { feature: 'State', values: ['Static', 'Dynamic'] },
          {
            feature: 'Resource Usage',
            values: ['Does not use resources directly', 'Uses CPU, memory, and other resources'],
          },
        ],
      },
      {
        title: 'Small vs. Large Quantum in Round Robin (RR)',
        headers: ['Feature', 'Small Quantum', 'Large Quantum'],
        rows: [
          {
            feature: 'Context Switching',
            values: ['Frequent (High Overhead)', 'Less frequent (Low Overhead)'],
          },
          { feature: 'Responsiveness', values: ['Better', 'Worse'] },
          {
            feature: 'Extreme Case',
            values: ['Very responsive', 'Behaves like FCFS if too large'],
          },
        ],
      },
      {
        title: 'exit() vs. abort() vs. wait()',
        headers: ['System Call', 'Purpose'],
        rows: [
          { feature: 'exit()', values: ['Process terminates itself after completion'] },
          { feature: 'abort()', values: ['Parent forcibly terminates a child process'] },
          {
            feature: 'wait()',
            values: ['Parent waits for child process termination and collects status'],
          },
        ],
      },
      {
        title: 'Zombie vs. Orphan Processes',
        headers: ['Feature', 'Zombie Process', 'Orphan Process'],
        rows: [
          { feature: 'Parent Status', values: ['Alive', 'Terminated'] },
          { feature: 'Child Status', values: ['Terminated', 'Running'] },
          {
            feature: 'Cause',
            values: ["Parent hasn't called wait()", 'Parent exits before child'],
          },
        ],
      },
      {
        title: 'Deadlock Avoidance vs. Deadlock Prevention',
        headers: ['Feature', 'Deadlock Prevention', 'Deadlock Avoidance'],
        rows: [
          {
            feature: 'Method',
            values: [
              'Eliminates at least one deadlock condition',
              'Dynamically checks for safe states',
            ],
          },
          { feature: 'Approach', values: ['Static', 'Dynamic'] },
          { feature: 'Example', values: ['Prevent Circular Wait', "Banker's Algorithm"] },
        ],
      },
      {
        title: 'Thread vs. Process',
        headers: ['Feature', 'Process', 'Thread'],
        rows: [
          {
            feature: 'Definition',
            values: [
              'Independent program in execution',
              'Lightweight execution unit within a process',
            ],
          },
          { feature: 'Memory', values: ['Own private memory', 'Shares memory with other threads'] },
          { feature: 'Resource Usage', values: ['Higher', 'Lower'] },
        ],
      },
      {
        title: 'User-Level Threads (ULTs) vs. Kernel-Level Threads (KLTs)',
        headers: ['Feature', 'ULTs', 'KLTs'],
        rows: [
          { feature: 'Managed By', values: ['User-space libraries', 'Operating System Kernel'] },
          { feature: 'Switching Speed', values: ['Faster', 'Slower'] },
          {
            feature: 'Blocking Behavior',
            values: [
              'One blocked thread blocks entire process',
              'Other threads can continue running',
            ],
          },
        ],
      },
      {
        title: 'Shared Memory vs. Message Passing (IPC)',
        headers: ['Feature', 'Shared Memory', 'Message Passing'],
        rows: [
          { feature: 'Control', values: ['User process controlled', 'OS controlled'] },
          { feature: 'Speed', values: ['Faster', 'Slower'] },
          {
            feature: 'Synchronization',
            values: ['Manual synchronization required', 'Built-in synchronization'],
          },
          { feature: 'Kernel Involvement', values: ['Minimal', 'High'] },
        ],
      },
    ],
  },
]

export function getComparisonsForCategory(categoryId: CategoryId): Comparison[] {
  const entry = COMPARISONS.find((c) => c.categoryId === categoryId)
  return entry?.comparisons ?? []
}

export function hasComparisons(categoryId: CategoryId): boolean {
  return COMPARISONS.some((c) => c.categoryId === categoryId && c.comparisons.length > 0)
}
