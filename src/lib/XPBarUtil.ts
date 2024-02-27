export function step_time(timer: Date, time: number): [Date, number] {
    let now = new Date();
    let diff = now.getTime() - timer.getTime();
    let milliseconds = Math.floor(diff);

    time += milliseconds;
    timer = now;

    return [timer, time];
}