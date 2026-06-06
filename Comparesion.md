# Part 1: Comparison Questions

## System Program vs. Application Program

| Feature    | System Program                                                | Application Program                                                       |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Definition | Associated with the OS but not necessarily part of the kernel | all programs not associated with the operating system as MS word, excel,… |

| Purpose | Supports system operation and management | Performs tasks for end users |
| Examples | Shell, Antivirus, Firewall, Disk Utilities | MS Word, Web Browsers, Video Games |

---

## Bootstrap vs. Kernel vs. Shell

| Component | Description                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| Bootstrap | Small program that runs when the computer powers up, initializes hardware, and loads the kernel into memory |
| Kernel    | The core program always running; manages CPU, memory, and hardware resources                                |
| Shell     | User interface that interprets commands and communicates with the kernel                                    |

---

## Batch Systems vs. Interactive Systems

| Feature          | Batch System                      | Interactive System           |
| ---------------- | --------------------------------- | ---------------------------- |
| User Interaction | No direct interaction             | Direct interaction           |
| Response Time    | Delayed response                  | Fast response (Time-Sharing) |
| Suitable Tasks   | Payroll, Billing, Repetitive Jobs | Debugging, General Computing |

---

## Hard Real-Time vs. Soft Real-Time Systems

| Feature                     | Hard Real-Time                      | Soft Real-Time                        |
| --------------------------- | ----------------------------------- | ------------------------------------- |
| Deadline Requirement        | Strict deadlines must always be met | Some deadline variation is acceptable |
| Response Variation (Jitter) | Not allowed                         | Limited jitter allowed                |
| Example Usage               | Airbags, Medical Devices            | Multimedia, Online Streaming          |

---

## Processor vs. CPU vs. Core

| Component        | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| Processor (Chip) | Physical chip installed on the motherboard                            |
| CPU              | Processing unit inside the processor that executes instructions       |
| Core             | Smallest execution unit capable of independently running instructions |

---

## Symmetric (SMP) vs. Asymmetric (AMP) Multiprocessing

| Feature         | SMP                              | AMP                                  |
| --------------- | -------------------------------- | ------------------------------------ |
| Control         | All CPUs are equal and cooperate | Master CPU controls subordinate CPUs |
| OS Copy         | All CPUs run the same OS copy    | Master manages task assignment       |
| Decision Making | Independent decisions            | Centralized decisions                |

---

## Multiprogramming vs. Multitasking Systems

### Similarities

- Multiple programs are loaded into memory simultaneously.

### Differences

| Feature       | Multiprogramming                    | Multitasking                     |
| ------------- | ----------------------------------- | -------------------------------- |
| CPU Switching | Occurs when a process waits for I/O | Occurs when time quantum expires |
| Control       | Cooperative                         | Preemptive                       |
| Goal          | Maximize CPU utilization            | Improve responsiveness           |

---

## Bit vs. Byte vs. Qubit

| Unit  | Description                                                          |
| ----- | -------------------------------------------------------------------- |
| Bit   | Smallest storage unit (0 or 1)                                       |
| Byte  | 8 bits; smallest chunk most CPUs can move                            |
| Qubit | Quantum bit that can be 0, 1, or both simultaneously (Superposition) |

---

## Registers vs. Cache

| Feature    | Registers                      | Cache                                     |
| ---------- | ------------------------------ | ----------------------------------------- |
| Location   | Inside CPU                     | Inside or very close to CPU               |
| Size       | Very small (Bytes)             | Small (KB–MB)                             |
| Speed      | Fastest memory                 | Faster than RAM but slower than registers |
| Function   | Holds currently processed data | Stores frequently used data               |
| Volatility | Volatile                       | Volatile                                  |

---

## HDD vs. SSD

| Feature           | HDD                | SSD              |
| ----------------- | ------------------ | ---------------- |
| Speed             | Slow               | Very Fast        |
| Moving Parts      | Spinning disks     | No moving parts  |
| Price             | Cheaper            | More expensive   |
| Durability        | Less durable       | More durable     |
| Storage Structure | Tracks and sectors | Pages and blocks |

---

## Protection vs. Security

| Feature | Protection                   | Security                                 |
| ------- | ---------------------------- | ---------------------------------------- |
| Purpose | Controls access to resources | Defends against threats and attackers    |
| Focus   | Internal users/processes     | External threats and unauthorized access |

---

## Program vs. Process

| Feature        | Program                         | Process                               |
| -------------- | ------------------------------- | ------------------------------------- |
| Definition     | Passive executable file on disk | Active program in execution           |
| State          | Static                          | Dynamic                               |
| Resource Usage | Does not use resources directly | Uses CPU, memory, and other resources |

---

## Small vs. Large Quantum in Round Robin (RR)

| Feature           | Small Quantum            | Large Quantum                  |
| ----------------- | ------------------------ | ------------------------------ |
| Context Switching | Frequent (High Overhead) | Less frequent (Low Overhead)   |
| Responsiveness    | Better                   | Worse                          |
| Extreme Case      | Very responsive          | Behaves like FCFS if too large |

---

## `exit()` vs. `abort()` vs. `wait()`

| System Call | Purpose                                                        |
| ----------- | -------------------------------------------------------------- |
| `exit()`    | Process terminates itself after completion                     |
| `abort()`   | Parent forcibly terminates a child process                     |
| `wait()`    | Parent waits for child process termination and collects status |

---

## Zombie vs. Orphan Processes

| Feature       | Zombie Process                | Orphan Process            |
| ------------- | ----------------------------- | ------------------------- |
| Parent Status | Alive                         | Terminated                |
| Child Status  | Terminated                    | Running                   |
| Cause         | Parent hasn't called `wait()` | Parent exits before child |

---

## Deadlock Avoidance vs. Deadlock Prevention

| Feature  | Deadlock Prevention                        | Deadlock Avoidance                 |
| -------- | ------------------------------------------ | ---------------------------------- |
| Method   | Eliminates at least one deadlock condition | Dynamically checks for safe states |
| Approach | Static                                     | Dynamic                            |
| Example  | Prevent Circular Wait                      | Banker's Algorithm                 |

---

## Thread vs. Process

| Feature        | Process                          | Thread                                      |
| -------------- | -------------------------------- | ------------------------------------------- |
| Definition     | Independent program in execution | Lightweight execution unit within a process |
| Memory         | Own private memory               | Shares memory with other threads            |
| Resource Usage | Higher                           | Lower                                       |

---

## User-Level Threads (ULTs) vs. Kernel-Level Threads (KLTs)

| Feature           | ULTs                                     | KLTs                               |
| ----------------- | ---------------------------------------- | ---------------------------------- |
| Managed By        | User-space libraries                     | Operating System Kernel            |
| Switching Speed   | Faster                                   | Slower                             |
| Blocking Behavior | One blocked thread blocks entire process | Other threads can continue running |

---

## Shared Memory vs. Message Passing (IPC)

| Feature            | Shared Memory                   | Message Passing          |
| ------------------ | ------------------------------- | ------------------------ |
| Control            | User process controlled         | OS controlled            |
| Speed              | Faster                          | Slower                   |
| Synchronization    | Manual synchronization required | Built-in synchronization |
| Kernel Involvement | Minimal                         | High                     |

---
