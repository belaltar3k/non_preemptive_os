import random
import time
from colorama import init, Fore

init(autoreset=True)

class Process:
    def __init__(self):
        self.id = str(int(time.time() * 1000))
        self.time = random.randint(1, 100)
        self.active = False
        self.arrival_time = int(time.time() * 1000)
        self.start_time = 0
        self.finish_time = 0
        print(f"{Fore.GREEN}Process spawned: Process ID: {self.id} | Time: {self.time}")


    def checkLife(self) -> bool:
        if self.time == 0:
            self.active = False
            print(f"{Fore.RED}Process killed: Process ID: {self.id}")
            return True
        else:
            return False


processes = []
totalSpawned, totalKilled = 0, 0
total_wait_time = 0
total_turnaround_time = 0
cpu_busy_time = 0
simulation_start_time = int(time.time() * 1000)

for step in range(0, 1000):
    if random.randint(0, 100) < 20:
        spawn = Process()
        processes.append(spawn)
        totalSpawned += 1
        processes.sort(key=lambda x: x.time)
    
    cpuIdle = True
    for process in processes:
        if process.checkLife():
            processes.remove(process)
            totalKilled += 1
        if process.active:
            process.time -= 1
            cpuIdle = False
            print(f"{Fore.BLUE}Process ID: {process.id} | Time Remaining: {process.time} | Status: Active | Step {step}")

    if len(processes) != 0 and cpuIdle:
        processes[0].active = True
        cpuIdle = False

simulation_end_time = int(time.time() * 1000)
simulation_duration = simulation_end_time - simulation_start_time

for process in processes:
    wait_time = process.start_time - process.arrival_time
    turnaround_time = process.finish_time - process.arrival_time
    
    if process.start_time == 0:
        turnaround_time = 0
        wait_time = 0
    total_wait_time += wait_time
    total_turnaround_time += turnaround_time


if totalSpawned > 0:
    avg_wait_time = total_wait_time / totalSpawned
    avg_turnaround_time = total_turnaround_time / totalSpawned
else:
    avg_wait_time = 0
    avg_turnaround_time = 0

cpu_utilization = (cpu_busy_time / simulation_duration) * 100 if simulation_duration > 0 else 0

print("\n" + "="*20 + " Simulation Summary " + "="*20)
print(f"Remaining processes: {len(processes)}")
print(f"Total spawned: {totalSpawned}")
print(f"Total killed: {totalKilled}")
print(f"Average Wait Time: {avg_wait_time:.2f} ms")
print(f"Average Turnaround Time: {avg_turnaround_time:.2f} ms")
print(f"CPU Utilization: {cpu_utilization:.2f}%")
print(f"Simulation Duration: {simulation_duration} ms")
print("="*59 + "\n")

print(f"Remaining processes: {len(processes)}, Total spawned: {totalSpawned}, Total killed: {totalKilled}")
